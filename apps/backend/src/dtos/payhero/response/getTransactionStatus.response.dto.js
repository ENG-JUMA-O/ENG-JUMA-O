export default function getTransactionStatusResponseDto(data) {
    return {
        success: data.success,
        status: data.status,
        transaction: data.transaction,
    };
}
