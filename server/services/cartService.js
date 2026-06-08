import { redis } from "../config/redis.js";
import { Product } from "../models/product.model.js";
import { cartRepository } from "../repositories/cartRepository.js";
import { ApiError } from "../utils/ApiError.js";


// ─── Cache Key Helpers ────────────────────────────────────────────────────────

const CART_TTL          = 86_400; // 24h
const PRODUCT_PRICE_TTL = 3_600;  // 1h

const cartKey         = (userId)    => `cart:${userId}`;
const productPriceKey = (productId) => `product:price:${productId}`;

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Redis-first price lookup.
 * Falls back to MongoDB on miss and repopulates cache automatically.
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
 * Re-fetches cart from MongoDB and overwrites Redis key.
 * Fire-and-forget — never blocks the HTTP response.
 */
const syncCartCache = (userId) => {
  cartRepository
    .findByUserId(userId)
    .then((cart) =>
      redis.set(cartKey(userId), JSON.stringify(cart), { ex: CART_TTL }),
    )
    .catch((err) => console.error("[Redis] cart sync failed:", err.message));
};

// ─── Service ──────────────────────────────────────────────────────────────────

export const cartService = {
  async addToCart(userId, productId, quantity = 1) {
    if (!productId) throw new ApiError(400, "Product ID is required");

    const price = await getProductPrice(productId);
    if (price === null) throw new ApiError(404, "Product not found");

    const cartItem = await cartRepository.upsertIncrement(
      userId,
      productId,
      price,
      quantity,
    );

    syncCartCache(userId);

    return cartItem;
  },

  async removeFromCart(userId, productId) {
    if (!productId) throw new ApiError(400, "Product ID is required");

    const cartItem = await cartRepository.decrementItem(userId, productId);
    if (!cartItem) throw new ApiError(404, "Product not found in your cart");

    if (cartItem.quantity <= 0) {
      await cartRepository.deleteOne(userId, productId);
      syncCartCache(userId);
      return null; // signals item fully removed
    }

    syncCartCache(userId);

    return cartItem;
  },

  async clearCart(userId) {
    await cartRepository.deleteByUserId(userId);

    // Delete Redis key entirely — no stale data left behind
    redis
      .del(cartKey(userId))
      .catch((err) =>
        console.error("[Redis] cart clear failed:", err.message),
      );
  },

  async getCart(userId) {
    try {
      const cached = await redis.get(cartKey(userId));
      if (cached !== null) {
        return typeof cached === "string" ? JSON.parse(cached) : cached;
      }
    } catch {
      // Redis down — fall through to MongoDB
    }

    const cartItems = await cartRepository.findByUserId(userId);

    syncCartCache(userId); // repopulate cache, non-blocking

    return cartItems;
  },
};
