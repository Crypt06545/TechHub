import { redis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";
import { productRepository } from "../repositories/product.repository.js";
import { Product } from "../models/product.model.js";
import Category from "../models/category.mode.js";

// ─── TTLs ─────────────────────────────────────────────────────────────────────

const PRODUCT_LIST_TTL = 3_600; // 1h
const FEATURED_TTL = 86_400; // 24h
const SINGLE_PRODUCT_TTL = 86_400; // 24h

// ─── Cache Key Helpers ────────────────────────────────────────────────────────
// NOTE: admin product list is NEVER cached — no key helper needed for it.

const featuredKey = () => "featured_products";
const singleKey = (slug) => `product:${slug}`;
const productListKey = (params) => `all_products:${JSON.stringify(params)}`;

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

const normalizeVariants = (rawVariants) => {
  if (!Array.isArray(rawVariants)) return [];

  return rawVariants.map((v, i) => {
    const size = v.size?.toString().trim() || null;
    const color = v.color?.toString().trim() || null;
    const price = Number(v.price);
    const stock = Number(v.stock);

    if (!size && !color) {
      throw new ApiError(400, `Variant #${i + 1} needs a size or a color`);
    }
    if (Number.isNaN(price) || price < 0) {
      throw new ApiError(400, `Variant #${i + 1} has an invalid price`);
    }
    if (Number.isNaN(stock) || stock < 0) {
      throw new ApiError(400, `Variant #${i + 1} has an invalid stock value`);
    }

    return { size, color, price, stock };
  });
};

const toBool = (val) => val === true || val === "true";

// ─── Cache Invalidation ───────────────────────────────────────────────────────

const invalidateProductCache = async (slug = null) => {
  try {
    const keysToDelete = [featuredKey(), "product:filters:facets"];
    if (slug) keysToDelete.push(singleKey(slug));

    const listKeys = await redis.keys("all_products:*");
    if (listKeys.length) keysToDelete.push(...listKeys);

    if (keysToDelete.length) await redis.del(...keysToDelete);
  } catch (err) {
    console.error("[Redis] cache invalidation failed:", err.message);
  }
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const productService = {
  // ─── Public (storefront) ─────────────────────────────────────────────────

  /**
   * Storefront product list — only published, non-archived products.
   * Cached in Redis per unique filter/sort/cursor combination.
   */
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
        "title slug price compareAtPrice images stock ratingAverage category",
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
   * Admin product list — ALL products regardless of status. Never cached,
   * always fresh. Filters by status/featured/category/title instead of
   * the storefront's price-range filters.
   *
   * status: "draft" | "published" | "archived" | undefined (= all)
   * isFeatured: true | false | undefined
   * sort: "latest" | "oldest" (default latest)
   */
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
        "title slug price compareAtPrice images stock ratingAverage category isPublished isArchived isFeatured createdAt",
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
    category,
    brand,
    sku,
    stock,
    isPublished,
    isFeatured,
    hasVariants,
    variants,
    images,
    vendorId,
  }) {
    if (!title || !price || !category) {
      throw new ApiError(400, "title, price and category are required");
    }

    const normalizedHasVariants = toBool(hasVariants);
    const normalizedVariants = normalizedHasVariants
      ? normalizeVariants(variants)
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
      category,
      brand: brand || "",
      sku: sku || "",
      images,
      stock: normalizedHasVariants ? 0 : Number(stock),
      hasVariants: normalizedHasVariants,
      variants: normalizedVariants,
      isPublished: isPublished === "true" || isPublished === true,
      isFeatured: toBool(isFeatured),
      vendorId,
    });

    await invalidateProductCache();

    return product;
  },

  async updateProduct(
    productId,
    {
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
    if (brand !== undefined) product.brand = brand;
    if (sku !== undefined) product.sku = sku;
    if (isPublished !== undefined)
      product.isPublished = isPublished === "true" || isPublished === true;
    if (isFeatured !== undefined) product.isFeatured = toBool(isFeatured);

    if (hasVariants !== undefined) {
      const normalizedHasVariants = toBool(hasVariants);
      product.hasVariants = normalizedHasVariants;

      if (normalizedHasVariants) {
        const normalizedVariants = normalizeVariants(variants);
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
};
