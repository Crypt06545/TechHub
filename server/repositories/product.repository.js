import { Product } from "../models/product.model.js";

const LIST_PROJECTION = `
title
slug
description
price
compareAtPrice
images
category
brand
stock
hasVariants
variants
badge
ratingAverage
ratingCount
isFeatured
createdAt
`;

const DETAIL_PROJECTION = `
title
slug
description
price
compareAtPrice
costPrice
lowStockThreshold
images
category
brand
sku
stock
hasVariants
variants
badge
ratingAverage
ratingCount
vendorId
isFeatured
createdAt
updatedAt
`;

export const productRepository = {
  // ---------------------------------------------------------------------------
  // Product List
  // ---------------------------------------------------------------------------

  async findProducts(query, sort, limit) {
    return Product.find(query)
      .select(LIST_PROJECTION)
      .populate("category", "name slug")
      .sort(sort)
      .limit(limit)
      .lean();
  },

  // ---------------------------------------------------------------------------
  // Featured Products
  // ---------------------------------------------------------------------------

  async findFeatured() {
    return Product.find({
      isFeatured: true,
      isPublished: true,
      isArchived: false,
    })
      .select(LIST_PROJECTION)
      .populate("category", "name slug")
      .lean();
  },

  // ---------------------------------------------------------------------------
  // Single Product
  // ---------------------------------------------------------------------------

  async findBySlug(slug, excludeId = null) {
    const query = { slug };

    if (excludeId) {
      query._id = { $ne: excludeId };
    } else {
      query.isPublished = true;
      query.isArchived = false;
    }

    return Product.findOne(query)
      .select(DETAIL_PROJECTION)
      .populate("category", "name slug")
      .lean();
  },

  // ---------------------------------------------------------------------------
  // Admin
  // ---------------------------------------------------------------------------

  async findById(productId) {
    return Product.findById(productId).populate("category", "name slug");
  },

  async findByIds(productIds) {
    return Product.find({
      _id: { $in: productIds },
    })
      .select(LIST_PROJECTION)
      .populate("category", "name slug")
      .lean();
  },

  /**
   * Used by productService.resolveOrderItems() before order creation /
   * payment. Needs enough fields to price and validate each cart line
   * server-side — not the lean list projection, which is missing
   * hasVariants/variants/isPublished/isArchived.
   */
  async findByIdsForOrder(productIds) {
    return Product.find({ _id: { $in: productIds } })
      .select(
        "title slug price stock images isPublished isArchived hasVariants variants",
      )
      .lean();
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

  async decrementStock(productId, quantity, session) {
    return Product.findOneAndUpdate(
      { _id: productId, stock: { $gte: quantity } },
      { $inc: { stock: -quantity } },
      { returnDocument: "after", session },
    );
  },

  async decrementVariantStock(productId, variantId, quantity, session) {
    return Product.findOneAndUpdate(
      {
        _id: productId,
        variants: {
          $elemMatch: { _id: variantId, stock: { $gte: quantity } },
        },
      },
      {
        $inc: {
          "variants.$.stock": -quantity,
          stock: -quantity,
        },
      },
      { returnDocument: "after", session },
    );
  },
  // ─── Inventory: increases (mirror of the decrements above) ────────────────

  // Plain increment, cost untouched — used for positive manual
  // adjustments (e.g. correcting an earlier over-deduction). Damage and
  // negative corrections reuse decrementStock/decrementVariantStock
  // above instead of a new method.
  async incrementStock(productId, quantity, session) {
    return Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { stock: quantity } },
      { returnDocument: "after", session },
    );
  },

  async incrementVariantStock(productId, variantId, quantity, session) {
    return Product.findOneAndUpdate(
      { _id: productId, "variants._id": variantId },
      { $inc: { "variants.$.stock": quantity, stock: quantity } },
      { returnDocument: "after", session },
    );
  },
  // Restock-specific: increments stock AND sets the newly-computed
  // average cost in the same atomic update, so the two numbers can
  // never drift apart even under concurrent restocks.
  async restockStock(productId, quantity, newCostPrice, session) {
    return Product.findOneAndUpdate(
      { _id: productId },
      { $inc: { stock: quantity }, $set: { costPrice: newCostPrice } },
      { returnDocument: "after", session },
    );
  },

  async restockVariantStock(
    productId,
    variantId,
    quantity,
    newCostPrice,
    session,
  ) {
    return Product.findOneAndUpdate(
      { _id: productId, "variants._id": variantId },
      {
        $inc: { "variants.$.stock": quantity, stock: quantity },
        $set: { "variants.$.costPrice": newCostPrice },
      },
      { returnDocument: "after", session },
    );
  },

  // ---------------------------------------------------------------------------
  // Exists
  // ---------------------------------------------------------------------------

  async exists(query) {
    return Product.exists(query);
  },

  async count(query = {}) {
    return Product.countDocuments(query);
  },
};
