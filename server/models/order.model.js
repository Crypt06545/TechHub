import mongoose from "mongoose";


const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
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

    // price snapshotted at order time — never rely on the live product price
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
    country: { type: String, required: true, trim: true, default: "Bangladesh" },
    mobile: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    orderId: {
      type: String,
      required: true,
      unique: true, // unique already creates the index — no extra needed
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (arr) => arr.length > 0,
        message: "An order must have at least one item.",
      },
    },

    // FIX: embedded address snapshot instead of a reference
    delivery_address: {
      type: addressSnapshotSchema,
      required: true,
    },

    paymentId: {
      type: String,
      default: null,
    },

    payment_status: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },

    // FIX: added order_status — separate concern from payment
    order_status: {
      type: String,
      enum: ["Processing", "Confirmed", "Shipped", "Delivered", "Cancelled"],
      default: "Processing",
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

// user's order history, newest first
orderSchema.index({ userId: 1, createdAt: -1 });

// FIX: removed redundant orderId index — unique:true above already covers it

// admin: filter by payment status
orderSchema.index({ payment_status: 1 });

// admin: filter by order status
orderSchema.index({ order_status: 1 });


const Order = mongoose.models.order || mongoose.model("order", orderSchema);

export default Order;
