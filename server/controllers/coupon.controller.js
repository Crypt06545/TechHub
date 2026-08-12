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
  const { isActive, search, cursor, limit = 20 } = req.query;

  const data = await couponService.getAllCoupons({
    isActive:
      isActive === "true" ? true : isActive === "false" ? false : undefined,
    search,
    cursor: cursor || undefined,
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

// ─── Check / Preview Coupon ─────────────────────────────────────────────────

/**
 * @desc    Validate a coupon against the current cart and preview the
 *          discount, without redeeming it. Read-only — safe to call
 *          repeatedly. Access is Private only because previewCoupon needs
 *          req.user._id for the per-user usage pre-check; actual
 *          redemption still only happens inside placeOrderController.
 * @route   POST /api/v1/coupons/check
 * @access  Private
 */
export const checkCouponController = asyncHandler(async (req, res) => {
  const { code, items } = req.body;

  const result = await couponService.previewCoupon({
    code,
    userId: req.user._id,
    items,
  });

  return res.status(200).json(new ApiResponse(200, result, "Coupon is valid"));
});
