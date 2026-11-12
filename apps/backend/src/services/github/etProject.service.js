
import githubClient from "../../config/github.client.js";
import githubConfig from "../../config/github.config.js";
import { asyncCache } from "../../utils/cache.js";

const CACHE_TTL = 60_000;

const getProjectService = async (requestDto = {}) => {
  const repositoryName = requestDto.repositoryName?.trim();

  if (!repositoryName) {
    throw new Error("Repository name is required.");
  }

  const username = githubConfig.username;

  if (!username) {
    throw new Error("GitHub username is not configured.");
  }

  const cacheKey = [
    "github:project",
    username.toLowerCase(),
    repositoryName.toLowerCase(),
  ].join(":");

  return asyncCache(
    cacheKey,
    async () => {
      const { data } = await githubClient.get(
        `/repos/${encodeURIComponent(username)}/${encodeURIComponent(repositoryName)}`,
      );

      return data;
    },
    CACHE_TTL,
  );
};

export default getProjectService;
