import WishlistModel from "../models/wishlist.model.js";

const wishlistRepository = {
  // find a single wishlist entry for user + product
  findOne: async (userId, productId) => {
    return await WishlistModel.findOne({ userId, productId });
  },

  // get all wishlist items for a user, populated with product details
  findAllByUser: async (userId) => {
    return await WishlistModel.find({ userId })
      .populate("productId")
      .sort({ createdAt: -1 });
  },

  // add product to wishlist
  addItem: async (userId, productId) => {
    const item = new WishlistModel({ userId, productId });
    return await item.save();
  },

  // remove a specific product from wishlist
  removeItem: async (userId, productId) => {
    return await WishlistModel.findOneAndDelete({ userId, productId });
  },

  // clear entire wishlist for a user (useful for admin or account deletion)
  clearByUser: async (userId) => {
    return await WishlistModel.deleteMany({ userId });
  },

  // check if product is already in wishlist (boolean helper)
  exists: async (userId, productId) => {
    return await WishlistModel.exists({ userId, productId });
  },
};

export default wishlistRepository;
