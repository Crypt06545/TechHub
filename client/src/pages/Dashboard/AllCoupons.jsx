import React, { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  MoreVertical,
  Copy,
  RefreshCw,
  Ticket,
  Percent,
  Tag,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
  Power,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  DialogFooter,
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
  useAdminCoupons,
  useCreateCoupon,
  useUpdateCoupon,
  useDeleteCoupon,
  useToggleCouponActive,
  useAdminCategories,
} from "@/hooks/useAdminAnalytics";

/* ---------------------------------------------------------------- */

const formatCurrency = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDateOnly = (date) =>
  date
    ? new Date(date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "No expiry";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const normalizeList = (raw, key) => {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw[key])) return raw[key];
  return [];
};

const getCouponStatus = (coupon) => {
  const now = new Date();
  const end = coupon.expiresAt ? new Date(coupon.expiresAt) : null;

  if (!coupon.isActive) return "Inactive";
  if (end && end < now) return "Expired";
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return "Exhausted";
  return "Active";
};

const statusBadge = (status) => {
  const map = {
    Active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Expired: "bg-red-100 text-red-700 hover:bg-red-100",
    Inactive: "bg-slate-100 text-slate-700 hover:bg-slate-100",
    Exhausted: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  };
  return <Badge className={map[status] || ""}>{status}</Badge>;
};

const discountLabel = (coupon) =>
  coupon.discountType === "percentage"
    ? `${coupon.discountValue}% off`
    : `${formatCurrency(coupon.discountValue)} off`;

const appliesToLabel = (coupon, categories) => {
  const ids = (coupon.applicableCategories || []).map((c) =>
    typeof c === "string" ? c : c._id,
  );
  if (ids.length === 0) return "All categories";
  const names = categories
    .filter((c) => ids.includes(c._id))
    .map((c) => c.name);
  if (names.length === 0) return "No categories selected";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
};

const CONFIRM_COPY = {
  delete: {
    title: (code) => `Delete coupon — ${code}`,
    description:
      "This can't be undone. Customers won't be able to use this code once it's deleted.",
    actionLabel: "Delete coupon",
    actionClass: "bg-red-600 hover:bg-red-700",
  },
  duplicate: {
    title: (code) => `Duplicate coupon — ${code}`,
    description:
      "This creates a new, active coupon with the same rules and a new code. You can edit it afterward.",
    actionLabel: "Duplicate",
    actionClass: "",
  },
  activate: {
    title: (code) => `Activate coupon — ${code}`,
    description: "Customers will be able to use this code again immediately.",
    actionLabel: "Activate",
    actionClass: "",
  },
  deactivate: {
    title: (code) => `Deactivate coupon — ${code}`,
    description:
      "This pauses the coupon without deleting it. Customers won't be able to apply it until you reactivate it.",
    actionLabel: "Deactivate",
    actionClass: "bg-red-600 hover:bg-red-700",
  },
};

