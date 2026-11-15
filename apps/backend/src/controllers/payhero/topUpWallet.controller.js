import topUpWalletService from "../../services/payhero/topUpWallet.service.js";

export default async function topUpWalletController(req, res, next) {
    try {
        const data = await topUpWalletService(req.body);

        return res.status(200).json({
            success: true,
            message: "Wallet top-up request submitted successfully",
            data,
        });
    } catch (error) {
        next(error);
    }
}