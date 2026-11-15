import getWalletBalanceService from "../../services/payhero/getWalletBalance.service.js";

export default async function getWalletBalanceController(req, res, next) {
    try {
        const data = await getWalletBalanceService();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}