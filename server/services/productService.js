import { redis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";
import { productRepository } from "../repositories/product.repository.js";
import { Product } from "../models/product.model.js";
import Category from "../models/category.mode.js";
import { StockLog } from "../models/stockLog.model.js";
import mongoose from "mongoose";
// ─── TTLs ─────────────────────────────────────────────────────────────────────

const PRODUCT_LIST_TTL = 3_600; // 1h
const SINGLE_PRODUCT_TTL = 86_400; // 24h
const SECTION_TTL = 3_600; // 1h — shared by "featured" and every badge section

// ─── Cache Key Helpers ────────────────────────────────────────────────────────
// NOTE: admin product list is NEVER cached — no key helper needed for it.

const singleKey = (slug) => `product:${slug}`;
const productListKey = (params) => `all_products:${JSON.stringify(params)}`;
const sectionKey = (type) => `products_section:${type}`;

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

const normalizeVariants = (rawVariants, fallbackCostPrice = 0) => {
  if (!Array.isArray(rawVariants)) return [];

  return rawVariants.map((v, i) => {
    const size = v.size?.toString().trim() || null;
    const color = v.color?.toString().trim() || null;
    const price = Number(v.price);
    const stock = Number(v.stock);
    const costPrice =
      v.costPrice !== undefined && v.costPrice !== ""
        ? Number(v.costPrice)
        : fallbackCostPrice;

    if (!size && !color) {
      throw new ApiError(400, `Variant #${i + 1} needs a size or a color`);
    }
    if (Number.isNaN(price) || price < 0) {
      throw new ApiError(400, `Variant #${i + 1} has an invalid price`);
    }
    if (Number.isNaN(stock) || stock < 0) {
      throw new ApiError(400, `Variant #${i + 1} has an invalid stock value`);
    }
    if (Number.isNaN(costPrice) || costPrice < 0) {
      throw new ApiError(400, `Variant #${i + 1} has an invalid cost price`);
    }

    // Passed straight through untouched when present — this service
    // never computes the breakdown itself, only stores whatever the
    // "Manage Cost" calculator already computed client-side. Omitted
    // entirely (e.g. a variant added via AddProduct, never priced
    // through the calculator) just stays null.
    const costBreakdown = v.costBreakdown ?? null;

    return { size, color, price, stock, costPrice, costBreakdown };
  });
};

const toBool = (val) => val === true || val === "true";

// Must match the `badge` enum in product.model.js exactly.
const BADGE_OPTIONS = [
  "Hot Deal",
  "New Arrival",
  "Best Seller",
  "Top Rated",
  "Limited Stock",
  "Trending",
];

/**
 * "" / undefined / null all mean "no badge" — the admin form sends
 * nothing (or "none") for that case, not an omitted field.
 */
const normalizeBadge = (badge) => {
  if (
    badge === undefined ||
    badge === null ||
    badge === "" ||
    badge === "none"
  ) {
    return null;
  }
  if (!BADGE_OPTIONS.includes(badge)) {
    throw new ApiError(
      400,
      `Invalid badge "${badge}". Must be one of: ${BADGE_OPTIONS.join(", ")}`,
    );
  }
  return badge;
};

// ─── Cache Invalidation ───────────────────────────────────────────────────────

const invalidateProductCache = async (slug = null) => {
  try {
    const keysToDelete = ["product:filters:facets"];
    if (slug) keysToDelete.push(singleKey(slug));

    const listKeys = await redis.keys("all_products:*");
    if (listKeys.length) keysToDelete.push(...listKeys);

    const sectionKeys = await redis.keys("products_section:*");
    if (sectionKeys.length) keysToDelete.push(...sectionKeys);

    if (keysToDelete.length) await redis.del(...keysToDelete);
  } catch (err) {
    console.error("[Redis] cache invalidation failed:", err.message);
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const productService = {
  // ─── Public (storefront) ─────────────────────────────────────────────────

  async getProducts({
    limit = 12,
    cursor,
    category,
    brand,
    minPrice,
    maxPrice,
    search,
    sort,
  }) {
    const cacheKey = productListKey({
      limit,
      cursor,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sort,
    });
    const cached = await safeRedisGet(cacheKey);
    if (cached) return cached;

    const query = { isPublished: true, isArchived: false };

    if (category) {
      const slugs = category.split(",");
      const categoryDocs = await Category.find({ slug: { $in: slugs } })
        .select("_id")
        .lean();
      if (categoryDocs.length === 0) {
        return { products: [], nextCursor: null, hasMore: false };
      }
      query.category = { $in: categoryDocs.map((c) => c._id) };
    }

    if (brand) query.brand = { $in: brand.split(",") };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.title = { $regex: search, $options: "i" };

    let sortSpec = { _id: -1 };
    if (sort === "price_asc") sortSpec = { price: 1, _id: 1 };
    if (sort === "price_desc") sortSpec = { price: -1, _id: -1 };

    if (cursor) {
      if (sort === "price_asc" || sort === "price_desc") {
        let cursorData;
        try {
          cursorData = JSON.parse(cursor);
        } catch (error) {
          throw new ApiError(400, "Invalid pagination cursor");
        }

        if (sort === "price_asc") {
          query.price = { ...(query.price || {}), $gte: cursorData.price };
          query._id = { $gt: cursorData._id };
        } else {
          query.price = { ...(query.price || {}), $lte: cursorData.price };
          query._id = { $lt: cursorData._id };
        }
      } else {
        query._id = { $lt: cursor };
      }
    }

    const products = await Product.find(query)
      .select(
        "title slug description price compareAtPrice images stock ratingAverage ratingCount category hasVariants variants badge",
      )
      .populate("category", "name slug")
      .sort(sortSpec)
      .limit(limit + 1)
      .lean();

    let nextCursor = null;
    if (products.length > limit) {
      const nextItem = products.pop();
      nextCursor = sort?.startsWith("price")
        ? JSON.stringify({ price: nextItem.price, _id: nextItem._id })
        : nextItem._id;
    }

    const result = { products, nextCursor, hasMore: Boolean(nextCursor) };

    redis
      .set(cacheKey, JSON.stringify(result), { ex: PRODUCT_LIST_TTL })
      .catch((err) => console.error("[Redis] list cache failed:", err.message));

    return result;
  },

  async getFilterFacets() {
    const cacheKey = "product:filters:facets";
    const cached = await safeRedisGet(cacheKey);
    if (cached) return cached;

    const [result] = await Product.aggregate([
      { $match: { isPublished: true, isArchived: false } },
      {
        $facet: {
          brands: [
            { $group: { _id: "$brand" } },
            { $match: { _id: { $ne: "" } } },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, name: "$_id" } },
          ],
          priceRange: [
            {
              $group: {
                _id: null,
                min: { $min: "$price" },
                max: { $max: "$price" },
              },
            },
          ],
        },
      },
    ]);

    const facets = {
      brands: result.brands.map((b) => b.name),
      priceRange: result.priceRange[0] || { min: 0, max: 1000 },
    };

    redis
      .set(cacheKey, JSON.stringify(facets), { ex: 3600 })
      .catch((err) =>
        console.error("[Redis] filters cache failed:", err.message),
      );

    return facets;
  },

  async getProductSection(type) {
    const isFeatured = type === "featured";

    if (!isFeatured && !BADGE_OPTIONS.includes(type)) {
      throw new ApiError(
        400,
        `Invalid section "${type}". Must be "featured" or one of: ${BADGE_OPTIONS.join(", ")}`,
      );
    }

    const cacheKey = sectionKey(type);
    const cached = await safeRedisGet(cacheKey);
    if (cached) return cached;

    const query = isFeatured
      ? { isFeatured: true, isPublished: true, isArchived: false }
      : { badge: type, isPublished: true, isArchived: false };

    const products = await Product.find(query)
      .select(
        "title slug description price compareAtPrice images stock ratingAverage ratingCount category hasVariants variants badge isFeatured",
      )
      .populate("category", "name slug")
      .sort({ _id: -1 })
      .lean();

    redis
      .set(cacheKey, JSON.stringify(products), { ex: SECTION_TTL })
      .catch((err) =>
        console.error("[Redis] section cache failed:", err.message),
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

  async getAdminProductById(productId) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");
    return product;
  },

  async getAdminProducts({
    limit = 12,
    cursor,
    search,
    category,
    status,
    isFeatured,
    sort,
  }) {
    const query = {};

    if (status === "published") {
      query.isPublished = true;
      query.isArchived = false;
    } else if (status === "draft") {
      query.isPublished = false;
      query.isArchived = false;
    } else if (status === "archived") {
      query.isArchived = true;
    }

    if (isFeatured !== undefined) {
      query.isFeatured = isFeatured === "true" || isFeatured === true;
    }

    if (category) {
      const slugs = category.split(",");
      const categoryDocs = await Category.find({ slug: { $in: slugs } })
        .select("_id")
        .lean();
      if (categoryDocs.length === 0) {
        return { products: [], nextCursor: null, hasMore: false };
      }
      query.category = { $in: categoryDocs.map((c) => c._id) };
    }

    if (search) query.title = { $regex: search, $options: "i" };

    const sortSpec = sort === "oldest" ? { _id: 1 } : { _id: -1 };

    if (cursor) {
      query._id = sort === "oldest" ? { $gt: cursor } : { $lt: cursor };
    }

    const products = await Product.find(query)
      .select(
        "title slug description price compareAtPrice costPrice images stock hasVariants lowStockThreshold category isPublished isArchived isFeatured badge createdAt",
      )
      .populate("category", "name slug")
      .sort(sortSpec)
      .limit(limit + 1)
      .lean();

    let nextCursor = null;
    if (products.length > limit) {
      const nextItem = products.pop();
      nextCursor = nextItem._id;
    }

    return { products, nextCursor, hasMore: Boolean(nextCursor) };
  },

  // ─── Order support ────────────────────────────────────────────────────────

  async resolveOrderItems(items) {
    if (!items?.length) throw new ApiError(400, "No items provided");

    const productIds = items.map((i) => i.productId);
    const products = await productRepository.findByIdsForOrder(productIds);
    const productMap = new Map(products.map((p) => [String(p._id), p]));

    return items.map(({ productId, variantId, quantity }) => {
      if (!quantity || quantity < 1) {
        throw new ApiError(400, "Invalid quantity in cart");
      }

      const product = productMap.get(String(productId));
      if (!product) {
        throw new ApiError(
          404,
          `One of the products in your cart no longer exists`,
        );
      }
      if (!product.isPublished || product.isArchived) {
        throw new ApiError(400, `"${product.title}" is no longer available`);
      }

      if (variantId) {
        const variant = product.variants?.find(
          (v) => String(v._id) === String(variantId),
        );
        if (!variant) {
          throw new ApiError(
            404,
            `The selected option for "${product.title}" is no longer available`,
          );
        }
        if (variant.stock < quantity) {
          const label = [variant.size, variant.color]
            .filter(Boolean)
            .join(" / ");
          throw new ApiError(
            400,
            `Only ${variant.stock} left in stock for "${product.title}"${
              label ? ` (${label})` : ""
            }`,
          );
        }

        const price = variant.price;
        return {
          productId: product._id,
          variantId: variant._id,
          title: product.title,
          slug: product.slug,
          image: product.images?.[0]?.url ?? null,
          size: variant.size,
          color: variant.color,
          price,
          quantity,
          lineTotal: price * quantity,
        };
      }

      if (product.stock < quantity) {
        throw new ApiError(
          400,
          `Only ${product.stock} left in stock for "${product.title}"`,
        );
      }

      return {
        productId: product._id,
        variantId: null,
        title: product.title,
        slug: product.slug,
        image: product.images?.[0]?.url ?? null,
        size: null,
        color: null,
        price: product.price,
        quantity,
        lineTotal: product.price * quantity,
      };
    });
  },

  async decrementStockForOrder(resolvedItems, session = null) {
    for (const item of resolvedItems) {
      const updated = item.variantId
        ? await productRepository.decrementVariantStock(
            item.productId,
            item.variantId,
            item.quantity,
            session,
          )
        : await productRepository.decrementStock(
            item.productId,
            item.quantity,
            session,
          );

      if (!updated) {
        throw new ApiError(
          409,
          `Stock for "${item.title}" changed while you were checking out — please review your cart and try again.`,
        );
      }
    }
  },

  // ─── Admin: mutations ─────────────────────────────────────────────────────

  async createProduct({
    title,
    description,
    price,
    compareAtPrice,
    costPrice,
    lowStockThreshold,
    category,
    brand,
    sku,
    stock,
    isPublished,
    isFeatured,
    badge,
    hasVariants,
    variants,
    images,
    vendorId,
    ratingAverage,
    adminId,
  }) {
    if (!title || !price || !category) {
      throw new ApiError(400, "title, price and category are required");
    }

    const normalizedHasVariants = toBool(hasVariants);
    const normalizedCostPrice =
      costPrice !== undefined && costPrice !== "" ? Number(costPrice) : 0;
    const normalizedVariants = normalizedHasVariants
      ? normalizeVariants(variants, normalizedCostPrice)
      : [];

    if (normalizedHasVariants && normalizedVariants.length === 0) {
      throw new ApiError(
        400,
        "At least one variant is required when the product has variants",
      );
    }
    if (!normalizedHasVariants && (stock === undefined || stock === "")) {
      throw new ApiError(
        400,
        "Stock is required for products without variants",
      );
    }

    const slug = await buildSlug(title);

    const product = await productRepository.create({
      title,
      slug,
      description: description || "",
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      costPrice: normalizedCostPrice,
      lowStockThreshold:
        lowStockThreshold !== undefined && lowStockThreshold !== ""
          ? Number(lowStockThreshold)
          : 5,
      category,
      brand: brand || "",
      sku: sku || "",
      images,
      stock: normalizedHasVariants ? 0 : Number(stock),
      hasVariants: normalizedHasVariants,
      variants: normalizedVariants,
      isPublished: isPublished === "true" || isPublished === true,
      isFeatured: toBool(isFeatured),
      badge: normalizeBadge(badge),
      vendorId,
      ...(ratingAverage !== undefined && ratingAverage !== ""
        ? { ratingAverage: Number(ratingAverage) }
        : {}),
    });

    await invalidateProductCache();

    if (normalizedHasVariants) {
      const stockedVariants = product.variants.filter((v) => v.stock > 0);
      if (stockedVariants.length) {
        await StockLog.insertMany(
          stockedVariants.map((v) => ({
            productId: product._id,
            variantId: v._id,
            type: "initial",
            change: v.stock,
            previousStock: 0,
            newStock: v.stock,
            unitCost: v.costPrice,
            totalCost: v.costPrice * v.stock,
            reason: "Opening stock on product creation",
            adminId,
          })),
        );
      }
    } else if (product.stock > 0) {
      await StockLog.create({
        productId: product._id,
        variantId: null,
        type: "initial",
        change: product.stock,
        previousStock: 0,
        newStock: product.stock,
        unitCost: product.costPrice,
        totalCost: product.costPrice * product.stock,
        reason: "Opening stock on product creation",
        adminId,
      });
    }

    return product;
  },

  async updateProduct(
    productId,
    {
      title,
      description,
      price,
      compareAtPrice,
      costPrice,
      costBreakdown,
      lowStockThreshold,
      category,
      brand,
      sku,
      stock,
      isPublished,
      isFeatured,
      badge,
      hasVariants,
      variants,
      imagesToRemove,
      newImages,
      ratingAverage,
      adminId,
    },
  ) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    const oldSlug = product.slug;
    const previousCostPrice = product.costPrice;

    if (title && title !== product.title) {
      product.slug = await buildSlug(title, productId);
      product.title = title;
    }

    if (description !== undefined) product.description = description;
    if (price !== undefined) product.price = Number(price);
    if (compareAtPrice !== undefined)
      product.compareAtPrice = compareAtPrice ? Number(compareAtPrice) : null;
    if (costPrice !== undefined && costPrice !== "")
      product.costPrice = Number(costPrice);
    if (costBreakdown !== undefined) product.costBreakdown = costBreakdown;
    if (lowStockThreshold !== undefined && lowStockThreshold !== "")
      product.lowStockThreshold = Number(lowStockThreshold);
    if (category) product.category = category;
    if (brand !== undefined) product.brand = brand;
    if (sku !== undefined) product.sku = sku;
    if (isPublished !== undefined)
      product.isPublished = isPublished === "true" || isPublished === true;
    if (isFeatured !== undefined) product.isFeatured = toBool(isFeatured);
    if (badge !== undefined) product.badge = normalizeBadge(badge);
    if (ratingAverage !== undefined && ratingAverage !== "")
      product.ratingAverage = Number(ratingAverage);

    if (hasVariants !== undefined) {
      const normalizedHasVariants = toBool(hasVariants);
      product.hasVariants = normalizedHasVariants;

      if (normalizedHasVariants) {
        const normalizedVariants = normalizeVariants(
          variants,
          product.costPrice,
        );
        if (normalizedVariants.length === 0) {
          throw new ApiError(
            400,
            "At least one variant is required when the product has variants",
          );
        }
        product.variants = normalizedVariants;
      } else {
        product.variants = [];
        if (stock !== undefined) product.stock = Number(stock);
      }
    } else if (!product.hasVariants && stock !== undefined) {
      product.stock = Number(stock);
    }

    let removedImages = [];
    if (imagesToRemove?.length) {
      removedImages = product.images.filter((img) =>
        imagesToRemove.includes(img.url),
      );
      product.images = product.images.filter(
        (img) => !imagesToRemove.includes(img.url),
      );
    }

    if (newImages?.length) {
      product.images = [...product.images, ...newImages];
    }

    const updated = await productRepository.save(product);

    if (
      costPrice !== undefined &&
      costPrice !== "" &&
      Number(costPrice) !== previousCostPrice
    ) {
      await StockLog.create({
        productId: updated._id,
        variantId: null,
        type: "correction",
        change: 0,
        previousStock: updated.stock,
        newStock: updated.stock,
        unitCost: Number(costPrice),
        reason: `Cost price corrected from ৳${previousCostPrice} to ৳${costPrice}`,
        adminId,
      });
    }

    await invalidateProductCache(oldSlug);
    if (product.slug !== oldSlug) await invalidateProductCache(product.slug);

    return { product: updated, removedImages };
  },

  async toggleFeatured(productId) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    product.isFeatured = !product.isFeatured;
    const updated = await productRepository.save(product);

    await invalidateProductCache(product.slug);

    return updated;
  },

  async deleteProduct(productId) {
    const product = await productRepository.findById(productId);
    if (!product) throw new ApiError(404, "Product not found");

    await productRepository.deleteById(productId);
    await invalidateProductCache(product.slug);

    return product.images;
  },

  // ─── Inventory management ───────────────────────────────────────────────

  async restockProduct({
    productId,
    variantId,
    quantity,
    unitCost,
    reason,
    adminId,
  }) {
    if (!quantity || quantity <= 0)
      throw new ApiError(400, "Quantity must be greater than 0");
    if (unitCost === undefined || unitCost === null || unitCost < 0)
      throw new ApiError(400, "A valid unit cost is required to restock");

    const session = await mongoose.startSession();
    let logEntry;
    let updatedProduct;

    try {
      await session.withTransaction(async () => {
        const product = await Product.findById(productId).session(session);
        if (!product) throw new ApiError(404, "Product not found");

        if (product.hasVariants && !variantId)
          throw new ApiError(
            400,
            "Select a variant to restock for this product",
          );
        if (!product.hasVariants && variantId)
          throw new ApiError(400, "This product does not use variants");

        let previousStock, oldCost, newAvgCost;

        if (variantId) {
          const variant = product.variants.id(variantId);
          if (!variant) throw new ApiError(404, "Variant not found");
          previousStock = variant.stock;
          oldCost = variant.costPrice || 0;
        } else {
          previousStock = product.stock;
          oldCost = product.costPrice || 0;
        }

        newAvgCost =
          Math.round(
            ((previousStock * oldCost + quantity * unitCost) /
              (previousStock + quantity)) *
              100,
          ) / 100;

        updatedProduct = variantId
          ? await productRepository.restockVariantStock(
              productId,
              variantId,
              quantity,
              newAvgCost,
              session,
            )
          : await productRepository.restockStock(
              productId,
              quantity,
              newAvgCost,
              session,
            );

        if (!updatedProduct) throw new ApiError(404, "Product not found");

        const [log] = await StockLog.create(
          [
            {
              productId,
              variantId: variantId || null,
              type: "restock",
              change: quantity,
              previousStock,
              newStock: previousStock + quantity,
              unitCost,
              totalCost: unitCost * quantity,
              reason: reason || "",
              adminId,
            },
          ],
          { session },
        );
        logEntry = log;
      });
    } finally {
      await session.endSession();
    }

    await invalidateProductCache(updatedProduct.slug);
    return { product: updatedProduct, log: logEntry };
  },

  async adjustStock({ productId, variantId, change, type, reason, adminId }) {
    const ADJUSTMENT_TYPES = ["damage", "correction"];

    if (!ADJUSTMENT_TYPES.includes(type))
      throw new ApiError(
        400,
        `type must be one of: ${ADJUSTMENT_TYPES.join(", ")}`,
      );
    if (!change || !Number.isInteger(change))
      throw new ApiError(400, "change must be a non-zero whole number");
    if (type === "damage" && change > 0)
      throw new ApiError(400, "Damage adjustments must reduce stock");
    if (!reason || !reason.trim())
      throw new ApiError(
        400,
        "A reason is required for manual stock adjustments",
      );

    const session = await mongoose.startSession();
    let logEntry;
    let updatedProduct;

    try {
      await session.withTransaction(async () => {
        const product = await Product.findById(productId).session(session);
        if (!product) throw new ApiError(404, "Product not found");

        if (product.hasVariants && !variantId)
          throw new ApiError(
            400,
            "Select a variant to adjust for this product",
          );
        if (!product.hasVariants && variantId)
          throw new ApiError(400, "This product does not use variants");

        const previousStock = variantId
          ? product.variants.id(variantId)?.stock
          : product.stock;

        if (previousStock === undefined)
          throw new ApiError(404, "Variant not found");
        if (change < 0 && previousStock + change < 0)
          throw new ApiError(
            400,
            `Cannot remove ${-change} units — only ${previousStock} in stock`,
          );

        const absChange = Math.abs(change);
        const isAdd = change > 0;

        updatedProduct = variantId
          ? isAdd
            ? await productRepository.incrementVariantStock(
                productId,
                variantId,
                absChange,
                session,
              )
            : await productRepository.decrementVariantStock(
                productId,
                variantId,
                absChange,
                session,
              )
          : isAdd
            ? await productRepository.incrementStock(
                productId,
                absChange,
                session,
              )
            : await productRepository.decrementStock(
                productId,
                absChange,
                session,
              );

        if (!updatedProduct)
          throw new ApiError(409, "Stock changed concurrently — please retry");

        const [log] = await StockLog.create(
          [
            {
              productId,
              variantId: variantId || null,
              type,
              change,
              previousStock,
              newStock: previousStock + change,
              reason,
              adminId,
            },
          ],
          { session },
        );
        logEntry = log;
      });
    } finally {
      await session.endSession();
    }

    await invalidateProductCache(updatedProduct.slug);
    return { product: updatedProduct, log: logEntry };
  },

  async getStockLogs({ productId, variantId, type, cursor, limit = 30 }) {
    const query = {};
    if (productId) query.productId = productId;
    if (variantId) query.variantId = variantId;
    if (type) query.type = type;
    if (cursor) query._id = { $lt: cursor };

    const logs = await StockLog.find(query)
      .populate("productId", "title slug images")
      .populate("adminId", "name")
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    let nextCursor = null;
    if (logs.length > limit) {
      nextCursor = logs.pop()._id;
    }

    return { logs, nextCursor, hasMore: Boolean(nextCursor) };
  },

  async getLowStockProducts() {
    return Product.aggregate([
      { $match: { isArchived: false } },
      {
        $addFields: {
          lowVariants: {
            $filter: {
              input: "$variants",
              as: "v",
              cond: { $lte: ["$$v.stock", "$lowStockThreshold"] },
            },
          },
        },
      },
      {
        $addFields: {
          isLowStock: {
            $cond: [
              "$hasVariants",
              { $gt: [{ $size: "$lowVariants" }, 0] },
              { $lte: ["$stock", "$lowStockThreshold"] },
            ],
          },
        },
      },
      { $match: { isLowStock: true } },
      {
        $project: {
          title: 1,
          slug: 1,
          brand: 1,
          stock: 1,
          lowStockThreshold: 1,
          hasVariants: 1,
          lowVariants: 1,
          images: { $slice: ["$images", 1] },
        },
      },
      { $sort: { stock: 1 } },
    ]);
  },

  async getInventorySummary() {
    const [result] = await Product.aggregate([
      { $match: { isArchived: false } },
      {
        $addFields: {
          retailValue: {
            $cond: [
              "$hasVariants",
              {
                $sum: {
                  $map: {
                    input: "$variants",
                    as: "v",
                    in: { $multiply: ["$$v.stock", "$$v.price"] },
                  },
                },
              },
              { $multiply: ["$stock", "$price"] },
            ],
          },
          costValue: {
            $cond: [
              "$hasVariants",
              {
                $sum: {
                  $map: {
                    input: "$variants",
                    as: "v",
                    in: { $multiply: ["$$v.stock", "$$v.costPrice"] },
                  },
                },
              },
              { $multiply: ["$stock", "$costPrice"] },
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStockUnits: { $sum: "$stock" },
          totalRetailValue: { $sum: "$retailValue" },
          totalCostValue: { $sum: "$costValue" },
          outOfStockCount: { $sum: { $cond: [{ $eq: ["$stock", 0] }, 1, 0] } },
        },
      },
    ]);

    const lowStockProducts = await this.getLowStockProducts();

    return {
      totalProducts: result?.totalProducts ?? 0,
      totalStockUnits: result?.totalStockUnits ?? 0,
      totalRetailValue: result?.totalRetailValue ?? 0,
      totalCostValue: result?.totalCostValue ?? 0,
      potentialProfit:
        (result?.totalRetailValue ?? 0) - (result?.totalCostValue ?? 0),
      outOfStockCount: result?.outOfStockCount ?? 0,
      lowStockCount: lowStockProducts.length,
    };
  },
};
