import mongoose from "mongoose";
import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { Product } from "../models/product.model.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { ApiError } from "../utils/ApiError.js";
import { redis } from "../config/redis.js";
import { couponRepository } from "../repositories/coupon.repository.js";

// ─── TTLs / cache keys ────────────────────────────────────────────────────
const USER_ORDERS_TTL = 120;
const SINGLE_ORDER_TTL = 300;
const userOrdersKey = (userId) => `orders:user:${userId}`;
const singleOrderKey = (orderId) => `orders:single:${orderId}`;

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

const calcShipping = (subTotal, city) => {
  if (subTotal >= 1000) return 0;
  return city?.toLowerCase() === "bogura" ? 60 : 130;
};

// Resolve price/stock for a cart line, honoring variantId when the
// product has variants. Falls back to the base product otherwise, even
// if a stale variantId is sent by an old cart.
const resolveLine = (product, variantId) => {
  if (!product.hasVariants || !variantId) {
    return {
      price: product.price,
      stock: product.stock,
      variantId: null,
      label: null,
      images: product.images?.slice(0, 1).map((img) => img.url) ?? [],
    };
  }

  const variant = product.variants.find(
    (v) => v._id.toString() === variantId.toString(),
  );
  if (!variant)
    throw new ApiError(
      404,
      `Variant no longer available for: ${product.title}`,
    );

  const label =
    [variant.size, variant.color].filter(Boolean).join(" / ") || null;

  return {
    price: variant.price,
    stock: variant.stock,
    variantId: variant._id,
    label,
    images: product.images?.slice(0, 1).map((img) => img.url) ?? [],
  };
};

// Validates + applies a coupon inside the transaction. Discount is scoped
// to applicableCategories if set, otherwise applies to the whole subtotal.
const applyCoupon = async ({
  code,
  userId,
  orderItems,
  subTotalAmt,
  session,
}) => {
  // cached lookup — long-lived, invalidated on create/update/delete
  const coupon = await couponRepository.findByCode(code);
  if (!coupon || !coupon.isActive)
    throw new ApiError(404, "Invalid or inactive coupon");

  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
    throw new ApiError(400, "This coupon has expired");

  if (subTotalAmt < coupon.minOrderAmount)
    throw new ApiError(
      400,
      `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`,
    );

  let eligibleAmt = subTotalAmt;
  if (coupon.applicableCategories?.length > 0) {
    const allowed = new Set(
      coupon.applicableCategories.map((c) => c.toString()),
    );
    eligibleAmt = orderItems
      .filter((item) => allowed.has(item.category.toString()))
      .reduce((sum, item) => sum + item.price * item.quantity, 0);

    if (eligibleAmt === 0)
      throw new ApiError(
        400,
        "This coupon isn't valid for the items in your cart",
      );
  }

  let discount =
    coupon.discountType === "percentage"
      ? (eligibleAmt * coupon.discountValue) / 100
      : coupon.discountValue;

  if (coupon.maxDiscountAmount != null)
    discount = Math.min(discount, coupon.maxDiscountAmount);
  discount = Math.min(discount, eligibleAmt);

  // Atomic, conditional GLOBAL usage increment — always hits live DB,
  // never cache, so maxUses can never be over-redeemed even though the
  // coupon lookup above was cached.
  const globalResult = await couponRepository.incrementUsage(
    coupon._id,
    coupon.maxUses,
    session,
  );
  if (globalResult.modifiedCount === 0)
    throw new ApiError(400, "This coupon has reached its usage limit");

  // Atomic, conditional PER-USER usage increment. Replaces the old
  // count-then-check (Order.countDocuments), which was vulnerable to a
  // race: two concurrent requests from the same user (double-click,
  // duplicate submit, multiple tabs) could both read count=0 before
  // either order committed, letting both slip past a
  // maxUsesPerUser: 1 limit. findOneAndUpdate's $lt guard + $inc happen
  // as one atomic op, so only one concurrent request can ever win.
  const userUsage = await couponRepository.incrementUserUsage(
    userId,
    coupon._id,
    coupon.maxUsesPerUser,
    session,
  );
  if (!userUsage)
    throw new ApiError(
      400,
      "You've already used this coupon the maximum number of times",
    );

  return { discount: Math.round(discount), code: coupon.code };
};

