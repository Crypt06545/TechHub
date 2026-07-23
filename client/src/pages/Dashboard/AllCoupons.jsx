import React, { useState, useEffect, useMemo } from "react";
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
  Package,
  Loader2,
  X,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

import { AuthToast } from "@/components/common/AuthToast"; // adjust path if needed

/* ─────────────────────────────────────────────────────────────────────
   TODO — wire this file to real endpoints once the backend exists.
   Suggested shape, mirroring the pattern used on the Orders page
   (useAdminOrders / useDashboardStats):

     import {
       useAdminCoupons,      // list + filters + pagination
       useCreateCoupon,      // mutate
       useUpdateCoupon,      // mutate
       useDeleteCoupon,      // mutate
       useAdminProductsLite, // for the product picker (id, name, price)
     } from "@/hooks/useAdminAnalytics";

   Everything below that touches `coupons` state and the three handlers
   (handleSaveCoupon / handleDeleteCoupon / MOCK_PRODUCTS) is the part
   to swap out. The table, filters, dialogs, and form validation don't
   need to change shape when the real API lands — just the data source.
───────────────────────────────────────────────────────────────────── */

const MOCK_PRODUCTS = [
  { _id: "p1", name: "Amber Nights Attar", price: 1050, category: "Attar" },
  {
    _id: "p2",
    name: "Samsung Galaxy S24 Ultra 256GB",
    price: 145000,
    category: "Electronics",
  },
  { _id: "p3", name: "Oud Al Mubarak", price: 2200, category: "Attar" },
  { _id: "p4", name: "Rose Musk Perfume Oil", price: 890, category: "Attar" },
  {
    _id: "p5",
    name: "Wireless Earbuds Pro",
    price: 3200,
    category: "Electronics",
  },
  {
    _id: "p6",
    name: "Leather Wallet — Classic",
    price: 1450,
    category: "Accessories",
  },
];

