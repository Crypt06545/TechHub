import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { redis } from "../config/redis.js";
import CartProductModel from "../models/cartProduct.model.js";

// ─── TTLs ─────────────────────────────────────────────────────────────────────
const USER_ORDERS_TTL = 120; // 2 min
const SINGLE_ORDER_TTL = 300; // 5 min

// ─── Cache Key Helpers ────────────────────────────────────────────────────────
const userOrdersKey = (userId) => `orders:user:${userId}`;
const singleOrderKey = (orderId) => `orders:single:${orderId}`;

// ─── Safe Redis Get ───────────────────────────────────────────────────────────
const safeRedisGet = async (key) => {
  try {
    const cached = await redis.get(key);
    if (cached === null || cached === undefined) return null;
    if (typeof cached === "object") return cached;
    if (typeof cached === "string") {
      if (cached === "[object Object]") {
        await redis.del(key);
        return null;
      }
      return JSON.parse(cached);
    }
  } catch {
    await redis.del(key);
  }
  return null;
};

// ─── Shipping Logic ───────────────────────────────────────────────────────────
const calcShipping = (subTotal, city) => {
  if (subTotal >= 1000) return 0;
  return city?.toLowerCase() === "bogura" ? 60 : 120;
};

// ─── Place Order ──────────────────────────────────────────────────────────────

/**
 * @desc    Place an order — COD / bKash / Nagad
 * @route   POST /api/v1/orders/place
 * @access  Private
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
    payment_proof_images = [],
  } = req.body;

  const userId = req.user._id;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!address_line || !city || !state || !pincode || !mobile)
    throw new ApiError(400, "All address fields are required");

  if (!["COD", "bKash", "Nagad"].includes(payment_method))
    throw new ApiError(400, "Invalid payment method");

  if (payment_method !== "COD" && !transactionId)
    throw new ApiError(400, "Transaction ID is required for online payment");

  // ── Cart ──────────────────────────────────────────────────────────────────
  const cartItems = await CartProductModel.find({ userId }).populate(
    "productId",
    "title price stock",
  );
  if (!cartItems.length) throw new ApiError(400, "Your cart is empty");

  // ── Stock check + build items ─────────────────────────────────────────────
  let subTotalAmt = 0;
  const orderItems = [];

  for (const item of cartItems) {
    const product = item.productId;
    if (!product)
      throw new ApiError(404, "A product in your cart no longer exists");
    if (product.stock < item.quantity)
      throw new ApiError(400, `Insufficient stock for: ${product.title}`);

    subTotalAmt += product.price * item.quantity;
    orderItems.push({
      productId: product._id,
      name: product.title,
      price: product.price,
      quantity: item.quantity,
    });
  }

  // ── Shipping ──────────────────────────────────────────────────────────────
  const shippingCharge = calcShipping(subTotalAmt, city);
  const totalAmt = subTotalAmt + shippingCharge;

  // ── Save address ──────────────────────────────────────────────────────────
  const existingCount = await Address.countDocuments({ userId });
  const savedAddress = await Address.create({
    userId,
    address_line,
    city,
    state,
    pincode,
    country: country || "Bangladesh",
    mobile,
    isDefault: existingCount === 0,
  });

  // ── Create order ──────────────────────────────────────────────────────────
  const order = await Order.create({
    userId,
    orderId: generateOrderId(),
    items: orderItems,
    delivery_address: {
      address_line: savedAddress.address_line,
      city: savedAddress.city,
      state: savedAddress.state,
      pincode: savedAddress.pincode,
      country: savedAddress.country,
      mobile: savedAddress.mobile,
    },
    payment_method,
    payment_status: payment_method === "COD" ? "Pending" : "Paid",
    transactionId: transactionId || null,
    payment_proof_images: payment_proof_images.length
      ? payment_proof_images
      : undefined,
    order_status: "Processing",
    subTotalAmt,
    shippingCharge,
    totalAmt,
  });

  // ── Stock deduction + cache invalidation + cart clear — fire and forget ───
  Promise.all([
    ...orderItems.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      }),
    ),
    redis.del(userOrdersKey(userId)),
    CartProductModel.deleteMany({ userId }),
    redis.del(`cart:${userId}`),
  ]).catch((err) => console.error("[Cleanup] post-order failed:", err.message));

  return res
    .status(201)
    .json(new ApiResponse(201, { order }, "Order placed successfully"));
});

// ─── Get All Orders ───────────────────────────────────────────────────────────

/**
 * @desc    Get all orders for logged in user
 * @route   GET /api/v1/orders
 * @access  Private
 */
export const getUserOrdersController = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const key = userOrdersKey(userId);

  const cached = await safeRedisGet(key);
  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(200, { orders: cached }, "Orders fetched successfully"),
      );
  }

  const orders = await Order.find({ userId }).sort({ createdAt: -1 });

  redis
    .set(key, JSON.stringify(orders), { ex: USER_ORDERS_TTL })
    .catch((err) => console.error("[Redis] orders cache failed:", err.message));

  return res
    .status(200)
    .json(new ApiResponse(200, { orders }, "Orders fetched successfully"));
});

// ─── Get Single Order ─────────────────────────────────────────────────────────

/**
 * @desc    Get single order by orderId
 * @route   GET /api/v1/orders/:id
 * @access  Private
 */
export const getSingleOrderController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const key = singleOrderKey(id);

  const cached = await safeRedisGet(key);
  if (cached) {
    if (cached.userId?.toString() !== userId.toString())
      throw new ApiError(403, "Access denied");

    return res
      .status(200)
      .json(
        new ApiResponse(200, { order: cached }, "Order fetched successfully"),
      );
  }

  const order = await Order.findOne({ orderId: id, userId });
  if (!order) throw new ApiError(404, "Order not found");

  redis
    .set(key, JSON.stringify(order), { ex: SINGLE_ORDER_TTL })
    .catch((err) =>
      console.error("[Redis] single order cache failed:", err.message),
    );

  return res
    .status(200)
    .json(new ApiResponse(200, { order }, "Order fetched successfully"));
});
