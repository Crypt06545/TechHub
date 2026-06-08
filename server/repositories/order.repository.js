import Order from "../models/order.model.js";

export const orderRepository = {
  // ─── Writes ─────────────────────────────────────────────────────────────────

  async create(data) {
    return Order.create(data);
  },

  async save(order) {
    return order.save();
  },

  // ─── Reads ──────────────────────────────────────────────────────────────────

  async findById(orderId) {
    return Order.findById(orderId);
  },

  async findByOrderId(orderId) {
    return Order.findOne({ orderId });
  },

  async findByIdAndUserId({ orderId, userId }) {
    return Order.findOne({ _id: orderId, userId });
  },

  async findByUserId(userId) {
    return Order.find({ userId }).sort({ createdAt: -1 }).lean();
  },

  async findAll({ filter, skip, limit }) {
    return Order.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  },

  async countAll(filter = {}) {
    return Order.countDocuments(filter);
  },

  // ─── Analytics ──────────────────────────────────────────────────────────────

  async revenueByDay(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Order.aggregate([
      { $match: { payment_status: "Paid", createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          revenue: { $sum: "$totalAmt" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  async revenueByMonth(months = 12) {
    const since = new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000);
    return Order.aggregate([
      { $match: { payment_status: "Paid", createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
          revenue: { $sum: "$totalAmt" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
  },

  async orderStatusBreakdown() {
    return Order.aggregate([
      {
        $group: {
          _id: "$order_status",
          count: { $sum: 1 },
        },
      },
    ]);
  },

  async topSellingProducts(limit = 10) {
    return Order.aggregate([
      { $match: { payment_status: "Paid" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          name: { $first: "$items.name" },
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: limit },
    ]);
  },

  async totalRevenue() {
    const result = await Order.aggregate([
      { $match: { payment_status: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmt" } } },
    ]);
    return result[0]?.total ?? 0;
  },
};
