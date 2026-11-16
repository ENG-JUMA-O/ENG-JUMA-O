
import smsWebhookService from "../../services/sms/smsWebhook.service.js";
import smsWebhookResponseDto from "../../dtos/sms/response/smsWebhook.response.dto.js";

export default async function smsWebhook(req, res) {
    try {
        const result = await smsWebhookService(
            req.rawBody,
            req.header("X-Signature")
        );

        const data = smsWebhookResponseDto(result);

        return res.status(200).json(data);
    } catch (error) {
        if (error.message === "Invalid webhook signature") {
            return res.status(401).json({
                success: false,
                error: error.message,
            });
        }

        if (error.message === "Raw webhook body is missing") {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        if (error.message === "Invalid webhook payload") {
            return res.status(400).json({
                success: false,
                error: error.message,
            });
        }

        return res.status(500).json({
            success: false,
            error: "Webhook processing failed",
        });
    }
}
