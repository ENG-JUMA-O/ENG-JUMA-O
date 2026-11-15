import getTransactionsService from "../../services/payhero/getTransactions.service.js";

export default async function getTransactionsController(req, res, next) {
    try {
        const data = await getTransactionsService(req.query);

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}