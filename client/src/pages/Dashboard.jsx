import React, { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, ShoppingBag, Users,
  DollarSign, Package, ArrowRight, MoreHorizontal,
  ArrowUpRight,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";

/* ── data ── */
const CHART_DATA = [
  { date: "2024-04-01", revenue: 32000, orders: 210 },
  { date: "2024-04-08", revenue: 41000, orders: 280 },
  { date: "2024-04-15", revenue: 38000, orders: 245 },
  { date: "2024-04-22", revenue: 52000, orders: 320 },
  { date: "2024-05-01", revenue: 48000, orders: 295 },
  { date: "2024-05-08", revenue: 61000, orders: 380 },
  { date: "2024-05-15", revenue: 55000, orders: 340 },
  { date: "2024-05-22", revenue: 67000, orders: 410 },
  { date: "2024-06-01", revenue: 59000, orders: 370 },
  { date: "2024-06-08", revenue: 72000, orders: 450 },
  { date: "2024-06-15", revenue: 68000, orders: 420 },
  { date: "2024-06-22", revenue: 81000, orders: 500 },
  { date: "2024-06-30", revenue: 75000, orders: 460 },
];

const CHART_CONFIG = {
  revenue: { label: "Revenue", color: "var(--primary)" },
  orders:  { label: "Orders",  color: "var(--muted-foreground)" },
};

const STATS = [
  { label: "Total Revenue", value: "৳4,82,350", change: "+12.5%", up: true,  icon: DollarSign  },
  { label: "Total Orders",  value: "1,284",     change: "+8.2%",  up: true,  icon: ShoppingBag },
  { label: "Customers",     value: "3,921",     change: "+5.1%",  up: true,  icon: Users       },
  { label: "Products",      value: "246",       change: "-2.4%",  up: false, icon: Package     },
];

const ORDERS = [
  { id: "#ORD-001", customer: "Rahim Uddin",   initials: "RU", product: "AirPods Pro",      amount: "৳12,500", status: "Delivered",  date: "Jun 18" },
  { id: "#ORD-002", customer: "Fatema Khatun", initials: "FK", product: "Attar Rose Oud",   amount: "৳2,800",  status: "Processing", date: "Jun 18" },
  { id: "#ORD-003", customer: "Karim Hossain", initials: "KH", product: "Smart Watch X1",   amount: "৳8,200",  status: "Shipped",    date: "Jun 17" },
  { id: "#ORD-004", customer: "Sumaiya Akter", initials: "SA", product: "Wireless Charger", amount: "৳1,950",  status: "Pending",    date: "Jun 17" },
  { id: "#ORD-005", customer: "Tariq Islam",   initials: "TI", product: "BT Speaker",       amount: "৳4,100",  status: "Delivered",  date: "Jun 16" },
];

const STATUS_CLS = {
  Delivered:  "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  Processing: "bg-blue-50   text-blue-700   dark:bg-blue-950/60   dark:text-blue-400",
  Shipped:    "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400",
  Pending:    "bg-amber-50  text-amber-700  dark:bg-amber-950/60  dark:text-amber-400",
};

/* ── stat card skeleton ── */
const StatSkeleton = () => (
  <Card className="shadow-none">
    <CardContent className="p-5 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-9 w-9 rounded-lg" />
      </div>
      <Skeleton className="h-7 w-28" />
      <Skeleton className="h-3 w-32" />
    </CardContent>
  </Card>
);

const RowSkeleton = () => (
  <TableRow>
    {[...Array(6)].map((_, i) => (
      <TableCell key={i} className={i === 0 ? "pl-5" : ""}>
        <Skeleton className="h-3.5 w-full max-w-[120px]" />
      </TableCell>
    ))}
    <TableCell><Skeleton className="h-7 w-7 rounded-lg" /></TableCell>
  </TableRow>
);

/* ── Chart range filter ── */
const filterByRange = (data, range) => {
  const ref = new Date("2024-06-30");
  const days = range === "30d" ? 30 : range === "7d" ? 7 : 90;
  const start = new Date(ref);
  start.setDate(start.getDate() - days);
  return data.filter((d) => new Date(d.date) >= start);
};

/* ── Dashboard ── */
const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("90d");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const filtered = filterByRange(CHART_DATA, range);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Welcome back, Mehadi — here's what's happening.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5 text-xs">
          Download report <ArrowUpRight size={12} />
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <StatSkeleton key={i} />)
          : STATS.map(({ label, value, change, up, icon: Icon }) => (
              <Card key={label} className="shadow-none">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">{label}</p>
                      <p className="text-2xl font-semibold mt-1 tracking-tight">{value}</p>
                    </div>
                    <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center">
                      <Icon size={16} className="text-muted-foreground" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3">
                    {up
                      ? <TrendingUp size={13} className="text-emerald-500" />
                      : <TrendingDown size={13} className="text-rose-500" />}
                    <span className={`text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                      {change}
                    </span>
                    <span className="text-xs text-muted-foreground">vs last month</span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Revenue chart — shadcn ChartContainer */}
      <Card className="shadow-none @container/card">
        <CardHeader className="flex flex-row items-start justify-between gap-4">
          <div>
            <CardTitle className="text-sm font-semibold">Revenue Overview</CardTitle>
            <CardDescription className="mt-0.5">
              {range === "90d" ? "Last 3 months" : range === "30d" ? "Last 30 days" : "Last 7 days"}
            </CardDescription>
          </div>
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-36 h-8 text-xs" size="sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="px-2 pb-4 sm:px-6">
          {loading ? (
            <Skeleton className="h-[220px] w-full rounded-lg" />
          ) : (
            <ChartContainer config={CHART_CONFIG} className="h-[220px] w-full">
              <AreaChart data={filtered} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false} axisLine={false} tickMargin={8} minTickGap={32}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  dataKey="revenue" type="natural"
                  stroke="var(--primary)" strokeWidth={2}
                  fill="url(#revGrad)" dot={false}
                />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Recent orders */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">Recent Orders</CardTitle>
            <CardDescription className="mt-0.5">Latest 5 transactions</CardDescription>
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
                <TableHead className="text-xs hidden sm:table-cell">Product</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs hidden md:table-cell">Date</TableHead>
                <TableHead className="pr-4 w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? [...Array(5)].map((_, i) => <RowSkeleton key={i} />)
                : ORDERS.map((o) => (
                    <TableRow key={o.id} className="hover:bg-muted/40 transition-colors">
                      <TableCell className="pl-5 py-3.5 text-sm font-medium">{o.id}</TableCell>
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
                      <TableCell className="py-3.5 text-sm text-muted-foreground hidden sm:table-cell">{o.product}</TableCell>
                      <TableCell className="py-3.5 text-sm font-medium">{o.amount}</TableCell>
                      <TableCell className="py-3.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${STATUS_CLS[o.status]}`}>
                          {o.status}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 text-sm text-muted-foreground hidden md:table-cell">{o.date}</TableCell>
                      <TableCell className="pr-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
                              <MoreHorizontal size={14} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 text-sm">
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit order</DropdownMenuItem>
                            <DropdownMenuItem className="text-rose-500 focus:text-rose-500">Cancel</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
