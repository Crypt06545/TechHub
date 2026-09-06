import React from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Package,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardStats } from "@/hooks/useAdminAnalytics";

const formatCurrency = (val) => `৳${Number(val || 0).toLocaleString("en-BD")}`;

const formatChange = (val) => {
  const num = Number(val || 0);
  const sign = num > 0 ? "+" : "";
  return `${sign}${num}%`;
};

const StatCards = ({ range = "week" }) => {
  const { data: response, isLoading } = useDashboardStats(range);
  const data = response?.data;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-none border-muted">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-28" />
              <Skeleton className="h-3 w-20" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatCurrency(data?.totalRevenue),
      change: formatChange(data?.revenueChange),
      up: (data?.revenueChange ?? 0) >= 0,
      icon: DollarSign,
    },
    {
      label: "Total Orders",
      value: (data?.totalOrders ?? 0).toLocaleString("en-BD"),
      change: formatChange(data?.ordersChange),
      up: (data?.ordersChange ?? 0) >= 0,
      icon: ShoppingBag,
    },
    {
      label: "Total Customers",
      value: (data?.totalCustomers ?? 0).toLocaleString("en-BD"),
      change: formatChange(data?.customersChange),
      up: (data?.customersChange ?? 0) >= 0,
      icon: Users,
    },
    {
      label: "Active Products",
      value: (data?.totalProducts ?? 0).toLocaleString("en-BD"),
      change: formatChange(data?.productsChange),
      up: (data?.productsChange ?? 0) >= 0,
      icon: Package,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {stats.map(({ label, value, change, up, icon: Icon }) => (
        <Card key={label} className="shadow-none border-muted">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {label}
                </p>
                <p className="text-2xl font-semibold mt-1 tracking-tight text-foreground">
                  {value}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                <Icon size={16} className="text-muted-foreground" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 mt-3">
              {up ? (
                <TrendingUp size={13} className="text-emerald-500" />
              ) : (
                <TrendingDown size={13} className="text-rose-500" />
              )}
              <span
                className={`text-xs font-medium ${
                  up
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-500"
                }`}
              >
                {change}
              </span>
              <span className="text-xs text-muted-foreground">
                vs previous period
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;
