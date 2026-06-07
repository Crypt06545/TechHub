import { Router } from "express";

import authMiddleware from "../middleware/authMiddleware.js";
import {
  addToCartController,
  clearCartController,
  getCartController,
  removeFromCart,
} from "../controllers/cart.controller.js";

const cartRouter = Router();

cartRouter.use(authMiddleware);

/**
 * CART
 */
cartRouter.post("/addToCart", addToCartController);
cartRouter.patch("/removeFromCart", removeFromCart);
cartRouter.get("/getCart", getCartController);
cartRouter.delete("/clearCart", clearCartController);

export default cartRouter;
