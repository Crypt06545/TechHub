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

const STATS = [
  {
    label: "Total Revenue",
    value: "৳4,82,350",
    change: "+12.5%",
    up: true,
    icon: DollarSign,
  },
  {
    label: "Total Orders",
    value: "1,284",
    change: "+8.2%",
    up: true,
    icon: ShoppingBag,
  },
  {
    label: "Customers",
    value: "3,921",
    change: "+5.1%",
    up: true,
    icon: Users,
  },
  {
    label: "Products",
    value: "246",
    change: "-2.4%",
    up: false,
    icon: Package,
  },
];

const StatCards = ({ loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="shadow-none">
            <CardContent className="p-5 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-9 w-9 rounded-lg" />
              </div>
              <Skeleton className="h-7 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {STATS.map(({ label, value, change, up, icon: Icon }) => (
        <Card key={label} className="shadow-none">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">
                  {label}
                </p>
                <p className="text-2xl font-semibold mt-1 tracking-tight">
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
                className={`text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}
              >
                {change}
              </span>
              <span className="text-xs text-muted-foreground">
                vs last month
              </span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default StatCards;
