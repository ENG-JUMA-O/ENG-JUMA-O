export default function smsWebhookResponseDto(data) {
    return {
        success: data.success,
        message: data.message,
    };
}