const orderService = {
  /**
   * Places an order inside a single Mongo transaction: stock decrement,
   * coupon usage, and order creation either all succeed or all roll back
   * together. The delivery address is stored only as a snapshot on the
   * order itself — no separate Address document is created here.
   */
  async placeOrder({
    userId,
    addressData,
    payment_method,
    transactionId,
    items, // [{ productId, variantId, quantity }]
    couponCode,
  }) {
    if (!Array.isArray(items) || items.length === 0)
      throw new ApiError(400, "Your cart is empty");

    for (const item of items) {
      if (!item?.productId || !item?.quantity || item.quantity < 1)
        throw new ApiError(400, "Invalid item in cart");
    }

    if (!["COD", "bKash", "Nagad"].includes(payment_method))
      throw new ApiError(400, "Invalid payment method");

    if (payment_method !== "COD" && !transactionId)
      throw new ApiError(400, "Transaction ID is required for online payment");

    const session = await mongoose.startSession();
    let order;
    let touchedSlugs = [];

    try {
      await session.withTransaction(async () => {
        const productIds = items.map((i) => i.productId);
        const products = await Product.find({ _id: { $in: productIds } })
          .select("title price stock slug images hasVariants variants category")
          .session(session);

        const productMap = new Map(products.map((p) => [p._id.toString(), p]));
        touchedSlugs = products.map((p) => p.slug);

        let subTotalAmt = 0;
        const orderItems = [];

        for (const { productId, variantId, quantity } of items) {
          const product = productMap.get(productId.toString());
          if (!product)
            throw new ApiError(404, "A product in your cart no longer exists");

          const resolved = resolveLine(product, variantId);
          if (resolved.stock < quantity)
            throw new ApiError(
              400,
              `Insufficient stock for: ${product.title}${resolved.label ? ` (${resolved.label})` : ""}`,
            );

          subTotalAmt += resolved.price * quantity;
          orderItems.push({
            productId: product._id,
            variantId: resolved.variantId,
            variantLabel: resolved.label,
            category: product.category,
            name: product.title,
            images: resolved.images,
            price: resolved.price,
            quantity,
          });
        }

        // Atomic, conditional stock decrement — single shared method so
        // variant stock and top-level stock never drift out of sync.
        for (const { productId, variantId, quantity } of items) {
          const product = productMap.get(productId.toString());
          const usesVariant = product.hasVariants && variantId;

          const updated = usesVariant
            ? await productRepository.decrementVariantStock(
                productId,
                variantId,
                quantity,
                session,
              )
            : await productRepository.decrementStock(
                productId,
                quantity,
                session,
              );

          if (!updated)
            throw new ApiError(
              400,
              `Insufficient stock for: ${product?.title ?? "item"}`,
            );
        }

        // ── Coupon (optional) ──────────────────────────────────────────
        let discountAmount = 0;
        let appliedCouponCode = null;
        if (couponCode) {
          const result = await applyCoupon({
            code: couponCode,
            userId,
            orderItems,
            subTotalAmt,
            session,
          });
          discountAmount = result.discount;
          appliedCouponCode = result.code;
        }

        const shippingCharge = calcShipping(subTotalAmt, addressData.city);
        const totalAmt = subTotalAmt + shippingCharge - discountAmount;

        order = await orderRepository.create(
          {
            userId,
            orderId: generateOrderId(),
            items: orderItems,
            delivery_address: {
              address_line: addressData.address_line,
              city: addressData.city,
              state: addressData.state,
              pincode: addressData.pincode,
              country: addressData.country || "Bangladesh",
              mobile: addressData.mobile,
            },
            payment_method,
            payment_status: payment_method === "COD" ? "Pending" : "Paid",
            transactionId: transactionId || null,
            order_status: "Processing",
            couponCode: appliedCouponCode,
            discountAmount,
            subTotalAmt,
            shippingCharge,
            totalAmt,
          },
          session,
        );
      });
    } finally {
      await session.endSession();
    }

    // Cache invalidation — best-effort, after commit.
    Promise.all([
      redis.del(userOrdersKey(userId)),
      touchedSlugs.length
        ? redis.del(
            ...touchedSlugs.map((slug) => `product:${slug}`),
            "featured_products",
            "product:filters:facets",
          )
        : Promise.resolve(),
    ]).catch((err) =>
      console.error(
        "[Cleanup] post-order cache invalidation failed:",
        err.message,
      ),
    );

    return order;
  },

  // ─── User queries ─────────────────────────────────────────────────────

  async getUserOrders(userId) {
    const key = userOrdersKey(userId);
    const cached = await safeRedisGet(key);
    if (cached) return cached;

    const orders = await orderRepository.findByUserId(userId);
    redis
      .set(key, JSON.stringify(orders), { ex: USER_ORDERS_TTL })
      .catch((err) =>
        console.error("[Redis] orders cache failed:", err.message),
      );
    return orders;
  },

  async getSingleOrder({ orderId, userId }) {
    const key = singleOrderKey(orderId);
    const cached = await safeRedisGet(key);
    if (cached) {
      if (cached.userId?.toString() !== userId.toString())
        throw new ApiError(403, "Access denied");
      return cached;
    }

    const order = await orderRepository.findByOrderIdAndUserId({
      orderId,
      userId,
    });
    if (!order) throw new ApiError(404, "Order not found");

    redis
      .set(key, JSON.stringify(order), { ex: SINGLE_ORDER_TTL })
      .catch((err) =>
        console.error("[Redis] single order cache failed:", err.message),
      );
    return order;
  },

  // ─── Admin ────────────────────────────────────────────────────────────

  async adminGetAllOrders({
    payment_status,
    order_status,
    search,
    sortDirection,
    cursor,
    limit,
  }) {
    return orderRepository.findAllOrdersAdmin({
      payment_status,
      order_status,
      search,
      sortDirection, // "asc" | "desc" string — matches findAllOrdersAdmin's own check
      cursor,
      limit,
    });
  },

  async adminUpdateOrderStatus({ orderId, order_status, payment_status }) {
    if (!order_status && !payment_status)
      throw new ApiError(
        400,
        "At least one of order_status or payment_status is required",
      );

    const order = await orderRepository.updateStatusById(orderId, {
      order_status,
      payment_status,
    });
    if (!order) throw new ApiError(404, "Order not found");
    return order;
  },
};

export default orderService;
