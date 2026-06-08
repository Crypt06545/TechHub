import { cartService } from "../services/cartService.js";
import asyncHandler from "../utils/asyncHandler.js";

export const addToCartController = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const userId = req.user?._id;

  const cartItem = await cartService.addToCart(userId, productId, quantity);

  return res.status(200).json({
    success: true,
    message: "Cart updated successfully",
    data: cartItem,
  });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user?._id;

  const cartItem = await cartService.removeFromCart(userId, productId);

  return res.status(200).json({
    success: true,
    message: cartItem
      ? "Cart item quantity decreased"
      : "Item removed from cart completely",
    data: cartItem,
  });
});

export const clearCartController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  await cartService.clearCart(userId);

  return res.status(200).json({
    success: true,
    message: "Cart cleared completely successfully",
  });
});

export const getCartController = asyncHandler(async (req, res) => {
  const userId = req.user?._id;

  const data = await cartService.getCart(userId);

  return res.status(200).json({
    success: true,
    data,
  });
});
