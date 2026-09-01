import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import orderService from "../services/orderService.js";

// ─── Place Order ────────────────────────────────────────────────────────────

/**
 * @desc    Place an order — COD / bKash / Nagad
 * @route   POST /api/v1/orders/place
 * @access  Private
 *
 * All business logic (price/stock resolution, variant handling, coupon
 * validation, transaction, cache invalidation) lives in orderService.
 * This controller ONLY reads the request and returns the response.
 */
export const placeOrderController = asyncHandler(async (req, res) => {
  const {
    address_line,
    city,
    state,
    pincode,
    country,
    mobile,
    payment_method,
    transactionId,
    items, // [{ productId, variantId, quantity }] — sent from client cart
    couponCode,
  } = req.body;

  if (!address_line || !city || !state || !pincode || !mobile)
    throw new ApiError(400, "All address fields are required");

  const order = await orderService.placeOrder({
    userId: req.user._id,
    addressData: { address_line, city, state, pincode, country, mobile },
    payment_method,
    transactionId,
    items,
    couponCode: couponCode?.trim() || null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { order }, "Order placed successfully"));
});

// ─── Get All Orders ─────────────────────────────────────────────────────────

/**
 * @desc    Get all orders for logged in user
 * @route   GET /api/v1/orders
 * @access  Private
 */
export const getUserOrdersController = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);

  return res
    .status(200)
    .json(new ApiResponse(200, { orders }, "Orders fetched successfully"));
});

// ─── Get Single Order ───────────────────────────────────────────────────────

/**
 * @desc    Get single order by orderId
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getSingleOrderController = asyncHandler(async (req, res) => {
  const order = await orderService.getSingleOrder({
    orderId: req.params.id,
    userId: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, "Order fetched successfully"));
});

// ─── Track Order (Public) ───────────────────────────────────────────────────

/**
 * @desc    Track an order by orderId only — no auth required
 * @route   GET /api/v1/orders/track/:orderId
 * @access  Public (rate-limited via trackOrderLimiter)
 */
export const trackOrderController = asyncHandler(async (req, res) => {
  const order = await orderService.trackOrder(req.params.orderId);

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, "Order status fetched successfully"));
});
