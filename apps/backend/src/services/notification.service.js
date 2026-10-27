
import prisma from "../config/prisma.js";
import { sendMobitechSms } from "./sms/sms.service.js";
import { buildDonationSms } from "../utils/donation-notification.util.js";
import { normalizeKenyanPhone } from "../utils/phone.util.js";

const MAX_ATTEMPTS = 3;
const SMS_CONCURRENCY = 5;
const LOG_PREFIX = "[DONATION NOTIFICATIONS]";

const notificationService = {
  async createDonationNotifications(donation) {
    if (!donation || donation.status !== "SUCCESS") {
      throw new Error(
        "Notifications can only be created for successful donations.",
      );
    }

    const donorPhone = normalizeKenyanPhone(donation.phone);
    const rawRecipientPhone =
      donation.recipientPhone || process.env.COFFEE_RECIPIENT_PHONE;

    const recipientPhone = rawRecipientPhone
      ? normalizeKenyanPhone(rawRecipientPhone)
      : null;

    const notifications = [
      {
        donationId: donation.id,
        type: "SUPPORTER_DONATION_RECEIPT",
        recipient: donorPhone,
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

    return {
      success: true,
      requested: notifications.length,
    };
  },

  async sendDonationNotifications(
    donationId,
    { retryFailed = false } = {},
  ) {
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

    const eligibleStatuses = retryFailed
      ? ["PENDING", "FAILED"]
      : ["PENDING"];

    const notifications = await prisma.notification.findMany({
      where: {
        donationId,
        status: { in: eligibleStatuses },
        ...(retryFailed ? { attempts: { lt: MAX_ATTEMPTS } } : {}),
      },
      orderBy: { createdAt: "asc" },
    });

    if (notifications.length === 0) {
      const existing = await prisma.notification.findFirst({
        where: { donationId },
        select: { id: true },
      });

      return {
        success: false,
        message: existing
          ? "No eligible notifications to send. Check notification statuses."
          : "No notification records exist for this donation.",
        total: 0,
        results: [],
      };
    }

    // Process a limited number of SMS requests concurrently.
    const results = new Array(notifications.length);
    let nextIndex = 0;

    const processNotification = async (notification) => {
      const claimed = await prisma.notification.updateMany({
        where: {
          id: notification.id,
          status: { in: eligibleStatuses },
          ...(retryFailed ? { attempts: { lt: MAX_ATTEMPTS } } : {}),
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

      let response;

      // Handle SMS errors separately from persistence errors.
      try {
        const message = buildDonationSms(
          donation,
          notification.type,
        );

        response = await sendMobitechSms({
          mobile: normalizeKenyanPhone(notification.recipient),
          message,
        });

        if (response?.success !== true) {
          throw new Error(
            response?.message || "SMS provider rejected the message.",
          );
        }
      } catch (error) {
        const errorMessage = String(
          error?.message || "SMS sending failed",
        ).slice(0, 1000);

        try {
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              status: "FAILED",
              lastError: errorMessage,
            },
          });
        } catch (dbError) {
          console.error(`${LOG_PREFIX} Failed to record SMS failure`, {
            donationId,
            notificationId: notification.id,
            error: dbError.message,
          });
        }

        console.error(`${LOG_PREFIX} SMS failed`, {
          donationId,
          notificationId: notification.id,
          type: notification.type,
          error: errorMessage,
        });

        return {
          success: false,
          id: notification.id,
          error: errorMessage,
        };
      }

      // The provider accepted the SMS. Do not mark it FAILED merely
      // because recording the successful result in the database fails.
      try {
        await prisma.notification.update({
          where: { id: notification.id },
          data: {
            status: "SENT",
            providerId: response.messageId
              ? String(response.messageId)
              : null,
            providerStatus: response.message || "Accepted by provider",
            sentAt: new Date(),
            lastError: null,
          },
        });
      } catch (dbError) {
        console.error(`${LOG_PREFIX} Accepted SMS status update failed`, {
          donationId,
          notificationId: notification.id,
          providerId: response.messageId ?? null,
          error: dbError.message,
        });

        // Leave the record in SENDING for reconciliation.
        // Automatically retrying it could send a duplicate SMS.
        return {
          success: false,
          id: notification.id,
          error: "SMS accepted, but its status could not be saved.",
          providerAccepted: true,
        };
      }

      return {
        success: true,
        id: notification.id,
        providerId: response.messageId ?? null,
      };
    };

    const worker = async () => {
      while (true) {
        const index = nextIndex++;

        if (index >= notifications.length) return;

        try {
          results[index] = await processNotification(
            notifications[index],
          );
        } catch (error) {
          // Handle unexpected errors, including claim-query failures.
          results[index] = {
            success: false,
            id: notifications[index].id,
            error: error.message || "Notification processing failed.",
          };

          console.error(`${LOG_PREFIX} Processing failed`, {
            donationId,
            notificationId: notifications[index].id,
            error: error.message,
          });
        }
      }
    };

    const workerCount = Math.min(
      SMS_CONCURRENCY,
      notifications.length,
    );

    await Promise.all(
      Array.from({ length: workerCount }, () => worker()),
    );

    return {
      success:
        results.length > 0 &&
        results.every((result) => result?.success === true),
      total: notifications.length,
      results,
    };
  },
};

export default notificationService;
