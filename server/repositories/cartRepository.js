import CartProductModel from "../models/cartProduct.model.js";

export const cartRepository = {
  async findItem(userId, productId) {
    return CartProductModel.findOne({ userId, productId }).lean();
  },

  async findByUserId(userId) {
    return CartProductModel.find({ userId }).lean();
  },

  async createItem(userId, productId, priceAtAdd) {
    return CartProductModel.create({
      userId,
      productId,
      priceAtAdd,
      quantity: 1,
    });
  },

  async incrementQuantity(userId, productId) {
    return CartProductModel.findOneAndUpdate(
      { userId, productId },
      { $inc: { quantity: 1 } },
      { returnDocument: "after" },
    );
  },

  async removeItem(userId, productId) {
    return CartProductModel.findOneAndDelete({ userId, productId });
  },
  async deleteManyByIds(cartItemIds) {
    return CartProductModel.deleteMany({ _id: { $in: cartItemIds } });
  },

  async getUserCart(userId) {
    return CartProductModel.find({ userId })
      .populate("productId", "name price images")
      .lean();
  },
};
