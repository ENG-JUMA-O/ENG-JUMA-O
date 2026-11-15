import initiateStkPushService from "../../services/payhero/initiateStkPush.service.js";
import initiateStkPushRequestDto from "../../dtos/payhero/request/initiateStkPush.request.dto.js";
import initiateStkPushResponseDto from "../../dtos/payhero/response/initiateStkPush.response.dto.js";

export default async function initiateStkPushController(req, res, next) {
    try {
        const request = initiateStkPushRequestDto(req.body);

        const result = await initiateStkPushService(request);

        return res.status(201).json(
            initiateStkPushResponseDto(result)
        );
    } catch (error) {
        next(error);
    }
}