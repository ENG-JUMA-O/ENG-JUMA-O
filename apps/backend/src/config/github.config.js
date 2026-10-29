
import "dotenv/config";

const username = process.env.GITHUB_USERNAME?.trim();
const apiUrl = (
  process.env.GITHUB_API_URL || "https://api.github.com"
).trim().replace(/\/+$/, "");
const apiVersion = (
  process.env.GITHUB_API_VERSION || "2022-11-28"
).trim();
const token = process.env.GITHUB_TOKEN?.trim();

if (!username) {
  throw new Error(
    "[GitHub Config] Missing required environment variable: GITHUB_USERNAME",
  );
}

if (!/^https:\/\/[^/]+(?:\/.*)?$/.test(apiUrl)) {
  throw new Error(
    "[GitHub Config] GITHUB_API_URL must be a valid HTTPS URL",
  );
}

if (!apiVersion) {
  throw new Error(
    "[GitHub Config] GITHUB_API_VERSION cannot be empty",
  );
}

const githubConfig = {
  username,
  apiUrl,
  apiVersion,
  token: token || undefined,
};

export default Object.freeze(githubConfig);
