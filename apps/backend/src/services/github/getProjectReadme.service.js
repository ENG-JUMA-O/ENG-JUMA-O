import githubClient from "../../config/github.client.js";
import githubConfig from "../../config/github.config.js";
import { asyncCache } from "../../utils/cache.js";

const getProjectReadmeService = async (requestDto) => {
  const { repositoryName } = requestDto;

  const cacheKey = `github:readme:${repositoryName.toLowerCase()}`;

  return asyncCache(cacheKey, async () => {
    const { data } = await githubClient.get(
      `/repos/${encodeURIComponent(githubConfig.username)}/${encodeURIComponent(repositoryName)}/readme`,
    );

    const content =
      data.content && data.encoding === "base64"
        ? Buffer.from(data.content.replace(/\s/g, ""), "base64").toString("utf8")
        : data.content ?? "";

    return {
      ...data,
      content,
      encoding: "utf-8",
    };
  }, 60_000);
};

export default getProjectReadmeService;