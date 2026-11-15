export default function payHeroCallbackResponseDto(data) {
    return {
        forward_url: data.forward_url,
        response: {
            Amount: data.response.Amount,
            CheckoutRequestID: data.response.CheckoutRequestID,
            ExternalReference: data.response.ExternalReference,
            MerchantRequestID: data.response.MerchantRequestID,
            MpesaReceiptNumber: data.response.MpesaReceiptNumber,
            Phone: data.response.Phone,
            ResultCode: data.response.ResultCode,
            ResultDesc: data.response.ResultDesc,
            Status: data.response.Status,
        },
        status: data.status,
    };
}
