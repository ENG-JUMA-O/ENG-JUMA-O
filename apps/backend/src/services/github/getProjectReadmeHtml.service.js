import githubClient from "../../config/github.client.js";
import githubConfig from "../../config/github.config.js";
import getProjectReadmeService from "./getProjectReadme.service.js";
import { asyncCache } from "../../utils/cache.js";

const getProjectReadmeHtmlService = async (requestDto) => {
  const { repositoryName } = requestDto;

  const cacheKey = `github:readme-html:${repositoryName.toLowerCase()}`;

  return asyncCache(cacheKey, async () => {
    const readme = await getProjectReadmeService({ repositoryName });

    if (!readme.content) {
      return "";
    }

    const { data } = await githubClient.post("/markdown", {
      text: readme.content,
      mode: "gfm",
      context: `${githubConfig.username}/${repositoryName}`,
    });

    return data;
  }, 60_000);
};

export default getProjectReadmeHtmlService;