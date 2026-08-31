// FILE: models/expense.model.js
import mongoose from "mongoose";

const EXPENSE_CATEGORIES = [
  "shipping",
  "packaging",
  "marketing",
  "salary",
  "rent",
  "gateway_fee",
  "other",
];

const expenseSchema = new mongoose.Schema(
  {
    category: {
      type: String,
      enum: {
        values: EXPENSE_CATEGORIES,
        message: "{VALUE} is not a valid expense category",
      },
      required: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    // The date the expense actually applies to (may be back-dated —
    // e.g. logging last week's courier bill today). Defaults to now
    // for the common case of logging it same-day.
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, default: "", trim: true, maxlength: 300 },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Soft delete — an expense is a financial record; hard-deleting it
    // would let past P&L reports silently change after the fact. A
    // "deleted" expense is excluded from all reads/aggregates, but the
    // row (and who deleted it, when) stays in the database.
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true, versionKey: false },
);

// Date-range reports ("this month's expenses"), deleted rows excluded
expenseSchema.index({ isDeleted: 1, date: -1 });
// Category breakdown within a range
expenseSchema.index({ isDeleted: 1, category: 1, date: -1 });

export const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
