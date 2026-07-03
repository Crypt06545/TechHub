import React from "react";
import {
  CreditCard,
  Percent,
  Truck,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { PieChart, Pie, Cell } from "recharts";
import { ChartContainer } from "@/components/ui/chart";

const LOW_STOCK_PRODUCTS = [
  { id: "P-101", name: "Premium Attar Rose Oud", stock: 3, total: 50 },
  { id: "P-104", name: "Wireless Fast Charger 20W", stock: 5, total: 100 },
  { id: "P-109", name: "Smart Watch X1 Pro Max", stock: 2, total: 30 },
];

const OUT_OF_STOCK_PRODUCTS = [
  { id: "P-202", name: "AirPods Pro (Gen 2)", missedDemands: 42 },
  { id: "P-205", name: "Mechanical Gaming Keyboard", missedDemands: 19 },
];

const PAYMENT_RATIO_DATA = [
  { name: "Cash on Delivery", value: 65, color: "#f59e0b" },
  { name: "Prepaid (bKash/Nagad/Cards)", value: 35, color: "#10b981" },
];

const MetricsTier = ({ loading }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {/* Payment Failure Rate */}
      {/* <Card className="shadow-none border-rose-100 dark:border-rose-950/30">
        <CardHeader className="pb-1.5 pt-4 px-4 flex flex-row items-center justify-between space-y-0">
          <div className="space-y-0.5">
            <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
              <CreditCard size={14} className="text-rose-500" />
              Payment Failure Rate
            </CardTitle>
            <CardDescription className="text-[11px] font-medium text-rose-500 font-mono">
              Live 5s
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-1 space-y-3">
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <>
              <div className="space-y-0.5">
                <div className="text-2xl font-bold tracking-tight text-foreground">
                  2.1%
                </div>
                <div className="text-[11px] text-muted-foreground">
                  of last 100 txns
                </div>
              </div>
              <div className="pt-2 border-t border-muted flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">
                  Gateway Status:
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded text-[11px]">
                  All Gateways Operational
                </span>
              </div>
            </>
          )}
        </CardContent>
      </Card> */}

      {/* COD vs Prepaid Ratio */}
      <Card className="shadow-none">
        <CardHeader className="pb-1.5 pt-4 px-4">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
            <Percent size={14} className="text-amber-500" />
            COD vs Prepaid Ratio
          </CardTitle>
          <CardDescription className="text-[11px]">
            Preferred user payout distribution
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-1 flex items-center justify-between h-[84px]">
          {loading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <>
              <div className="w-16 h-16 shrink-0">
                <ChartContainer config={{}} className="w-full h-full">
                  <PieChart>
                    <Pie
                      data={PAYMENT_RATIO_DATA}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={18}
                      outerRadius={30}
                      paddingAngle={2}
                    >
                      {PAYMENT_RATIO_DATA.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>
              <div className="space-y-1.5 text-xs flex-1 pl-4 font-medium">
                {PAYMENT_RATIO_DATA.map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="text-muted-foreground truncate max-w-[90px]">
                      {item.name.split(" ")[0]}
                    </span>
                    <span className="font-semibold text-foreground">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Logistics & Fulfillment */}
      {/* <Card className="shadow-none border-blue-100 dark:border-blue-950/30">
        <CardHeader className="pb-1.5 pt-4 px-4">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
            <Truck size={14} className="text-blue-500" />
            Logistics & Fulfillment
          </CardTitle>
          <CardDescription className="text-[11px]">
            Delivery & parcel operations matrix
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-1 space-y-3.5">
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-md bg-muted/40 border border-muted/50 space-y-0.5">
                <span className="text-[10px] font-medium text-muted-foreground block truncate">
                  Pending Fulfillment
                </span>
                <div className="text-base font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  48{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    skus
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-md bg-muted/40 border border-muted/50 space-y-0.5">
                <span className="text-[10px] font-medium text-muted-foreground block truncate">
                  Return / RTO Rate
                </span>
                <div className="text-base font-bold text-rose-500 flex items-center gap-1">
                  1.8%{" "}
                  <span className="text-[10px] font-normal text-muted-foreground">
                    loss
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card> */}

      {/* Inventory Alerts */}
      <Card className="shadow-none border-amber-100 dark:border-amber-950/30">
        <CardHeader className="pb-1.5 pt-4 px-4">
          <CardTitle className="text-[13px] font-semibold flex items-center gap-1.5">
            <AlertTriangle size={14} className="text-amber-500" />
            Inventory Alerts
          </CardTitle>
          <CardDescription className="text-[11px]">
            Immediate restocking prerequisites
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-3 pt-1 text-xs max-h-[110px] overflow-y-auto custom-scrollbar space-y-3">
          {loading ? (
            <Skeleton className="h-20 w-full" />
          ) : (
            <div className="space-y-2.5">
              <div className="space-y-2">
                {LOW_STOCK_PRODUCTS.map((prod) => (
                  <div key={prod.id} className="space-y-0.5">
                    <div className="flex justify-between text-[11px] font-medium">
                      <span className="text-muted-foreground truncate max-w-[130px]">
                        {prod.name}
                      </span>
                      <span className="text-amber-600 dark:text-amber-400 font-semibold font-mono">
                        {prod.stock} left
                      </span>
                    </div>
                    <Progress
                      value={(prod.stock / prod.total) * 100}
                      className="h-0.5 bg-muted [&>div]:bg-amber-500"
                    />
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-dashed border-muted space-y-1.5">
                <div className="text-[10px] font-semibold text-rose-500 tracking-wider uppercase flex items-center gap-1">
                  <XCircle size={10} /> Out of Stock (Missed Demand)
                </div>
                <div className="space-y-1">
                  {OUT_OF_STOCK_PRODUCTS.map((prod) => (
                    <div
                      key={prod.id}
                      className="flex justify-between items-center text-[11px] font-medium py-0.5"
                    >
                      <span className="text-muted-foreground truncate max-w-[140px]">
                        {prod.name}
                      </span>
                      <span className="text-rose-600 font-bold font-mono bg-rose-50 dark:bg-rose-950/40 px-1 rounded text-[10px]">
                        -{prod.missedDemands} hits
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsTier;
