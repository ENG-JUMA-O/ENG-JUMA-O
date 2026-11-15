
import payHeroCallbackService from "../../services/payhero/payHeroCallback.service.js";

export default async function payHeroCallbackController(req, res, next) {
    try {
        console.log("PAYHERO CALLBACK BODY:", {
            topLevelKeys: Object.keys(req.body ?? {}),
            status: req.body?.status,
            responseKeys: Object.keys(req.body?.response ?? {}),
            externalReference: req.body?.response?.ExternalReference,
            resultCode: req.body?.response?.ResultCode,
            paymentStatus: req.body?.response?.Status,
        });

        const donation = await payHeroCallbackService(req.body);

        return res.status(200).json({
            success: true,
            message: "Payment callback processed successfully",
            data: {
                donationId: donation.id,
                externalReference: donation.externalReference,
                status: donation.status,
            },
        });
    } catch (error) {
        next(error);
    }
}
