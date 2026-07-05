import { redis } from "../config/redis.js";

export const blockBannedIPs = async (req, res, next) => {
  try {
    const isBanned = await redis.get(`banned_ip:${req.ip}`);
    if (isBanned) {
      return res.status(403).json({
        success: false,
        message: "Your IP has been blocked due to suspicious activity.",
      });
    }
    next();
  } catch (error) {
    console.error("Redis blacklist check failed:", error);
    next(); // fail-open — don't take down the app if Redis hiccups
  }
};
