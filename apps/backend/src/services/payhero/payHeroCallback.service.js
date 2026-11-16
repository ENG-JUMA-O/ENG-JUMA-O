import prisma from "../../config/prisma.js";
import smsClient from "../../config/sms.client.js";
import smsConfig from "../../config/sms.config.js";
import notificationRepository from "../../repositories/notification/notification.repository.js";

export default async function payHeroCallbackService(payload) {
    const response = payload.response;

    if (!response?.ExternalReference) {
        throw new Error("Missing payment external reference");
    }

    const status =
        response.ResultCode === 0 && response.Status === "Success"
            ? "SUCCESS"
            : "FAILED";

    const donation = await prisma.donation.update({
        where: {
            externalReference: response.ExternalReference,
        },
        data: {
            status,
            checkoutRequestId: response.CheckoutRequestID ?? undefined,
            merchantRequestId: response.MerchantRequestID ?? undefined,
            mpesaReceiptNumber: response.MpesaReceiptNumber ?? undefined,
            providerResultCode:
                response.ResultCode !== undefined
                    ? String(response.ResultCode)
                    : undefined,
            providerResultDescription: response.ResultDesc ?? undefined,
            paidAt: status === "SUCCESS" ? new Date() : undefined,
        },
    });

    if (status === "SUCCESS") {
        const notifications =
            await notificationRepository.findByDonationId(donation.id);

        const smsNotifications = notifications.filter(
            (notification) =>
                [
                    "SUPPORTER_DONATION_RECEIPT",
                    "COFFEE_RECIPIENT_NOTIFICATION",
                ].includes(notification.type) &&
                notification.status === "PENDING"
        );

        for (const notification of smsNotifications) {
            if (!notification.message) {
                await notificationRepository.update(notification.id, {
                    status: "FAILED",
                    lastError: "Notification message is missing",
                });

                continue;
            }

            const claimed = await notificationRepository.updateMany(
                {
                    id: notification.id,
                    status: "PENDING",
                },
                {
                    status: "SENDING",
                }
            );

            if (claimed.count === 0) {
                continue;
            }

            try {
                const { data } = await smsClient.post("/api-send-sms", {
                    to: [notification.recipient],
                    message: notification.message,
                    sender_id: smsConfig.senderId,
                });

                await notificationRepository.update(notification.id, {
                    providerId: data.message_id ?? null,
                    providerStatus: data.status ?? "QUEUED",
                    attempts: { increment: 1 },
                    lastError: null,
                });
            } catch (error) {
                const rejectedByProvider =
                    error.response &&
                    error.response.status >= 400 &&
                    error.response.status < 500;

                await notificationRepository.update(notification.id, {
                    status: rejectedByProvider ? "FAILED" : "SENDING",
                    attempts: { increment: 1 },
                    lastError:
                        error.response?.data?.message ??
                        error.message ??
                        "SMS sending failed",
                });
            }
        }
    }

    return donation;
}