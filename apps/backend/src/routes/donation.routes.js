import { Router } from "express";

import createDonation from "../controllers/donation/createDonation.controller.js";
import getDonationById from "../controllers/donation/getDonationById.controller.js";
import handlePayHeroCallback from "../controllers/donation/handlePayHeroCallback.controller.js";

import {
  createDonationRateLimit,
  donationCallbackRateLimit,
  getDonationRateLimit,
} from "../middlewares/donationRateLimit.middleware.js";

import {
  validateCreateDonation,
  validatePayHeroCallback,
  validateDonationId,
} from "../validators/donation.validator.js";

const router = Router();

router.post("/", createDonationRateLimit, validateCreateDonation, createDonation);
router.post("/callback", donationCallbackRateLimit, validatePayHeroCallback, handlePayHeroCallback);
router.get("/:id", getDonationRateLimit, validateDonationId, getDonationById);

export default router;
