import { redis } from "../config/redis.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";
import { detectProductCategory } from "../utils/gemini.js";

/**
 * @desc    Get paginated and filtered products with multi-layered caching
 * @route   GET /api/v1/products
 * @access  Public
 */
export const getProductController = asyncHandler(async (req, res) => {
  // Query normalization & validation
  const limit = Math.min(parseInt(req.query.limit || "20", 10), 50);
  const cursor = req.query.cursor;
  const category = req.query.category;
  const featured = req.query.featured;
  const search = req.query.search;

  // Build MongoDB filter query
  const query = {
    isPublished: true,
    isArchived: false,
  };

  if (category) {
    query.category = category;
  }

  if (featured === "true") {
    query.isFeatured = true;
  }

  if (search) {
    query.title = {
      $regex: search,
      $options: "i",
    };
  }

  if (cursor) {
    query._id = {
      $lt: cursor,
    };
  }

  // Generate deterministic cache key based on lookup parameters
  const cacheKey = `products:${JSON.stringify({
    limit,
    cursor,
    category,
    featured,
    search,
  })}`;

  // Serve from Redis cache layer if hit
  const cachedProducts = await redis.get(cacheKey);

  if (cachedProducts) {
    let parsedData = null;

    if (typeof cachedProducts === "object" && cachedProducts !== null) {
      parsedData = cachedProducts;
    } else if (typeof cachedProducts === "string") {
      try {
        if (cachedProducts !== "[object Object]") {
          parsedData = JSON.parse(cachedProducts);
        } else {
          await redis.del(cacheKey);
        }
      } catch (e) {
        await redis.del(cacheKey);
      }
    }

    if (parsedData && parsedData.products) {
      return res.status(200).json({
        statusCode: 200,
        data: parsedData,
        message: "Products fetched successfully",
        success: true,
      });
    }
  }

  // Database fallback query execution
  const products = await Product.find(query)
    .select(
      "title slug price compareAtPrice images category stock ratingAverage",
    )
    .lean()
    .sort({ _id: -1 })
    .limit(limit + 1);

  // Parse pagination cursors
  let nextCursor = null;
  if (products.length > limit) {
    const nextItem = products.pop();
    nextCursor = nextItem._id;
  }

  const responseData = {
    products,
    nextCursor,
    hasMore: Boolean(nextCursor),
  };

  // Populate cache layer asynchronously to prevent blocking the event loop
  try {
    await redis.set(cacheKey, JSON.stringify(responseData), {
      ex: 300,
    });
  } catch (redisError) {
    console.error("Redis operational cache exception:", redisError);
  }

  return res
    .status(200)
    .json(new ApiResponse(200, responseData, "Products fetched successfully"));
});

/**
 * @desc    Get all high-priority featured products with cache layer optimization
 * @route   GET /api/v1/products/featured
 * @access  Public
 */
export const getFeaturedProductConroller = asyncHandler(async (req, res) => {
  const cached = await redis.get("featured_products");

  if (cached) {
    let parsedData = null;

    if (typeof cached === "object" && cached !== null) {
      parsedData = cached;
    } else if (typeof cached === "string") {
      try {
        if (cached !== "[object Object]") {
          parsedData = JSON.parse(cached);
        } else {
          await redis.del("featured_products");
        }
      } catch (e) {
        await redis.del("featured_products");
      }
    }

    if (parsedData) {
      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { products: parsedData, total: parsedData.length },
            "Featured products fetched successfully",
          ),
        );
    }
  }

  const featuredProducts = await Product.find({ isFeatured: true }).lean();
  if (!featuredProducts || featuredProducts.length === 0) {
    throw new ApiError(404, "No featured products found");
  }

  await redis.set("featured_products", JSON.stringify(featuredProducts), {
    ex: 600,
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { products: featuredProducts, total: featuredProducts.length },
        "Featured products fetched successfully",
      ),
    );
});

/**
 * @desc    Get single product details by unique slug identification
 * @route   GET /api/v1/products/:slug
 * @access  Public
 */
export const getSingleProductController = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  if (!slug) {
    throw new ApiError(400, "Product slug is required");
  }

  const cacheKey = `product:${slug}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { product: cached },
          "Product fetched successfully",
        ),
      );
  }

  const product = await Product.findOne({
    slug,
    isPublished: true,
    isArchived: false,
  }).lean();

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  await redis.set(cacheKey, product, { ex: 3600 });

  return res
    .status(200)
    .json(new ApiResponse(200, { product }, "Product fetched successfully"));
});
