
import prisma from "../config/prisma.js";
import { sendMobitechSms } from "./sms/sms.service.js";
import { buildDonationSms } from "../utils/donation-notification.util.js";
import { normalizeKenyanPhone } from "../utils/phone.util.js";

const LOG_PREFIX = "[NOTIFICATION SERVICE]";

const notificationService = {
  async createDonationNotifications(donation) {
    console.log(`${LOG_PREFIX} Creating donation notifications`, {
      donationId: donation?.id,
      donationStatus: donation?.status,
      timestamp: new Date().toISOString(),
    });

    try {
      if (!donation || donation.status !== "SUCCESS") {
        console.error(`${LOG_PREFIX} Cannot create notifications`, {
          donationId: donation?.id,
          status: donation?.status,
          reason: "Donation is not successful",
        });

        throw new Error(
          "Notifications can only be created for successful donations.",
        );
      }

      const donorPhone = normalizeKenyanPhone(donation.phone);

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

      console.log(`${LOG_PREFIX} Preparing notification records`, {
        donationId: donation.id,
        count: notifications.length,
        types: notifications.map((item) => item.type),
        recipientConfigured: Boolean(recipientPhone),
      });

      const result = await prisma.notification.createMany({
        data: notifications,
        skipDuplicates: true,
      });

      console.log(`${LOG_PREFIX} Notification records created`, {
        donationId: donation.id,
        requested: notifications.length,
        created: result.count,
        skippedAsDuplicates: notifications.length - result.count,
      });

      return {
        success: true,
        requested: notifications.length,
        created: result.count,
      };
    } catch (error) {
      console.error(`${LOG_PREFIX} Failed to create notifications`, {
        donationId: donation?.id,
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  },

  async sendDonationNotifications(
    donationId,
    { retryFailed = false } = {},
  ) {
    console.log(`${LOG_PREFIX} Starting SMS processing`, {
      donationId,
      retryFailed,
      timestamp: new Date().toISOString(),
    });

    try {
      const donation = await prisma.donation.findUnique({
        where: { id: donationId },
      });

      console.log(`${LOG_PREFIX} Donation lookup completed`, {
        donationId,
        found: Boolean(donation),
        status: donation?.status,
        amount: donation?.amount,
      });

      if (!donation || donation.status !== "SUCCESS") {
        console.error(`${LOG_PREFIX} SMS processing stopped`, {
          donationId,
          reason: !donation
            ? "Donation not found"
            : "Donation is not confirmed as successful",
          status: donation?.status,
        });

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
          status: retryFailed
            ? { in: ["PENDING", "FAILED"] }
            : "PENDING",
          ...(retryFailed ? { attempts: { lt: 3 } } : {}),
        },
        orderBy: { createdAt: "asc" },
      });

      console.log(`${LOG_PREFIX} Eligible notifications retrieved`, {
        donationId,
        count: notifications.length,
        retryFailed,
        notifications: notifications.map((item) => ({
          id: item.id,
          type: item.type,
          status: item.status,
          attempts: item.attempts,
        })),
      });

      if (notifications.length === 0) {
        const existing = await prisma.notification.count({
          where: { donationId },
        });

        console.warn(`${LOG_PREFIX} No eligible notifications`, {
          donationId,
          existingNotificationCount: existing,
          reason:
            existing === 0
              ? "No notification records exist"
              : "Records exist but none are eligible to send",
        });

        return {
          success: false,
          message:
            existing === 0
              ? "No notification records exist for this donation."
              : "No eligible notifications to send. Check notification statuses.",
          total: 0,
          results: [],
        };
      }

      const results = await Promise.allSettled(
        notifications.map(async (notification) => {
          console.log(`${LOG_PREFIX} Claiming notification`, {
            donationId,
            notificationId: notification.id,
            type: notification.type,
            previousStatus: notification.status,
            previousAttempts: notification.attempts,
          });

          const eligibleStatuses = retryFailed
            ? ["PENDING", "FAILED"]
            : ["PENDING"];

          const claimed = await prisma.notification.updateMany({
            where: {
              id: notification.id,
              status: { in: eligibleStatuses },
              ...(retryFailed ? { attempts: { lt: 3 } } : {}),
            },
            data: {
              status: "SENDING",
              attempts: { increment: 1 },
              lastError: null,
            },
          });

          if (claimed.count !== 1) {
            console.warn(`${LOG_PREFIX} Notification skipped`, {
              notificationId: notification.id,
              reason: "Another process claimed it or status changed",
            });

            return {
              success: true,
              skipped: true,
              id: notification.id,
            };
          }

          try {
            console.log(`${LOG_PREFIX} Building SMS message`, {
              donationId,
              notificationId: notification.id,
              type: notification.type,
            });

            const message = buildDonationSms(
              donation,
              notification.type,
            );

            console.log(`${LOG_PREFIX} Sending SMS to Mobitech`, {
              donationId,
              notificationId: notification.id,
              type: notification.type,
              recipient: notification.recipient,
              messageLength: message.length,
              attempt: notification.attempts + 1,
            });

            const response = await sendMobitechSms({
              mobile: normalizeKenyanPhone(notification.recipient),
              message,
            });

            console.log(`${LOG_PREFIX} Mobitech response received`, {
              donationId,
              notificationId: notification.id,
              success: response?.success,
              messageId: response?.messageId ?? null,
              message: response?.message,
            });

            if (response?.success !== true) {
              throw new Error(
                response?.message ||
                  "SMS provider rejected the message.",
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

            console.log(`${LOG_PREFIX} SMS marked as SENT`, {
              donationId,
              notificationId: notification.id,
              providerId: response.messageId ?? null,
              timestamp: new Date().toISOString(),
            });

            return {
              success: true,
              id: notification.id,
              providerId: response.messageId ?? null,
            };
          } catch (error) {
            console.error(`${LOG_PREFIX} SMS sending or update failed`, {
              donationId,
              notificationId: notification.id,
              type: notification.type,
              errorName: error.name,
              message: error.message,
              providerStatus: error.response?.status,
              providerCode: error.code,
              timestamp: new Date().toISOString(),
            });

            try {
              await prisma.notification.update({
                where: { id: notification.id },
                data: {
                  status: "FAILED",
                  lastError: String(
                    error?.message || "SMS sending failed",
                  ).slice(0, 1000),
                },
              });

              console.log(`${LOG_PREFIX} Notification marked as FAILED`, {
                donationId,
                notificationId: notification.id,
              });
            } catch (databaseError) {
              console.error(
                `${LOG_PREFIX} Could not save FAILED status`,
                {
                  donationId,
                  notificationId: notification.id,
                  message: databaseError.message,
                  code: databaseError.code,
                },
              );
            }

            throw error;
          }
        }),
      );

      const summary = results.map((result) =>
        result.status === "fulfilled"
          ? result.value
          : {
              success: false,
              error: result.reason?.message || "Unknown error",
            },
      );

      const finalResult = {
        success:
          summary.length > 0 &&
          summary.every((result) => result.success),
        total: notifications.length,
        results: summary,
      };

      console.log(`${LOG_PREFIX} SMS processing completed`, {
        donationId,
        total: finalResult.total,
        successful: summary.filter((item) => item.success).length,
        failed: summary.filter((item) => !item.success).length,
        success: finalResult.success,
        timestamp: new Date().toISOString(),
      });

      return finalResult;
    } catch (error) {
      console.error(`${LOG_PREFIX} SMS processing crashed`, {
        donationId,
        message: error.message,
        code: error.code,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  },
};

export default notificationService;
