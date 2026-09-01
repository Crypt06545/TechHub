import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { redis } from "../config/redis.js";

// Custom store compatible with Upstash REST client (no .call/.eval support)
class UpstashRateLimitStore {
  constructor(prefix) {
    this.prefix = prefix;
  }

  init(options) {
    this.windowMs = options.windowMs;
  }

  key(key) {
    return `rl:${this.prefix}:${key}`;
  }

  async increment(key) {
    const redisKey = this.key(key);
    const totalHits = await redis.incr(redisKey);

    if (totalHits === 1) {
      await redis.expire(redisKey, Math.ceil(this.windowMs / 1000));
    }

    const ttl = await redis.ttl(redisKey);
    const resetTime = new Date(Date.now() + (ttl > 0 ? ttl : 0) * 1000);

    return { totalHits, resetTime };
  }

  async decrement(key) {
    await redis.decr(this.key(key));
  }

  async resetKey(key) {
    await redis.del(this.key(key));
  }
}

const banIP = async (ip) => {
  const violationKey = `violation:${ip}`;
  const violations = await redis.incr(violationKey);
  if (violations === 1) await redis.expire(violationKey, 60 * 60);

  if (violations >= 3) {
    await redis.set(`banned_ip:${ip}`, "true", { ex: 24 * 60 * 60 });
    console.warn(`[SECURITY] IP banned: ${ip} (${violations} violations)`);
  }
};

const makeHandler = (message) => async (req, res) => {
  await banIP(req.ip).catch((err) => console.error("Ban error:", err));
  res.status(429).json({ success: false, message });
};

// ─── Global ─────────────────────────────────────────────────────────────────

export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new UpstashRateLimitStore("global"),
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: makeHandler("Too many requests. Please slow down."),
});

// ─── Register ───────────────────────────────────────────────────────────────

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new UpstashRateLimitStore("register"),
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: makeHandler(
    "Too many accounts created from this IP. Try again after an hour.",
  ),
});

// ─── Login ──────────────────────────────────────────────────────────────────

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  store: new UpstashRateLimitStore("login"),
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: makeHandler(
    "Too many login attempts. Please try again after 15 minutes.",
  ),
});

// ─── OTP Request ────────────────────────────────────────────────────────────

export const otpRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  store: new UpstashRateLimitStore("otp-request"),
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: makeHandler(
    "Too many OTP requests. Please try again after an hour.",
  ),
});

// ─── OTP Verify ─────────────────────────────────────────────────────────────

export const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new UpstashRateLimitStore("otp-verify"),
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: makeHandler(
    "Too many failed verification attempts. Please request a new OTP.",
  ),
});

export const trackOrderLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new UpstashRateLimitStore("track-order"),
  keyGenerator: (req) => ipKeyGenerator(req.ip),
  handler: makeHandler(
    "Too many tracking requests. Please try again after 15 minutes.",
  ),
});
