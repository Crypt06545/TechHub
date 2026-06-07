import Address from "../models/address.model.js";

/**
 * Repository — Address model-এর সব DB query এখানে।
 * Service layer কখনো Address model directly import করবে না।
 */
export const addressRepository = {
  /**
   * User-এর একটা নির্দিষ্ট address আনো।
   * userId দিয়ে ownership verify করা হয়।
   */
  async findByIdAndUserId({ addressId, userId }) {
    return Address.findOne({ _id: addressId, userId }).lean();
  },

  /**
   * User-এর সব address আনো।
   */
  async findAllByUserId(userId) {
    return Address.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  /**
   * User-এর default address আনো।
   */
  async findDefaultByUserId(userId) {
    return Address.findOne({ userId, isDefault: true }).lean();
  },
};
