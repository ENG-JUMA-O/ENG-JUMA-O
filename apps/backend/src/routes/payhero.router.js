
import { Router } from "express";

import initiateStkPush from "../controllers/payhero/initiateStkPush.controller.js";
import getPaymentChannels from "../controllers/payhero/getPaymentChannels.controller.js";
import getWalletBalance from "../controllers/payhero/getWalletBalance.controller.js";
import getTransactionStatus from "../controllers/payhero/getTransactionStatus.controller.js";
import getTransactions from "../controllers/payhero/getTransactions.controller.js";
import topUpWallet from "../controllers/payhero/topUpWallet.controller.js";
import payHeroCallback from "../controllers/payhero/payHeroCallback.controller.js";

const router = Router();

// Payments
router.post("/payments", initiateStkPush);
router.post("/callback", payHeroCallback);
router.get("/payment_channels", getPaymentChannels);
router.get("/wallets", getWalletBalance);
router.post("/topup", topUpWallet);
router.get("/transaction-status", getTransactionStatus);
router.get("/transactions", getTransactions);

export default router;
