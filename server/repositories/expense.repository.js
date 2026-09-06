import { Expense } from "../models/expense.model.js";

export const expenseRepository = {
  async create(data) {
    return Expense.create(data);
  },

  async findById(id) {
    return Expense.findOne({ _id: id, isDeleted: false });
  },

  async findAll({ category, startDate, endDate, cursor, limit }) {
    const query = { isDeleted: false };

    if (category) query.category = category;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    // Compound Cursor logic for date + _id sorting
    if (cursor) {
      const [cursorDate, cursorId] = cursor.split("_");
      if (cursorDate && cursorId) {
        query.$or = [
          { date: { $lt: new Date(cursorDate) } },
          {
            date: new Date(cursorDate),
            _id: { $lt: cursorId },
          },
        ];
      } else {
        query._id = { $lt: cursor };
      }
    }

    return Expense.find(query)
      .populate("adminId", "name")
      .sort({ date: -1, _id: -1 })
      .limit(limit + 1)
      .lean();
  },

  async updateById(id, data) {
    return Expense.findOneAndUpdate({ _id: id, isDeleted: false }, data, {
      new: true,
    });
  },

  async softDeleteById(id, adminId) {
    return Expense.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date(), deletedBy: adminId },
      { new: true },
    );
  },

  async totalByDateRange(since, until = new Date()) {
    const startDate = since instanceof Date ? since : new Date(since);
    const endDate = until instanceof Date ? until : new Date(until);

    const [result] = await Expense.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);
    return result?.total ?? 0;
  },

  async breakdownByCategory(since) {
    const startDate = since instanceof Date ? since : new Date(since);

    return Expense.aggregate([
      {
        $match: {
          isDeleted: false,
          date: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);
  },
};
