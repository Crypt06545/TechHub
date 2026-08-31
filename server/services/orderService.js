// FILE: services/orderService.js
import mongoose from "mongoose";
import { orderRepository } from "../repositories/order.repository.js";
import { productRepository } from "../repositories/product.repository.js";
import { Product } from "../models/product.model.js";
import Order from "../models/order.model.js";
import { StockLog } from "../models/stockLog.model.js";
import { generateOrderId } from "../utils/generateOrderId.js";
import { ApiError } from "../utils/ApiError.js";
import { redis } from "../config/redis.js";
import { couponRepository } from "../repositories/coupon.repository.js";
import {
  GATEWAY_FEE_RATES,
  DEFAULT_PACKAGING_COST,
} from "../utils/inventoryConstants.js";
import { expenseService } from "./expense.service.js";

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

const calcOrderCosts = (payment_method, totalAmt) => ({
  packagingCost: DEFAULT_PACKAGING_COST,
  gatewayFee: Math.round(totalAmt * (GATEWAY_FEE_RATES[payment_method] || 0)),
});

const resolveLine = (product, variantId) => {
  if (!product.hasVariants || !variantId) {
    return {
      price: product.price,
      costPrice: product.costPrice || 0,
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
    costPrice: variant.costPrice || 0,
    stock: variant.stock,
    variantId: variant._id,
    label,
    images: product.images?.slice(0, 1).map((img) => img.url) ?? [],
  };
};

const applyCoupon = async ({
  code,
  userId,
  orderItems,
  subTotalAmt,
  session,
}) => {
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

  const globalResult = await couponRepository.incrementUsage(
    coupon._id,
    coupon.maxUses,
    session,
  );
  if (globalResult.modifiedCount === 0)
    throw new ApiError(400, "This coupon has reached its usage limit");

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
  async placeOrder({
    userId,
    addressData,
    payment_method,
    transactionId,
    items,
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
          .select(
            "title price costPrice stock slug images hasVariants variants category",
          )
          .session(session);

        const productMap = new Map(products.map((p) => [p._id.toString(), p]));
        touchedSlugs = products.map((p) => p.slug);

        let subTotalAmt = 0;
        const orderItems = [];
        const lines = [];

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
            costPriceAtSale: resolved.costPrice,
            quantity,
          });

          lines.push({
            productId: product._id,
            variantId: resolved.variantId,
            title: product.title,
            quantity,
          });
        }

        const stockLogDrafts = [];
        for (const line of lines) {
          const updated = line.variantId
            ? await productRepository.decrementVariantStock(
                line.productId,
                line.variantId,
                line.quantity,
                session,
              )
            : await productRepository.decrementStock(
                line.productId,
                line.quantity,
                session,
              );

          if (!updated)
            throw new ApiError(400, `Insufficient stock for: ${line.title}`);

          const newStock = line.variantId
            ? updated.variants.id(line.variantId).stock
            : updated.stock;

          stockLogDrafts.push({
            productId: line.productId,
            variantId: line.variantId,
            type: "sale",
            change: -line.quantity,
            previousStock: newStock + line.quantity,
            newStock,
          });
        }

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
        const { packagingCost, gatewayFee } = calcOrderCosts(
          payment_method,
          totalAmt,
        );

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
            costs: { packagingCost, gatewayFee },
            totalAmt,
          },
          session,
        );

        await StockLog.insertMany(
          stockLogDrafts.map((draft) => ({
            ...draft,
            orderId: order._id,
            reason: `Sold via order ${order.orderId}`,
          })),
          { session },
        );
      });
    } finally {
      await session.endSession();
    }

    // Cache invalidation — awaited (not fire-and-forget) so the very
    // next request for this product can never see a stale stock
    // number. Runs after the transaction has committed, so it clears
    // exactly the values that are now correct in the DB.
    try {
      await Promise.all([
        redis.del(userOrdersKey(userId)),
        touchedSlugs.length
          ? redis.del(
              ...touchedSlugs.map((slug) => `product:${slug}`),
              "featured_products",
              "product:filters:facets",
            )
          : Promise.resolve(),
      ]);
    } catch (err) {
      console.error(
        "[Cleanup] post-order cache invalidation failed:",
        err.message,
      );
    }

    return order;
  },

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
      sortDirection,
      cursor,
      limit,
    });
  },

  async adminUpdateOrderStatus({
    orderId,
    order_status,
    payment_status,
    courierCost,
    adminId,
  }) {
    if (!order_status && !payment_status && courierCost === undefined)
      throw new ApiError(
        400,
        "At least one of order_status, payment_status or courierCost is required",
      );

    const triggersRestore =
      order_status === "Cancelled" || payment_status === "Refunded";

    // ১. সাধারণ আপডেট (যেমন Processing -> Shipped)
    if (!triggersRestore) {
      const order = await orderRepository.updateStatusById(orderId, {
        order_status,
        payment_status,
        courierCost,
      });
      if (!order) throw new ApiError(404, "Order not found");

      redis.del(singleOrderKey(order.orderId)).catch(() => {});
      return order;
    }

    // ২. স্টক রিস্টোর আপডেট (Cancelled / Refunded)
    const session = await mongoose.startSession();
    let updatedOrder;

    try {
      await session.withTransaction(async () => {
        const order = await Order.findOneAndUpdate(
          { _id: orderId, stockRestored: false },
          {
            ...(order_status && { order_status }),
            ...(payment_status && { payment_status }),
            ...(courierCost !== undefined && {
              "costs.courierCost": courierCost,
            }),
            stockRestored: true,
          },
          { returnDocument: "after", session },
        );

        // যদি স্টক আগেই রিস্টোর হয়ে থাকে (stockRestored === true)
        if (!order) {
          const fallback = await Order.findByIdAndUpdate(
            orderId,
            {
              ...(order_status && { order_status }),
              ...(payment_status && { payment_status }),
              ...(courierCost !== undefined && {
                "costs.courierCost": courierCost,
              }),
            },
            { new: true, session },
          );
          if (!fallback) throw new ApiError(404, "Order not found");
          updatedOrder = fallback;
          return; // ⚠️ এখান থেকে বের হয়ে যাবে, আর যেন স্টক না বাড়ায়!
        }

        // প্রথমবার ক্যান্সেল হলে স্টক ফেরত আনবে
        for (const item of order.items) {
          const updated = item.variantId
            ? await productRepository.incrementVariantStock(
                item.productId,
                item.variantId,
                item.quantity,
                session,
              )
            : await productRepository.incrementStock(
                item.productId,
                item.quantity,
                session,
              );

          if (!updated) continue;

          const newStock = item.variantId
            ? updated.variants.id(item.variantId).stock
            : updated.stock;

          await StockLog.create(
            [
              {
                productId: item.productId,
                variantId: item.variantId,
                type: "return",
                change: item.quantity,
                previousStock: newStock - item.quantity,
                newStock,
                orderId: order._id,
                adminId,
                reason: `Stock restored — order ${order.orderId} ${
                  order_status === "Cancelled" ? "cancelled" : "refunded"
                }`,
              },
            ],
            { session },
          );
        }

        updatedOrder = order;
      });
    } finally {
      await session.endSession();
    }

    // ক্যাশ ক্লিয়ারিং
    if (updatedOrder) {
      redis.del(singleOrderKey(updatedOrder.orderId)).catch(() => {});
      redis.del(userOrdersKey(updatedOrder.userId)).catch(() => {});
    }

    return updatedOrder;
  },

  async getProfitLoss(range, fromDate, toDate) {
    const [orderStats, totalExpenses] = await Promise.all([
      orderRepository.profitLossByRange(range, fromDate, toDate),
      expenseService.getTotalExpenses(range, fromDate, toDate),
    ]);

    // aggregation থেকে পাওয়া _id ফিল্ডটি মুছে ফেলে রেসপন্স ক্লিন করা
    delete orderStats._id;

    const grossProfit = orderStats.revenue - orderStats.cogs;
    const orderCosts =
      orderStats.courierCost +
      orderStats.packagingCost +
      orderStats.gatewayFee +
      orderStats.returnCost;
    const netProfit = grossProfit - orderCosts - totalExpenses;

    return {
      ...orderStats,
      totalExpenses,
      grossProfit,
      orderCosts,
      netProfit,
    };
  },
};

export default orderService;
