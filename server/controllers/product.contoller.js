import mongoose from "mongoose";
import { productService } from "../services/productService.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import {
  uploadOnCloudinary,
  deleteFromCloudinary,
} from "../utils/cloudinary.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

const parseJSON = (value, fieldName) => {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    throw new ApiError(400, `Invalid ${fieldName} payload`);
  }
};

const assertValidId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, "Invalid product id");
  }
};

const uploadProductImages = async (files = []) => {
  if (!files.length) return [];

  const results = await Promise.all(
    files.map((f) => uploadOnCloudinary(f.buffer, f.originalname)),
  );

  const failedIndex = results.findIndex((r) => !r);
  if (failedIndex !== -1) {
    await Promise.all(
      results.filter(Boolean).map((r) => deleteFromCloudinary(r.public_id)),
    );
    throw new ApiError(500, "One or more images failed to upload");
  }

  return results.map((r) => ({ url: r.secure_url, publicId: r.public_id }));
};

// ─── Public ─────────────────────────────────────────────────────────────────

export const getProductController = asyncHandler(async (req, res) => {
  const parsedLimit = parseInt(req.query.limit, 10);
  const limit = Math.min(Number.isNaN(parsedLimit) ? 12 : parsedLimit, 50);

  const data = await productService.getProducts({
    limit,
    cursor: req.query.cursor,
    category: req.query.category,
    brand: req.query.brand,
    minPrice: req.query.minPrice,
    maxPrice: req.query.maxPrice,
    search: req.query.search,
    sort: req.query.sort,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Products fetched successfully"));
});

export const getProductFiltersController = asyncHandler(async (req, res) => {
  const data = await productService.getFilterFacets();
  return res
    .status(200)
    .json(new ApiResponse(200, data, "Filters fetched successfully"));
});

export const getFeaturedProductConroller = asyncHandler(async (req, res) => {
  const products = await productService.getFeaturedProducts();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products, total: products.length },
        "Featured products fetched successfully",
      ),
    );
});

export const getSingleProductController = asyncHandler(async (req, res) => {
  const product = await productService.getSingleProduct(req.params.slug);

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product fetched successfully"));
});

// ─── Admin: List ────────────────────────────────────────────────────────────

export const getAdminProductsController = asyncHandler(async (req, res) => {
  const parsedLimit = parseInt(req.query.limit, 10);
  const limit = Math.min(Number.isNaN(parsedLimit) ? 12 : parsedLimit, 50);

  const data = await productService.getAdminProducts({
    limit,
    cursor: req.query.cursor,
    search: req.query.search,
    category: req.query.category,
    status: req.query.status,
    isFeatured: req.query.isFeatured,
    sort: req.query.sort,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Admin products fetched successfully"));
});

export const getAdminProductByIdController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);

  const product = await productService.getAdminProductById(id);

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product fetched successfully"));
});
// ─── Admin: Create ────────────────────────────────────────────────────────

export const createProductController = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    price,
    compareAtPrice,
    category,
    brand,
    sku,
    stock,
    isPublished,
    isFeatured,
    hasVariants,
    variants,
    imageUrls,
    ratingAverage,
  } = req.body;

  const parsedVariants = parseJSON(variants, "variants") || [];
  const parsedImageUrls = parseJSON(imageUrls, "imageUrls") || [];

  const uploadedImages = await uploadProductImages(req.files);
  const urlImages = parsedImageUrls.map((url) => ({ url, publicId: null }));
  const images = [...uploadedImages, ...urlImages];

  if (images.length === 0) {
    throw new ApiError(400, "At least one product image is required");
  }

  const product = await productService.createProduct({
    title,
    description,
    price,
    compareAtPrice,
    category,
    brand,
    sku,
    stock,
    isPublished,
    isFeatured,
    hasVariants,
    variants: parsedVariants,
    images,
    vendorId: req.user?._id,
    ratingAverage,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, { product }, "Product created successfully"));
});
// ─── Admin: Update ────────────────────────────────────────────────────────

export const updateProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);

  const {
    title,
    description,
    price,
    compareAtPrice,
    category,
    brand,
    sku,
    stock,
    isPublished,
    isFeatured,
    hasVariants,
    variants,
    imagesToRemove,
    ratingAverage,
  } = req.body;

  const parsedVariants = parseJSON(variants, "variants");
  const parsedImagesToRemove =
    parseJSON(imagesToRemove, "imagesToRemove") || [];

  const newImages = await uploadProductImages(req.files);

  const { product, removedImages } = await productService.updateProduct(id, {
    title,
    description,
    price,
    compareAtPrice,
    category,
    brand,
    sku,
    stock,
    isPublished,
    isFeatured,
    hasVariants,
    variants: parsedVariants,
    imagesToRemove: parsedImagesToRemove,
    newImages,
    ratingAverage,
  });

  if (removedImages.length) {
    await Promise.all(
      removedImages
        .filter((img) => img.publicId)
        .map((img) => deleteFromCloudinary(img.publicId)),
    );
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product updated successfully"));
});

// ─── Admin: Delete ────────────────────────────────────────────────────────

export const deleteProductController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);

  const images = await productService.deleteProduct(id);

  await Promise.all(
    images
      .filter((img) => img.publicId)
      .map((img) => deleteFromCloudinary(img.publicId)),
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

// ─── Admin: Toggle Featured ───────────────────────────────────────────────

export const toggleFeaturedController = asyncHandler(async (req, res) => {
  const { id } = req.params;
  assertValidId(id);

  const product = await productService.toggleFeatured(id);

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Featured status updated"));
});
