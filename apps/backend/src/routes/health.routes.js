
import { Router } from "express";

import {
  getApiStatus,
  getHealthStatus,
} from "../controllers/health/health.controller.js";

const router = Router();

router.get("/", getApiStatus);
router.get("/api/health", getHealthStatus);

export default router;
