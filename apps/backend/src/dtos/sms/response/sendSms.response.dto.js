
export default function sendSmsResponseDto(data) {
    return {
        success: data.success,
        sandbox: data.sandbox,
        message_id: data.message_id,
        accepted: data.accepted,
        rejected: data.rejected,
        sms_segments: data.sms_segments,
        total_units: data.total_units,
        refunded_units: data.refunded_units,
        balance_after: data.balance_after,
        reference: data.reference,
    };
}
