import githubClient from "../../config/github.client.js";
import githubConfig from "../../config/github.config.js";
import { asyncCache } from "../../utils/cache.js";

const getProfileService = async () =>
  asyncCache("github:profile", async () => {
    const { data } = await githubClient.get(
      `/users/${encodeURIComponent(githubConfig.username)}`,
    );

    return data;
  }, 60_000);

export default getProfileService;