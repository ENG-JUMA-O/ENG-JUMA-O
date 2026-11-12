
import githubClient from "../../config/github.client.js";
import githubConfig from "../../config/github.config.js";
import { asyncCache } from "../../utils/cache.js";

const CACHE_TTL = 60_000;

const getProfileService = async () => {
  const username = githubConfig.username;

  if (!username) {
    throw new Error("GitHub username is not configured.");
  }

  const cacheKey = `github:profile:${username.toLowerCase()}`;

  return asyncCache(
    cacheKey,
    async () => {
      const { data } = await githubClient.get(
        `/users/${encodeURIComponent(username)}`,
      );

      return data;
    },
    CACHE_TTL,
  );
};

export default getProfileService;
