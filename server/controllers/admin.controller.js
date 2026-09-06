import { redis } from "../config/redis.js";
import Category from "../models/category.mode.js";
import User from "../models/user.model.js";
import Order from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { orderRepository } from "../repositories/order.repository.js";
import orderService from "../services/orderService.js";
import { productService } from "../services/productService.js";
import { expenseService } from "../services/expense.service.js";

// ─── Internal Helpers ─────────────────────────────────────────────────────────

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

// variants arrives as a JSON string inside multipart/form-data (same
// pattern as removeImages below) since FormData can't carry nested arrays
// natively. Empty/omitted field just means "no variants sent".
const parseVariantsField = (variants) => {
  if (variants === undefined || variants === null || variants === "") {
    return undefined;
  }
  try {
    const parsed = JSON.parse(variants);
    if (!Array.isArray(parsed)) throw new Error("not an array");
    return parsed;
  } catch {
    throw new ApiError(400, "Invalid variants payload");
  }
};

// ─── Dashboard range helpers ──────────────────────────────────────────────────
// same "day/week/month/3month" vocabulary as ChartsGrid's revenue analytics,
// so the stat cards and the chart always describe the same window.

const RANGE_MS = {
  day: 24 * 60 * 60 * 1000,
  week: 7 * 24 * 60 * 60 * 1000,
  month: 30 * 24 * 60 * 60 * 1000,
  "3month": 90 * 24 * 60 * 60 * 1000,
};

const getRangeWindows = (range) => {
  const ms = RANGE_MS[range] || RANGE_MS.week;
  const now = new Date();
  const currentStart = new Date(now.getTime() - ms);
  const previousStart = new Date(currentStart.getTime() - ms);
  return { now, currentStart, previousStart };
};

const pctChange = (curr, prev) => {
  if (!prev) return curr > 0 ? 100 : 0;
  return Number((((curr - prev) / prev) * 100).toFixed(1));
};

const orderTotalsInWindow = async (start, end) => {
  const [result] = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: start, $lt: end },
        order_status: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: null,
        revenue: { $sum: "$totalAmt" },
        orders: { $sum: 1 },
      },
    },
  ]);
  return { revenue: result?.revenue || 0, orders: result?.orders || 0 };
};

// ─── Users ────────────────────────────────────────────────────────────────────

export const getAllUserController = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select(
      "-password -refresh_token -email_verify_token -email_verify_expiry -__v",
    )
    .sort({ createdAt: -1 });

  if (!users.length) throw new ApiError(404, "No users found");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalUsers: users.length, users },
        "Users fetched successfully",
      ),
    );
});

// ─── Products ─────────────────────────────────────────────────────────────────

// ─── Categories ───────────────────────────────────────────────────────────────

export const AddCategoryController = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const file = req.file;

  if (!name || !file) throw new ApiError(400, "Name and image are required");

  const result = await uploadOnCloudinary(
    file.buffer,
    file.originalname || `${name}-${Date.now()}`,
  );

  if (!result?.secure_url)
    throw new ApiError(500, "Failed to upload image to Cloudinary");

  const newCategory = await Category.create({
    name,
    image: result.secure_url,
    imagePublicId: result.public_id,
  });

  redis
    .del("all_categories")
    .catch((err) =>
      console.error("[Redis] category cache clear failed:", err.message),
    );

  return res
    .status(201)
    .json(new ApiResponse(201, newCategory, "Category added successfully"));
});

export const updateCategoryController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  const file = req.file;

  const category = await Category.findById(id);
  if (!category) throw new ApiError(404, "Category not found");

  if (name) category.name = name;

  if (file) {
    if (category.image) await deleteFromCloudinary(category.image);

    const result = await uploadOnCloudinary(
      file.buffer,
      file.originalname || `${name}-${Date.now()}`,
    );

    if (!result?.secure_url) throw new ApiError(500, "Failed to upload image");

    category.image = result.secure_url;
    category.imagePublicId = result.public_id;
  }

  await category.save();

  redis
    .del("all_categories")
    .catch((err) =>
      console.error("[Redis] category cache clear failed:", err.message),
    );

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

export const getAllCategoryController = asyncHandler(async (req, res) => {
  const cached = await safeRedisGet("all_categories");

  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { totalCategories: cached.length, categories: cached },
          "Categories fetched successfully",
        ),
      );
  }

  const categories = await Category.find();
  if (!categories.length) throw new ApiError(404, "No categories found");

  redis
    .set("all_categories", JSON.stringify(categories), { ex: 86_400 })
    .catch((err) =>
      console.error("[Redis] category cache set failed:", err.message),
    );

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalCategories: categories.length, categories },
        "Categories fetched successfully",
      ),
    );
});

// ─── Orders ───────────────────────────────────────────────────────────────────

