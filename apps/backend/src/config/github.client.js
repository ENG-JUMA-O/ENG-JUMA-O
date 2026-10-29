
import axios from "axios";
import githubConfig from "./github.config.js";

const headers = {
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": githubConfig.apiVersion,
};

if (githubConfig.token) {
  headers.Authorization = `Bearer ${githubConfig.token}`;
}

const githubClient = axios.create({
  baseURL: githubConfig.apiUrl,
  timeout: 10000,
  headers,
});

// Log outgoing requests during development.
githubClient.interceptors.request.use(
  (config) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[GitHub API] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      );
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// Log responses and normalize useful error details.
githubClient.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[GitHub API] ${response.status} ${response.config.url}`,
      );
    }

    return response;
  },
  (error) => {
    if (process.env.NODE_ENV !== "production") {
      console.error("[GitHub API Error]", {
        method: error.config?.method?.toUpperCase(),
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        rateLimitRemaining:
          error.response?.headers?.["x-ratelimit-remaining"],
        rateLimitReset:
          error.response?.headers?.["x-ratelimit-reset"],
      });
    }

    return Promise.reject(error);
  },
);

export default githubClient;
