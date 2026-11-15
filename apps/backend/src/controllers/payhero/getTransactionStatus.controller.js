import getTransactionStatusService from "../../services/payhero/getTransactionStatus.service.js";

export default async function getTransactionStatusController(req, res, next) {
    try {
        const data = await getTransactionStatusService(req.query);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}