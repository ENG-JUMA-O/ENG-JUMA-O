
export default function scheduleSmsRequestDto(body) {
    return {
        to: Array.isArray(body.to) ? body.to : [body.to],
        message: body.message,
        sender_id: body.sender_id,
        send_at: body.send_at,
        callback_url: body.callback_url,
        reference: body.reference,
    };
}
