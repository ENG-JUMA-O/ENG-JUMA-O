export default function getTransactionsResponseDto(data) {
    return {
        success: data.success,
        transactions: data.transactions,
        pagination: data.pagination,
    };
}
