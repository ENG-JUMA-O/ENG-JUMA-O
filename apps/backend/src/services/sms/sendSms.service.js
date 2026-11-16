
import smsClient from "../../config/sms.client.js";
import smsConfig from "../../config/sms.config.js";
import notificationRepository from "../../repositories/notification/notification.repository.js";
import normalizePhoneNumber from "../../utils/sms/normalizePhoneNumber.js";

export default async function sendSmsService(request) {
    const accepted = [];
    const rejected = [];
    const recipients = [];
    const seen = new Set();

    request.to.forEach((recipient, index) => {
        const normalized = normalizePhoneNumber(recipient);

        if (normalized) {
            if (!seen.has(normalized)) {
                seen.add(normalized);
                accepted.push(normalized);
                recipients.push({
                    recipient: normalized,
                    valid: true,
                });
            }
        } else {
            rejected.push({
                recipient,
                error: "Invalid phone number format",
                field: `to[${index}]`,
            });

            const key = String(recipient);

            if (!seen.has(key)) {
                seen.add(key);
                recipients.push({
                    recipient: key,
                    valid: false,
                    error: "Invalid phone number format",
                });
            }
        }
    });

    const notifications = await Promise.all(
        recipients.map(({ recipient, valid, error }) =>
            notificationRepository.create({
                type: "GENERAL_SMS",
                recipient,
                message: request.message,
                status: valid ? "PENDING" : "FAILED",
                lastError: error ?? null,
            })
        )
    );

    if (accepted.length === 0) {
        return {
            validationError: true,
            error: "Validation failed",
            fields: rejected.reduce((fields, item) => {
                fields[item.field] = item.error;
                return fields;
            }, {}),
        };
    }

    const payload = {
        to: accepted,
        message: request.message,
        sender_id: request.sender_id || smsConfig.senderId,
    };

    if (request.callback_url) {
        payload.callback_url = request.callback_url;
    }

    if (request.reference) {
        payload.reference = request.reference;
    }

    const pendingNotifications = notifications.filter(
        (notification) => notification.status === "PENDING"
    );

    let data;

    try {
        const response = await smsClient.post("/api-send-sms", payload);
        data = response.data;
    } catch (error) {
        const rejectedByProvider =
            error.response &&
            error.response.status >= 400 &&
            error.response.status < 500;

        await Promise.all(
            pendingNotifications.map((notification) =>
                notificationRepository.update(notification.id, {
                    status: rejectedByProvider ? "FAILED" : "PENDING",
                    attempts: { increment: 1 },
                    lastError:
                        error.response?.data?.message ??
                        error.message ??
                        "SMS delivery request failed",
                })
            )
        );

        throw error;
    }

    await Promise.all(
        pendingNotifications.map((notification) =>
            notificationRepository.update(notification.id, {
                status: "SENDING",
                providerId: data.message_id ?? null,
                providerStatus: data.status ?? "QUEUED",
                attempts: { increment: 1 },
                lastError: null,
            })
        )
    );

    return {
        ...data,
        rejected: [
            ...(data.rejected || []),
            ...rejected,
        ],
        notificationIds: notifications.map(
            (notification) => notification.id
        ),
    };
}
