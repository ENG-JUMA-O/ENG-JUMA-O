
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

const PENDING_STATUSES = new Set([
  "pending",
  "queued",
  "processing",
  "initiated",
]);

const CANCELLED_STATUSES = new Set(["cancelled", "canceled"]);

const createError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

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
      // A timeout does not prove that PayHero rejected the request.
      // Preserve the donation and reference for reconciliation.
      console.error("[DONATION] Payment initiation needs review", {
        donationId: donation.id,
        externalReference,
        statusCode: error.statusCode ?? null,
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
      !result ||
      typeof result.ExternalReference !== "string" ||
      !result.ExternalReference.trim() ||
      typeof result.CheckoutRequestID !== "string" ||
      !result.CheckoutRequestID.trim() ||
      result.Amount == null ||
      result.ResultCode == null ||
      !Number.isFinite(Number(result.Amount)) ||
      !Number.isFinite(Number(result.ResultCode)) ||
      typeof result.Status !== "string"
    ) {
      throw createError("Invalid PayHero callback payload.", 400);
    }

    const donation =
      await findDonationByExternalReferenceRepository(
        result.ExternalReference,
      );

    if (!donation) {
      throw createError("Donation not found.", 404);
    }

    if (Number(result.Amount) !== Number(donation.amount)) {
      throw createError("Payment amount mismatch.", 400);
    }

    if (
      donation.checkoutRequestId &&
      donation.checkoutRequestId !== result.CheckoutRequestID
    ) {
      throw createError("Checkout reference mismatch.", 400);
    }

    const status = result.Status.trim().toLowerCase();
    const resultCode = Number(result.ResultCode);

    const succeeded = status === "success" && resultCode === 0;
    const cancelled = CANCELLED_STATUSES.has(status);
    const pending = PENDING_STATUSES.has(status);

    const nextStatus = succeeded
      ? "SUCCESS"
      : cancelled
        ? "CANCELLED"
        : pending
          ? "PENDING"
          : "FAILED";

    if (succeeded && (
      typeof result.MpesaReceiptNumber !== "string" ||
      !result.MpesaReceiptNumber.trim()
    )) {
      throw createError(
        "Successful payment has no M-Pesa receipt.",
        400,
      );
    }

    // A previously confirmed payment must never regress to PENDING,
    // FAILED, or CANCELLED because of a delayed callback.
    if (donation.status === "SUCCESS") {
      await notificationService.createDonationNotifications(donation);

      return {
        success: true,
        message: "Donation was already confirmed.",
        paymentStatus: "SUCCESS",
        notificationsQueued: true,
      };
    }

    const updateData = {
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID ?? undefined,
      status: nextStatus,
      providerResultCode: String(result.ResultCode),
      providerResultDescription: result.ResultDesc ?? null,
    };

    if (succeeded) {
      updateData.mpesaReceiptNumber =
        result.MpesaReceiptNumber.trim();
      updateData.paidAt = new Date();
    }

    // Use a conditional write so concurrent callbacks cannot overwrite
    // a successful status with an older non-success result.
    const updated = await prisma.donation.updateMany({
      where: {
        id: donation.id,
        status: { not: "SUCCESS" },
      },
      data: updateData,
    });

    const confirmedDonation =
      await findDonationByIdRepository(donation.id);

    if (!confirmedDonation) {
      throw createError("Donation could not be reloaded.", 500);
    }

    if (confirmedDonation.status === "SUCCESS") {
      // Idempotently create durable notification records.
      // A worker should send these outside the payment callback.
      await notificationService.createDonationNotifications(
        confirmedDonation,
      );

      return {
        success: true,
        message: updated.count === 0
          ? "Donation was already confirmed."
          : "Payment confirmed.",
        paymentStatus: "SUCCESS",
        notificationsQueued: true,
      };
    }

    return {
      success: true,
      message: "Payment callback processed.",
      paymentStatus: confirmedDonation.status,
    };
  },
};

export default donationService;
