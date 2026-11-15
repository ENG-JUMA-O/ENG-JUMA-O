import prisma from "../../config/prisma.js";

export default async function payHeroCallbackService(payload) {
    const response = payload.response;

    if (!response?.ExternalReference) {
        throw new Error("Missing payment external reference");
    }

    const status =
        response.ResultCode === 0 && response.Status === "Success"
            ? "SUCCESS"
            : "FAILED";

    const donation = await prisma.donation.update({
        where: {
            externalReference: response.ExternalReference,
        },
        data: {
            status,
            checkoutRequestId: response.CheckoutRequestID ?? undefined,
            merchantRequestId: response.MerchantRequestID ?? undefined,
            mpesaReceiptNumber: response.MpesaReceiptNumber ?? undefined,
            providerResultCode:
                response.ResultCode !== undefined
                    ? String(response.ResultCode)
                    : undefined,
            providerResultDescription: response.ResultDesc ?? undefined,
            paidAt: status === "SUCCESS" ? new Date() : undefined,
        },
    });

    return donation;
}