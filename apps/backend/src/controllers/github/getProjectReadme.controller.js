import  getProjectReadmeService  from "../../services/github/getProjectReadme.service.js";
import { getProjectReadmeRequestDto } from "../../dtos/github/requests/getProjectReadme.request.dto.js";
import { getProjectReadmeResponseDto } from "../../dtos/github/responses/getProjectReadme.response.dto.js";

const getProjectReadme = async (req, res, next) => {
  try {
    const requestDto = getProjectReadmeRequestDto(req.params);
    const readme = await getProjectReadmeService(requestDto);

    return res.status(200).json({
      success: true,
      message: "Project README retrieved successfully",
      data: getProjectReadmeResponseDto(readme),
    });
  } catch (error) {
    next(error);
  }
};

export default getProjectReadme;