import CartProductModel from "../models/cartProduct.model.js";

export const cartRepository = {
  async findByUserId(userId) {
    return CartProductModel.find({ userId }).lean();
  },

  /**
   * Atomic upsert — increments quantity if exists, inserts with priceAtAdd if new.
   * Single DB round-trip, no race condition.
   */
  async upsertIncrement(userId, productId, priceAtAdd, quantity = 1) {
    return CartProductModel.findOneAndUpdate(
      { userId, productId },
      {
        $inc: { quantity },
        $setOnInsert: { priceAtAdd },
      },
      {
        returnDocument: "after",
        upsert: true,
        runValidators: true,
      },
    );
  },

  async decrementItem(userId, productId) {
    return CartProductModel.findOneAndUpdate(
      { userId, productId },
      { $inc: { quantity: -1 } },
      { returnDocument: "after" },
    );
  },

  async deleteOne(userId, productId) {
    return CartProductModel.deleteOne({ userId, productId });
  },

  async deleteManyByIds(cartItemIds) {
    return CartProductModel.deleteMany({ _id: { $in: cartItemIds } });
  },

  async deleteByUserId(userId) {
    return CartProductModel.deleteMany({ userId });
  },
};
