export default function initiateStkPushRequestDto(body) {
    return {
        amount: body.amount,
        phone_number: body.phone_number,
        channel_id: body.channel_id,
        provider: body.provider,
        message: body.message,
        isAnonymous: body.isAnonymous,
        external_reference: body.external_reference,
        callback_url: body.callback_url,
    };
}