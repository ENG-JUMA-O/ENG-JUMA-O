import donationService from "../../services/donation.service.js";
import { payHeroCallbackRequestDto } from "../../dtos/donation/requests/payHeroCallback.request.dto.js";

export default async function handlePayHeroCallback(req, res, next) {
  try {
    const callbackDto = payHeroCallbackRequestDto(req.body);
    const result = await donationService.handlePayHeroCallback(callbackDto);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
