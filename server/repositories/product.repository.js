import { Product } from "../models/product.model.js";

export const productRepository = {
  async findWithFilters(query, limit) {
    return Product.find(query)
      .select("title slug price compareAtPrice images category stock ratingAverage")
      .lean()
      .sort({ _id: -1 })
      .limit(limit + 1);
  },

  async findFeatured() {
    return Product.find({ isFeatured: true }).lean();
  },

  /**
   * Used for both public single-product fetch and slug uniqueness check.
   * excludeId — skips self during update slug conflict check.
   */
  async findBySlug(slug, excludeId = null) {
    const query = { slug };
    if (!excludeId) {
      // Public fetch — enforce published/not-archived
      query.isPublished = true;
      query.isArchived  = false;
    } else {
      // Slug conflict check during update — scope to excludeId
      query._id = { $ne: excludeId };
    }
    return Product.findOne(query).lean();
  },

  async findById(productId) {
    return Product.findById(productId);
  },

  async findByIds(productIds) {
    return Product.find({ _id: { $in: productIds } }).lean();
  },

  async create(data) {
    return Product.create(data);
  },

  async save(product) {
    return product.save();
  },

  async deleteById(productId) {
    return Product.findByIdAndDelete(productId);
  },

  async decrementStock(productId, quantity) {
    return Product.findByIdAndUpdate(
      productId,
      { $inc: { stock: -quantity } },
      { new: true },
    );
  },
};
