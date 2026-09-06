// FILE: pages/admin/Expenses.jsx
import React, { useState, useCallback, useMemo, memo } from "react";
import { Plus, Trash2, Pencil, Wallet, Loader2, Calendar } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AuthToast } from "@/components/common/AuthToast";

import {
  useExpenses,
  useExpenseBreakdown,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
} from "@/hooks/useAdminAnalytics";

const CATEGORIES = [
  "shipping",
  "packaging",
  "marketing",
  "salary",
  "rent",
  "gateway_fee",
  "other",
];

const CATEGORY_LABEL = {
  shipping: "Shipping",
  packaging: "Packaging",
  marketing: "Marketing",
  salary: "Salary",
  rent: "Rent",
  gateway_fee: "Gateway Fee",
  other: "Other",
};

const CATEGORY_BADGE = {
  shipping: "bg-blue-100 text-blue-700",
  packaging: "bg-amber-100 text-amber-700",
  marketing: "bg-purple-100 text-purple-700",
  salary: "bg-emerald-100 text-emerald-700",
  rent: "bg-indigo-100 text-indigo-700",
  gateway_fee: "bg-red-100 text-red-700",
  other: "bg-slate-100 text-slate-700",
};

const formatCurrency = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

const todayISO = () => new Date().toISOString().slice(0, 10);

