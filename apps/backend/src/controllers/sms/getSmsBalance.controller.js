import getSmsBalanceService from "../../services/sms/getSmsBalance.service.js";
import getSmsBalanceResponseDto from "../../dtos/sms/response/getSmsBalance.response.dto.js";

export default async function getSmsBalance(req, res) {
    try {
        const result = await getSmsBalanceService();
        const data = getSmsBalanceResponseDto(result);

        return res.status(200).json(data);
    } catch (error) {
        return res.status(error.response?.status || 500).json(
            error.response?.data || {
                success: false,
                error: error.message,
            }
        );
    }
}