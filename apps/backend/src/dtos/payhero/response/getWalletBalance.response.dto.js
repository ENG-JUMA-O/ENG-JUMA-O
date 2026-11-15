export default function getWalletBalanceResponseDto(data) {
    return {
        success: data.success,
        balance: data.balance,
        currency: data.currency,
    };
}