/* ─────────────────────────────────────────────────────────────────────
   SummaryCards — isolated so it only re-renders on its own query,
   not on every filter change in the table above it.
───────────────────────────────────────────────────────────────────── */
const SummaryCards = memo(function SummaryCards() {
  const { data, isLoading } = useExpenseBreakdown("month");
  const breakdown = data?.data || [];
  const total = breakdown.reduce((sum, b) => sum + b.total, 0);
  const topCategory = breakdown[0];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">This Month</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-24" />
          ) : (
            <p className="mt-1 text-2xl font-bold">{formatCurrency(total)}</p>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Top Category</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-24" />
          ) : (
            <p className="mt-1 text-lg font-bold">
              {topCategory ? CATEGORY_LABEL[topCategory._id] : "—"}
            </p>
          )}
        </CardContent>
      </Card>
      <Card className="col-span-2 sm:col-span-1">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">Categories Used</p>
          {isLoading ? (
            <Skeleton className="mt-1 h-7 w-10" />
          ) : (
            <p className="mt-1 text-2xl font-bold">{breakdown.length}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────────
   ExpenseRow — memoized so opening a dialog doesn't re-render every
   row in the table, only the one whose own data actually changed.
───────────────────────────────────────────────────────────────────── */
const ExpenseRow = memo(function ExpenseRow({ expense, onEdit, onDelete }) {
  return (
    <TableRow>
      <TableCell>
        <Badge className={CATEGORY_BADGE[expense.category]}>
          {CATEGORY_LABEL[expense.category]}
        </Badge>
      </TableCell>
      <TableCell className="font-medium">
        {formatCurrency(expense.amount)}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {formatDate(expense.date)}
      </TableCell>
      <TableCell className="max-w-xs truncate text-muted-foreground">
        {expense.note || "—"}
      </TableCell>
      <TableCell className="text-muted-foreground">
        {expense.adminId?.name || "—"}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => onEdit(expense)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={() => onDelete(expense)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
});

/* ─────────────────────────────────────────────────────────────────────
   ExpenseFormDialog — shared by Add and Edit; `expense` prop being
   present means edit-mode, null means create-mode.
───────────────────────────────────────────────────────────────────── */
const ExpenseFormDialog = ({ open, expense, onOpenChange }) => {
  const isEdit = Boolean(expense);
  const [category, setCategory] = useState(expense?.category || "");
  const [amount, setAmount] = useState(expense?.amount ?? "");
  const [date, setDate] = useState(
    expense?.date ? expense.date.slice(0, 10) : todayISO(),
  );
  const [note, setNote] = useState(expense?.note || "");

  const { mutate: create, isPending: isCreating } = useCreateExpense();
  const { mutate: update, isPending: isUpdating } = useUpdateExpense();
  const isSubmitting = isCreating || isUpdating;

  // Reset the form to match whichever expense (or blank, for "Add")
  // is passed in each time the dialog opens for a different target.
  React.useEffect(() => {
    if (!open) return;
    setCategory(expense?.category || "");
    setAmount(expense?.amount ?? "");
    setDate(expense?.date ? expense.date.slice(0, 10) : todayISO());
    setNote(expense?.note || "");
  }, [open, expense]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!category) {
      AuthToast.error("Select a category");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      AuthToast.error("Enter a valid amount");
      return;
    }

    const payload = { category, amount: Number(amount), date, note };
    const onSettled = {
      onSuccess: () => {
        AuthToast.success(isEdit ? "Expense updated" : "Expense recorded");
        onOpenChange(false);
      },
      onError: (err) =>
        AuthToast.error(err?.response?.data?.message || "Something went wrong"),
    };

    if (isEdit) {
      update({ id: expense._id, payload }, onSettled);
    } else {
      create(payload, onSettled);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Expense" : "Add Expense"}</DialogTitle>
          <DialogDescription>
            Business-level costs not tied to a specific product — marketing,
            rent, salary, and similar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>
                    {CATEGORY_LABEL[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Amount (৳)</Label>
              <Input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Date</Label>
              <Input
                type="date"
                required
                value={date}
                max={todayISO()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Note (optional)</Label>
            <Textarea
              rows={2}
              placeholder="e.g. Facebook ads — August campaign"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full gap-1.5"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Add Expense"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Expenses — main page
───────────────────────────────────────────────────────────────────── */
const Expenses = () => {
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [cursorStack, setCursorStack] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);

  const [formOpen, setFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deletingExpense, setDeletingExpense] = useState(null);

  const currentCursor = cursorStack[pageIndex];

  const filters = useMemo(
    () => ({
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    }),
    [categoryFilter, startDate, endDate],
  );

  const { data, isLoading, isFetching } = useExpenses(
    filters,
    currentCursor,
    20,
  );
  const { mutate: deleteExpense, isPending: isDeleting } = useDeleteExpense();

  const expenses = data?.data?.expenses || [];
  const hasMore = data?.data?.hasMore || false;
  const nextCursor = data?.data?.nextCursor || null;

  const resetPagination = () => {
    setCursorStack([null]);
    setPageIndex(0);
  };

  const handleCategoryChange = (value) => {
    setCategoryFilter(value);
    resetPagination();
  };
  const handleDateChange = (setter) => (e) => {
    setter(e.target.value);
    resetPagination();
  };

  const handleNext = () => {
    if (!nextCursor) return;
    setCursorStack([...cursorStack.slice(0, pageIndex + 1), nextCursor]);
    setPageIndex(pageIndex + 1);
  };
  const handlePrevious = () => pageIndex > 0 && setPageIndex(pageIndex - 1);

  // useCallback: passed into every memoized ExpenseRow — without this,
  // a new function identity each render would defeat row memoization.
  const handleEdit = useCallback((expense) => setEditingExpense(expense), []);
  const handleDelete = useCallback(
    (expense) => setDeletingExpense(expense),
    [],
  );

  const confirmDelete = () => {
    deleteExpense(deletingExpense._id, {
      onSuccess: () => {
        AuthToast.success("Expense deleted");
        setDeletingExpense(null);
      },
      onError: (err) => {
        AuthToast.error(err?.response?.data?.message || "Delete failed");
        setDeletingExpense(null);
      },
    });
  };

  const showSkeleton = isLoading || isFetching;

  return (
    <div className="min-h-screen space-y-6 px-3 py-3 md:px-6 md:py-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">
            Track business costs not tied to a specific product.
          </p>
        </div>
        <Button onClick={() => setFormOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" />
          Add Expense
        </Button>
      </div>

      <SummaryCards />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={startDate}
            onChange={handleDateChange(setStartDate)}
            className="w-full sm:w-[150px]"
          />
          <span className="text-sm text-muted-foreground">to</span>
          <Input
            type="date"
            value={endDate}
            onChange={handleDateChange(setEndDate)}
            className="w-full sm:w-[150px]"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {showSkeleton ? (
          <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <Wallet className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No expenses found</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try adjusting your filters, or add your first expense.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead>Logged By</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.map((expense) => (
                    <ExpenseRow
                      key={expense._id}
                      expense={expense}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Showing {expenses.length} expenses
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={pageIndex === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNext}
                  disabled={!hasMore}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add dialog */}
      <ExpenseFormDialog
        open={formOpen}
        expense={null}
        onOpenChange={setFormOpen}
      />

      {/* Edit dialog */}
      <ExpenseFormDialog
        open={Boolean(editingExpense)}
        expense={editingExpense}
        onOpenChange={(open) => !open && setEditingExpense(null)}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deletingExpense)}
        onOpenChange={(open) => !open && setDeletingExpense(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this expense?</AlertDialogTitle>
            <AlertDialogDescription>
              {deletingExpense &&
                `${CATEGORY_LABEL[deletingExpense.category]} — ${formatCurrency(
                  deletingExpense.amount,
                )} on ${formatDate(deletingExpense.date)}`}
              . This removes it from future profit & loss reports, but keeps a
              record for audit purposes.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
