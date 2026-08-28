// FILE: pages/admin/Inventory.jsx
import React, { useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  Search,
  Package,
  AlertTriangle,
  TrendingUp,
  Boxes,
  MoreVertical,
  PlusCircle,
  MinusCircle,
  History,
  Loader2,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AuthToast } from "@/components/common/AuthToast";

import {
  useAdminProducts,
  useAdminProductDetails,
  useInventorySummary,
  useLowStockProducts,
  useStockLogs,
  useRestockProduct,
  useAdjustStock,
} from "@/hooks/useAdminAnalytics";

const formatCurrency = (value) =>
  `৳${Number(value || 0).toLocaleString("en-BD")}`;

const formatDate = (date) =>
  date
    ? new Date(date).toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

// Pure function — no component state involved, safe to memoize/hoist
// outside render so it isn't recreated every render.
const getStockStatus = (stock, threshold = 5) => {
  if (stock === 0)
    return { label: "Out of Stock", className: "bg-red-100 text-red-700" };
  if (stock <= threshold)
    return { label: "Low Stock", className: "bg-amber-100 text-amber-700" };
  return { label: "In Stock", className: "bg-emerald-100 text-emerald-700" };
};

const STOCK_LOG_TYPE_BADGE = {
  initial: "bg-slate-100 text-slate-700",
  restock: "bg-emerald-100 text-emerald-700",
  sale: "bg-blue-100 text-blue-700",
  return: "bg-indigo-100 text-indigo-700",
  damage: "bg-red-100 text-red-700",
  correction: "bg-amber-100 text-amber-700",
};

