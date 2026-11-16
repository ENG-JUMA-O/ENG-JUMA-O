import { Router } from "express";

import sendSms from "../controllers/sms/sendSms.controller.js";
import scheduleSms from "../controllers/sms/scheduleSms.controller.js";
import getSmsBalance from "../controllers/sms/getSmsBalance.controller.js";
import smsWebhook from "../controllers/sms/smsWebhook.controller.js";

const router = Router();

router.post("/send", sendSms);
router.post("/schedule", scheduleSms);
router.get("/balance", getSmsBalance);
router.post("/webhook", smsWebhook);

export default router;