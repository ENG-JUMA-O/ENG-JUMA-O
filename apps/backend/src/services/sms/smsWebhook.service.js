
import crypto from "node:crypto";

import smsConfig from "../../config/sms.config.js";
import notificationRepository from "../../repositories/notification/notification.repository.js";
import normalizePhoneNumber from "../../utils/sms/normalizePhoneNumber.js";

export default async function smsWebhookService(rawBody, signature) {
    const secret = smsConfig.webhookSecret;

    if (!secret) {
        throw new Error("Webhook secret is not configured");
    }

    if (!rawBody || !Buffer.isBuffer(rawBody)) {
        throw new Error("Raw webhook body is missing");
    }

    if (!signature || !/^[a-f0-9]{64}$/i.test(signature)) {
        throw new Error("Invalid webhook signature");
    }

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(rawBody)
        .digest();

    const receivedSignature = Buffer.from(signature, "hex");

    if (!crypto.timingSafeEqual(receivedSignature, expectedSignature)) {
        throw new Error("Invalid webhook signature");
    }

    let data;

    try {
        data = JSON.parse(rawBody.toString("utf8"));
    } catch {
        throw new Error("Invalid webhook payload");
    }

    const providerId = data.message_id;
    const recipient = normalizePhoneNumber(data.recipient);
    const providerStatus = String(data.status || "").toLowerCase();

    if (!providerId || !recipient || !providerStatus) {
        throw new Error("Invalid webhook payload");
    }

    const notification =
        await notificationRepository.findByProviderIdAndRecipient(
            providerId,
            recipient
        );

    if (!notification) {
        return {
            success: true,
            message: "Notification not found",
            ignored: true,
        };
    }

    if (["SENT", "FAILED"].includes(notification.status)) {
        return {
            success: true,
            message: "Notification already processed",
            ignored: true,
        };
    }

    const deliveredStatuses = ["delivered", "success", "sent"];
    const failedStatuses = ["failed", "rejected", "undelivered"];

    let status = notification.status;
    let sentAt;

    if (deliveredStatuses.includes(providerStatus)) {
        status = "SENT";

        const deliveredAt = data.delivered_at
            ? new Date(data.delivered_at)
            : new Date();

        sentAt = Number.isNaN(deliveredAt.getTime())
            ? new Date()
            : deliveredAt;
    } else if (failedStatuses.includes(providerStatus)) {
        status = "FAILED";
    }

    const updatedNotification = await notificationRepository.update(
        notification.id,
        {
            status,
            providerStatus: data.status,
            ...(sentAt ? { sentAt } : {}),
            ...(status === "FAILED"
                ? { lastError: data.error || "SMS delivery failed" }
                : {}),
        }
    );

    return {
        success: true,
        message: "SMS notification updated successfully",
        notificationId: updatedNotification.id,
        status: updatedNotification.status,
    };
}
