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

export default githubClient;
