export default function getPaymentChannelsResponseDto(data) {
    return {
        success: data.success,
        channels: data.channels,
    };
}
