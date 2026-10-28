
import { apiRequest } from "./api.js";

export const githubService = {
  getProfile() {
    return apiRequest("/api/github/profile");
  },

  getProjects({ page = 1, perPage = 10 } = {}) {
    const params = new URLSearchParams({
      page: String(page),
      perPage: String(perPage),
    });

    return apiRequest(`/api/github/projects?${params.toString()}`);
  },

  getProject(repositoryName) {
    return apiRequest(
      `/api/github/projects/${encodeURIComponent(repositoryName)}`
    );
  },

  getProjectReadme(repositoryName) {
    return apiRequest(
      `/api/github/projects/${encodeURIComponent(repositoryName)}/readme`
    );
  },

  getProjectReadmeHtml(repositoryName) {
    return apiRequest(
      `/api/github/projects/${encodeURIComponent(repositoryName)}/readme/html`
    );
  },
};

export default githubService;
