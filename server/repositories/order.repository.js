import Order from "../models/order.model.js";

export const orderRepository = {
  // ─── Writes ─────────────────────────────────────────────────────────────

  // session optional — pass it when this needs to run inside a transaction
  // (e.g. order placement, where stock decrement must commit atomically
  // with order creation).
  async create(data, session) {
    if (session) {
      const [order] = await Order.create([data], { session });
      return order;
    }
    return Order.create(data);
  },

  async save(order) {
    return order.save();
  },

  async updateStatusById(orderId, { order_status, payment_status }) {
    const update = {};
    if (order_status) update.order_status = order_status;
    if (payment_status) update.payment_status = payment_status;

    return Order.findByIdAndUpdate(orderId, update, {
      returnDocument: "after",
    });
  },

  // ─── Reads ──────────────────────────────────────────────────────────────

  async findById(orderId) {
    return Order.findById(orderId);
  },

  async findByOrderId(orderId) {
    return Order.findOne({ orderId });
  },

  async findByIdAndUserId({ orderId, userId }) {
    return Order.findOne({ _id: orderId, userId });
  },

  // custom orderId string (e.g. "ORD-xxxx") + ownership check in one query
  // — used by the user-facing single-order route.
  async findByOrderIdAndUserId({ orderId, userId }) {
    return Order.findOne({ orderId, userId }).lean();
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

  // ─── Admin: cursor-based pagination (scales to 10M+ orders) ─────────────

  async findAllOrdersAdmin({
    payment_status,
    order_status,
    search,
    sortDirection,
    cursor,
    limit,
  }) {
    const filter = {};
    if (payment_status) filter.payment_status = payment_status;
    if (order_status) filter.order_status = order_status;

    if (search) {
      filter.$or = [
        { orderId: { $regex: `^${search}`, $options: "i" } },
        { "delivery_address.mobile": { $regex: search } },
      ];
    }

    const isDesc = sortDirection !== "asc";
    if (cursor) {
      filter._id = isDesc ? { $lt: cursor } : { $gt: cursor };
    }

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .sort({ _id: isDesc ? -1 : 1 })
      .limit(limit + 1)
      .lean();

    const hasMore = orders.length > limit;
    const results = hasMore ? orders.slice(0, limit) : orders;
    const nextCursor = hasMore ? results[results.length - 1]._id : null;

    return { orders: results, hasMore, nextCursor };
  },

  async countAll(filter = {}) {
    return Order.countDocuments(filter);
  },

  // ─── Analytics ────────────────────────────────────────────────────────────

  async revenueByRange(range = "week") {
    const now = new Date();
    const since = new Date(now);
    let dateFormat;

    switch (range) {
      case "day":
        since.setHours(now.getHours() - 24);
        dateFormat = "%Y-%m-%dT%H:00:00";
        break;
      case "week":
        since.setDate(now.getDate() - 7);
        dateFormat = "%Y-%m-%d";
        break;
      case "month":
        since.setDate(now.getDate() - 30);
        dateFormat = "%Y-%m-%d";
        break;
      case "3month":
        since.setMonth(now.getMonth() - 3);
        dateFormat = "%Y-%m-%d";
        break;
      default:
        since.setDate(now.getDate() - 7);
        dateFormat = "%Y-%m-%d";
    }

    return Order.aggregate([
      {
        $match: {
          order_status: { $ne: "Cancelled" },
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: dateFormat, date: "$createdAt" } },
          revenue: { $sum: "$totalAmt" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: "$_id", revenue: 1, orders: 1 } },
    ]);
  },

  async revenueByDay(days = 30) {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return Order.aggregate([
      {
        $match: {
          order_status: { $ne: "Cancelled" },
          createdAt: { $gte: since },
        },
      },
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
    const since = new Date();
    since.setMonth(since.getMonth() - months);

    return Order.aggregate([
      {
        $match: {
          order_status: { $ne: "Cancelled" },
          createdAt: { $gte: since },
        },
      },
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
      { $group: { _id: "$order_status", count: { $sum: 1 } } },
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
      { $match: { order_status: { $ne: "Cancelled" } } },
      { $group: { _id: null, total: { $sum: "$totalAmt" } } },
    ]);
    return result[0]?.total ?? 0;
  },
};
