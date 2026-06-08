import { redis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";
import { productRepository } from "../repositories/product.repository.js";

// ─── TTLs ─────────────────────────────────────────────────────────────────────

const PRODUCT_LIST_TTL = 3_600; // 1h
const FEATURED_TTL = 86_400; // 24h
const SINGLE_PRODUCT_TTL = 86_400; // 24h

// ─── Cache Key Helpers ────────────────────────────────────────────────────────

const featuredKey = () => "featured_products";
const singleKey = (slug) => `product:${slug}`;
const productListKey = (params) => `products:${JSON.stringify(params)}`;

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

/**
 * Builds a unique slug from a title.
 * Appends timestamp if slug already exists in DB.
 * Excludes excludeId so update doesn't conflict with itself.
 */
const buildSlug = async (title, excludeId = null) => {
  let slug = title
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");

  const existing = await productRepository.findBySlug(slug, excludeId);
  if (existing) slug = `${slug}-${Date.now()}`;

  return slug;
};

// ─── Cache Invalidation ───────────────────────────────────────────────────────

const invalidateProductCache = async (slug = null) => {
  try {
    const listKeys = await redis.keys("products:*");
    const keysToDelete = [featuredKey(), ...listKeys];
    if (slug) keysToDelete.push(singleKey(slug));
    if (keysToDelete.length) await redis.del(...keysToDelete);
  } catch (err) {
    console.error("[Redis] cache invalidation failed:", err.message);
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const productService = {
  // ─── Public ───────────────────────────────────────────────────────────────

  async getProducts({ limit, cursor, category, featured, search }) {
    const query = { isPublished: true, isArchived: false };
    if (category) query.category = category;
    if (featured === "true") query.isFeatured = true;
    if (search) query.title = { $regex: search, $options: "i" };
    if (cursor) query._id = { $lt: cursor };

    const cacheKey = productListKey({
      limit,
      cursor,
      category,
      featured,
      search,
    });

    const cached = await safeRedisGet(cacheKey);
    if (cached?.products) return cached;

    const products = await productRepository.findWithFilters(query, limit);

    let nextCursor = null;
    if (products.length > limit) {
      const nextItem = products.pop();
      nextCursor = nextItem._id;
    }

    const responseData = { products, nextCursor, hasMore: Boolean(nextCursor) };

    redis
      .set(cacheKey, JSON.stringify(responseData), { ex: PRODUCT_LIST_TTL })
      .catch((err) =>
        console.error("[Redis] product list cache failed:", err.message),
      );

    return responseData;
  },

  async getFeaturedProducts() {
    const cached = await safeRedisGet(featuredKey());
    if (cached) return cached;

    const products = await productRepository.findFeatured();
    if (!products.length) throw new ApiError(404, "No featured products found");

    redis
      .set(featuredKey(), JSON.stringify(products), { ex: FEATURED_TTL })
      .catch((err) =>
        console.error("[Redis] featured cache failed:", err.message),
      );

    return products;
  },

  async getSingleProduct(slug) {
    if (!slug) throw new ApiError(400, "Product slug is required");

    const cacheKey = singleKey(slug);

    const cached = await safeRedisGet(cacheKey);
    if (cached) return cached;

    const product = await productRepository.findBySlug(slug);
    if (!product) throw new ApiError(404, "Product not found");

    redis
      .set(cacheKey, JSON.stringify(product), { ex: SINGLE_PRODUCT_TTL })
      .catch((err) =>
        console.error("[Redis] single product cache failed:", err.message),
      );

    return product;
  },

  // ─── Admin ────────────────────────────────────────────────────────────────

  /**
   * images array is built in the controller from Cloudinary uploads.
   * Service stays clean of req.files / multer.
   */
  async createProduct({
    title,
    description,
    price,
    compareAtPrice,
    category,
    stock,
    isPublished,
    images,
    vendorId,
  }) {
    const slug = await buildSlug(title);

    const product = await productRepository.create({
      title,
      slug,
      description: description || "",
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      category,
      images,
      stock: Number(stock),
      isPublished: isPublished === "true" || isPublished === true,
      vendorId,
    });

    await invalidateProductCache();

    return product;
  },

  /**
   * imagesToRemove — array of URLs already deleted from Cloudinary in the controller.
   * newImages      — array of { url, publicId } already uploaded in the controller.
   */
  async updateProduct(
    productId,
    {
      title,
      description,
      price,
      compareAtPrice,
      category,
      stock,
      isPublished,
      imagesToRemove,
      newImages,
    },
  ) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const oldSlug = product.slug;

    if (title && title !== product.title) {
      product.slug = await buildSlug(title, productId);
      product.title = title;
    }

    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (compareAtPrice !== undefined)
      product.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
    if (category) product.category = category;
    if (stock !== undefined) product.stock = Number(stock);
    if (isPublished !== undefined)
      product.isPublished = isPublished === "true" || isPublished === true;

    // Strip removed images
    if (imagesToRemove?.length) {
      product.images = product.images.filter(
        (img) => !imagesToRemove.includes(img.url),
      );
    }

    // Append new images
    if (newImages?.length) {
      product.images = [...product.images, ...newImages];
    }

    const updated = await productRepository.save(product);

    // Invalidate both old and new slug in case title changed
    await invalidateProductCache(oldSlug);
    if (product.slug !== oldSlug) await invalidateProductCache(product.slug);

    return updated;
  },

  async toggleFeatured(productId) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    product.isFeatured = !product.isFeatured;
    const updated = await productRepository.save(product);

    await invalidateProductCache(product.slug);

    return updated;
  },

  
  /**
   * Returns images array so controller can clean up Cloudinary after DB delete.
   */
  async deleteProduct(productId) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    await productRepository.deleteById(productId);
    await invalidateProductCache(product.slug);

    return product.images; // controller uses this to delete from Cloudinary
  },
};
