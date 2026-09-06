import { expenseRepository } from "../repositories/expense.repository.js";
import { ApiError } from "../utils/ApiError.js";

const EXPENSE_CATEGORIES = [
  "shipping",
  "packaging",
  "marketing",
  "salary",
  "rent",
  "gateway_fee",
  "other",
];

const rangeToSince = (range) => {
  const now = new Date();
  const since = new Date(now);

  switch (range) {
    case "day":
      since.setHours(now.getHours() - 24);
      break;
    case "week":
      since.setDate(now.getDate() - 7);
      break;
    case "3month":
      since.setMonth(now.getMonth() - 3);
      break;
    case "year":
      since.setFullYear(now.getFullYear() - 1);
      break;
    case "all":
      return new Date(0);
    case "month":
    default:
      since.setDate(now.getDate() - 30);
      break;
  }
  return since;
};

const MAX_REASONABLE_EXPENSE = 10_00_000; // ৳10,00,000

export const expenseService = {
  async createExpense({ category, amount, date, note, adminId }) {
    if (!category || !EXPENSE_CATEGORIES.includes(category))
      throw new ApiError(
        400,
        `category is required and must be one of: ${EXPENSE_CATEGORIES.join(", ")}`,
      );

    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0)
      throw new ApiError(400, "amount must be greater than 0");
    if (numAmount > MAX_REASONABLE_EXPENSE)
      throw new ApiError(
        400,
        `amount looks too large (over ৳${MAX_REASONABLE_EXPENSE.toLocaleString("en-BD")}) — please double-check`,
      );

    if (date && Number.isNaN(new Date(date).getTime()))
      throw new ApiError(400, "Invalid date");

    if (!adminId) throw new ApiError(401, "Not authenticated");

    return expenseRepository.create({
      category,
      amount: numAmount,
      date: date ? new Date(date) : new Date(),
      note: note || "",
      adminId,
    });
  },

  async getExpenses({ category, startDate, endDate, cursor, limit = 30 }) {
    if (category && !EXPENSE_CATEGORIES.includes(category))
      throw new ApiError(400, `Invalid category "${category}"`);

    const safeLimit = Math.min(Math.max(Number(limit) || 30, 1), 100);

    const expenses = await expenseRepository.findAll({
      category,
      startDate,
      endDate,
      cursor,
      limit: safeLimit,
    });

    let nextCursor = null;
    if (expenses.length > safeLimit) {
      const nextItem = expenses.pop();
      nextCursor = `${new Date(nextItem.date).toISOString()}_${nextItem._id}`;
    }

    return { expenses, nextCursor, hasMore: Boolean(nextCursor) };
  },

  async updateExpense(id, { category, amount, date, note }) {
    const existing = await expenseRepository.findById(id);
    if (!existing) throw new ApiError(404, "Expense not found");

    const update = {};

    if (category !== undefined) {
      if (!EXPENSE_CATEGORIES.includes(category))
        throw new ApiError(
          400,
          `category must be one of: ${EXPENSE_CATEGORIES.join(", ")}`,
        );
      update.category = category;
    }

    if (amount !== undefined) {
      const numAmount = Number(amount);
      if (!numAmount || numAmount <= 0)
        throw new ApiError(400, "amount must be greater than 0");
      if (numAmount > MAX_REASONABLE_EXPENSE)
        throw new ApiError(
          400,
          `amount looks too large (over ৳${MAX_REASONABLE_EXPENSE.toLocaleString("en-BD")}) — please double-check`,
        );
      update.amount = numAmount;
    }

    if (date !== undefined) {
      if (Number.isNaN(new Date(date).getTime()))
        throw new ApiError(400, "Invalid date");
      update.date = new Date(date);
    }

    if (note !== undefined) update.note = note;

    const updated = await expenseRepository.updateById(id, update);
    if (!updated) throw new ApiError(404, "Expense not found");
    return updated;
  },

  async deleteExpense(id, adminId) {
    if (!adminId) throw new ApiError(401, "Not authenticated");
    const deleted = await expenseRepository.softDeleteById(id, adminId);
    if (!deleted) throw new ApiError(404, "Expense not found");
    return deleted;
  },

  async getTotalExpenses(range, from, to) {
    const parsedFrom = from ? new Date(from) : null;
    const parsedTo = to ? new Date(to) : null;
    const hasCustomRange =
      parsedFrom &&
      parsedTo &&
      !Number.isNaN(parsedFrom.getTime()) &&
      !Number.isNaN(parsedTo.getTime());

    const since = hasCustomRange ? parsedFrom : rangeToSince(range);
    const until = hasCustomRange ? parsedTo : new Date();

    return expenseRepository.totalByDateRange(since, until);
  },

  async getExpenseBreakdown(range) {
    const sinceDate = rangeToSince(range);
    const breakdown = await expenseRepository.breakdownByCategory(sinceDate);
    return breakdown || [];
  },
};
