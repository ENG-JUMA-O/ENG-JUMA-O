
import getProjectService from "../../services/github/etProject.service.js";
import { getProjectRequestDto } from "../../dtos/github/requests/getProject.request.dto.js";
import { getProjectResponseDto } from "../../dtos/github/responses/getProject.response.dto.js";

const getProject = async (req, res, next) => {
  try {
    const requestDto = getProjectRequestDto(req.params);
    const project = await getProjectService(requestDto);

    return res.status(200).json({
      success: true,
      message: "GitHub project retrieved successfully",
      data: getProjectResponseDto(project),
    });
  } catch (error) {
    next(error);
  }
};

export default getProject;
