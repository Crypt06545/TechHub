import express, { Router } from "express";
import {
  sslInitController,
  sslIpnController,
  sslSuccessController,
  sslFailController,
  sslCancelController,
  stripeIntentController,
  stripeWebhookController,
} from "../controllers/payment.controller.js";
import authMiddleware from "../middleware/authMiddleware.js";

const paymentRouter = Router();

// ─── SSLCommerz ───────────────────────────────────────────────────────────────

paymentRouter.post("/ssl/init", authMiddleware, sslInitController);
paymentRouter.post("/ssl/ipn", sslIpnController); // no auth — SSLCommerz server
paymentRouter.post("/ssl/success", sslSuccessController); // no auth — browser redirect
paymentRouter.post("/ssl/fail", sslFailController);
paymentRouter.post("/ssl/cancel", sslCancelController);

// ─── Stripe ───────────────────────────────────────────────────────────────────

paymentRouter.post("/stripe/intent", authMiddleware, stripeIntentController);
paymentRouter.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookController, // no auth — Stripe server
);

export default paymentRouter;
