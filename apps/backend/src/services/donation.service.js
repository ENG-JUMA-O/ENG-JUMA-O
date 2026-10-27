
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

const PENDING_STATUSES = [
  "pending",
  "queued",
  "processing",
  "initiated",
];

const CANCELLED_STATUSES = ["cancelled", "canceled"];

const donationService = {
  async createDonation(data) {
    const externalReference = `DON-${randomUUID()}`;
    const phone = normalizeKenyanPhone(data.phone);

    const donation = await createDonationRepository({
      externalReference,
      amount: data.amount,
      phone,
      customerName: data.isAnonymous
        ? null
        : data.customerName,
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
      // Keep the record so an uncertain payment can be investigated.
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

    // Validate the required callback fields.
    if (
      callback?.status !== true ||
      !result?.ExternalReference ||
      !result?.CheckoutRequestID ||
      result?.Amount == null ||
      result?.ResultCode == null ||
      !result?.Status
    ) {
      const error = new Error(
        "Invalid PayHero callback payload",
      );
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

    // Validate the amount before changing the donation.
    if (
      !Number.isFinite(Number(result.Amount)) ||
      Number(result.Amount) !== donation.amount
    ) {
      const error = new Error(
        "Payment amount does not match donation",
      );
      error.statusCode = 400;
      throw error;
    }

    // Validate the checkout reference if it was already saved.
    if (
      donation.checkoutRequestId &&
      donation.checkoutRequestId !== result.CheckoutRequestID
    ) {
      const error = new Error("Checkout reference mismatch");
      error.statusCode = 400;
      throw error;
    }

    const paymentStatus = String(result.Status)
      .trim()
      .toLowerCase();

    const resultCode = Number(result.ResultCode);

    const paymentSucceeded =
      resultCode === 0 && paymentStatus === "success";

    const paymentCancelled =
      CANCELLED_STATUSES.includes(paymentStatus);

    const paymentPending =
      PENDING_STATUSES.includes(paymentStatus);

    const nextStatus = paymentSucceeded
      ? "SUCCESS"
      : paymentCancelled
        ? "CANCELLED"
        : paymentPending
          ? "PENDING"
          : "FAILED";

    // Never downgrade an already-confirmed successful payment.
    if (donation.status !== "SUCCESS") {
      const updateData = {
        checkoutRequestId: result.CheckoutRequestID,
        merchantRequestId:
          result.MerchantRequestID ?? undefined,
        status: nextStatus,
        providerResultCode: String(result.ResultCode),
        providerResultDescription:
          result.ResultDesc ?? null,

        ...(paymentSucceeded
          ? {
              mpesaReceiptNumber:
                result.MpesaReceiptNumber || undefined,
              paidAt: donation.paidAt ?? new Date(),
            }
          : {}),
      };

      if (paymentSucceeded) {
        // Commit payment confirmation before sending any SMS.
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
      } else {
        await updateDonationRepository(
          donation.id,
          updateData,
        );
      }
    }

    // Only successful payments can trigger donation SMS messages.
    if (
      !paymentSucceeded &&
      donation.status !== "SUCCESS"
    ) {
      return {
        success: true,
        message: "Payment callback processed",
        paymentStatus: nextStatus,
      };
    }

    try {
      // Retrieve the saved receipt and latest donation state.
      const confirmedDonation =
        await findDonationByIdRepository(donation.id);

      if (
        !confirmedDonation ||
        confirmedDonation.status !== "SUCCESS"
      ) {
        throw new Error(
          "Donation is not confirmed as successful",
        );
      }

      // Create donor and recipient notification records.
      await notificationService.createDonationNotifications(
        confirmedDonation,
      );

      // Attempt to send eligible notification records.
      const notificationResult =
        await notificationService.sendDonationNotifications(
          donation.id,
        );

      if (!notificationResult.success) {
        console.error(
          "One or more donation SMS notifications failed",
          {
            donationId: donation.id,
            notificationResult,
          },
        );
      }

      return {
        success: true,
        message: "Payment confirmed",
        paymentStatus: "SUCCESS",
        notifications: notificationResult,
      };
    } catch (error) {
      // Notification failure must not undo a confirmed payment.
      console.error(
        "Donation notification processing failed",
        {
          donationId: donation.id,
          message: error.message,
        },
      );

      return {
        success: true,
        message:
          "Payment confirmed; notification processing failed",
        paymentStatus: "SUCCESS",
        notifications: {
          success: false,
          retryRequired: true,
        },
      };
    }
  },
};

export default donationService;
