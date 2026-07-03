// controllers/analytics.controller.js
import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import Order from "../models/order.model.js";
import { redis } from "../config/redis.js";

const ANALYTICS_TTL = { day: 300, week: 900, month: 1800, "3month": 3600 };

const overviewKey = (range) => `analytics:overview:${range}`;
const recentOrdersKey = () => `analytics:recent-orders`;

const safeRedisGet = async (key) => {
  try {
    const cached = await redis.get(key);
    if (!cached) return null;
    return typeof cached === "string" ? JSON.parse(cached) : cached;
  } catch {
    await redis.del(key);
    return null;
  }
};

// রেঞ্জ অনুযায়ী স্টার্ট ডেট আর গ্রুপিং ফরম্যাট ঠিক করে
const getRangeConfig = (range) => {
  const now = new Date();
  const start = new Date(now);

  switch (range) {
    case "day":
      start.setHours(now.getHours() - 24);
      return { start, dateFormat: "%Y-%m-%dT%H:00:00" }; // hourly buckets
    case "week":
      start.setDate(now.getDate() - 7);
      return { start, dateFormat: "%Y-%m-%d" }; // daily buckets
    case "month":
      start.setDate(now.getDate() - 30);
      return { start, dateFormat: "%Y-%m-%d" }; // daily buckets
    case "3month":
      start.setDate(now.getDate() - 90);
      return { start, dateFormat: "%Y-%U" }; // weekly buckets
    default:
      throw new Error("Invalid range");
  }
};

/**
 * @desc    Revenue & orders trend for charts
 * @route   GET /api/v1/analytics/overview?range=day|week|month|3month
 * @access  Private/Admin
 */
export const getOverviewAnalytics = asyncHandler(async (req, res) => {
  const range = ["day", "week", "month", "3month"].includes(req.query.range)
    ? req.query.range
    : "week";

  const key = overviewKey(range);
  const cached = await safeRedisGet(key);
  if (cached) {
    return res
      .status(200)
      .json(new ApiResponse(200, cached, "Analytics fetched from cache"));
  }

  const { start, dateFormat } = getRangeConfig(range);

  const data = await Order.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
        revenue: { $sum: "$totalAmt" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    {
      $project: {
        _id: 0,
        date: "$_id",
        revenue: 1,
        orders: 1,
      },
    },
  ]);

  redis
    .set(key, JSON.stringify(data), { ex: ANALYTICS_TTL[range] })
    .catch((err) =>
      console.error("[Redis] analytics cache failed:", err.message),
    );

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Analytics fetched successfully"));
});

/**
 * @desc    Latest N orders for the dashboard table
 * @route   GET /api/v1/analytics/recent-orders?limit=5
 * @access  Private/Admin
 */
export const getRecentOrdersAnalytics = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 5, 20);
  const key = `${recentOrdersKey()}:${limit}`;

  const cached = await safeRedisGet(key);
  if (cached) {
    return res
      .status(200)
      .json(new ApiResponse(200, cached, "Recent orders fetched from cache"));
  }

  const orders = await Order.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("userId", "name")
    .lean();

  const formatted = orders.map((o) => {
    const customerName = o.userId?.name || "Guest";
    const initials = customerName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    const primaryItem = o.items[0]?.name || "—";
    const extraCount = o.items.length - 1;

    return {
      id: o.orderId,
      customer: customerName,
      initials,
      product:
        extraCount > 0 ? `${primaryItem} +${extraCount} more` : primaryItem,
      amount: `৳${o.totalAmt.toLocaleString()}`,
      status: o.order_status,
      date: new Date(o.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };
  });

  redis
    .set(key, JSON.stringify(formatted), { ex: 120 })
    .catch((err) =>
      console.error("[Redis] recent orders cache failed:", err.message),
    );

  return res
    .status(200)
    .json(
      new ApiResponse(200, formatted, "Recent orders fetched successfully"),
    );
});