/* ─────────────────────────────────────────────────────────────────────
   SummaryCards — isolated so it only re-renders when its own query
   updates, not on every keystroke in the search box above it.
───────────────────────────────────────────────────────────────────── */
const SummaryCards = memo(function SummaryCards() {
  const { data, isLoading } = useInventorySummary();
  const summary = data?.data;

  const cards = [
    {
      label: "Total Stock Units",
      value: summary?.totalStockUnits?.toLocaleString("en-BD"),
      icon: Boxes,
    },
    {
      label: "Retail Value",
      value: summary && formatCurrency(summary.totalRetailValue),
      icon: Package,
    },
    {
      label: "Potential Profit",
      value: summary && formatCurrency(summary.potentialProfit),
      icon: TrendingUp,
    },
    {
      label: "Low Stock Items",
      value: summary?.lowStockCount,
      icon: AlertTriangle,
      alert: summary?.lowStockCount > 0,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="flex items-center justify-between pt-6">
            <div>
              <p className="text-sm text-muted-foreground">{c.label}</p>
              {isLoading ? (
                <Skeleton className="mt-1 h-7 w-20" />
              ) : (
                <p
                  className={`mt-1 text-2xl font-bold ${c.alert ? "text-red-600" : ""}`}
                >
                  {c.value ?? "—"}
                </p>
              )}
            </div>
            <c.icon
              className={`h-8 w-8 ${c.alert ? "text-red-500" : "text-muted-foreground/40"}`}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────────────
   ProductRow — memoized so opening/closing a dialog (parent state
   change) doesn't re-render every row in the table, only the one whose
   own props actually changed.
───────────────────────────────────────────────────────────────────── */
const ProductRow = memo(function ProductRow({
  product,
  onRestock,
  onAdjust,
  onHistory,
}) {
  const status = getStockStatus(product.stock, product.lowStockThreshold);

  return (
    <TableRow>
      <TableCell>
        <div className="flex items-center gap-3">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.title}
              className="h-10 w-10 rounded-lg border object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-lg border bg-muted" />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{product.title}</p>
            {product.hasVariants && (
              <Badge variant="outline" className="mt-0.5 text-[10px]">
                Has variants
              </Badge>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>{product.brand || "—"}</TableCell>
      <TableCell className="font-medium">{product.stock}</TableCell>
      <TableCell>
        <Badge className={status.className}>{status.label}</Badge>
      </TableCell>
      <TableCell className="text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onRestock(product)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Restock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAdjust(product)}>
              <MinusCircle className="mr-2 h-4 w-4" />
              Adjust Stock
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onHistory(product)}>
              <History className="mr-2 h-4 w-4" />
              Stock History
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
});

/* ─────────────────────────────────────────────────────────────────────
   RestockDialog — fetches full product details (with variants) lazily,
   only while open (`enabled: !!product` inside useAdminProductDetails),
   so the main table never has to carry the heavier variants payload.
───────────────────────────────────────────────────────────────────── */
const RestockDialog = ({ product, onOpenChange }) => {
  const [variantId, setVariantId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [reason, setReason] = useState("");

  const { data: detailData, isLoading: detailsLoading } =
    useAdminProductDetails(product?._id);
  const fullProduct = detailData?.data?.product;

  const { mutate, isPending } = useRestockProduct();

  useEffect(() => {
    // Reset the form each time a different product is opened, so stale
    // values from the last restock don't leak into the next one.
    setVariantId("");
    setQuantity("");
    setUnitCost("");
    setReason("");
  }, [product?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product.hasVariants && !variantId) {
      AuthToast.error("Select a variant to restock");
      return;
    }
    mutate(
      {
        id: product._id,
        payload: {
          variantId: variantId || undefined,
          quantity: Number(quantity),
          unitCost: Number(unitCost),
          reason,
        },
      },
      {
        onSuccess: () => {
          AuthToast.success("Stock restocked successfully");
          onOpenChange(false);
        },
        onError: (err) =>
          AuthToast.error(err?.response?.data?.message || "Restock failed"),
      },
    );
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restock — {product?.title}</DialogTitle>
          <DialogDescription>
            Add newly purchased units and their per-unit cost.
          </DialogDescription>
        </DialogHeader>

        {product?.hasVariants && detailsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {product?.hasVariants && (
              <div className="space-y-1.5">
                <Label className="text-xs">Variant</Label>
                <Select value={variantId} onValueChange={setVariantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {fullProduct?.variants?.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {[v.size, v.color].filter(Boolean).join(" / ")} —{" "}
                        {v.stock} in stock
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Unit Cost (৳)</Label>
                <Input
                  type="number"
                  min="0"
                  required
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Reason (optional)</Label>
              <Textarea
                rows={2}
                placeholder="e.g. New batch from supplier"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className="w-full gap-1.5"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Restock
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   AdjustStockDialog — "damage" always subtracts (UI collects a plain
   positive quantity and negates it internally); "correction" lets the
   admin pick a direction explicitly.
───────────────────────────────────────────────────────────────────── */
const AdjustStockDialog = ({ product, onOpenChange }) => {
  const [variantId, setVariantId] = useState("");
  const [type, setType] = useState("damage");
  const [direction, setDirection] = useState("subtract"); // correction only
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const { data: detailData, isLoading: detailsLoading } =
    useAdminProductDetails(product?._id);
  const fullProduct = detailData?.data?.product;

  const { mutate, isPending } = useAdjustStock();

  useEffect(() => {
    setVariantId("");
    setType("damage");
    setDirection("subtract");
    setQuantity("");
    setReason("");
  }, [product?._id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (product.hasVariants && !variantId) {
      AuthToast.error("Select a variant to adjust");
      return;
    }
    if (!reason.trim()) {
      AuthToast.error("A reason is required");
      return;
    }

    const qty = Number(quantity);
    const signedChange =
      type === "damage" || direction === "subtract" ? -qty : qty;

    mutate(
      {
        id: product._id,
        payload: {
          variantId: variantId || undefined,
          type,
          change: signedChange,
          reason,
        },
      },
      {
        onSuccess: () => {
          AuthToast.success("Stock adjusted successfully");
          onOpenChange(false);
        },
        onError: (err) =>
          AuthToast.error(err?.response?.data?.message || "Adjustment failed"),
      },
    );
  };

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust Stock — {product?.title}</DialogTitle>
          <DialogDescription>
            Correct a miscount or write off damaged/lost units.
          </DialogDescription>
        </DialogHeader>

        {product?.hasVariants && detailsLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {product?.hasVariants && (
              <div className="space-y-1.5">
                <Label className="text-xs">Variant</Label>
                <Select value={variantId} onValueChange={setVariantId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a variant" />
                  </SelectTrigger>
                  <SelectContent>
                    {fullProduct?.variants?.map((v) => (
                      <SelectItem key={v._id} value={v._id}>
                        {[v.size, v.color].filter(Boolean).join(" / ")} —{" "}
                        {v.stock} in stock
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Type</Label>
                <Select value={type} onValueChange={setType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="damage">Damage / Loss</SelectItem>
                    <SelectItem value="correction">Correction</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {type === "correction" ? (
                <div className="space-y-1.5">
                  <Label className="text-xs">Direction</Label>
                  <Select value={direction} onValueChange={setDirection}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subtract">Remove units</SelectItem>
                      <SelectItem value="add">Add units</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <Label className="text-xs">Quantity Lost</Label>
                  <Input
                    type="number"
                    min="1"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              )}
            </div>

            {type === "correction" && (
              <div className="space-y-1.5">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">
                Reason <span className="text-red-500">*</span>
              </Label>
              <Textarea
                rows={2}
                required
                placeholder="e.g. 2 units damaged in warehouse"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              variant="destructive"
              disabled={isPending}
              className="w-full gap-1.5"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirm Adjustment
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   HistoryDialog — cursor-paginated, matching the same pattern as
   AllOrders.jsx so it scales the same way to a product with a long
   stock history.
───────────────────────────────────────────────────────────────────── */
const HistoryDialog = ({ product, onOpenChange }) => {
  const [cursor, setCursor] = useState(null);

  useEffect(() => setCursor(null), [product?._id]);

  const { data, isLoading } = useStockLogs(product?._id, cursor);
  const logs = data?.data?.logs || [];
  const hasMore = data?.data?.hasMore;
  const nextCursor = data?.data?.nextCursor;

  return (
    <Dialog open={Boolean(product)} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Stock History — {product?.title}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        ) : (
          <div className="space-y-2">
            {logs.map((log) => (
              <div key={log._id} className="rounded-lg border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <Badge className={STOCK_LOG_TYPE_BADGE[log.type]}>
                    {log.type}
                  </Badge>
                  <span
                    className={`font-semibold ${log.change >= 0 ? "text-emerald-600" : "text-red-600"}`}
                  >
                    {log.change >= 0 ? "+" : ""}
                    {log.change}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {log.previousStock} → {log.newStock}
                  {log.unitCost != null && ` · unit cost ৳${log.unitCost}`}
                </p>
                {log.reason && <p className="mt-1 text-xs">{log.reason}</p>}
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {formatDate(log.createdAt)}
                  {log.adminId?.name && ` · by ${log.adminId.name}`}
                </p>
              </div>
            ))}
            {logs.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No stock movements yet.
              </p>
            )}
            {hasMore && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setCursor(nextCursor)}
              >
                Load more
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   Inventory — main page
───────────────────────────────────────────────────────────────────── */
const Inventory = () => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const [cursorStack, setCursorStack] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);

  const [restockProduct, setRestockProduct] = useState(null);
  const [adjustProduct, setAdjustProduct] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);

  // Debounced search — same 500ms pattern as AllOrders.jsx, avoids a
  // network request per keystroke.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCursorStack([null]);
      setPageIndex(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const currentCursor = cursorStack[pageIndex];

  const { data, isLoading, isFetching } = useAdminProducts(
    { search: debouncedSearch || undefined },
    currentCursor,
    20,
  );
  const { data: lowStockData } = useLowStockProducts();

  const allProducts = data?.data?.products || [];
  const lowStockIds = useMemo(
    () => new Set((lowStockData?.data?.products || []).map((p) => p._id)),
    [lowStockData],
  );

  // Client-side filter on the current page only — the low-stock toggle
  // is a lens over what's already loaded, not a separate paginated view.
  const products = showLowStockOnly
    ? allProducts.filter((p) => lowStockIds.has(p._id))
    : allProducts;

  const hasMore = data?.data?.hasMore || false;
  const nextCursor = data?.data?.nextCursor || null;

  // useCallback: these are passed down to every memoized ProductRow —
  // without this, a new function identity each render would defeat the
  // row memoization entirely.
  const handleRestock = useCallback((p) => setRestockProduct(p), []);
  const handleAdjust = useCallback((p) => setAdjustProduct(p), []);
  const handleHistory = useCallback((p) => setHistoryProduct(p), []);

  const handleNext = () => {
    if (!nextCursor) return;
    setCursorStack([...cursorStack.slice(0, pageIndex + 1), nextCursor]);
    setPageIndex(pageIndex + 1);
  };
  const handlePrevious = () => pageIndex > 0 && setPageIndex(pageIndex - 1);

  const showSkeleton = isLoading || isFetching;

  return (
    <div className="min-h-screen space-y-6 px-3 py-3 md:px-6 md:py-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory</h1>
        <p className="text-sm text-muted-foreground">
          Track stock levels, restock, and review movement history.
        </p>
      </div>

      <SummaryCards />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant={showLowStockOnly ? "default" : "outline"}
          onClick={() => setShowLowStockOnly((v) => !v)}
          className="gap-1.5"
        >
          <AlertTriangle className="h-4 w-4" />
          Low Stock Only
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
        {showSkeleton ? (
          <div className="space-y-3 p-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <Package className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No products found</h2>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Stock</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <ProductRow
                      key={product._id}
                      product={product}
                      onRestock={handleRestock}
                      onAdjust={handleAdjust}
                      onHistory={handleHistory}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>

            {!showLowStockOnly && (
              <div className="flex items-center justify-between border-t p-4">
                <p className="text-sm text-muted-foreground">
                  Showing {products.length} products
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
            )}
          </>
        )}
      </div>

      <RestockDialog
        product={restockProduct}
        onOpenChange={(open) => !open && setRestockProduct(null)}
      />
      <AdjustStockDialog
        product={adjustProduct}
        onOpenChange={(open) => !open && setAdjustProduct(null)}
      />
      <HistoryDialog
        product={historyProduct}
        onOpenChange={(open) => !open && setHistoryProduct(null)}
      />
    </div>
  );
};

export default Inventory;
