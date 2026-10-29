import { rateLimit } from "express-rate-limit";

const createGitHubRateLimit = (limit, message) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
      success: false,
      message,
    },
  });

export const profileRateLimit = createGitHubRateLimit(
  60,
  "Too many profile requests. Please try again later."
);

export const projectsRateLimit = createGitHubRateLimit(
  60,
  "Too many project list requests. Please try again later."
);

export const projectRateLimit = createGitHubRateLimit(
  100,
  "Too many project detail requests. Please try again later."
);

export const projectReadmeRateLimit = createGitHubRateLimit(
  40,
  "Too many README requests. Please try again later."
);

export const projectReadmeHtmlRateLimit = createGitHubRateLimit(
  20,
  "Too many rendered README requests. Please try again later."
);
