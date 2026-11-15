import getPaymentChannelsService from "../../services/payhero/getPaymentChannels.service.js";

export default async function getPaymentChannelsController(req, res, next) {
    try {
        const data = await getPaymentChannelsService();

        return res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        next(error);
    }
}