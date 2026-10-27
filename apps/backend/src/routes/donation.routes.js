
import { Router } from "express";

import createDonation from "../controllers/donation/createDonation.controller.js";
import getDonationById from "../controllers/donation/getDonationById.controller.js";
import handlePayHeroCallback from "../controllers/donation/handlePayHeroCallback.controller.js";

const router = Router();

router.post("/", createDonation);
router.post("/callback", handlePayHeroCallback);
router.get("/:id", getDonationById);

export default router;
