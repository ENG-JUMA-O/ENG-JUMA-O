
import smsClient from "../../config/sms.client.js";
import smsConfig from "../../config/sms.config.js";
import notificationRepository from "../../repositories/notification/notification.repository.js";
import normalizePhoneNumber from "../../utils/sms/normalizePhoneNumber.js";

export default async function scheduleSmsService(request) {
    const accepted = [];
    const rejected = [];
    const seen = new Set();

    request.to.forEach((recipient, index) => {
        const normalized = normalizePhoneNumber(recipient);

        if (normalized) {
            if (!seen.has(normalized)) {
                seen.add(normalized);
                accepted.push(normalized);
            }
        } else {
            rejected.push({
                recipient,
                error: "Invalid phone number format",
                field: `to[${index}]`,
            });
        }
    });

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

    const notifications = await Promise.all(
        accepted.map((recipient) =>
            notificationRepository.create({
                type: "GENERAL_SMS",
                recipient,
                message: request.message ?? null,
                status: "PENDING",
            })
        )
    );

    const payload = {
        to: accepted,
        message: request.message,
        send_at: request.send_at,
        sender_id: request.sender_id || smsConfig.senderId,
    };

    if (request.callback_url) {
        payload.callback_url = request.callback_url;
    }

    if (request.reference) {
        payload.reference = request.reference;
    }

    let data;

    try {
        const response = await smsClient.post(
            "/api-schedule-sms",
            payload
        );

        data = response.data;
    } catch (error) {
        const rejectedByProvider =
            error.response &&
            error.response.status >= 400 &&
            error.response.status < 500;

        await Promise.all(
            notifications.map((notification) =>
                notificationRepository.update(notification.id, {
                    status: rejectedByProvider ? "FAILED" : "PENDING",
                    attempts: { increment: 1 },
                    lastError:
                        error.response?.data?.message ??
                        error.message ??
                        "SMS scheduling failed",
                })
            )
        );

        throw error;
    }

    await Promise.all(
        notifications.map((notification) =>
            notificationRepository.update(notification.id, {
                status: "PENDING",
                providerId: data.scheduled_id ?? null,
                providerStatus: data.status ?? "SCHEDULED",
                attempts: { increment: 1 },
                lastError: null,
            })
        )
    );

    return {
        ...data,
        rejected,
        notificationIds: notifications.map(
            (notification) => notification.id
        ),
    };
}
