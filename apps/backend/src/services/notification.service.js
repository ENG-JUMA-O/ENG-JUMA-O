
import prisma from "../config/prisma.js";
import { sendMobitechSms } from "./sms/sms.service.js";
import { buildDonationSms } from "../utils/donation-notification.util.js";
import { normalizeKenyanPhone } from "../utils/phone.util.js";

const notificationService = {
  async createDonationNotifications(donation) {
    const rawRecipientPhone =
      donation.recipientPhone ||
      process.env.COFFEE_RECIPIENT_PHONE;

    const recipientPhone = rawRecipientPhone
      ? normalizeKenyanPhone(rawRecipientPhone)
      : null;

    const notifications = [
      {
        donationId: donation.id,
        type: "SUPPORTER_DONATION_RECEIPT",
        recipient: donation.phone,
      },
      ...(recipientPhone
        ? [
            {
              donationId: donation.id,
              type: "COFFEE_RECIPIENT_NOTIFICATION",
              recipient: recipientPhone,
            },
          ]
        : []),
    ];

    await prisma.notification.createMany({
      data: notifications,
      skipDuplicates: true,
    });

    return notifications;
  },

  async sendDonationNotifications(donationId) {
    const donation = await prisma.donation.findUnique({
      where: { id: donationId },
    });

    if (!donation || donation.status !== "SUCCESS") {
      return {
        success: false,
        message: "Donation is not confirmed.",
        total: 0,
        results: [],
      };
    }

    const notifications = await prisma.notification.findMany({
      where: {
        donationId,
        status: "PENDING",
      },
    });

    const results = await Promise.allSettled(
      notifications.map(async (notification) => {
        // Atomically claim the notification before sending.
        const claimed = await prisma.notification.updateMany({
          where: {
            id: notification.id,
            status: "PENDING",
          },
          data: {
            status: "SENDING",
            attempts: { increment: 1 },
            lastError: null,
          },
        });

        if (claimed.count !== 1) {
          return {
            success: true,
            skipped: true,
            id: notification.id,
          };
        }

        try {
          const message = buildDonationSms(
            donation,
            notification.type,
          );

          const response = await sendMobitechSms({
            mobile: notification.recipient,
            message,
          });

          if (response?.success !== true) {
            throw new Error(
              response?.message ||
                "SMS provider rejected the message",
            );
          }

          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: "SENT",
              providerId: response.messageId
                ? String(response.messageId)
                : null,
              providerStatus:
                response.message || "Accepted by provider",
              sentAt: new Date(),
              lastError: null,
            },
          });

          return {
            success: true,
            id: notification.id,
          };
        } catch (error) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: "FAILED",
              lastError: String(
                error?.message || "SMS sending failed",
              ).slice(0, 1000),
            },
          });

          console.error("Donation notification failed", {
            donationId,
            notificationId: notification.id,
            type: notification.type,
            error: error.message,
          });

          throw error;
        }
      }),
    );

    const summary = results.map((result) =>
      result.status === "fulfilled"
        ? result.value
        : {
            success: false,
            error: result.reason?.message,
          },
    );

    return {
      success: summary.every((result) => result.success),
      total: notifications.length,
      results: summary,
    };
  },
};

export default notificationService;
