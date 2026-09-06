import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  MoreHorizontal,
  Eye,
  Pencil,
  FileText,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { useAdminOrders } from "@/hooks/useAdminAnalytics";

const ORDER_STATUS_CLS = {
  Processing:
    "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200/60",
  Confirmed:
    "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200/60",
  Shipped:
    "bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 border-purple-200/60",
  Delivered:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200/60",
  Cancelled:
    "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border-rose-200/60",
};

const RowSkeleton = () => (
  <TableRow className="hover:bg-transparent">
    <TableCell className="pl-5 py-3.5">
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell className="py-3.5">
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-28" />
      </div>
    </TableCell>
    <TableCell className="py-3.5 hidden sm:table-cell">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="py-3.5">
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell className="py-3.5">
      <Skeleton className="h-5 w-20 rounded-full" />
    </TableCell>
    <TableCell className="py-3.5 hidden md:table-cell">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="pr-4 w-10">
      <Skeleton className="h-7 w-7 rounded-md" />
    </TableCell>
  </TableRow>
);

const RecentOrders = ({ onSelectOrderForStatus, onSelectOrderForDetails }) => {
  const navigate = useNavigate();

  // Fetch strictly top 5 recent orders sorted by newest
  const { data: response, isLoading } = useAdminOrders(
    { sort: "desc" },
    null,
    5,
  );

  const orders = response?.data?.orders || [];

  return (
    <Card className="shadow-none border-muted">
      <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
          <CardDescription className="mt-0.5 text-xs">
            Latest 5 transactions needing fulfillment
          </CardDescription>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/admin/dashboard/orders")}
          className="text-xs gap-1 h-7 px-2 font-medium"
        >
          View all <ArrowRight size={12} />
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-muted/80">
              <TableHead className="pl-5 text-xs font-semibold">
                Order ID
              </TableHead>
              <TableHead className="text-xs font-semibold">Customer</TableHead>
              <TableHead className="text-xs font-semibold hidden sm:table-cell">
                Contact
              </TableHead>
              <TableHead className="text-xs font-semibold">Total</TableHead>
              <TableHead className="text-xs font-semibold">Status</TableHead>
              <TableHead className="text-xs font-semibold hidden md:table-cell">
                Date
              </TableHead>
              <TableHead className="pr-4 w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-xs text-muted-foreground"
                >
                  No recent orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => {
                const customerName = order.userId?.name || "Guest";
                const phoneOrEmail =
                  order.delivery_address?.mobile || order.userId?.email || "—";
                const initials = customerName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();

                const formattedDate = order.createdAt
                  ? new Date(order.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                    })
                  : "—";

                return (
                  <TableRow
                    key={order._id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="pl-5 py-3.5 text-xs font-medium font-mono text-foreground">
                      {order.orderId || `#${order._id.slice(-6)}`}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6 border">
                          <AvatarFallback className="text-[9px] font-bold bg-muted text-muted-foreground">
                            {initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground">
                          {customerName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-muted-foreground hidden sm:table-cell truncate max-w-[140px]">
                      {phoneOrEmail}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs font-semibold text-foreground">
                      ৳{Number(order.totalAmt || 0).toLocaleString("en-BD")}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <Badge
                        variant="outline"
                        className={`text-[10px] px-2 py-0.5 font-medium border ${
                          ORDER_STATUS_CLS[order.order_status] ||
                          "bg-secondary text-secondary-foreground"
                        }`}
                      >
                        {order.order_status || "Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 text-xs text-muted-foreground hidden md:table-cell">
                      {formattedDate}
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          >
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-40 text-xs"
                        >
                          <DropdownMenuItem
                            onClick={() =>
                              onSelectOrderForDetails
                                ? onSelectOrderForDetails(order)
                                : navigate("/admin/dashboard/orders")
                            }
                          >
                            <Eye className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              onSelectOrderForStatus
                                ? onSelectOrderForStatus(order)
                                : navigate("/admin/dashboard/orders")
                            }
                          >
                            <Pencil className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            Update Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() =>
                              navigate("/admin/dashboard/orders/invoice", {
                                state: { order },
                              })
                            }
                          >
                            <FileText className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            Invoice
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
