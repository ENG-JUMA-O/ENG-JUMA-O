
import getTransactionStatusService from "../../services/payhero/getTransactionStatus.service.js";

export default async function getTransactionStatusController(req, res, next) {
    try {
        const { reference } = req.query;

        if (!reference) {
            return res.status(400).json({
                success: false,
                message: "Transaction reference is required",
            });
        }

        const data = await getTransactionStatusService(reference);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}
