export default function scheduleSmsResponseDto(data) {
    return {
        success: data.success,
        scheduled_id: data.scheduled_id,
        send_at: data.send_at,
        status: data.status,
        sms_segments: data.sms_segments,
        total_units: data.total_units,
        sandbox: data.sandbox,
    };
}