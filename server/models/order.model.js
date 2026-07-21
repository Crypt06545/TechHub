import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    variantLabel: {
      type: String,
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    images: {
      type: [String],
      default: [],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  { _id: false },
);

const addressSnapshotSchema = new mongoose.Schema(
  {
    address_line: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: {
      type: String,
      required: true,
      trim: true,
      default: "Bangladesh",
    },
    mobile: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "An order must have at least one item.",
      },
    },
    delivery_address: {
      type: addressSnapshotSchema,
      required: true,
    },
    payment_method: {
      type: String,
      enum: ["COD", "bKash", "Nagad"],
      required: true,
    },
    transactionId: {
      type: String,
      default: null,
    },
    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    order_status: {
      type: String,
      enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
    },
    couponCode: {
      type: String,
      default: null,
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    subTotalAmt: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmt: {
      type: Number,
      required: true,
      min: 0,
    },
    shippingCharge: { type: Number, required: true, min: 0, default: 0 },
    invoice_receipt: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ payment_status: 1 });
orderSchema.index({ order_status: 1 });
orderSchema.index({ payment_status: 1, order_status: 1, _id: -1 });
orderSchema.index({ "delivery_address.mobile": 1 });
orderSchema.index({ userId: 1, couponCode: 1 });

const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
