// FILE: models/stockLog.model.js
import mongoose from "mongoose";

const STOCK_LOG_TYPES = [
  "initial", // opening stock, logged when a product is first created
  "restock", // admin bought more units
  "sale", // decremented by a placed order
  "return", // added back because an order was cancelled/refunded
  "damage", // lost/broken units, written off
  "correction", // admin manually fixing a miscount (or a cost-only edit, change: 0)
];

const stockLogSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    // References a subdocument _id inside Product.variants — not a
    // separate collection, so no `ref` (same convention as
    // orderItemSchema.variantId in order.model.js).
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    type: {
      type: String,
      enum: {
        values: STOCK_LOG_TYPES,
        message: "{VALUE} is not a valid stock log type",
      },
      required: true,
    },
    // Signed — positive adds stock (restock, return, initial, positive
    // correction), negative removes it (sale, damage, negative
    // correction). Always equals newStock - previousStock.
    change: { type: Number, required: true },
    previousStock: { type: Number, required: true, min: 0 },
    newStock: { type: Number, required: true, min: 0 },

    // Only meaningful for "restock"/"initial" — what was paid per unit
    // for this batch, and the total cash outlay it represents.
    unitCost: { type: Number, default: null, min: 0 },
    totalCost: { type: Number, default: null, min: 0 },

    // "sale"/"return" are tied to the order that caused them; manual
    // types ("restock"/"damage"/"correction") are tied to the admin
    // who made the call.
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "order", // matches Order's actual (lowercase) model name
      default: null,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reason: { type: String, default: "", trim: true, maxlength: 300 },
  },
  { timestamps: true, versionKey: false },
);

// A product's full stock history, newest first
stockLogSchema.index({ productId: 1, createdAt: -1 });
// Filter a product's history by movement type (e.g. "just restocks")
stockLogSchema.index({ productId: 1, type: 1, createdAt: -1 });
// Trace stock movements back to the order that caused them
stockLogSchema.index({ orderId: 1 }, { sparse: true });

export const StockLog =
  mongoose.models.StockLog || mongoose.model("StockLog", stockLogSchema);
