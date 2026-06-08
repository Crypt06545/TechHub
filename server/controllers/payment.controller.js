import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { paymentService } from "../services/paymentService.js";

// ─── SSLCommerz ───────────────────────────────────────────────────────────────

export const sslInitController = asyncHandler(async (req, res) => {
  const { addressId } = req.body;
  if (!addressId) throw new ApiError(400, "Address ID is required");

  const { gatewayURL, orderId } = await paymentService.initSSLPayment({
    userId:    req.user._id,
    addressId,
    user:      req.user,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { gatewayURL, orderId }, "Payment initiated"));
});

// No auth — SSLCommerz server calls this directly
export const sslIpnController = asyncHandler(async (req, res) => {
  await paymentService.handleSSLIPN(req.body);
  return res.status(200).send("OK");
});

// Browser redirect after payment — no auth
export const sslSuccessController = asyncHandler(async (req, res) => {
  return res.redirect(
    `${process.env.CLIENT_URL}/payment/success?orderId=${req.body.tran_id}`,
  );
});

export const sslFailController = asyncHandler(async (req, res) => {
  return res.redirect(
    `${process.env.CLIENT_URL}/payment/fail?orderId=${req.body.tran_id}`,
  );
});

export const sslCancelController = asyncHandler(async (req, res) => {
  return res.redirect(
    `${process.env.CLIENT_URL}/payment/cancel?orderId=${req.body.tran_id}`,
  );
});

// ─── Stripe ───────────────────────────────────────────────────────────────────

export const stripeIntentController = asyncHandler(async (req, res) => {
  const { addressId } = req.body;
  if (!addressId) throw new ApiError(400, "Address ID is required");

  const { clientSecret } = await paymentService.createStripeIntent({
    userId: req.user._id,
    addressId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { clientSecret }, "Payment intent created"));
});

// Raw body required — registered before express.json() in app.js
export const stripeWebhookController = asyncHandler(async (req, res) => {
  const sig = req.headers["stripe-signature"];
  if (!sig) throw new ApiError(400, "Missing Stripe signature");

  const result = await paymentService.handleStripeWebhook(req.body, sig);

  return res.status(200).json(result);
});
