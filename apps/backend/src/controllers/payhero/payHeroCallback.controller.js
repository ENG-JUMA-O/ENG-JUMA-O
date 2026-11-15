
import payHeroCallbackService from "../../services/payhero/payHeroCallback.service.js";

export default async function payHeroCallbackController(req, res, next) {
    try {
        const response = req.body?.response;

        // Handle PayHero transaction notifications separately
        const isTransactionNotification =
            response &&
            (
                "Transaction_Type" in response ||
                "MPESA_Reference" in response ||
                "Transaction_Reference" in response
            );

        if (!response?.ExternalReference && isTransactionNotification) {
            console.log("PayHero transaction notification received:", {
                transactionType: response.Transaction_Type,
                transactionReference: response.Transaction_Reference,
                sentAt: req.body?.sent_at,
            });

            return res.status(200).json({
                success: true,
                message: "Transaction notification received",
                ignored: true,
            });
        }

        // Process normal STK payment callback
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
