
export default function sendSmsRequestDto(body) {
    return {
        to: Array.isArray(body.to) ? body.to : [body.to],
        message: body.message,
        sender_id: body.sender_id,
        callback_url: body.callback_url,
        reference: body.reference,
    };
}
