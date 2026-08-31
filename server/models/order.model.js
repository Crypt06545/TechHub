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
    // Snapshot of the product/variant's costPrice at the moment this
    // order was placed — same reasoning as `price` being a snapshot:
    // if the product's cost later changes (a new restock at a
    // different rate), this order's margin/COGS must stay computed
    // against what it ACTUALLY cost at the time, not today's cost.
    costPriceAtSale: {
      type: Number,
      default: 0,
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

// Everything the business actually spent to fulfill THIS order —
// separate from `shippingCharge` above, which is what the CUSTOMER
// paid for shipping (often less than courierCost, sometimes free).
// Mixing the two up is a common P&L mistake: it hides the real courier
// spend on "free shipping" orders.
const orderCostsSchema = new mongoose.Schema(
  {
    // What the courier (Pathao/Steadfast/RedX/...) actually charges —
    // filled in by the admin when the order is marked "Shipped", since
    // it isn't known until the parcel is actually booked. null = not
    // entered yet (not the same as a genuine ৳0 self-delivery).
    courierCost: { type: Number, default: null, min: 0 },
    // Auto-applied at order creation from DEFAULT_PACKAGING_COST.
    packagingCost: { type: Number, default: 0, min: 0 },
    // Auto-calculated at order creation from GATEWAY_FEE_RATES — ৳0 for COD.
    gatewayFee: { type: Number, default: 0, min: 0 },
    // Extra courier cost if the parcel was sent AND came back
    // (customer refusal/return). Filled in on refund, same as courierCost.
    returnCost: { type: Number, default: null, min: 0 },
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
    costs: { type: orderCostsSchema, default: () => ({}) },
    // Idempotency guard: stock is restored (incremented back) exactly
    // once per order, whether that's triggered by order_status turning
    // "Cancelled" or payment_status turning "Refunded" — whichever
    // happens first flips this to true so the other can never restore
    // the same units a second time.
    stockRestored: { type: Boolean, default: false },
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
