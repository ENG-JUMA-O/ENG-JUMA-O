
import { randomUUID } from "node:crypto";

import donationRepository from "../repositories/donation.repository.js";
import payHeroService from "./payHero.service.js";

const donationService = {
  async createDonation(data) {
    const externalReference = `DON-${randomUUID()}`;

    const donation = await donationRepository.create({
      externalReference,
      amount: data.amount,
      phone: data.phone,
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

      await donationRepository.updateById(donation.id, {
        checkoutRequestId: payment.CheckoutRequestID ?? undefined,
        merchantRequestId: payment.MerchantRequestID ?? undefined,
      });

      return {
        donation: {
          ...donation,
          checkoutRequestId: payment.CheckoutRequestID ?? null,
        },
        payment,
      };
    } catch (error) {
      // The request may have reached PayHero even if the client timed out.
      // Reconcile uncertain outcomes before retrying or marking them failed.
      throw error;
    }
  },

  async getDonationById(id) {
    return donationRepository.findById(id);
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

    const donation = await donationRepository.findByExternalReference(
      result.ExternalReference,
    );

    if (!donation) {
      const error = new Error("Donation not found");
      error.statusCode = 404;
      throw error;
    }

    if (Number(result.Amount) !== donation.amount) {
      const error = new Error("Payment amount does not match donation");
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

    // A confirmed payment must never be downgraded by a later callback.
    if (donation.status === "SUCCESS") {
      return {
        success: true,
        message: "Payment already processed",
      };
    }

    const paymentSucceeded =
      Number(result.ResultCode) === 0 &&
      String(result.Status).toLowerCase() === "success";

    const paymentCancelled =
      String(result.Status).toLowerCase() === "cancelled" ||
      String(result.Status).toLowerCase() === "canceled";

    const status = paymentSucceeded
      ? "SUCCESS"
      : paymentCancelled
        ? "CANCELLED"
        : "FAILED";

    await donationRepository.updateById(donation.id, {
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID ?? undefined,
      status,
      mpesaReceiptNumber: paymentSucceeded
        ? result.MpesaReceiptNumber ?? undefined
        : undefined,
      providerResultCode: String(result.ResultCode),
      providerResultDescription: result.ResultDesc ?? null,
      ...(paymentSucceeded ? { paidAt: new Date() } : {}),
    });

    return {
      success: true,
      message: "Payment callback processed",
    };
  },
};

export default donationService;
