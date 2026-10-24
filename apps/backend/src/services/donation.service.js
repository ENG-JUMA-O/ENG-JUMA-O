
import { randomUUID } from "node:crypto";

import prisma from "../config/prisma.js";

import {
  createDonationRepository,
  findDonationByIdRepository,
  findDonationByExternalReferenceRepository,
  updateDonationRepository,
} from "../repositories/donation.repository.js";

import {
  createNotificationRepository,
  findNotificationByDonationAndTypeRepository,
  updateNotificationRepository,
  findPendingNotificationsRepository,
} from "../repositories/notification.repository.js";

import payHeroService from "./payHero.service.js";
import { sendMobitechSms } from "./sms.service.js";
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

      await updateDonationRepository(donation.id, {
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
      // Preserve the donation record for investigation or callback recovery.
      // A provider timeout does not prove that payment initiation failed.
      console.error("Donation payment initiation issue", {
        donationId: donation.id,
        externalReference: donation.externalReference,
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

    const donation = await findDonationByExternalReferenceRepository(
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

    const paymentStatus = String(result.Status).toLowerCase();

    const paymentSucceeded =
      Number(result.ResultCode) === 0 && paymentStatus === "success";

    const paymentCancelled = ["cancelled", "canceled"].includes(
      paymentStatus,
    );

    const status = paymentSucceeded
      ? "SUCCESS"
      : paymentCancelled
        ? "CANCELLED"
        : "FAILED";

    const updateData = {
      checkoutRequestId: result.CheckoutRequestID,
      merchantRequestId: result.MerchantRequestID ?? undefined,
      status,
      providerResultCode: String(result.ResultCode),
      providerResultDescription: result.ResultDesc ?? null,
      ...(paymentSucceeded
        ? {
            mpesaReceiptNumber: result.MpesaReceiptNumber ?? undefined,
            paidAt: donation.paidAt ?? new Date(),
          }
        : {}),
    };

    if (!paymentSucceeded) {
      // Never downgrade a donation already marked SUCCESS.
      if (donation.status !== "SUCCESS") {
        await updateDonationRepository(donation.id, updateData);
      }

      return {
        success: true,
        message: "Payment callback processed",
      };
    }

    const notificationData = [
      {
        donationId: donation.id,
        type: "SUPPORTER_DONATION_RECEIPT",
        recipient: donation.phone,
      },
    ];

    if (process.env.DONATION_ADMIN_PHONE) {
      notificationData.push({
        donationId: donation.id,
        type: "ADMIN_NEW_DONATION",
        recipient: normalizeKenyanPhone(
          process.env.DONATION_ADMIN_PHONE,
        ),
      });
    }

    // Update payment status and create notification records atomically.
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
        throw new Error("Unable to confirm donation success");
      }

      await tx.notification.createMany({
        data: notificationData,
        skipDuplicates: true,
      });
    });

    await donationService.processDonationNotifications(donation.id);

    return {
      success: true,
      message: "Payment confirmed; notification processing attempted",
    };
  },

  async processDonationNotifications(donationId) {
    const donation = await findDonationByIdRepository(donationId);

    if (!donation || donation.status !== "SUCCESS") {
      return;
    }

    // Your current repository exposes PENDING notifications only.
    const notifications = await findPendingNotificationsRepository(50);
    const donationNotifications = notifications.filter(
      (notification) => notification.donationId === donationId,
    );

    const receipt =
      donation.mpesaReceiptNumber || donation.externalReference;

    const paidAt = new Intl.DateTimeFormat("en-KE", {
      dateStyle: "short",
      timeStyle: "short",
      timeZone: "Africa/Nairobi",
    }).format(donation.paidAt ?? new Date());

    const donorName = donation.isAnonymous
      ? "Anonymous"
      : donation.customerName || "Supporter";

    for (const notification of donationNotifications) {
      // Avoid sending if another attempt has already changed its status.
      const current = await findNotificationByDonationAndTypeRepository(
        notification.donationId,
        notification.type,
      );

      if (!current || current.status !== "PENDING") {
        continue;
      }

      let message;

      if (notification.type === "SUPPORTER_DONATION_RECEIPT") {
        message = [
          `Thank you ${donorName}!`,
          `Your KES ${donation.amount} donation was successful.`,
          `M-Pesa receipt: ${receipt}.`,
          "Thank you for your support!",
        ].join(" ");
      } else if (notification.type === "ADMIN_NEW_DONATION") {
        message = [
          "NEW DONATION RECEIVED",
          `Amount: KES ${donation.amount}`,
          `Receipt: ${receipt}`,
          `Time: ${paidAt}`,
          `Donor: ${donorName}`,
          `Phone: ${donation.phone}`,
          `Message: ${donation.message || "No message"}`,
          `Donation ID: ${donation.id}`,
        ].join(" | ");
      } else {
        await updateNotificationRepository(notification.id, {
          status: "FAILED",
          lastError: "Unsupported notification type",
        });
        continue;
      }

      try {
        // Mark as SENDING before making the provider request.
        await updateNotificationRepository(notification.id, {
          status: "SENDING",
          attempts: { increment: 1 },
          lastError: null,
        });

        const smsResult = await sendMobitechSms({
          mobile: notification.recipient,
          message,
        });

        await updateNotificationRepository(notification.id, {
          status: "SENT",
          providerId: smsResult?.message_id
            ? String(smsResult.message_id)
            : null,
          providerStatus: smsResult?.status_desc
            ? String(smsResult.status_desc)
            : null,
          sentAt: new Date(),
          lastError: null,
        });
      } catch (error) {
        await updateNotificationRepository(notification.id, {
          status: "FAILED",
          lastError: String(
            error?.message || "SMS sending failed",
          ).slice(0, 1000),
        });

        console.error("Donation notification failed", {
          donationId,
          notificationId: notification.id,
          type: notification.type,
          error: error.message,
        });
      }
    }
  },
};

export default donationService;
