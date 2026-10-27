
import { randomUUID } from "node:crypto";

import prisma from "../config/prisma.js";

import {
  createDonationRepository,
  findDonationByIdRepository,
  findDonationByExternalReferenceRepository,
  updateDonationRepository,
} from "../repositories/donation.repository.js";

import payHeroService from "./payHero.service.js";
import notificationService from "./notification.service.js";
import { normalizeKenyanPhone } from "../utils/phone.util.js";

const donationService = {
  async createDonation(data) {
    const externalReference = `DON-${randomUUID()}`;
    const phone = normalizeKenyanPhone(data.phone);

    const donation = await createDonationRepository({
      externalReference,
      amount: data.amount,
      phone,
      customerName: data.isAnonymous ? null : data.customerName,
      message: data.isAnonymous ? null : data.message,
      isAnonymous: data.isAnonymous ?? false,
      status: "PENDING",
    });

    try {
      const payment = await payHeroService.initiatePayment({
        amount: donation.amount,
        phone_number: donation.phone,
        external_reference: donation.externalReference,
        customer_name: donation.customerName ?? "Anonymous",
      });

      const updatedDonation = await updateDonationRepository(
        donation.id,
        {
          checkoutRequestId:
            payment.CheckoutRequestID ?? undefined,
          merchantRequestId:
            payment.MerchantRequestID ?? undefined,
        },
      );

      return {
        donation: updatedDonation,
        payment,
      };
    } catch (error) {
      // Keep the donation for investigation if PayHero times out.
      console.error("Donation payment initiation issue", {
        donationId: donation.id,
        externalReference,
        message: error.message,
      });

      throw error;
    }
  },

  async getDonationById(id) {
    return findDonationByIdRepository(id);
  },

  async handlePayHeroCallback(callback) {
    const result = callback?.response;

    if (
      callback?.status !== true ||
      !result?.ExternalReference ||
      !result?.CheckoutRequestID ||
      result?.Amount == null ||
      result?.ResultCode == null ||
      !result?.Status
    ) {
      const error = new Error("Invalid PayHero callback payload");
      error.statusCode = 400;
      throw error;
    }

    const donation =
      await findDonationByExternalReferenceRepository(
        result.ExternalReference,
      );

    if (!donation) {
      const error = new Error("Donation not found");
      error.statusCode = 404;
      throw error;
    }

    if (Number(result.Amount) !== donation.amount) {
      const error = new Error(
        "Payment amount does not match donation",
      );
      error.statusCode = 400;
      throw error;
    }

    if (
      donation.checkoutRequestId &&
      donation.checkoutRequestId !== result.CheckoutRequestID
    ) {
      const error = new Error("Checkout reference mismatch");
      error.statusCode = 400;
      throw error;
    }

    const paymentStatus = String(result.Status).toLowerCase();

    const paymentSucceeded =
      Number(result.ResultCode) === 0 &&
      paymentStatus === "success";

    const paymentCancelled = [
      "cancelled",
      "canceled",
    ].includes(paymentStatus);

    const status = paymentSucceeded
      ? "SUCCESS"
      : paymentCancelled
        ? "CANCELLED"
        : "FAILED";

    const updateData = {
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId:
        result.MerchantRequestID ?? undefined,
      status,
      providerResultCode: String(result.ResultCode),
      providerResultDescription: result.ResultDesc ?? null,

      ...(paymentSucceeded
        ? {
            mpesaReceiptNumber:
              result.MpesaReceiptNumber ?? undefined,
            paidAt: donation.paidAt ?? new Date(),
          }
        : {}),
    };

    if (!paymentSucceeded) {
      // Never downgrade a confirmed successful payment.
      if (donation.status !== "SUCCESS") {
        await updateDonationRepository(
          donation.id,
          updateData,
        );
      }

      return {
        success: true,
        message: "Payment callback processed",
      };
    }

    // Save payment confirmation first. Notifications are created
    // separately so an SMS/database notification issue cannot
    // roll back the confirmed payment.
    await prisma.$transaction(async (tx) => {
      await tx.donation.updateMany({
        where: {
          id: donation.id,
          status: { not: "SUCCESS" },
        },
        data: updateData,
      });

      const current = await tx.donation.findUnique({
        where: { id: donation.id },
        select: { status: true },
      });

      if (current?.status !== "SUCCESS") {
        throw new Error(
          "Unable to confirm donation success",
        );
      }
    });

    // Fetch the latest saved donation, including its M-Pesa receipt.
    const confirmedDonation =
      await findDonationByIdRepository(donation.id);

    if (!confirmedDonation) {
      throw new Error(
        "Confirmed donation could not be retrieved",
      );
    }

    // Create both notification records idempotently, then send
    // their SMS messages concurrently.
    await notificationService.createDonationNotifications(
      confirmedDonation,
    );

    const notificationResult =
      await notificationService.sendDonationNotifications(
        donation.id,
      );

    return {
      success: true,
      message: "Payment confirmed; notification processing completed",
      notifications: notificationResult,
    };
  },
};

export default donationService;