/* ─────────────────────────────────────────────────────────────────────
   AllCoupons
───────────────────────────────────────────────────────────────────── */
const AllCoupons = () => {
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const limit = 20;

  // ── Cursor pagination state ──────────────────────────────────────
  // cursorStack[0] is always null (first page, no cursor).
  // cursorStack[i] is the cursor that fetches page i.
  // cursorIndex is which page we're currently displaying.
  const [cursorStack, setCursorStack] = useState([null]);
  const [cursorIndex, setCursorIndex] = useState(0);

  const isActiveParam =
    statusFilter === "Active" ||
    statusFilter === "Exhausted" ||
    statusFilter === "Expired"
      ? true
      : statusFilter === "Inactive"
        ? false
        : undefined;

  const couponsQuery = useAdminCoupons(
    { isActive: isActiveParam, search: searchInput.trim() || undefined },
    cursorStack[cursorIndex],
    limit,
  );
  const categoriesQuery = useAdminCategories();

  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon();
  const deleteMutation = useDeleteCoupon();
  const toggleMutation = useToggleCouponActive();

  const coupons = normalizeList(couponsQuery.data?.data, "coupons");
  const nextCursor = couponsQuery.data?.data?.nextCursor ?? null;
  const hasMore = couponsQuery.data?.data?.hasMore ?? false;
  const hasPrev = cursorIndex > 0;
  const categories = normalizeList(categoriesQuery.data?.data, "categories");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null); // null = create mode
  const [confirmAction, setConfirmAction] = useState(null);

  // Whenever search or status filter changes, we can't keep the old
  // cursor trail — it was built against a different filtered set.
  // Jump back to page 1.
  const resetPagination = () => {
    setCursorStack([null]);
    setCursorIndex(0);
  };

  const goNext = () => {
    if (!nextCursor) return;
    setCursorStack((prev) => {
      // If we'd previously gone further forward on a different filter
      // and came back, trim anything stale past our current position
      // before pushing the new cursor.
      const trimmed = prev.slice(0, cursorIndex + 1);
      return [...trimmed, nextCursor];
    });
    setCursorIndex((i) => i + 1);
  };

  const goPrev = () => {
    if (!hasPrev) return;
    setCursorIndex((i) => i - 1);
  };

  const filteredCoupons = useMemo(() => {
    return coupons.filter((c) => {
      const matchesStatus =
        statusFilter === "all" ||
        statusFilter === "Active" ||
        statusFilter === "Inactive" ||
        getCouponStatus(c) === statusFilter;
      const matchesType = typeFilter === "all" || c.discountType === typeFilter;
      return matchesStatus && matchesType;
    });
  }, [coupons, statusFilter, typeFilter]);

  const pageStats = useMemo(() => {
    const active = coupons.filter(
      (c) => getCouponStatus(c) === "Active",
    ).length;
    const expired = coupons.filter(
      (c) => getCouponStatus(c) === "Expired",
    ).length;
    const redemptions = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);
    return { active, expired, redemptions };
  }, [coupons]);

  const openCreate = () => {
    setEditingCoupon(null);
    setFormOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormOpen(true);
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      AuthToast.success("Coupon code copied");
    } catch {
      AuthToast.error("Couldn't copy the code");
    }
  };

  const handleSaveCoupon = (payload, isEdit) => {
    if (isEdit) {
      updateMutation.mutate(
        { id: editingCoupon._id, payload },
        {
          onSuccess: (response) => {
            AuthToast.success(
              response?.message || "Coupon updated successfully",
            );
            if (response?.statusCode === 200) setFormOpen(false);
          },
          onError: (err) => {
            AuthToast.error(
              err?.response?.data?.message || "Couldn't update coupon",
            );
          },
        },
      );
    } else {
      createMutation.mutate(payload, {
        onSuccess: (response) => {
          AuthToast.success(response?.message || "Coupon created successfully");
          if (response?.statusCode === 201) {
            setFormOpen(false);
            resetPagination(); // new coupon sorts to the top — show page 1
          }
        },
        onError: (err) => {
          AuthToast.error(
            err?.response?.data?.message || "Couldn't create coupon",
          );
        },
      });
    }
  };

  const handleConfirm = () => {
    if (!confirmAction) return;
    const { type, coupon } = confirmAction;

    if (type === "delete") {
      deleteMutation.mutate(coupon._id, {
        onSuccess: (response) => {
          AuthToast.success(response?.message || "Coupon deleted successfully");
          setConfirmAction(null);
        },
        onError: (err) => {
          AuthToast.error(
            err?.response?.data?.message || "Couldn't delete coupon",
          );
          setConfirmAction(null);
        },
      });
      return;
    }

    if (type === "activate" || type === "deactivate") {
      toggleMutation.mutate(coupon._id, {
        onSuccess: (response) => {
          AuthToast.success(response?.message || "Coupon updated");
          setConfirmAction(null);
        },
        onError: (err) => {
          AuthToast.error(
            err?.response?.data?.message || "Couldn't update coupon",
          );
          setConfirmAction(null);
        },
      });
      return;
    }

    if (type === "duplicate") {
      createMutation.mutate(
        {
          code: `${coupon.code}-COPY`,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          maxDiscountAmount: coupon.maxDiscountAmount,
          applicableCategories: (coupon.applicableCategories || []).map((c) =>
            typeof c === "string" ? c : c._id,
          ),
          minOrderAmount: coupon.minOrderAmount,
          maxUses: coupon.maxUses,
          maxUsesPerUser: coupon.maxUsesPerUser,
          expiresAt: coupon.expiresAt,
        },
        {
          onSuccess: (response) => {
            AuthToast.success(response?.message || "Coupon duplicated");
            setConfirmAction(null);
            resetPagination();
          },
          onError: (err) => {
            AuthToast.error(
              err?.response?.data?.message || "Couldn't duplicate coupon",
            );
            setConfirmAction(null);
          },
        },
      );
    }
  };

  const isConfirmBusy =
    deleteMutation.isPending ||
    toggleMutation.isPending ||
    createMutation.isPending;
  const isSaving = createMutation.isPending || updateMutation.isPending;
  const confirmCopy = confirmAction ? CONFIRM_COPY[confirmAction.type] : null;

  return (
    <div className="min-h-screen px-3 py-3 md:px-6 md:py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coupons</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage discount codes.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 w-fit">
          <Plus className="h-4 w-4" />
          New coupon
        </Button>
      </div>

      {/* Stats (current page only — wire to a dedicated stats endpoint for global totals) */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active (this page)</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {pageStats.active}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expired (this page)</p>
            <p className="mt-1 text-2xl font-bold text-red-500">
              {pageStats.expired}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">
              Redemptions (this page)
            </p>
            <p className="mt-1 text-2xl font-bold">
              {pageStats.redemptions.toLocaleString("en-BD")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code..."
            value={searchInput}
            onChange={(e) => {
              setSearchInput(e.target.value);
              resetPagination();
            }}
            className="pl-9"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v);
            resetPagination();
          }}
        >
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Expired">Expired</SelectItem>
            <SelectItem value="Exhausted">Exhausted</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Discount type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="flat">Flat amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {couponsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 p-16 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading coupons...
          </div>
        ) : couponsQuery.isError ? (
          <div className="flex flex-col items-center justify-center gap-2 p-16 text-center">
            <p className="text-sm text-red-500">
              {couponsQuery.error?.response?.data?.message ||
                "Couldn't load coupons"}
            </p>
            <Button variant="outline" onClick={() => couponsQuery.refetch()}>
              Try again
            </Button>
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <Ticket className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No coupons found</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try adjusting your search or filters, or create a new coupon.
            </p>
            <Button
              onClick={openCreate}
              variant="outline"
              className="gap-2 mt-1"
            >
              <Plus className="h-4 w-4" />
              New coupon
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Applies to</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  const isRowBusy =
                    confirmAction?.coupon?._id === coupon._id && isConfirmBusy;
                  return (
                    <TableRow key={coupon._id}>
                      <TableCell>
                        <p className="font-mono font-semibold tracking-wide">
                          {coupon.code}
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{discountLabel(coupon)}</p>
                        {coupon.minOrderAmount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Min. {formatCurrency(coupon.minOrderAmount)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                          <Tag className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">
                            {appliesToLabel(coupon, categories)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {coupon.usedCount}
                          {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateOnly(coupon.expiresAt)}
                      </TableCell>
                      <TableCell>{statusBadge(status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              disabled={isRowBusy}
                            >
                              {isRowBusy ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <MoreVertical className="h-4 w-4" />
                              )}
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(coupon)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleCopyCode(coupon.code)}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy code
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmAction({ type: "duplicate", coupon })
                              }
                            >
                              <Ticket className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmAction({
                                  type: coupon.isActive
                                    ? "deactivate"
                                    : "activate",
                                  coupon,
                                })
                              }
                            >
                              <Power className="mr-2 h-4 w-4" />
                              {coupon.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() =>
                                setConfirmAction({ type: "delete", coupon })
                              }
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Pagination — cursor-based, Prev/Next only, no page-number jumps */}
      {(hasPrev || hasMore) && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {cursorIndex + 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!hasPrev || couponsQuery.isFetching}
              onClick={goPrev}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={!hasMore || couponsQuery.isFetching}
              onClick={goNext}
              className="gap-1"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Create / edit dialog */}
      <CouponFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialCoupon={editingCoupon}
        categories={categories}
        isSaving={isSaving}
        onSubmit={handleSaveCoupon}
      />

      {/* Single shared confirm modal for delete / duplicate / activate / deactivate */}
      <AlertDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) =>
          !open && !isConfirmBusy && setConfirmAction(null)
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmCopy?.title(confirmAction?.coupon?.code)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmCopy?.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isConfirmBusy}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={isConfirmBusy}
              className={`gap-1.5 ${confirmCopy?.actionClass || ""}`}
            >
              {isConfirmBusy && (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              )}
              {confirmCopy?.actionLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   CouponFormDialog — shared by create + edit (unchanged from before)
───────────────────────────────────────────────────────────────────── */
const emptyForm = {
  code: "",
  discountType: "percentage",
  discountValue: "",
  minOrderAmount: "",
  maxDiscountAmount: "",
  applyTo: "all",
  applicableCategories: [],
  maxUses: "",
  maxUsesPerUser: "",
  expiresAt: "",
  isActive: true,
};

const CouponFormDialog = ({
  open,
  onOpenChange,
  initialCoupon,
  categories,
  isSaving,
  onSubmit,
}) => {
  const isEdit = Boolean(initialCoupon);
  const [form, setForm] = useState(emptyForm);
  const [categorySearch, setCategorySearch] = useState("");
  const safeCategories = Array.isArray(categories) ? categories : [];

  React.useEffect(() => {
    if (!open) return;
    if (initialCoupon) {
      const catIds = (initialCoupon.applicableCategories || []).map((c) =>
        typeof c === "string" ? c : c._id,
      );
      setForm({
        code: initialCoupon.code || "",
        discountType: initialCoupon.discountType || "percentage",
        discountValue: initialCoupon.discountValue ?? "",
        minOrderAmount: initialCoupon.minOrderAmount ?? "",
        maxDiscountAmount: initialCoupon.maxDiscountAmount ?? "",
        applyTo: catIds.length ? "specific" : "all",
        applicableCategories: catIds,
        maxUses: initialCoupon.maxUses ?? "",
        maxUsesPerUser: initialCoupon.maxUsesPerUser ?? "",
        expiresAt: initialCoupon.expiresAt
          ? new Date(initialCoupon.expiresAt).toISOString().slice(0, 10)
          : "",
        isActive: initialCoupon.isActive ?? true,
      });
    } else {
      setForm(emptyForm);
    }
    setCategorySearch("");
  }, [open, initialCoupon]);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCategory = (id) => {
    setForm((prev) => ({
      ...prev,
      applicableCategories: prev.applicableCategories.includes(id)
        ? prev.applicableCategories.filter((c) => c !== id)
        : [...prev.applicableCategories, id],
    }));
  };

  const visibleCategories = safeCategories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.trim().toLowerCase()),
  );

  const handleSubmit = () => {
    const code = form.code.trim().toUpperCase();
    const discountValue = Number(form.discountValue);

    if (!code) {
      AuthToast.error("Give the coupon a code");
      return;
    }
    if (!discountValue || discountValue <= 0) {
      AuthToast.error("Discount value must be greater than 0");
      return;
    }
    if (form.discountType === "percentage" && discountValue > 100) {
      AuthToast.error("Percentage discount can't exceed 100%");
      return;
    }
    if (form.applyTo === "specific" && form.applicableCategories.length === 0) {
      AuthToast.error(
        "Select at least one category, or switch to All categories",
      );
      return;
    }

    onSubmit(
      {
        code,
        discountType: form.discountType,
        discountValue,
        maxDiscountAmount:
          form.discountType === "percentage" && form.maxDiscountAmount !== ""
            ? Number(form.maxDiscountAmount)
            : null,
        applicableCategories:
          form.applyTo === "specific" ? form.applicableCategories : [],
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxUses: form.maxUses !== "" ? Number(form.maxUses) : null,
        maxUsesPerUser:
          form.maxUsesPerUser !== "" ? Number(form.maxUsesPerUser) : 1,
        expiresAt: form.expiresAt || null,
        isActive: form.isActive,
      },
      isEdit,
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit coupon" : "New coupon"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the details for this coupon."
              : "Set up a new discount code for customers."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label htmlFor="coupon-code">Coupon code</Label>
            <div className="flex gap-2 mt-1.5">
              <Input
                id="coupon-code"
                value={form.code}
                onChange={(e) => setField("code", e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME10"
                className="font-mono"
                disabled={isEdit}
              />
              {!isEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setField("code", generateCode())}
                  title="Generate a random code"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              )}
            </div>
            {isEdit && (
              <p className="text-xs text-muted-foreground mt-1">
                Code can't be changed after creation.
              </p>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Percent className="h-3.5 w-3.5" />
              Discount
            </Label>
            <RadioGroup
              value={form.discountType}
              onValueChange={(v) => setField("discountType", v)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="percentage" id="type-percentage" />
                <Label htmlFor="type-percentage" className="font-normal">
                  Percentage off
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="flat" id="type-flat" />
                <Label htmlFor="type-flat" className="font-normal">
                  Flat amount off
                </Label>
              </div>
            </RadioGroup>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label
                  htmlFor="discount-value"
                  className="text-xs text-muted-foreground"
                >
                  {form.discountType === "percentage"
                    ? "Percent (%)"
                    : "Amount (৳)"}
                </Label>
                <Input
                  id="discount-value"
                  type="number"
                  min="0"
                  max={form.discountType === "percentage" ? 100 : undefined}
                  value={form.discountValue}
                  onChange={(e) => setField("discountValue", e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label
                  htmlFor="min-order"
                  className="text-xs text-muted-foreground"
                >
                  Minimum order (৳)
                </Label>
                <Input
                  id="min-order"
                  type="number"
                  min="0"
                  value={form.minOrderAmount}
                  onChange={(e) => setField("minOrderAmount", e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            {form.discountType === "percentage" && (
              <div>
                <Label
                  htmlFor="max-discount"
                  className="text-xs text-muted-foreground"
                >
                  Max discount cap (৳){" "}
                  <span className="text-[10px]">(optional)</span>
                </Label>
                <Input
                  id="max-discount"
                  type="number"
                  min="0"
                  value={form.maxDiscountAmount}
                  onChange={(e) =>
                    setField("maxDiscountAmount", e.target.value)
                  }
                  className="mt-1"
                />
              </div>
            )}
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5" />
              Applies to
            </Label>
            <RadioGroup
              value={form.applyTo}
              onValueChange={(v) => setField("applyTo", v)}
              className="flex gap-4"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="all" id="apply-all" />
                <Label htmlFor="apply-all" className="font-normal">
                  All categories
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="specific" id="apply-specific" />
                <Label htmlFor="apply-specific" className="font-normal">
                  Specific categories
                </Label>
              </div>
            </RadioGroup>

            {form.applyTo === "specific" && (
              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={categorySearch}
                      onChange={(e) => setCategorySearch(e.target.value)}
                      placeholder="Search categories..."
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {form.applicableCategories.length} selected
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {safeCategories.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">
                      No categories found. Create a category first.
                    </p>
                  ) : visibleCategories.length === 0 ? (
                    <p className="text-xs text-muted-foreground p-2">
                      No categories match "{categorySearch}"
                    </p>
                  ) : (
                    visibleCategories.map((c) => (
                      <label
                        key={c._id}
                        htmlFor={`category-${c._id}`}
                        className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-muted/60 cursor-pointer"
                      >
                        <Checkbox
                          id={`category-${c._id}`}
                          checked={form.applicableCategories.includes(c._id)}
                          onCheckedChange={() => toggleCategory(c._id)}
                        />
                        <span className="text-sm flex-1 truncate">
                          {c.name}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="max-uses"
                className="text-xs text-muted-foreground"
              >
                Total usage limit{" "}
                <span className="text-[10px]">(blank = unlimited)</span>
              </Label>
              <Input
                id="max-uses"
                type="number"
                min="1"
                value={form.maxUses}
                onChange={(e) => setField("maxUses", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="max-uses-per-user"
                className="text-xs text-muted-foreground"
              >
                Limit per customer
              </Label>
              <Input
                id="max-uses-per-user"
                type="number"
                min="1"
                value={form.maxUsesPerUser}
                onChange={(e) => setField("maxUsesPerUser", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          <div>
            <Label
              htmlFor="expires-at"
              className="text-xs text-muted-foreground"
            >
              Expiry date{" "}
              <span className="text-[10px]">(blank = never expires)</span>
            </Label>
            <Input
              id="expires-at"
              type="date"
              value={form.expiresAt}
              onChange={(e) => setField("expiresAt", e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border p-3">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">
                Turn off to pause this coupon without deleting it.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(v) => setField("isActive", v)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="gap-1.5"
          >
            {isSaving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            {isEdit ? "Save changes" : "Create coupon"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AllCoupons;
