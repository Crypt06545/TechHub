import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSingleOrderController,
  getUserOrdersController,
  placeOrderController,
  trackOrderController,
} from "../controllers/order.controller.js";
import { trackOrderLimiter } from "../middleware/rateLimiter.js";

const orderRouter = Router();

orderRouter.get("/track/:orderId", trackOrderLimiter, trackOrderController);
orderRouter.use(authMiddleware);

/**
 * ORDER
 * 
 */

orderRouter.get("/", getUserOrdersController);
orderRouter.post("/place", placeOrderController);
orderRouter.get("/:id", getSingleOrderController);
// orderRouter.delete("/clearCart", clearCartController);

export default orderRouter;
