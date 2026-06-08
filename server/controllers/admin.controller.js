import { redis } from "../config/redis.js";
import Category from "../models/category.mode.js";
import User from "../models/user.model.js";
import { productService } from "../services/productService.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

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

// ─── User ─────────────────────────────────────────────────────────────────────

export const getAllUserController = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select("-password -refresh_token -email_verify_token -email_verify_expiry -__v")
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

// ─── Product ──────────────────────────────────────────────────────────────────

export const addProductController = asyncHandler(async (req, res) => {
  const { title, description, price, compareAtPrice, category, stock, isPublished } = req.body;

  if (!title || !price || !category || stock === undefined) {
    throw new ApiError(400, "title, price, category and stock are required");
  }

  // Process Cloudinary uploads before handing off to service
  let images = [];
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadOnCloudinary(file.buffer, file.originalname || `product-${Date.now()}`),
      ),
    );
    images = uploads
      .filter((r) => r?.secure_url)
      .map((r) => ({ url: r.secure_url, publicId: r.public_id }));
  }

  const product = await productService.createProduct({
    title, description, price, compareAtPrice,
    category, stock, isPublished, images,
    vendorId: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product added successfully"));
});

export const updateProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, description, price, compareAtPrice, category, stock, isPublished, removeImages } = req.body;

  // Handle Cloudinary deletions first
  let imagesToRemove = [];
  if (removeImages) {
    imagesToRemove = JSON.parse(removeImages);
    await Promise.all(imagesToRemove.map((url) => deleteFromCloudinary(url)));
  }

  // Handle Cloudinary uploads
  let newImages = [];
  if (req.files?.length) {
    const uploads = await Promise.all(
      req.files.map((file) =>
        uploadOnCloudinary(file.buffer, file.originalname || `product-${Date.now()}`),
      ),
    );
    newImages = uploads
      .filter((r) => r?.secure_url)
      .map((r) => ({ url: r.secure_url, publicId: r.public_id }));
  }

  const product = await productService.updateProduct(id, {
    title, description, price, compareAtPrice,
    category, stock, isPublished,
    imagesToRemove, newImages,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

export const toggleFeaturedProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  if (!id) throw new ApiError(400, "Product ID is required");

  const product = await productService.toggleFeatured(id);

  return res.status(200).json(
    new ApiResponse(
      200,
      { productId: product._id, title: product.title, isFeatured: product.isFeatured },
      `Product ${product.isFeatured ? "marked as featured" : "removed from featured"} successfully`,
    ),
  );
});

export const deleteProductController = asyncHandler(async (req, res) => {
  // Service deletes from DB + invalidates cache, returns images for Cloudinary cleanup
  const images = await productService.deleteProduct(req.params.id);

  // Cloudinary cleanup — fire-and-forget, don't block response
  if (images?.length) {
    Promise.all(
      images.map((img) => img.url && deleteFromCloudinary(img.url))
    ).catch((err) => console.error("[Cloudinary] delete failed:", err.message));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

// ─── Category (flat — migrates to own microservice later) ─────────────────────

export const AddCategoryController = asyncHandler(async (req, res) => {
  const { name } = req.body;
  const file = req.file;

  if (!name || !file) throw new ApiError(400, "Enter required fields.");

  const result = await uploadOnCloudinary(
    file.buffer,
    file.originalname || `${name}-${Date.now()}`,
  );

  if (!result?.secure_url) {
    throw new ApiError(500, "Failed to upload image to Cloudinary");
  }

  const newCategory = await Category.create({
    name,
    image:        result.secure_url,
    imagePublicId: result.public_id,
  });

  redis
    .del("all_categories")
    .catch((err) => console.error("[Redis] category cache clear failed:", err.message));

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

    category.image        = result.secure_url;
    category.imagePublicId = result.public_id;
  }

  await category.save();

  redis
    .del("all_categories")
    .catch((err) => console.error("[Redis] category cache clear failed:", err.message));

  return res
    .status(200)
    .json(new ApiResponse(200, category, "Category updated successfully"));
});

export const getAllCategoryController = asyncHandler(async (req, res) => {
  const cached = await safeRedisGet("all_categories");

  if (cached) {
    return res.status(200).json(
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
    .catch((err) => console.error("[Redis] category cache set failed:", err.message));

  return res.status(200).json(
    new ApiResponse(
      200,
      { totalCategories: categories.length, categories },
      "Categories fetched successfully",
    ),
  );
});