const seedId = () =>
  `c_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

const MOCK_COUPONS = [
  {
    _id: seedId(),
    code: "WELCOME10",
    description: "10% off for first-time customers",
    discountType: "percentage",
    discountValue: 10,
    minPurchaseAmount: 500,
    maxDiscountAmount: 300,
    applyTo: "all",
    productIds: [],
    usageLimit: 500,
    usageLimitPerUser: 1,
    usedCount: 128,
    startDate: "2026-06-01",
    endDate: "2026-12-31",
    isActive: true,
  },
  {
    _id: seedId(),
    code: "ATTAR200",
    description: "Flat ৳200 off on select attars",
    discountType: "fixed",
    discountValue: 200,
    minPurchaseAmount: 1000,
    maxDiscountAmount: null,
    applyTo: "specific",
    productIds: ["p1", "p3", "p4"],
    usageLimit: 200,
    usageLimitPerUser: 2,
    usedCount: 200,
    startDate: "2026-05-01",
    endDate: "2026-06-30",
    isActive: true,
  },
  {
    _id: seedId(),
    code: "EID26",
    description: "Eid special — sitewide",
    discountType: "percentage",
    discountValue: 15,
    minPurchaseAmount: 0,
    maxDiscountAmount: 1000,
    applyTo: "all",
    productIds: [],
    usageLimit: null,
    usageLimitPerUser: 1,
    usedCount: 54,
    startDate: "2026-08-01",
    endDate: "2026-08-15",
    isActive: true,
  },
];

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
    : "—";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const getCouponStatus = (coupon) => {
  const now = new Date();
  const start = coupon.startDate ? new Date(coupon.startDate) : null;
  const end = coupon.endDate ? new Date(coupon.endDate) : null;

  if (!coupon.isActive) return "Inactive";
  if (end && end < now) return "Expired";
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
    return "Exhausted";
  if (start && start > now) return "Scheduled";
  return "Active";
};

const statusBadge = (status) => {
  const map = {
    Active: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Scheduled: "bg-blue-100 text-blue-700 hover:bg-blue-100",
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

const appliesToLabel = (coupon, products) => {
  if (coupon.applyTo === "all") return "All products";
  const names = products
    .filter((p) => coupon.productIds.includes(p._id))
    .map((p) => p.name);
  if (names.length === 0) return "No products selected";
  if (names.length <= 2) return names.join(", ");
  return `${names.slice(0, 2).join(", ")} +${names.length - 2} more`;
};

/* ─────────────────────────────────────────────────────────────────────
   AllCoupons
───────────────────────────────────────────────────────────────────── */
const AllCoupons = () => {
  // TODO: replace with useAdminCoupons(filters) once the endpoint exists
  const [coupons, setCoupons] = useState(MOCK_COUPONS);
  const products = MOCK_PRODUCTS; // TODO: replace with useAdminProductsLite()

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null); // null = create mode
  const [isSaving, setIsSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredCoupons = useMemo(() => {
    const q = searchInput.trim().toLowerCase();
    return coupons.filter((c) => {
      const matchesSearch =
        !q ||
        c.code.toLowerCase().includes(q) ||
        (c.description || "").toLowerCase().includes(q);
      const matchesStatus =
        statusFilter === "all" || getCouponStatus(c) === statusFilter;
      const matchesType = typeFilter === "all" || c.discountType === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [coupons, searchInput, statusFilter, typeFilter]);

  const stats = useMemo(() => {
    const active = coupons.filter(
      (c) => getCouponStatus(c) === "Active",
    ).length;
    const expired = coupons.filter(
      (c) => getCouponStatus(c) === "Expired",
    ).length;
    const redemptions = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);
    return { total: coupons.length, active, expired, redemptions };
  }, [coupons]);

  const openCreate = () => {
    setEditingCoupon(null);
    setFormOpen(true);
  };

  const openEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormOpen(true);
  };

  const handleDuplicate = (coupon) => {
    const copy = {
      ...coupon,
      _id: seedId(),
      code: `${coupon.code}-COPY`,
      usedCount: 0,
    };
    setCoupons((prev) => [copy, ...prev]);
    AuthToast.success(`Duplicated as ${copy.code}`);
  };

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      AuthToast.success("Coupon code copied");
    } catch {
      AuthToast.error("Couldn't copy the code");
    }
  };

  // TODO: replace body with createCoupon(...) / updateCoupon(...) mutate calls
  const handleSaveCoupon = (payload, isEdit) => {
    setIsSaving(true);
    setTimeout(() => {
      setCoupons((prev) => {
        if (isEdit) {
          return prev.map((c) =>
            c._id === payload._id ? { ...c, ...payload } : c,
          );
        }
        return [{ ...payload, _id: seedId(), usedCount: 0 }, ...prev];
      });
      setIsSaving(false);
      setFormOpen(false);
      AuthToast.success(isEdit ? "Coupon updated" : "Coupon created");
    }, 400);
  };

  // TODO: replace body with deleteCoupon(...) mutate call
  const handleDeleteCoupon = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setTimeout(() => {
      setCoupons((prev) => prev.filter((c) => c._id !== deleteTarget._id));
      setIsDeleting(false);
      setDeleteTarget(null);
      AuthToast.success("Coupon deleted");
    }, 300);
  };

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

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Coupons</p>
            <p className="mt-1 text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">
              {stats.active}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expired</p>
            <p className="mt-1 text-2xl font-bold text-red-500">
              {stats.expired}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Redemptions</p>
            <p className="mt-1 text-2xl font-bold">
              {stats.redemptions.toLocaleString("en-BD")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Search */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by code or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Scheduled">Scheduled</SelectItem>
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
            <SelectItem value="fixed">Fixed amount</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {filteredCoupons.length === 0 ? (
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
                  <TableHead>Validity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCoupons.map((coupon) => {
                  const status = getCouponStatus(coupon);
                  return (
                    <TableRow key={coupon._id}>
                      <TableCell>
                        <p className="font-mono font-semibold tracking-wide">
                          {coupon.code}
                        </p>
                        {coupon.description && (
                          <p className="text-xs text-muted-foreground max-w-[220px] truncate">
                            {coupon.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{discountLabel(coupon)}</p>
                        {coupon.minPurchaseAmount > 0 && (
                          <p className="text-xs text-muted-foreground">
                            Min. {formatCurrency(coupon.minPurchaseAmount)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 max-w-[200px]">
                          <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          <span className="text-sm truncate">
                            {appliesToLabel(coupon, products)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {coupon.usedCount}
                          {coupon.usageLimit
                            ? ` / ${coupon.usageLimit}`
                            : " / ∞"}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDateOnly(coupon.startDate)} –{" "}
                        {formatDateOnly(coupon.endDate)}
                      </TableCell>
                      <TableCell>{statusBadge(status)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
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
                              onClick={() => handleDuplicate(coupon)}
                            >
                              <Ticket className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => setDeleteTarget(coupon)}
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

      {/* Create / edit dialog */}
      <CouponFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        initialCoupon={editingCoupon}
        products={products}
        existingCodes={coupons
          .filter((c) => c._id !== editingCoupon?._id)
          .map((c) => c.code.toUpperCase())}
        isSaving={isSaving}
        onSubmit={handleSaveCoupon}
      />

      {/* Delete confirmation */}
      <AlertDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete coupon — {deleteTarget?.code}
            </AlertDialogTitle>
            <AlertDialogDescription>
              This can't be undone. Customers won't be able to use this code
              once it's deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCoupon}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 gap-1.5"
            >
              {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Delete coupon
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   CouponFormDialog — shared by create + edit
───────────────────────────────────────────────────────────────────── */
const emptyForm = {
  code: "",
  description: "",
  discountType: "percentage",
  discountValue: "",
  minPurchaseAmount: "",
  maxDiscountAmount: "",
  applyTo: "all",
  productIds: [],
  usageLimit: "",
  usageLimitPerUser: "",
  startDate: "",
  endDate: "",
  isActive: true,
};

const CouponFormDialog = ({
  open,
  onOpenChange,
  initialCoupon,
  products,
  existingCodes,
  isSaving,
  onSubmit,
}) => {
  const isEdit = Boolean(initialCoupon);
  const [form, setForm] = useState(emptyForm);
  const [productSearch, setProductSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    if (initialCoupon) {
      setForm({
        code: initialCoupon.code || "",
        description: initialCoupon.description || "",
        discountType: initialCoupon.discountType || "percentage",
        discountValue: initialCoupon.discountValue ?? "",
        minPurchaseAmount: initialCoupon.minPurchaseAmount ?? "",
        maxDiscountAmount: initialCoupon.maxDiscountAmount ?? "",
        applyTo: initialCoupon.applyTo || "all",
        productIds: initialCoupon.productIds || [],
        usageLimit: initialCoupon.usageLimit ?? "",
        usageLimitPerUser: initialCoupon.usageLimitPerUser ?? "",
        startDate: initialCoupon.startDate || "",
        endDate: initialCoupon.endDate || "",
        isActive: initialCoupon.isActive ?? true,
      });
    } else {
      setForm(emptyForm);
    }
    setProductSearch("");
  }, [open, initialCoupon]);

  const setField = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleProduct = (id) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(id)
        ? prev.productIds.filter((p) => p !== id)
        : [...prev.productIds, id],
    }));
  };

  const visibleProducts = products.filter((p) =>
    p.name.toLowerCase().includes(productSearch.trim().toLowerCase()),
  );

  const handleSubmit = () => {
    const code = form.code.trim().toUpperCase();
    const discountValue = Number(form.discountValue);

    if (!code) {
      AuthToast.error("Give the coupon a code");
      return;
    }
    if (existingCodes.includes(code)) {
      AuthToast.error("That code is already in use");
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
    if (form.applyTo === "specific" && form.productIds.length === 0) {
      AuthToast.error("Select at least one product, or switch to All products");
      return;
    }
    if (
      form.startDate &&
      form.endDate &&
      new Date(form.startDate) > new Date(form.endDate)
    ) {
      AuthToast.error("Start date must be before the end date");
      return;
    }

    onSubmit(
      {
        ...(isEdit ? { _id: initialCoupon._id } : {}),
        code,
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue,
        minPurchaseAmount: Number(form.minPurchaseAmount) || 0,
        maxDiscountAmount:
          form.discountType === "percentage" && form.maxDiscountAmount !== ""
            ? Number(form.maxDiscountAmount)
            : null,
        applyTo: form.applyTo,
        productIds: form.applyTo === "specific" ? form.productIds : [],
        usageLimit: form.usageLimit !== "" ? Number(form.usageLimit) : null,
        usageLimitPerUser:
          form.usageLimitPerUser !== "" ? Number(form.usageLimitPerUser) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
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
          {/* Code + description */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="coupon-code">Coupon code</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="coupon-code"
                  value={form.code}
                  onChange={(e) =>
                    setField("code", e.target.value.toUpperCase())
                  }
                  placeholder="e.g. WELCOME10"
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setField("code", generateCode())}
                  title="Generate a random code"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="coupon-description">
                Description{" "}
                <span className="text-xs text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="coupon-description"
                value={form.description}
                onChange={(e) => setField("description", e.target.value)}
                placeholder="Shown to your team, not to customers"
                className="mt-1.5 min-h-[64px]"
              />
            </div>
          </div>

          <Separator />

          {/* Discount */}
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
                <RadioGroupItem value="fixed" id="type-fixed" />
                <Label htmlFor="type-fixed" className="font-normal">
                  Fixed amount off
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
                  htmlFor="min-purchase"
                  className="text-xs text-muted-foreground"
                >
                  Minimum purchase (৳)
                </Label>
                <Input
                  id="min-purchase"
                  type="number"
                  min="0"
                  value={form.minPurchaseAmount}
                  onChange={(e) =>
                    setField("minPurchaseAmount", e.target.value)
                  }
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
                  <span className="text-[10px]">
                    (optional, prevents huge discounts on big carts)
                  </span>
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

          {/* Applies to */}
          <div className="space-y-3">
            <Label className="flex items-center gap-1.5">
              <Package className="h-3.5 w-3.5" />
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
                  All products
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="specific" id="apply-specific" />
                <Label htmlFor="apply-specific" className="font-normal">
                  Specific products
                </Label>
              </div>
            </RadioGroup>

            {form.applyTo === "specific" && (
              <div className="rounded-xl border p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Search products..."
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {form.productIds.length} selected
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                  {visibleProducts.length === 0 && (
                    <p className="text-xs text-muted-foreground p-2">
                      No products match "{productSearch}"
                    </p>
                  )}
                  {visibleProducts.map((p) => (
                    <label
                      key={p._id}
                      htmlFor={`product-${p._id}`}
                      className="flex items-center gap-2.5 rounded-lg p-1.5 hover:bg-muted/60 cursor-pointer"
                    >
                      <Checkbox
                        id={`product-${p._id}`}
                        checked={form.productIds.includes(p._id)}
                        onCheckedChange={() => toggleProduct(p._id)}
                      />
                      <span className="text-sm flex-1 truncate">{p.name}</span>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {formatCurrency(p.price)}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Usage limits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="usage-limit"
                className="text-xs text-muted-foreground"
              >
                Total usage limit{" "}
                <span className="text-[10px]">(blank = unlimited)</span>
              </Label>
              <Input
                id="usage-limit"
                type="number"
                min="0"
                value={form.usageLimit}
                onChange={(e) => setField("usageLimit", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="usage-per-user"
                className="text-xs text-muted-foreground"
              >
                Limit per customer{" "}
                <span className="text-[10px]">(blank = unlimited)</span>
              </Label>
              <Input
                id="usage-per-user"
                type="number"
                min="0"
                value={form.usageLimitPerUser}
                onChange={(e) => setField("usageLimitPerUser", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Separator />

          {/* Validity + active toggle */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label
                htmlFor="start-date"
                className="text-xs text-muted-foreground"
              >
                Start date
              </Label>
              <Input
                id="start-date"
                type="date"
                value={form.startDate}
                onChange={(e) => setField("startDate", e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label
                htmlFor="end-date"
                className="text-xs text-muted-foreground"
              >
                End date
              </Label>
              <Input
                id="end-date"
                type="date"
                value={form.endDate}
                onChange={(e) => setField("endDate", e.target.value)}
                className="mt-1"
              />
            </div>
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
