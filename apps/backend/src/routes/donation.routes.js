import { Router } from "express";

import createDonation from "../controllers/donation/createDonation.controller.js";
import getDonationById from "../controllers/donation/getDonationById.controller.js";
import handlePayHeroCallback from "../controllers/donation/handlePayHeroCallback.controller.js";

import { createDonationSchema, donationIdSchema } from "../validators/donation.validator.js";
import { validateBody, validateParams } from "../middleware/validate.middleware.js";
import { donationRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = Router();

router.post("/", donationRateLimiter, validateBody(createDonationSchema), createDonation);
router.post("/callback", handlePayHeroCallback);
router.get("/:id", validateParams(donationIdSchema), getDonationById);

export default router;
