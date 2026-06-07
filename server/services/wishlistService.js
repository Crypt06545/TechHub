import wishlistRepository from "../repositories/wishlistRepository.js";
import { redis } from "../config/redis.js";

// ─── Cache Key Helpers ────────────────────────────────────────────────────────

const WISHLIST_TTL      = 86_400; // 24h — full wishlist snapshot
const WISHLISTED_TTL    = 3_600;  // 1h  — per-product boolean check

const wishlistKey       = (userId)              => `wishlist:${userId}`;
const wishlistedKey     = (userId, productId)   => `wishlisted:${userId}:${productId}`;

// ─── Cache Helpers ────────────────────────────────────────────────────────────

/**
 * Re-fetches the full wishlist from MongoDB and writes it to Redis.
 * Fire-and-forget — never awaited so the HTTP response is never blocked.
 *
 * @param {string} userId
 */
const syncWishlistCache = (userId) => {
  wishlistRepository
    .findAllByUser(userId)
    .then((items) =>
      redis.set(wishlistKey(userId), JSON.stringify(items), { ex: WISHLIST_TTL }),
    )
    .catch((err) => console.error("[Redis] wishlist sync failed:", err.message));
};

/**
 * Writes a single product's wishlist status for this user into Redis.
 * Used after toggle/remove to keep the boolean check cache consistent.
 *
 * @param {string}  userId
 * @param {string}  productId
 * @param {boolean} value
 */
const setWishlistedCache = (userId, productId, value) => {
  redis
    .set(wishlistedKey(userId, productId), value ? "1" : "0", { ex: WISHLISTED_TTL })
    .catch((err) => console.error("[Redis] wishlisted set failed:", err.message));
};

// ─── Service ──────────────────────────────────────────────────────────────────

const wishlistService = {
  /**
   * Toggle a product in the wishlist.
   * Invalidates both the full wishlist cache and the per-product boolean cache.
   */
  toggleWishlist: async ({ userId, productId }) => {
    const existing = await wishlistRepository.findOne(userId, productId);

    if (existing) {
      await wishlistRepository.removeItem(userId, productId);

      // Product is no longer wishlisted — update both cache layers
      setWishlistedCache(userId, productId, false);
      syncWishlistCache(userId);

      return { added: false, productId };
    }

    const item = await wishlistRepository.addItem(userId, productId);

    // Product is now wishlisted — update both cache layers
    setWishlistedCache(userId, productId, true);
    syncWishlistCache(userId);

    return { added: true, item };
  },

  /**
   * Get all wishlist items.
   * Serves from Redis on a cache hit; falls back to MongoDB on a miss
   * and repopulates the cache automatically.
   */
  getWishlist: async ({ userId }) => {
    try {
      const cached = await redis.get(wishlistKey(userId));
      if (cached !== null) {
        return typeof cached === "string" ? JSON.parse(cached) : cached;
      }
    } catch {
      // Redis unavailable — fall through to MongoDB
    }

    const items = await wishlistRepository.findAllByUser(userId);

    syncWishlistCache(userId); // repopulate cache, non-blocking

    return items;
  },

  /**
   * Remove a specific product directly (no toggle).
   * Throws ITEM_NOT_IN_WISHLIST if the product wasn't in the wishlist.
   */
  removeFromWishlist: async ({ userId, productId }) => {
    const removed = await wishlistRepository.removeItem(userId, productId);
    if (!removed) throw new Error("ITEM_NOT_IN_WISHLIST");

    // Invalidate both cache layers
    setWishlistedCache(userId, productId, false);
    syncWishlistCache(userId);

    return removed;
  },

  /**
   * Check if a single product is wishlisted.
   * Hits a tiny boolean key in Redis — avoids a full DB lookup for a yes/no answer.
   */
  isWishlisted: async ({ userId, productId }) => {
    try {
      const cached = await redis.get(wishlistedKey(userId, productId));
      if (cached !== null) return cached === "1";
    } catch {
      // Redis unavailable — fall through to MongoDB
    }

    const exists = await wishlistRepository.exists(userId, productId);
    const value  = !!exists;

    // Populate the boolean cache for next time
    setWishlistedCache(userId, productId, value);

    return value;
  },
};

export default wishlistService;
