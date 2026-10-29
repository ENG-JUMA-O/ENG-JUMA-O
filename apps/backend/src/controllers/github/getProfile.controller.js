import getProfileService from "../../services/github/getProfile.service.js";
import { getProfileRequestDto } from "../../dtos/github/requests/getProfile.request.dto.js";
import { getProfileResponseDto } from "../../dtos/github/responses/getProfile.response.dto.js";

const getProfile = async (req, res, next) => {
  try {
    getProfileRequestDto();

    const profile = await getProfileService();

    return res.status(200).json({
      success: true,
      message: "GitHub profile retrieved successfully",
      data: getProfileResponseDto(profile),
    });
  } catch (error) {
    next(error);
  }
};

export default getProfile;