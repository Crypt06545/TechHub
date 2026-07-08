import { redis } from "../config/redis.js";
import Category from "../models/category.mode.js";
import User from "../models/user.model.js";
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

export const addProductController = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    compareAtPrice,
    category,
    stock,
    isPublished,
  } = req.body;

  if (!title || !price || !category || stock === undefined) {
    throw new ApiError(400, "title, price, category and stock are required");
  }

  let images = [];
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadOnCloudinary(
          file.buffer,
          file.originalname || `product-${Date.now()}`,
        ),
      ),
    );
    images = uploads
      .filter((r) => r?.secure_url)
      .map((r) => ({ url: r.secure_url, publicId: r.public_id }));
  }

  const product = await productService.createProduct({
    title,
    description,
    price,
    compareAtPrice,
    category,
    stock,
    isPublished,
    images,
    vendorId: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product added successfully"));
});

export const updateProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    price,
    compareAtPrice,
    category,
    stock,
    isPublished,
    removeImages,
  } = req.body;

  let imagesToRemove = [];
  if (removeImages) {
    imagesToRemove = JSON.parse(removeImages);
    await Promise.all(imagesToRemove.map((url) => deleteFromCloudinary(url)));
  }

  let newImages = [];
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadOnCloudinary(
          file.buffer,
          file.originalname || `product-${Date.now()}`,
        ),
      ),
    );
    newImages = uploads
      .filter((r) => r?.secure_url)
      .map((r) => ({ url: r.secure_url, publicId: r.public_id }));
  }

  const product = await productService.updateProduct(id, {
    title,
    description,
    price,
    compareAtPrice,
    category,
    stock,
    isPublished,
    imagesToRemove,
    newImages,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

export const deleteProductController = asyncHandler(async (req, res) => {
  const images = await productService.deleteProduct(req.params.id);

  if (images?.length) {
    Promise.all(
      images.map((img) => img.url && deleteFromCloudinary(img.url)),
    ).catch((err) => console.error("[Cloudinary] delete failed:", err.message));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Product ID is required");

  const product = await productService.toggleFeatured(id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          productId: product._id,
          title: product.title,
          isFeatured: product.isFeatured,
        },
        `Product ${product.isFeatured ? "marked as featured" : "removed from featured"} successfully`,
      ),
    );
});

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
    const { order_status, payment_status } = req.body;

    const order = await orderService.adminUpdateOrderStatus({
      orderId: req.params.id,
      order_status,
      payment_status,
    });

    return res
      .status(200)
      .json(new ApiResponse(200, order, "Order status updated successfully"));
  },
);

// ─── Analytics ────────────────────────────────────────────────────────────────

export const getDashboardController = asyncHandler(async (req, res) => {
  const [totalRevenue, totalOrders, totalUsers, orderStatusBreakdown] =
    await Promise.all([
      orderRepository.totalRevenue(),
      orderRepository.countAll(),
      User.countDocuments(),
      orderRepository.orderStatusBreakdown(),
    ]);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { totalRevenue, totalOrders, totalUsers, orderStatusBreakdown },
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
