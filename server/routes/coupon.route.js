import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import { checkCouponController } from "../controllers/coupon.controller.js";

const couponRouter = Router();

couponRouter.use(authMiddleware);

/**
 * COUPON
 */

couponRouter.post("/check", checkCouponController);

export default couponRouter;
