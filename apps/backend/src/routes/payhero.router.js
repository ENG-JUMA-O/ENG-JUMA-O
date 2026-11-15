import { Router } from "express";

import initiateStkPush from "../controllers/payhero/initiateStkPush.controller.js";
import getPaymentChannels from "../controllers/payhero/getPaymentChannels.controller.js";
import getWalletBalance from "../controllers/payhero/getWalletBalance.controller.js";
import getTransactionStatus from "../controllers/payhero/getTransactionStatus.controller.js";
import getTransactions from "../controllers/payhero/getTransactions.controller.js";
import topUpWallet from "../controllers/payhero/topUpWallet.controller.js";
import payHeroCallback from "../controllers/payhero/payHeroCallback.controller.js";

import payHeroCallbackAuth from "../middleware/payheroCallbackAuth.middleware.js";

import { paymentLimiter,
         callbackLimiter,
         topUpLimiter,
         readLimiter } from "../middleware/payheroRateLimit.middleware.js";
import { initiatePaymentValidator,
         callbackValidator,
         transactionStatusValidator } from "../validators/payhero.validators.js";

const router = Router();

// Payments
router.post("/payments", paymentLimiter, initiatePaymentValidator, initiateStkPush);
router.post("/callback", callbackLimiter, payHeroCallbackAuth, callbackValidator, payHeroCallback);
router.get("/payment_channels", readLimiter, getPaymentChannels);
router.get("/wallets", readLimiter, getWalletBalance);
router.post("/topup", topUpLimiter, topUpWallet);
router.get("/transaction-status", readLimiter, transactionStatusValidator, getTransactionStatus);
router.get("/transactions", readLimiter, getTransactions);

export default router;
