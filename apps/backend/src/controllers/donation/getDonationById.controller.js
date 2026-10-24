
import donationService from "../../services/donation.service.js";

import { getDonationByIdResponseDto } from "../../dtos/donation/responses/getDonationById.response.dto.js";

export default async function getDonationById(req, res, next) {
  try {
    const donation = await donationService.getDonationById(req.params.id);

    if (!donation) {
      return res.status(404).json({
        success: false,
        message: "Donation not found",
      });
    }

    return res.status(200).json(
      getDonationByIdResponseDto(donation),
    );
  } catch (error) {
    next(error);
  }
}
