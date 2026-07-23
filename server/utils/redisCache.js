import { redis } from "../config/redis.js";

export const invalidateCategoryCache = async () => {
  await redis.del("all_categories");
};
