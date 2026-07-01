import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true, trim: true },
    publicId: { type: String, default: "", trim: true },
  },
  { _id: false },
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

    images: { type: [imageSchema], default: [] },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    brand: { type: String, default: "", trim: true },

    stock: { type: Number, required: true, min: 0, default: 0 },

    isPublished: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

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

// latest products
ProductSchema.index({ isPublished: 1, isArchived: 1, _id: -1 });

// category products
ProductSchema.index({ category: 1, isPublished: 1, isArchived: 1, _id: -1 });

// brand filter
ProductSchema.index({ isPublished: 1, isArchived: 1, brand: 1 });

// featured products
ProductSchema.index({ isFeatured: 1, isPublished: 1, isArchived: 1 });

// vendor dashboard
ProductSchema.index({ vendorId: 1, isArchived: 1, _id: -1 });

// price filtering
ProductSchema.index({ isPublished: 1, isArchived: 1, price: 1 });

// text search (electronics kaje lagbe pore)
ProductSchema.index({ title: "text", description: "text" });

export const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
