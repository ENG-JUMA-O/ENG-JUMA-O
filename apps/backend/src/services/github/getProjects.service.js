import githubClient from "../../config/github.client.js";
import githubConfig from "../../config/github.config.js";
import { asyncCache } from "../../utils/cache.js";

const getProjectsService = async (requestDto = {}) => {
  const {
    page = 1,
    perPage = 20,
    sort = "updated",
    direction = "desc",
  } = requestDto;

  const cacheKey = `github:projects:${page}:${perPage}:${sort}:${direction}`;

  return asyncCache(cacheKey, async () => {
    const { data } = await githubClient.get(
      `/users/${encodeURIComponent(githubConfig.username)}/repos`,
      {
        params: {
          type: "owner",
          sort,
          direction,
          page,
          per_page: perPage,
        },
      },
    );

    return data.filter((repo) => !repo.fork && !repo.archived);
  }, 60_000);
};

export default getProjectsService;