
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

  // Never allow a callback to overwrite an existing success.
  if (donation.status === "SUCCESS") {
    await notificationService.createDonationNotifications(donation);

    const notifications =
      await notificationService.sendDonationNotifications(
        donation.id,
        { retryFailed: true },
      );

    return {
      success: true,
      message: "Donation was already confirmed",
      paymentStatus: "SUCCESS",
      notifications,
    };
  }

  if (
    Number(result.Amount) !== donation.amount ||
    !Number.isFinite(Number(result.Amount))
  ) {
    const error = new Error("Payment amount mismatch");
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

  const status = String(result.Status).trim().toLowerCase();
  const resultCode = Number(result.ResultCode);

  const succeeded = status === "success" && resultCode === 0;
  const cancelled = ["cancelled", "canceled"].includes(status);
  const pending = ["pending", "queued", "processing", "initiated"].includes(status);

  const nextStatus = succeeded
    ? "SUCCESS"
    : cancelled
      ? "CANCELLED"
      : pending
        ? "PENDING"
        : "FAILED";

  if (succeeded && !result.MpesaReceiptNumber) {
    const error = new Error("Successful payment has no M-Pesa receipt");
    error.statusCode = 400;
    throw error;
  }

  await updateDonationRepository(donation.id, {
    checkoutRequestId: result.CheckoutRequestID,
    merchantRequestId: result.MerchantRequestID ?? undefined,
    status: nextStatus,
    providerResultCode: String(result.ResultCode),
    providerResultDescription: result.ResultDesc ?? null,
    ...(succeeded
      ? {
          mpesaReceiptNumber: result.MpesaReceiptNumber,
          paidAt: new Date(),
        }
      : {}),
  });

  if (!succeeded) {
    return {
      success: true,
      message: "Payment callback processed",
      paymentStatus: nextStatus,
    };
  }

  const confirmedDonation =
    await findDonationByIdRepository(donation.id);

  if (!confirmedDonation || confirmedDonation.status !== "SUCCESS") {
    throw new Error("Donation success was not persisted");
  }

  try {
    await notificationService.createDonationNotifications(
      confirmedDonation,
    );

    const notifications =
      await notificationService.sendDonationNotifications(
        donation.id,
      );

    return {
      success: true,
      message: "Payment confirmed",
      paymentStatus: "SUCCESS",
      notifications,
    };
  } catch (error) {
    console.error("Notification processing failed", {
      donationId: donation.id,
      message: error.message,
    });

    return {
      success: true,
      message: "Payment confirmed; SMS processing needs retry",
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
