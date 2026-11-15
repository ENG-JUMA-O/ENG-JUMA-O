export default function topUpWalletResponseDto(data) {
    return {
        success: data.success,
        message: data.message,
        reference: data.reference,
        status: data.status,
    };
}
