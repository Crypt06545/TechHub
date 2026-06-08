import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import orderService from "../services/orderService.js";

export const placeCodOrderController = asyncHandler(async (req, res) => {
  const { addressId } = req.body;
  if (!addressId) throw new ApiError(400, "Address ID is required");

  const order = await orderService.placeCodOrder({
    userId: req.user._id,
    addressId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed successfully"));
});

export const getUserOrdersController = asyncHandler(async (req, res) => {
  const orders = await orderService.getUserOrders(req.user._id);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { orders, total: orders.length },
        "Orders fetched successfully",
      ),
    );
});

export const getSingleOrderController = asyncHandler(async (req, res) => {
  const order = await orderService.getSingleOrder({
    orderId: req.params.id,
    userId:  req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order fetched successfully"));
});
