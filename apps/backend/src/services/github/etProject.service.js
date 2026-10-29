
import githubClient from "../../config/github.client.js";
import githubConfig from "../../config/github.config.js";
import { asyncCache } from "../../utils/cache.js";

const getProjectService = async (requestDto) => {
  const { repositoryName } = requestDto;

  const cacheKey = `github:project:${repositoryName.toLowerCase()}`;

  return asyncCache(
    cacheKey,
    async () => {
      const { data } = await githubClient.get(
        `/repos/${encodeURIComponent(githubConfig.username)}/${encodeURIComponent(repositoryName)}`,
      );

      return data;
    },
    60_000,
  );
};

export default getProjectService;
