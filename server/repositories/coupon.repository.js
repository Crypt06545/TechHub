import { Coupon } from "../models/coupon.model.js";
import { redis } from "../config/redis.js";

const COUPON_CODE_TTL = 86_400; // 24h — long-lived, invalidated on write instead of expiry
const ADMIN_LIST_TTL = 60;

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

const codeKey = (code) => `coupon:code:${code.toUpperCase().trim()}`;
const listKey = (params) => `coupons:list:${JSON.stringify(params)}`;

// Wipes all cached admin-list variants (param-specific keys, so we can't
// target one). Fine at admin-panel scale; switch to SCAN if this ever
// runs against a huge keyspace.
const invalidateListCache = async () => {
  try {
    const keys = await redis.keys("coupons:list:*");
    if (keys.length) await redis.del(...keys);
  } catch (err) {
    console.error(
      "[Redis] coupon list cache invalidation failed:",
      err.message,
    );
  }
};

const invalidateCodeCache = async (code) => {
  if (!code) return;
  try {
    await redis.del(codeKey(code));
  } catch (err) {
    console.error(
      "[Redis] coupon code cache invalidation failed:",
      err.message,
    );
  }
};

export const couponRepository = {
  async create(data) {
    const coupon = await Coupon.create(data);
    await invalidateListCache();
    // no code-cache invalidation needed — nothing was cached under this
    // brand-new code yet, so there's nothing stale to clear.
    return coupon;
  },

  // Long-TTL cache — this is the checkout-path lookup. Cache holds the
  // full coupon doc (as plain object); refreshed only when the coupon is
  // created/updated/deleted, or after 24h as a safety net.
  async findByCode(code) {
    const key = codeKey(code);
    const cached = await safeRedisGet(key);
    if (cached) return cached;

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
    }).lean();
    if (!coupon) return null;

    redis
      .set(key, JSON.stringify(coupon), { ex: COUPON_CODE_TTL })
      .catch((err) =>
        console.error("[Redis] coupon code cache failed:", err.message),
      );

    return coupon;
  },

  async findById(id) {
    return Coupon.findById(id);
  },

  async findAll({ isActive, search, cursor, limit = 20 } = {}) {
    const cacheKey = listKey({ isActive, search, cursor, limit });
    const cached = await safeRedisGet(cacheKey);
    if (cached) return cached;

    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive;
    if (search) filter.code = { $regex: search, $options: "i" };
    if (cursor) filter._id = { $lt: cursor };

    // Fetch one extra row to know if there's a next page without a
    // separate count query.
    const coupons = await Coupon.find(filter)
      .populate("applicableCategories", "name slug")
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = coupons.length > limit;
    const page = hasMore ? coupons.slice(0, limit) : coupons;
    const nextCursor = hasMore ? String(page[page.length - 1]._id) : null;

    const result = { coupons: page, nextCursor, hasMore };

    redis
      .set(cacheKey, JSON.stringify(result), { ex: ADMIN_LIST_TTL })
      .catch((err) =>
        console.error("[Redis] coupon list cache failed:", err.message),
      );

    return result;
  },

  // oldCode is passed so we can invalidate the PREVIOUS code's cache entry
  // too, in case the update renamed the code (old cached entry would
  // otherwise keep serving stale "valid" data under the old code forever).
  async updateById(id, data, oldCode) {
    const coupon = await Coupon.findByIdAndUpdate(id, data, {
      returnDocument: "after",
      runValidators: true,
    });
    if (coupon) {
      await invalidateCodeCache(oldCode);
      await invalidateCodeCache(coupon.code);
      await invalidateListCache();
    }
    return coupon;
  },

  async deleteById(id) {
    const coupon = await Coupon.findByIdAndDelete(id);
    if (coupon) {
      await invalidateCodeCache(coupon.code);
      await invalidateListCache();
    }
    return coupon;
  },

  // Atomic, conditional usage increment — used by order placement inside
  // the transaction. Not cached (this is a write), and doesn't need the
  // code-cache invalidated afterward since usedCount isn't part of what
  // the checkout validation reads from cache in a way that risks
  // over-redemption (the $lt guard here is always live-DB, never cached).
  async incrementUsage(couponId, maxUses, session) {
    const filter = { _id: couponId };
    if (maxUses != null) filter.usedCount = { $lt: maxUses };

    return Coupon.updateOne(filter, { $inc: { usedCount: 1 } }, { session });
  },
};
