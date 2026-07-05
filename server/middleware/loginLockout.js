import { redis } from "../config/redis.js";

const MAX_FAILS = 5;
const LOCK_WINDOW_SEC = 15 * 60;

export const checkAccountLock = async (req, res, next) => {
  const email = req.body?.email?.toLowerCase();
  if (!email) return next();

  try {
    const fails = await redis.get(`login_fail:${email}`);
    if (fails && Number(fails) >= MAX_FAILS) {
      return res.status(423).json({
        success: false,
        message:
          "This account is temporarily locked due to multiple failed attempts. Try again in 15 minutes.",
      });
    }
    next();
  } catch (error) {
    console.error("Login lock check failed:", error);
    next();
  }
};

export const recordLoginFailure = async (email) => {
  if (!email) return;
  try {
    const key = `login_fail:${email.toLowerCase()}`;
    const fails = await redis.incr(key);
    if (fails === 1) await redis.expire(key, LOCK_WINDOW_SEC);
  } catch (error) {
    console.error("Failed to record login failure:", error);
  }
};

export const clearLoginFailures = async (email) => {
  if (!email) return;
  try {
    await redis.del(`login_fail:${email.toLowerCase()}`);
  } catch (error) {
    console.error("Failed to clear login failures:", error);
  }
};