export const adminGetAllOrdersController = asyncHandler(async (req, res) => {
  const { payment_status, order_status, search, sort, cursor, limit } =
    req.query;

  const data = await orderService.adminGetAllOrders({
    payment_status,
    order_status,
    search,
    sortDirection: sort === "asc" ? "asc" : "desc",
    cursor,
    limit: Math.min(parseInt(limit || "20", 10), 100),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Orders fetched successfully"));
});

export const adminUpdateOrderStatusController = asyncHandler(
  async (req, res) => {
    const { order_status, payment_status, courierCost } = req.body;

    const order = await orderService.adminUpdateOrderStatus({
      orderId: req.params.id,
      order_status,
      payment_status,
      courierCost,
      adminId: req.user?._id,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order status updated successfully"));
  },
);
// ─── Analytics ────────────────────────────────────────────────────────────────

export const getDashboardController = asyncHandler(async (req, res) => {
  const range = ["day", "week", "month", "3month"].includes(req.query.range)
    ? req.query.range
    : "week";

  const { now, currentStart, previousStart } = getRangeWindows(range);

  const [
    currentPeriod,
    previousPeriod,
    totalUsers,
    usersBeforeCurrentPeriod,
    usersBeforePreviousPeriod,
    totalProducts,
    productsBeforeCurrentPeriod,
    productsBeforePreviousPeriod,
    orderStatusBreakdown,
  ] = await Promise.all([
    orderTotalsInWindow(currentStart, now),
    orderTotalsInWindow(previousStart, currentStart),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $lt: currentStart } }),
    User.countDocuments({ createdAt: { $lt: previousStart } }),
    Product.countDocuments(),
    Product.countDocuments({ createdAt: { $lt: currentStart } }),
    Product.countDocuments({ createdAt: { $lt: previousStart } }),
    orderRepository.orderStatusBreakdown(),
  ]);

  const newUsersCurrent = totalUsers - usersBeforeCurrentPeriod;
  const newUsersPrevious = usersBeforeCurrentPeriod - usersBeforePreviousPeriod;

  const newProductsCurrent = totalProducts - productsBeforeCurrentPeriod;
  const newProductsPrevious =
    productsBeforeCurrentPeriod - productsBeforePreviousPeriod;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        range,
        totalRevenue: currentPeriod.revenue,
        revenueChange: pctChange(currentPeriod.revenue, previousPeriod.revenue),
        totalOrders: currentPeriod.orders,
        ordersChange: pctChange(currentPeriod.orders, previousPeriod.orders),
        totalCustomers: totalUsers,
        customersChange: pctChange(newUsersCurrent, newUsersPrevious),
        totalProducts,
        productsChange: pctChange(newProductsCurrent, newProductsPrevious),
        orderStatusBreakdown,
      },
      "Dashboard stats fetched successfully",
    ),
  );
});

export const getRevenueAnalyticsController = asyncHandler(async (req, res) => {
  const range = ["day", "week", "month", "3month"].includes(req.query.range)
    ? req.query.range
    : "week";

  const data = await orderRepository.revenueByRange(range);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Revenue analytics fetched successfully"));
});

export const getTopProductsController = asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit || "10", 10), 50);

  const data = await orderRepository.topSellingProducts(limit);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Top products fetched successfully"));
});

export const getNewUsersAnalyticsController = asyncHandler(async (req, res) => {
  const days = Math.min(parseInt(req.query.days || "30", 10), 365);
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const data = await User.aggregate([
    { $match: { createdAt: { $gte: since } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, data, "New users analytics fetched successfully"),
    );
});

export const getMonthlyRevenueController = asyncHandler(async (req, res) => {
  const months = Math.min(parseInt(req.query.months || "6", 10), 12);
  const now = new Date();
  const since = new Date(now.getFullYear(), now.getMonth() - (months - 1), 1);

  const data = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: since },
        order_status: { $ne: "Cancelled" },
      },
    },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        revenue: { $sum: "$totalAmt" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Monthly revenue fetched successfully"));
});

// ─── Expenses ─────────────────────────────────────────────────────────────────

export const createExpenseController = asyncHandler(async (req, res) => {
  const expense = await expenseService.createExpense({
    ...req.body,
    adminId: req.user?._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense recorded successfully"));
});

export const getExpensesController = asyncHandler(async (req, res) => {
  const data = await expenseService.getExpenses(req.query);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Expenses fetched successfully"));
});

export const updateExpenseController = asyncHandler(async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body);

  return res
    .status(200)
    .json(new ApiResponse(200, expense, "Expense updated successfully"));
});

export const deleteExpenseController = asyncHandler(async (req, res) => {
  await expenseService.deleteExpense(req.params.id, req.user?._id);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Expense deleted successfully"));
});

export const getExpenseBreakdownController = asyncHandler(async (req, res) => {
  const range = ["day", "week", "month", "3month"].includes(req.query.range)
    ? req.query.range
    : "week";

  const data = await expenseService.getExpenseBreakdown(range);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Expense breakdown fetched successfully"));
});

// ─── Profit & Loss ──────────────────────────────────────────────────────────

export const getProfitLossController = asyncHandler(async (req, res) => {
  const { range, from, to } = req.query;

  const validRange = ["day", "week", "month", "3month", "year", "all"].includes(
    range,
  )
    ? range
    : "month";

  const data = await orderService.getProfitLoss(validRange, from, to);

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Profit & loss fetched successfully"));
});
