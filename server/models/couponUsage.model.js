import mongoose from "mongoose";

// Tracks how many times each user has redeemed each coupon. Kept as a
// separate collection (rather than counting Order documents) so the
// per-user limit can be enforced atomically via findOneAndUpdate +
// upsert, the same way Coupon.usedCount enforces the global limit.
// Counting orders instead would require a non-atomic count-then-check,
// which is race-condition prone under concurrent/duplicate requests.
const couponUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },
    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// One usage record per (user, coupon) pair — also the index this
// collection is queried by, so it serves both correctness and speed.
couponUsageSchema.index({ userId: 1, couponId: 1 }, { unique: true });

const CouponUsage =
  mongoose.models.couponUsage ||
  mongoose.model("couponUsage", couponUsageSchema);

export default CouponUsage;
