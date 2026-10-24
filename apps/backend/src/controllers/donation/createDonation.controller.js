
import donationService from "../../services/donation.service.js";

import { createDonationRequestDto } from "../../dtos/donation/requests/createDonation.request.dto.js";
import { createDonationResponseDto } from "../../dtos/donation/responses/createDonation.response.dto.js";

export default async function createDonation(req, res, next) {
  try {
    const requestDto = createDonationRequestDto(req.body);

    const result = await donationService.createDonation(requestDto);

    return res.status(201).json(
      createDonationResponseDto(result),
    );
  } catch (error) {
    next(error);
  }
}
