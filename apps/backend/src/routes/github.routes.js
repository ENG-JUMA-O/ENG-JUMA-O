
import { Router } from "express";
import {
  getProfile,
  getProjects,
  getProject,
  getProjectReadme,
  getProjectReadmeHtml,
} from "../controllers/github/github.controller.js";

const router = Router();

router.get("/profile", getProfile);
router.get("/projects", getProjects);
router.get("/projects/:repositoryName", getProject);
router.get(
  "/projects/:repositoryName/readme",
  getProjectReadme
);

router.get(
  "/projects/:repositoryName/readme/html",
  getProjectReadmeHtml
);

export default router;
