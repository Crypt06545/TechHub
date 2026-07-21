import asyncHandler from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { couponService } from "../services/coupon.service.js";

export const createCouponController = asyncHandler(async (req, res) => {
  const coupon = await couponService.createCoupon(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, coupon, "Coupon created successfully"));
});

export const getAllCouponsController = asyncHandler(async (req, res) => {
  const { isActive, search, page = 1, limit = 20 } = req.query;

  const data = await couponService.getAllCoupons({
    isActive:
      isActive === "true" ? true : isActive === "false" ? false : undefined,
    search,
    skip: (Number(page) - 1) * Number(limit),
    limit: Number(limit),
  });

  return res
    .status(200)
    .json(new ApiResponse(200, data, "Coupons fetched successfully"));
});

export const getCouponByIdController = asyncHandler(async (req, res) => {
  const coupon = await couponService.getCouponById(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon fetched successfully"));
});

export const updateCouponController = asyncHandler(async (req, res) => {
  const coupon = await couponService.updateCoupon(req.params.id, req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, coupon, "Coupon updated successfully"));
});

export const deleteCouponController = asyncHandler(async (req, res) => {
  await couponService.deleteCoupon(req.params.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, "Coupon deleted successfully"));
});

export const toggleCouponActiveController = asyncHandler(async (req, res) => {
  const coupon = await couponService.toggleActive(req.params.id);
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        coupon,
        `Coupon ${coupon.isActive ? "activated" : "deactivated"} successfully`,
      ),
    );
});
