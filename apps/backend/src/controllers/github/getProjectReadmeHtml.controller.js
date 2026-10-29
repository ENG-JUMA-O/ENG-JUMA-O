import  getProjectReadmeHtmlService  from "../../services/github/getProjectReadmeHtml.service.js";
import { getProjectReadmeHtmlRequestDto } from "../../dtos/github/requests/getProjectReadmeHtml.request.dto.js";
import { getProjectReadmeHtmlResponseDto } from "../../dtos/github/responses/getProjectReadmeHtml.response.dto.js";

const getProjectReadmeHtml = async (req, res, next) => {
  try {
    const requestDto = getProjectReadmeHtmlRequestDto(req.params);
    const html = await getProjectReadmeHtmlService(requestDto);

    return res.status(200).json({
      success: true,
      message: "Project README HTML retrieved successfully",
      data: getProjectReadmeHtmlResponseDto(html),
    });
  } catch (error) {
    next(error);
  }
};

export default getProjectReadmeHtml;