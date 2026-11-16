
import sendSmsService from "../../services/sms/sendSms.service.js";
import sendSmsRequestDto from "../../dtos/sms/request/sendSms.request.dto.js";
import sendSmsResponseDto from "../../dtos/sms/response/sendSms.response.dto.js";

export default async function sendSms(req, res) {
    try {
        const request = sendSmsRequestDto(req.body);
        const result = await sendSmsService(request);

        if (result.validationError) {
            return res.status(400).json({
                success: false,
                error: result.error,
                fields: result.fields,
            });
        }

        const data = sendSmsResponseDto(result);

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
