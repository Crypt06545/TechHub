import CartProductModel from "../models/cartProduct.model.js";
import { Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { redis } from "../config/redis.js";

// ─── Cache Key Helpers ────────────────────────────────────────────────────────

const CART_TTL          = 86_400; // 24h  — full cart snapshot
const PRODUCT_PRICE_TTL = 3_600;  // 1h   — product prices change rarely

const cartKey         = (userId)    => `cart:${userId}`;
const productPriceKey = (productId) => `product:price:${productId}`;

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Resolves a product's price.
 * Hits Redis first — eliminates a MongoDB round-trip on every addToCart call.
 * Falls back to MongoDB on a miss and repopulates the cache automatically.
 *
 * @param   {string}              productId
 * @returns {Promise<number|null>}           price, or null if product not found
 */
const getProductPrice = async (productId) => {
  try {
    const cached = await redis.get(productPriceKey(productId));
    if (cached !== null) return parseFloat(cached);
  } catch {
    // Redis down — fall through to MongoDB
  }

  const product = await Product.findById(productId).select("price").lean();
  if (!product) return null;

  try {
    await redis.set(productPriceKey(productId), String(product.price), {
      ex: PRODUCT_PRICE_TTL,
    });
  } catch {
    // Non-fatal — continue without caching
  }

  return product.price;
};

/**
 * Re-fetches the full cart from MongoDB and overwrites the Redis key.
 * Called after every mutation. Intentionally NOT awaited — the HTTP response
 * is never held up waiting for a Redis write.
 *
 * @param {string} userId
 */
const syncCartCache = (userId) => {
  CartProductModel.find({ userId })
    .lean()
    .then((cart) =>
      redis.set(cartKey(userId), JSON.stringify(cart), { ex: CART_TTL }),
    )
    .catch((err) => console.error("[Redis] cart sync failed:", err.message));
};

// ─── Controllers ─────────────────────────────────────────────────────────────

export const addToCartController = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user?._id;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  // Redis-first price lookup — saves one DB call on every cache hit
  const price = await getProductPrice(productId);
  if (price === null) {
    throw new ApiError(404, "Product not found");
  }

  const cartItem = await CartProductModel.findOneAndUpdate(
    { userId, productId },
    {
      $inc:         { quantity },
      $setOnInsert: { priceAtAdd: price },
    },
    {
      returnDocument: "after",
      upsert:         true,
      runValidators:  true,
    },
  );

  syncCartCache(userId); // fire-and-forget — does not block response

  return res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data:    cartItem,
  });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user?._id;

  if (!productId) {
    throw new ApiError(400, "Product ID is required");
  }

  const cartItem = await CartProductModel.findOneAndUpdate(
    { userId, productId },
    { $inc: { quantity: -1 } },
    { returnDocument: "after" },
  );

  if (!cartItem) {
    throw new ApiError(404, "Product not found in your cart");
  }

  if (cartItem.quantity <= 0) {
    await CartProductModel.deleteOne({ _id: cartItem._id });

    syncCartCache(userId);

    return res.status(200).json({
      success: true,
      message: "Item removed from cart completely",
      data:    null,
    });
  }

  syncCartCache(userId);

  return res.status(200).json({
    success: true,
    message: "Cart item quantity decreased",
    data:    cartItem,
  });
});

export const clearCartController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  await CartProductModel.deleteMany({ userId });

  // Delete the Redis key entirely — no stale data left behind
  redis.del(cartKey(userId)).catch((err) =>
    console.error("[Redis] cart clear failed:", err.message),
  );

  return res.status(200).json({
    success: true,
    message: "Cart cleared completely successfully",
  });
});

/**
 * GET /cart
 * Serve from Redis on a cache hit.
 * Fall back to MongoDB on a miss and repopulate the cache automatically.
 */
export const getCartController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  try {
    const cached = await redis.get(cartKey(userId));
    if (cached !== null) {
      return res.status(200).json({
        success: true,
        data: typeof cached === "string" ? JSON.parse(cached) : cached,
      });
    }
  } catch {
    // Redis down — fall through to MongoDB
  }

  const cartItems = await CartProductModel.find({ userId }).lean();

  syncCartCache(userId); // repopulate cache, non-blocking

  return res.status(200).json({
    success: true,
    data: cartItems,
  });
});
