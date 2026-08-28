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
    amount: { type: Number, required: true, min: 0 },
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
  },
  { timestamps: true, versionKey: false },
);

// Date-range reports ("this month's expenses")
expenseSchema.index({ date: -1 });
// Category breakdown within a range ("how much on shipping this month")
expenseSchema.index({ category: 1, date: -1 });

export const Expense =
  mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
