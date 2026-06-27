import User from "../models/user.model.js";

const userRepository = {
  findById: async (id, selectFields = "") => {
    return await User.findById(id).select(selectFields);
  },

  findByEmail: async (email, selectFields = "") => {
    return await User.findOne({ email }).select(selectFields);
  },

  findByVerifyToken: async (token) => {
    return await User.findOne({
      email_verify_token: token,
      email_verify_expiry: { $gt: Date.now() },
    });
  },

  createUser: async (userData) => {
    const newUser = new User(userData);
    return await newUser.save();
  },

  updateById: async (id, updateData, options = {}) => {
    const defaultOptions = {
      returnDocument: "after",
      runValidators: true,
    };

    return await User.findByIdAndUpdate(id, updateData, {
      ...defaultOptions,
      ...options,
    });
  },

  updateUserFields: async (userInstance, updateFields) => {
    Object.assign(userInstance, updateFields);
    return await userInstance.save({ validateBeforeSave: false });
  },

  updateRefreshToken: async (id, token) => {
    return await User.findByIdAndUpdate(id, { refresh_token: token });
  },

  clearRefreshTokenByUserId: async (userId) => {
    return await User.findByIdAndUpdate(userId, { refresh_token: null });
  },
};

export default userRepository;
