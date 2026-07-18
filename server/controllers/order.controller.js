import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import Address from "../models/address.model.js";
import Order from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { redis } from "../config/redis.js";

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
 *
 * Cart lives client-side only (no per-add DB write). At checkout the
 * client sends [{ productId, quantity }] — nothing else from the cart
 * is trusted. Price, title, and stock are always resolved fresh from
 * the DB in a single batched query, regardless of what the client's
 * local cart displayed (prices can drift between add-to-cart and
 * checkout, and a client could tamper with price/name in devtools).
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
    items, // [{ productId, quantity }] — sent fresh from client's local cart
  } = req.body;

  const userId = req.user._id;

  // ── Validation ────────────────────────────────────────────────────────────
  if (!address_line || !city || !state || !pincode || !mobile)
    throw new ApiError(400, "All address fields are required");

  if (!["COD", "bKash", "Nagad"].includes(payment_method))
    throw new ApiError(400, "Invalid payment method");

  if (payment_method !== "COD" && !transactionId)
    throw new ApiError(400, "Transaction ID is required for online payment");

  if (!Array.isArray(items) || items.length === 0)
    throw new ApiError(400, "Your cart is empty");

  for (const item of items) {
    if (!item?.productId || !item?.quantity || item.quantity < 1)
      throw new ApiError(400, "Invalid item in cart");
  }

  // ── Batch fetch live product data — ONE query for the whole cart,
  //    regardless of how many line items are in it ──────────────────────────
  const productIds = items.map((i) => i.productId);
  const products = await Product.find({ _id: { $in: productIds } }).select(
    "title price stock slug",
  );
  const productMap = new Map(products.map((p) => [p._id.toString(), p]));

  // ── Stock check + build items from live DB data only ──────────────────────
  let subTotalAmt = 0;
  const orderItems = [];

  for (const { productId, quantity } of items) {
    const product = productMap.get(productId.toString());
    if (!product)
      throw new ApiError(404, "A product in your cart no longer exists");
    if (product.stock < quantity)
      throw new ApiError(400, `Insufficient stock for: ${product.title}`);

    subTotalAmt += product.price * quantity;
    orderItems.push({
      productId: product._id,
      name: product.title,
      price: product.price, // always the live DB price — never client-sent
      quantity,
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

  // ── Stock deduction + cache invalidation — fire and forget ────────────────
  // No CartProductModel cleanup needed — cart was never written to the DB.
  //
  // IMPORTANT: this must mirror invalidateProductCache() in product.service.js
  // exactly (same key format: `product:${slug}`, "featured_products",
  // "product:filters:facets"). If those key formats ever change there,
  // update here too — otherwise stock updates silently stop invalidating
  // the cache again, same bug as this one.
  Promise.all([
    ...orderItems.map((item) =>
      Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      }),
    ),
    redis.del(userOrdersKey(userId)),
    redis.del(
      ...products.map((p) => `product:${p.slug}`),
      "featured_products",
      "product:filters:facets",
    ),
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
