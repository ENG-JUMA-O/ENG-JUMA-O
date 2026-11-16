import scheduleSmsService from "../../services/sms/scheduleSms.service.js";
import scheduleSmsRequestDto from "../../dtos/sms/request/scheduleSms.request.dto.js";
import scheduleSmsResponseDto from "../../dtos/sms/response/scheduleSms.response.dto.js";

export default async function scheduleSms(req, res) {
    try {
        const request = scheduleSmsRequestDto(req.body);
        const result = await scheduleSmsService(request);

        if (result.validationError) {
            return res.status(400).json(result);
        }

        const data = scheduleSmsResponseDto(result);

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