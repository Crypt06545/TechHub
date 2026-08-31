import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: "", trim: true },
  },
  { _id: false },
);

// Fully admin-defined cost line item — no fixed "packaging"/"shipping"
// labels baked in, since which cost categories matter varies per
// product. The admin names each line themselves.
const costLineItemSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true, default: "" },
    amount: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

const oilLineSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, default: "" },
    costPerMl: { type: Number, min: 0, default: 0 },
    bottleSizeMl: { type: Number, min: 0, default: 0 },
  },
  { _id: false },
);

// The full "Manage Cost" calculator state, saved so it can be reloaded
// exactly as entered — no hardcoded field names or default numbers,
// every line (oils, other costs) is admin-defined. Shared by both
// non-variant products (Product.costBreakdown) and each variant
// (variantSchema.costBreakdown below).
const costBreakdownSchema = new mongoose.Schema(
  {
    oils: { type: [oilLineSchema], default: [] },
    otherCosts: { type: [costLineItemSchema], default: [] },
    platformFeePercent: { type: Number, min: 0, max: 100, default: 0 },
    wastagePercent: { type: Number, min: 0, max: 100, default: 0 },
    desiredMarginPercent: { type: Number, min: 0, max: 100, default: 0 },
  },
  { _id: false },
);

// A variant is a size/color combo with its own price + stock.
// Kept as a real subdocument (with _id) so cart/order line items can
// reference a specific variantId later, not just the productId.
const variantSchema = new mongoose.Schema(
  {
    size: { type: String, default: null, trim: true },
    color: { type: String, default: null, trim: true },
    price: { type: Number, required: true, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    // Running-average cost, kept in sync by productService.restockProduct().
    costPrice: { type: Number, min: 0, default: 0 },

    // The full "Manage Cost" calculator inputs that produced costPrice
    // above, saved per-variant so switching sizes in the calculator
    // restores exactly what was entered for THAT size — e.g. 3ML uses
    // less oil than 12ML, so their raw-material lines differ even
    // though they share the same admin-set cost-per-ml. Optional/null
    // until the admin actually uses the calculator for this variant;
    // a variant created without ever opening "Manage Cost" just keeps
    // its plain costPrice with no breakdown attached.
    costBreakdown: { type: costBreakdownSchema, default: null },
  },
  { _id: true },
);

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "", trim: true },

    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: null },

    // What this product costs to buy/produce, for products WITHOUT
    // variants (variant-level cost lives on variantSchema instead).
    // Recalculated as a running average every time the product is
    // restocked at a different unit cost — see productService.restockProduct().
    costPrice: { type: Number, min: 0, default: 0 },

    // Same breakdown structure as variants.costBreakdown, for
    // non-variant products — set by ManageProductCost.jsx.
    costBreakdown: { type: costBreakdownSchema, default: null },

    // Below this stock level, the product shows up in the admin's
    // low-stock list/alerts. For variant products, each variant's own
    // stock is checked against this same threshold.
    lowStockThreshold: { type: Number, min: 0, default: 5 },

    images: { type: [imageSchema], default: [] },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: { type: String, default: "", trim: true },
    sku: { type: String, default: "", trim: true },

    stock: { type: Number, required: true, min: 0, default: 0 },

    // --- variants (size/color, optional) ---
    hasVariants: { type: Boolean, default: false },
    variants: { type: [variantSchema], default: [] },

    isPublished: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    // Single marketing badge shown on the product card (ProductBadge
    // reads this). null/omitted = no badge. Kept as one value, not an
    // array -- a card only has room to show one ribbon at a time.
    badge: {
      type: String,
      enum: {
        values: [
          "Hot Deal",
          "New Arrival",
          "Best Seller",
          "Top Rated",
          "Limited Stock",
          "Trending",
        ],
        message: "{VALUE} is not a valid badge",
      },
      default: null,
    },

    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    ratingAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true, versionKey: false },
);

ProductSchema.pre("save", async function () {
  if (this.hasVariants && this.variants?.length) {
    this.stock = this.variants.reduce((sum, v) => sum + (v.stock || 0), 0);
  }
});

// latest products
ProductSchema.index({ isPublished: 1, isArchived: 1, _id: -1 });
// category products
ProductSchema.index({ category: 1, isPublished: 1, isArchived: 1, _id: -1 });
// brand filter
ProductSchema.index({ isPublished: 1, isArchived: 1, brand: 1 });
// featured products
ProductSchema.index({ isFeatured: 1, isPublished: 1, isArchived: 1 });
// badge filtering (e.g. a "Hot Deals" or "New Arrivals" storefront page)
ProductSchema.index({ badge: 1, isPublished: 1, isArchived: 1 });
// vendor dashboard
ProductSchema.index({ vendorId: 1, isArchived: 1, _id: -1 });
// price filtering
ProductSchema.index({ isPublished: 1, isArchived: 1, price: 1 });
// low-stock lookups (inventory dashboard)
ProductSchema.index({ isArchived: 1, stock: 1 });
// text search (electronics kaje lagbe pore)
ProductSchema.index({ title: "text", description: "text" });

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
