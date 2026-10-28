import "dotenv/config";

const githubConfig = {
  username: process.env.GITHUB_USERNAME,
  apiUrl: process.env.GITHUB_API_URL || "https://api.github.com",
  apiVersion: process.env.GITHUB_API_VERSION || "2022-11-28",
  token: process.env.GITHUB_TOKEN,
};

if (!githubConfig.username) {
  throw new Error("Missing required environment variable: GITHUB_USERNAME");
}

export default Object.freeze(githubConfig);