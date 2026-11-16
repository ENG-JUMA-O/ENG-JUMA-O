export default function getSmsBalanceResponseDto(data) {
    return {
        balance: data.balance,
        currency: data.currency,
        kes_value: data.kes_value,
        rate_per_unit_kes: data.rate_per_unit_kes,
        sandbox: data.sandbox,
        key_name: data.key_name,
        key_prefix: data.key_prefix,
    };
}