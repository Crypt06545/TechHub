import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSingleOrderController,
  getUserOrdersController,
  placeOrderController,
} from "../controllers/order.controller.js";

const orderRouter = Router();

orderRouter.use(authMiddleware);

/**
 * ORDER
 */

orderRouter.get("/", getUserOrdersController);
orderRouter.post("/place", placeOrderController);
orderRouter.get("/:id", getSingleOrderController);
// orderRouter.delete("/clearCart", clearCartController);

export default orderRouter;
