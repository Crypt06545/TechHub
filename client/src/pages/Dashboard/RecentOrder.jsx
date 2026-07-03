// src/components/dashboard/RecentOrders.jsx
import React from "react";
import { ArrowRight, MoreHorizontal } from "lucide-react";
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

const ORDERS = [
  {
    id: "#ORD-001",
    customer: "Rahim Uddin",
    initials: "RU",
    product: "AirPods Pro",
    amount: "৳12,500",
    status: "Delivered",
    date: "Jun 28, 2026",
  },
  {
    id: "#ORD-002",
    customer: "Fatema Khatun",
    initials: "FK",
    product: "Attar Rose Oud",
    amount: "৳2,800",
    status: "Processing",
    date: "Jun 27, 2026",
  },
  {
    id: "#ORD-003",
    customer: "Karim Sheikh",
    initials: "KS",
    product: "Wireless Mouse",
    amount: "৳1,200",
    status: "Pending",
    date: "Jun 26, 2026",
  },
  {
    id: "#ORD-004",
    customer: "Nusrat Jahan",
    initials: "NJ",
    product: "Senzo Air EDP",
    amount: "৳4,500",
    status: "Cancelled",
    date: "Jun 25, 2026",
  },
  {
    id: "#ORD-005",
    customer: "Tanvir Ahmed",
    initials: "TA",
    product: "Mechanical Keyboard",
    amount: "৳6,900",
    status: "Delivered",
    date: "Jun 24, 2026",
  },
];

const STATUS_CLS = {
  Delivered:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  Processing: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400",
  Pending:
    "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
  Cancelled: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400",
};

// লোডিং অবস্থায় দেখানোর স্কেলিটন রো — আগে এটা মিসিং ছিল
const RowSkeleton = () => (
  <TableRow className="hover:bg-transparent">
    <TableCell className="pl-5 py-3.5">
      <Skeleton className="h-4 w-16" />
    </TableCell>
    <TableCell className="py-3.5">
      <div className="flex items-center gap-2">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-20" />
      </div>
    </TableCell>
    <TableCell className="py-3.5 hidden sm:table-cell">
      <Skeleton className="h-4 w-24" />
    </TableCell>
    <TableCell className="py-3.5">
      <Skeleton className="h-4 w-14" />
    </TableCell>
    <TableCell className="py-3.5">
      <Skeleton className="h-5 w-16 rounded-md" />
    </TableCell>
    <TableCell className="py-3.5 hidden md:table-cell">
      <Skeleton className="h-4 w-20" />
    </TableCell>
    <TableCell className="pr-4">
      <Skeleton className="h-7 w-7 rounded-md" />
    </TableCell>
  </TableRow>
);

const RecentOrders = ({ loading }) => {
  return (
    <Card className="shadow-none">
      <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
        <div>
          <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
          <CardDescription className="mt-0.5">
            Latest {ORDERS.length} transactions
          </CardDescription>
        </div>
        <Button variant="ghost" size="sm" className="text-xs gap-1 h-7 px-2">
          View all <ArrowRight size={11} />
        </Button>
      </CardHeader>
      <CardContent className="px-0 pb-0">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="pl-5 text-xs">Order</TableHead>
              <TableHead className="text-xs">Customer</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">
                Product
              </TableHead>
              <TableHead className="text-xs">Amount</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden md:table-cell">
                Date
              </TableHead>
              <TableHead className="pr-4 w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
              : ORDERS.map((o) => (
                  <TableRow
                    key={o.id}
                    className="hover:bg-muted/40 transition-colors"
                  >
                    <TableCell className="pl-5 py-3.5 text-sm font-medium">
                      {o.id}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[9px] font-bold bg-muted">
                            {o.initials}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{o.customer}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 text-sm text-muted-foreground hidden sm:table-cell">
                      {o.product}
                    </TableCell>
                    <TableCell className="py-3.5 text-sm font-medium">
                      {o.amount}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${STATUS_CLS[o.status]}`}
                      >
                        {o.status}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 text-sm text-muted-foreground hidden md:table-cell">
                      {o.date}
                    </TableCell>
                    <TableCell className="pr-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-muted-foreground"
                          >
                            <MoreHorizontal size={14} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          className="w-36 text-sm"
                        >
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit order</DropdownMenuItem>
                          <DropdownMenuItem className="text-rose-500 focus:text-rose-500">
                            Cancel
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default RecentOrders;
