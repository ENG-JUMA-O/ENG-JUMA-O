export default function smsWebhookRequestDto(body) {
    return {
        message_id: body.message_id,
        status: body.status,
        recipient: body.recipient,
        delivered_at: body.delivered_at,
        error: body.error,
    };
}