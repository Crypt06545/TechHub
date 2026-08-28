import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: "", trim: true },
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
    // What this specific variant costs to buy/produce — tracked per
    // variant (not just per product) since e.g. a "128GB" and a "1TB"
    // variant of the same product can have very different costs.
    // Kept in sync as a running average by productService.restockProduct().
    costPrice: { type: Number, min: 0, default: 0 },
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
