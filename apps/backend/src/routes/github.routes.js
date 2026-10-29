
import { Router } from "express";

import getProfile from "../controllers/github/getProfile.controller.js";
import getProjects from "../controllers/github/getProjects.controller.js";
import getProject from "../controllers/github/getProject.controller.js";
import getProjectReadme from "../controllers/github/getProjectReadme.controller.js";
import getProjectReadmeHtml from "../controllers/github/getProjectReadmeHtml.controller.js";

import {
  profileRateLimit,
  projectsRateLimit,
  projectRateLimit,
  projectReadmeRateLimit,
  projectReadmeHtmlRateLimit,
} from "../middlewares/githubRateLimit.middleware.js";

import {
  profileValidator,
  projectsValidator,
  projectValidator,
  projectReadmeValidator,
  projectReadmeHtmlValidator,
  validateRequest,
} from "../validators/github.validator.js";

const router = Router();

router.get("/profile", profileRateLimit, profileValidator, validateRequest, getProfile);
router.get("/projects", projectsRateLimit, projectsValidator, validateRequest, getProjects);
router.get("/projects/:repositoryName", projectRateLimit, projectValidator, validateRequest, getProject);
router.get("/projects/:repositoryName/readme/html", projectReadmeHtmlRateLimit, projectReadmeHtmlValidator, validateRequest, getProjectReadmeHtml);
router.get("/projects/:repositoryName/readme", projectReadmeRateLimit, projectReadmeValidator, validateRequest, getProjectReadme);


export default router;
