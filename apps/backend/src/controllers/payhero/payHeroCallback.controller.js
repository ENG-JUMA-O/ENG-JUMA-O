import payHeroCallbackService from "../../services/payhero/payHeroCallback.service.js";

export default async function payHeroCallbackController(req, res, next) {
    try {
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