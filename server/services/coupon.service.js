import { couponRepository } from "../repositories/coupon.repository.js";
import { ApiError } from "../utils/ApiError.js";
import { Product } from "../models/product.model.js";
import CouponUsage from "../models/couponUsage.model.js";

// Mirrors resolveLine() in order.service.js, but only needs price/category
// — no stock check, since a preview doesn't reserve inventory.
const resolveLinePrice = (product, variantId) => {
  if (!product.hasVariants || !variantId) {
    return { price: product.price, category: product.category };
  }
  const variant = product.variants.find(
    (v) => v._id.toString() === variantId.toString(),
  );
  if (!variant)
    throw new ApiError(
      404,
      `Variant no longer available for: ${product.title}`,
    );
  return { price: variant.price, category: product.category };
};

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

  // ─── Preview (checkout "Apply" button) ─────────────────────────────────

  /**
   * Read-only validation + discount preview. Does NOT touch usedCount or
   * CouponUsage — actual redemption happens atomically inside
   * placeOrder's transaction (order.service.js applyCoupon), which
   * re-validates everything against live data regardless. This exists
   * purely so the checkout page can show a discount before submit.
   *
   * items: [{ productId, variantId, quantity }] — same shape the
   * checkout page already sends. Price/category are resolved fresh from
   * the DB here since the client never sends them.
   */
  async previewCoupon({ code, userId, items }) {
    if (!code?.trim()) throw new ApiError(400, "Coupon code is required");
    if (!Array.isArray(items) || items.length === 0)
      throw new ApiError(400, "Your cart is empty");

    const coupon = await couponRepository.findByCode(code);
    if (!coupon || !coupon.isActive)
      throw new ApiError(404, "Invalid or inactive coupon");

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date())
      throw new ApiError(400, "This coupon has expired");

    const productIds = items.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } }).select(
      "title price hasVariants variants category",
    );
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    let subTotalAmt = 0;
    const resolvedItems = [];
    for (const { productId, variantId, quantity } of items) {
      const product = productMap.get(productId?.toString());
      if (!product)
        throw new ApiError(404, "A product in your cart no longer exists");

      const { price, category } = resolveLinePrice(product, variantId);
      subTotalAmt += price * quantity;
      resolvedItems.push({ category, price, quantity });
    }

    if (subTotalAmt < coupon.minOrderAmount)
      throw new ApiError(
        400,
        `Minimum order amount for this coupon is ৳${coupon.minOrderAmount}`,
      );

    let eligibleAmt = subTotalAmt;
    if (coupon.applicableCategories?.length > 0) {
      const allowed = new Set(
        coupon.applicableCategories.map((c) => c.toString()),
      );
      eligibleAmt = resolvedItems
        .filter((item) => allowed.has(item.category?.toString()))
        .reduce((sum, item) => sum + item.price * item.quantity, 0);

      if (eligibleAmt === 0)
        throw new ApiError(
          400,
          "This coupon isn't valid for the items in your cart",
        );
    }

    let discount =
      coupon.discountType === "percentage"
        ? (eligibleAmt * coupon.discountValue) / 100
        : coupon.discountValue;

    if (coupon.maxDiscountAmount != null)
      discount = Math.min(discount, coupon.maxDiscountAmount);
    discount = Math.min(discount, eligibleAmt);

    // Soft checks only — findByCode is cached (up to 24h stale), so
    // usedCount here can lag. Good enough to avoid showing "applied" on an
    // obviously dead coupon; the real, race-safe enforcement is the atomic
    // $lt-guarded increments in order.service.js's applyCoupon().
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses)
      throw new ApiError(400, "This coupon has reached its usage limit");

    if (coupon.maxUsesPerUser != null) {
      const usage = await CouponUsage.findOne({
        userId,
        couponId: coupon._id,
      }).lean();
      if (usage && usage.usedCount >= coupon.maxUsesPerUser)
        throw new ApiError(
          400,
          "You've already used this coupon the maximum number of times",
        );
    }

    return { code: coupon.code, discount: Math.round(discount) };
  },
};
