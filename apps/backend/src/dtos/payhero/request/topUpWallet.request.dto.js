export default function topUpWalletRequestDto(body) {
    return {
        amount: body.amount,
        phone_number: body.phone_number,
    };
}
