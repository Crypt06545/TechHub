import React, { useState, useEffect } from "react";
import {
  Search,
  Eye,
  Pencil,
  MoreVertical,
  PackageOpen,
  ArrowUpDown,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { useAdminOrders, useDashboardStats } from "@/hooks/useAdminAnalytics";
import UpdateOrderStatus from "./UpdateOrderStatus";
import OrderDetailsModal from "./OrderDetailsModal"; // adjust path if needed

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

const paymentStatusBadge = (status) => {
  const map = {
    Paid: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Pending: "bg-amber-100 text-amber-700 hover:bg-amber-100",
    Failed: "bg-red-100 text-red-700 hover:bg-red-100",
    Refunded: "bg-slate-100 text-slate-700 hover:bg-slate-100",
  };
  return (
    <Badge
      className={map[status] || ""}
      variant={map[status] ? undefined : "secondary"}
    >
      {status || "—"}
    </Badge>
  );
};

const orderStatusBadge = (status) => {
  const map = {
    Processing: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    Confirmed: "bg-indigo-100 text-indigo-700 hover:bg-indigo-100",
    Shipped: "bg-purple-100 text-purple-700 hover:bg-purple-100",
    Delivered: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    Cancelled: "bg-red-100 text-red-700 hover:bg-red-100",
  };
  return (
    <Badge
      className={map[status] || ""}
      variant={map[status] ? undefined : "secondary"}
    >
      {status || "—"}
    </Badge>
  );
};

const AllOrders = () => {
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [orderFilter, setOrderFilter] = useState("all");
  const [sortDirection, setSortDirection] = useState("desc"); // newest first by default
  const [statusOrder, setStatusOrder] = useState(null); // order being edited
  const [viewOrder, setViewOrder] = useState(null); // order being viewed in detail

  const [cursorStack, setCursorStack] = useState([null]);
  const [pageIndex, setPageIndex] = useState(0);

  const { data: dashboardData } = useDashboardStats();
  const totalOrders = dashboardData?.data?.totalOrders ?? null;
  // console.log(totalOrders);

  // Debounce search — same fix as the products page, avoids hammering the DB per keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setCursorStack([null]);
      setPageIndex(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const currentCursor = cursorStack[pageIndex];

  const filters = {
    payment_status: paymentFilter !== "all" ? paymentFilter : undefined,
    order_status: orderFilter !== "all" ? orderFilter : undefined,
    search: debouncedSearch || undefined,
    sort: sortDirection,
  };

  const { data, isLoading, isFetching } = useAdminOrders(
    filters,
    currentCursor,
    20,
  );

  const orders = data?.data?.orders || [];
  const hasMore = data?.data?.hasMore || false;
  const nextCursor = data?.data?.nextCursor || null;

  const resetPagination = () => {
    setCursorStack([null]);
    setPageIndex(0);
  };

  const handlePaymentFilterChange = (value) => {
    setPaymentFilter(value);
    resetPagination();
  };

  const handleOrderFilterChange = (value) => {
    setOrderFilter(value);
    resetPagination();
  };

  const handleSortToggle = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : "desc"));
    resetPagination();
  };

  const handleNext = () => {
    if (!nextCursor) return;
    const newStack = [...cursorStack.slice(0, pageIndex + 1), nextCursor];
    setCursorStack(newStack);
    setPageIndex(pageIndex + 1);
  };

  const handlePrevious = () => {
    if (pageIndex === 0) return;
    setPageIndex(pageIndex - 1);
  };

  const showSkeleton = isLoading || isFetching;

  return (
    <div className="min-h-screen px-3 py-3 md:px-6 md:py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">All Orders</h1>
        <p className="text-sm text-muted-foreground">
          Manage and track customer orders.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-md">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Orders</p>
            <p className="mt-1 text-2xl font-bold">
              {totalOrders !== null ? totalOrders.toLocaleString("en-BD") : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Orders This Page</p>
            <p className="mt-1 text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters + Search + Sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order ID or phone number..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>

        <Select value={paymentFilter} onValueChange={handlePaymentFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Payment status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Payments</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Failed">Failed</SelectItem>
            <SelectItem value="Refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={orderFilter} onValueChange={handleOrderFilterChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Order status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="Processing">Processing</SelectItem>
            <SelectItem value="Confirmed">Confirmed</SelectItem>
            <SelectItem value="Shipped">Shipped</SelectItem>
            <SelectItem value="Delivered">Delivered</SelectItem>
            <SelectItem value="Cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline" onClick={handleSortToggle} className="gap-2">
          <ArrowUpDown className="h-4 w-4" />
          {sortDirection === "desc" ? "Newest first" : "Oldest first"}
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
        {showSkeleton ? (
          <div className="space-y-3 p-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 p-16 text-center">
            <PackageOpen className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-lg font-semibold">No orders found</h2>
            <p className="max-w-sm text-sm text-muted-foreground">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order._id}>
                      <TableCell className="font-medium">
                        {order.orderId}
                      </TableCell>
                      <TableCell>
                        <p className="font-medium leading-tight">
                          {order.userId?.name || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.delivery_address?.mobile ||
                            order.userId?.email ||
                            ""}
                        </p>
                      </TableCell>
                      <TableCell>{formatCurrency(order.totalAmt)}</TableCell>
                      <TableCell>
                        {paymentStatusBadge(order.payment_status)}
                      </TableCell>
                      <TableCell>
                        {orderStatusBadge(order.order_status)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(order.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => setViewOrder(order)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setStatusOrder(order)}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Cursor pagination — no page numbers, scales to 10M+ orders */}
            <div className="flex items-center justify-between border-t p-4">
              <p className="text-sm text-muted-foreground">
                Showing {orders.length} orders
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

      {/* View Details Dialog — full customer, shipping & item breakdown */}
      <OrderDetailsModal
        order={viewOrder}
        onOpenChange={(open) => !open && setViewOrder(null)}
      />

      {/* Update Status Dialog */}
      <Dialog
        open={Boolean(statusOrder)}
        onOpenChange={(open) => !open && setStatusOrder(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update order — {statusOrder?.orderId}</DialogTitle>
            <DialogDescription>
              Change the payment and order status for this order.
            </DialogDescription>
          </DialogHeader>

          {statusOrder && (
            <UpdateOrderStatus
              order={statusOrder}
              onSuccess={() => setStatusOrder(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllOrders;
