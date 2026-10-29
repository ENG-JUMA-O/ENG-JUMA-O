import getProjectsService  from "../../services/github/getProjects.service.js";
import { getProjectsRequestDto } from "../../dtos/github/requests/getProjects.request.dto.js";
import { getProjectsResponseDto } from "../../dtos/github/responses/getProjects.response.dto.js";

const getProjects = async (req, res, next) => {
  try {
    const requestDto = getProjectsRequestDto(req.query);
    const repositories = await getProjectsService(requestDto);

    return res.status(200).json({
      success: true,
      message: "GitHub projects retrieved successfully",
      data: getProjectsResponseDto(repositories),
    });
  } catch (error) {
    next(error);
  }
};

export default getProjects;