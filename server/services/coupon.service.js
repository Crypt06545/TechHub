import { couponRepository } from "../repositories/coupon.repository.js";
import { ApiError } from "../utils/ApiError.js";

export const couponService = {
  async createCoupon({
    code,
    discountType,
    discountValue,
    maxDiscountAmount,
    applicableCategories,
    minOrderAmount,
    maxUses,
    maxUsesPerUser,
    expiresAt,
  }) {
    if (!code?.trim()) throw new ApiError(400, "Coupon code is required");
    if (!["percentage", "flat"].includes(discountType))
      throw new ApiError(400, "discountType must be 'percentage' or 'flat'");
    if (discountValue === undefined || discountValue <= 0)
      throw new ApiError(400, "discountValue must be greater than 0");
    if (discountType === "percentage" && discountValue > 100)
      throw new ApiError(400, "Percentage discount cannot exceed 100");

    const existing = await couponRepository.findByCode(code);
    if (existing)
      throw new ApiError(
        409,
        `Coupon code "${code.toUpperCase()}" already exists`,
      );

    return couponRepository.create({
      code: code.toUpperCase().trim(),
      discountType,
      discountValue: Number(discountValue),
      maxDiscountAmount:
        maxDiscountAmount != null ? Number(maxDiscountAmount) : null,
      applicableCategories: applicableCategories?.length
        ? applicableCategories
        : [],
      minOrderAmount: minOrderAmount ? Number(minOrderAmount) : 0,
      maxUses: maxUses != null ? Number(maxUses) : null,
      maxUsesPerUser: maxUsesPerUser ? Number(maxUsesPerUser) : 1,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
  },

  async getAllCoupons(params) {
    return couponRepository.findAll(params);
  },

  async getCouponById(id) {
    const coupon = await couponRepository.findById(id);
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return coupon;
  },

  async updateCoupon(id, updates) {
    if (
      updates.discountType &&
      !["percentage", "flat"].includes(updates.discountType)
    )
      throw new ApiError(400, "discountType must be 'percentage' or 'flat'");
    if (updates.discountType === "percentage" && updates.discountValue > 100)
      throw new ApiError(400, "Percentage discount cannot exceed 100");

    const existing = await couponRepository.findById(id);
    if (!existing) throw new ApiError(404, "Coupon not found");

    const oldCode = existing.code;
    if (updates.code) updates.code = updates.code.toUpperCase().trim();

    const coupon = await couponRepository.updateById(id, updates, oldCode);
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return coupon;
  },

  async deleteCoupon(id) {
    const coupon = await couponRepository.deleteById(id);
    if (!coupon) throw new ApiError(404, "Coupon not found");
    return coupon;
  },

  // No .save() hack — goes straight through updateById, which already
  // handles both DB write AND cache invalidation (code-cache + list-cache)
  // in one place, consistent with update/delete.
  async toggleActive(id) {
    const existing = await couponRepository.findById(id);
    if (!existing) throw new ApiError(404, "Coupon not found");

    const coupon = await couponRepository.updateById(
      id,
      { isActive: !existing.isActive },
      existing.code,
    );
    return coupon;
  },
};
