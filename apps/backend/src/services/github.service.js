
import githubClient from "../config/github.client.js";
import githubConfig from "../config/github.config.js";
import { asyncCache } from "../utils/cache.js";

class GitHubService {
async getProfile() {
  return asyncCache("github:profile", async () => {
    const { data } = await githubClient.get(
      `/users/${encodeURIComponent(githubConfig.username)}`
    );

    return {
      username: data.login,
      name: data.name,
      avatarUrl: data.avatar_url,
      bio: data.bio,
      profileUrl: data.html_url,
      publicRepositories: data.public_repos,
      followers: data.followers,
      following: data.following,
    };
  }, 60_000);
}

 async getProjects({ page = 1, perPage = 20 } = {}) {
  const cacheKey = `github:projects:${page}:${perPage}`;

  return asyncCache(cacheKey, async () => {
    const { data } = await githubClient.get(
      `/users/${encodeURIComponent(githubConfig.username)}/repos`,
      {
        params: {
          type: "owner",
          sort: "updated",
          direction: "desc",
          page,
          per_page: perPage,
        },
      }
    );

    return data
      .filter((repo) => !repo.fork && !repo.archived)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        topics: repo.topics ?? [],
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        githubUrl: repo.html_url,
        homepage: repo.homepage || null,
        visibility: repo.visibility,
        createdAt: repo.created_at,
        updatedAt: repo.updated_at,
      }));
  }, 60_000);
}

  async getProject(repositoryName) {
  const cacheKey = `github:project:${repositoryName.toLowerCase()}`;

  return asyncCache(cacheKey, async () => {
    const { data } = await githubClient.get(
      `/repos/${encodeURIComponent(githubConfig.username)}/${encodeURIComponent(repositoryName)}`
    );

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      language: data.language,
      topics: data.topics ?? [],
      stars: data.stargazers_count,
      forks: data.forks_count,
      githubUrl: data.html_url,
      homepage: data.homepage || null,
      updatedAt: data.updated_at,
    };
  }, 60_000);
}


async getProjectReadme(repositoryName) {
  const cacheKey = `github:readme:${repositoryName.toLowerCase()}`;

  return asyncCache(
    cacheKey,
    async () => {
      const { data } = await githubClient.get(
        `/repos/${encodeURIComponent(githubConfig.username)}/${encodeURIComponent(repositoryName)}/readme`
      );

      if (!data.content) {
        return {
          repositoryName: data.name,
          fileName: data.path,
          content: "",
          htmlUrl: data.html_url,
          size: data.size,
        };
      }

      const content = Buffer.from(
        data.content.replace(/\s/g, ""),
        "base64"
      ).toString("utf8");

      return {
        repositoryName: data.name,
        fileName: data.path,
        content,
        htmlUrl: data.html_url,
        size: data.size,
      };
    },
    60_000
  );
}

}

export default new GitHubService();
