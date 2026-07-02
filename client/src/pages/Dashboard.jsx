import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  DollarSign,
  Package,
  ArrowRight,
  MoreHorizontal,
  ArrowUpRight,
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
  AreaChart,
  Area,
  XAxis,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  Legend,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ── Clean & Structured Data ── */
const CHART_DATA = [
  // April Weekly Points
  { date: "2024-04-01", revenue: 32000, orders: 210 },
  { date: "2024-04-08", revenue: 41000, orders: 280 },
  { date: "2024-04-15", revenue: 38000, orders: 245 },
  { date: "2024-04-22", revenue: 52000, orders: 320 },
  // May Weekly Points
  { date: "2024-05-01", revenue: 48000, orders: 295 },
  { date: "2024-05-08", revenue: 61000, orders: 380 },
  { date: "2024-05-15", revenue: 55000, orders: 340 },
  { date: "2024-05-22", revenue: 67000, orders: 410 },
  // June Clean Sequential Daily Data (Last 30 Days)
  { date: "2024-06-01", revenue: 59000, orders: 370 },
  { date: "2024-06-02", revenue: 59000, orders: 370 },
  { date: "2024-06-03", revenue: 59000, orders: 370 },
  { date: "2024-06-04", revenue: 62000, orders: 390 },
  { date: "2024-06-08", revenue: 72000, orders: 450 },
  { date: "2024-06-12", revenue: 65000, orders: 400 },
  { date: "2024-06-15", revenue: 68000, orders: 420 },
  { date: "2024-06-19", revenue: 70000, orders: 435 },
  { date: "2024-06-22", revenue: 81000, orders: 500 },
  { date: "2024-06-24", revenue: 73000, orders: 440 },
  { date: "2024-06-25", revenue: 74000, orders: 445 },
  { date: "2024-06-26", revenue: 71000, orders: 425 },
  { date: "2024-06-27", revenue: 76000, orders: 460 },
  { date: "2024-06-28", revenue: 79000, orders: 485 },
  { date: "2024-06-29", revenue: 83000, orders: 510 },
  { date: "2024-06-30", revenue: 75000, orders: 460 },
];

/* ── Static Segment Aggregated Data ── */
const PIE_DATA = [
  { name: "April Sales", value: 163000, color: "#f43f5e" }, // Vibrant Rose
  { name: "May Sales", value: 231000, color: "#0ea5e9" }, // Sky Blue
  { name: "June Sales", value: 890000, color: "#6366f1" }, // Deep Indigo
];

const RADAR_DATA = [
  { subject: "Vol. Velocity", A: 120, B: 90, fullMark: 150 },
  { subject: "Margin Ratio", A: 98, B: 130, fullMark: 150 },
  { subject: "Retention", A: 86, B: 110, fullMark: 150 },
  { subject: "Market Reach", A: 135, B: 100, fullMark: 150 },
  { subject: "Support Res.", A: 110, B: 120, fullMark: 150 },
  { subject: "Conversion", A: 140, B: 95, fullMark: 150 },
];

/* ── Configuration Styles ── */
const CHART_CONFIG = {
  revenue: { label: "Revenue", color: "#0ea5e9" },
  orders: { label: "Orders", color: "#6366f1" },
  target: { label: "Target Profile", color: "#f43f5e" },
  actual: { label: "Actual Profile", color: "#0ea5e9" },
};

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

const ORDERS = [
  {
    id: "#ORD-001",
    customer: "Rahim Uddin",
    initials: "RU",
    product: "AirPods Pro",
    amount: "৳12,500",
    status: "Delivered",
    date: "Jun 18",
  },
  {
    id: "#ORD-002",
    customer: "Fatema Khatun",
    initials: "FK",
    product: "Attar Rose Oud",
    amount: "৳2,800",
    status: "Processing",
    date: "Jun 18",
  },
  {
    id: "#ORD-003",
    customer: "Karim Hossain",
    initials: "KH",
    product: "Smart Watch X1",
    amount: "৳8,200",
    status: "Shipped",
    date: "Jun 17",
  },
  {
    id: "#ORD-004",
    customer: "Sumaiya Akter",
    initials: "SA",
    product: "Wireless Charger",
    amount: "৳1,950",
    status: "Pending",
    date: "Jun 17",
  },
  {
    id: "#ORD-005",
    customer: "Tariq Islam",
    initials: "TI",
    product: "BT Speaker",
    amount: "৳4,100",
    status: "Delivered",
    date: "Jun 16",
  },
];

const STATUS_CLS = {
  Delivered:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
  Processing:
    "bg-blue-50   text-blue-700   dark:bg-blue-950/60   dark:text-blue-400",
  Shipped:
    "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-400",
  Pending:
    "bg-amber-50  text-amber-700  dark:bg-amber-950/60  dark:text-amber-400",
};

const filterByRange = (data, range) => {
  const ref = new Date("2024-06-30");

  if (range === "day") {
    return data.filter((d) => d.date === "2024-06-30");
  }

  const start = new Date(ref);
  if (range === "7d") start.setDate(start.getDate() - 7);
  else if (range === "30d") start.setDate(start.getDate() - 30);
  else if (range === "90d") start.setDate(start.getDate() - 90);

  let filtered = data.filter((d) => new Date(d.date) >= start);

  if (range === "90d") {
    filtered = filtered.filter((d) => {
      const day = new Date(d.date).getDate();
      if (d.date.startsWith("2024-06-")) {
        return [1, 8, 15, 22, 30].includes(day);
      }
      return true;
    });
  }

  if (range === "30d") {
    filtered = filtered.filter((d) => {
      const day = new Date(d.date).getDate();
      return [1, 4, 8, 12, 15, 19, 22, 26, 30].includes(day);
    });
  }

  return filtered;
};

const getRangeSubtitle = (range) => {
  switch (range) {
    case "day":
      return "Today's performance";
    case "7d":
      return "Last 7 days (Daily)";
    case "30d":
      return "Last 30 days (Month)";
    case "90d":
      return "Last 3 months (Weekly trends)";
    default:
      return "";
  }
};

/* ── Dashboard Component ── */
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

      {/* Global Range Selector */}
      <div className="flex justify-end">
        <Select value={range} onValueChange={setRange}>
          <SelectTrigger className="w-44 h-8 text-xs" size="sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Today</SelectItem>
            <SelectItem value="7d">Every Day (7 Days)</SelectItem>
            <SelectItem value="30d">Month (30 Days)</SelectItem>
            <SelectItem value="90d">Last 3 Months</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Grid Row 1: Line & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Area Chart */}
        <Card className="shadow-none @container/card border-teal-100/40 dark:border-teal-900/20">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
              Revenue Overview
            </CardTitle>
            <CardDescription className="mt-0.5">
              {getRangeSubtitle(range)}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6">
            {loading ? (
              <Skeleton className="h-[200px] w-full rounded-lg" />
            ) : (
              <ChartContainer
                config={CHART_CONFIG}
                className="h-[200px] w-full"
              >
                <AreaChart
                  data={filtered}
                  margin={{ top: 4, right: 6, left: 6, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="vibrantRevGrad"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor="#0ea5e9"
                        stopOpacity={0.25}
                      />
                      <stop
                        offset="95%"
                        stopColor="#6366f1"
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-muted/70"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <ChartTooltip
                    cursor={{
                      stroke: "#0ea5e9",
                      strokeWidth: 1,
                      strokeDasharray: "4 4",
                    }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fill="url(#vibrantRevGrad)"
                    dot={
                      range === "day" || range === "7d"
                        ? { r: 4, fill: "#0ea5e9", strokeWidth: 0 }
                        : false
                    }
                    activeDot={{ r: 6, fill: "#6366f1" }}
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        {/* Orders Bar Chart Component */}
        <Card className="shadow-none @container/card border-indigo-100/40 dark:border-indigo-900/20">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Orders Volume
            </CardTitle>
            <CardDescription className="mt-0.5">
              {getRangeSubtitle(range)}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6">
            {loading ? (
              <Skeleton className="h-[200px] w-full rounded-lg" />
            ) : (
              <ChartContainer
                config={CHART_CONFIG}
                className="h-[200px] w-full"
              >
                <BarChart
                  data={filtered}
                  margin={{ top: 4, right: 6, left: 6, bottom: 0 }}
                >
                  <CartesianGrid
                    vertical={false}
                    strokeDasharray="3 3"
                    className="stroke-muted/70"
                  />
                  <XAxis
                    dataKey="date"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) =>
                      new Date(v).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                  />
                  <ChartTooltip
                    cursor={{ fill: "rgba(99, 102, 241, 0.05)" }}
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={range === "7d" || range === "day" ? 36 : 20}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Grid Row 2: Pie & Radar Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Distribution Pie Chart */}
        <Card className="shadow-none border-rose-100/40 dark:border-rose-900/20">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-rose-500" />
              Monthly Revenue Distribution
            </CardTitle>
            <CardDescription className="mt-0.5">
              Total Share split across historical months
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-4 pb-6">
            {loading ? (
              <Skeleton className="h-[180px] w-[180px] rounded-full" />
            ) : (
              <>
                <div className="w-[180px] h-[180px]">
                  <ChartContainer
                    config={CHART_CONFIG}
                    className="w-full h-full"
                  >
                    <PieChart>
                      <ChartTooltip
                        content={<ChartTooltipContent nameKey="name" />}
                      />
                      <Pie
                        data={PIE_DATA}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {PIE_DATA.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </div>
                <div className="space-y-2.5 text-sm w-full max-w-[200px]">
                  {PIE_DATA.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground font-medium text-xs">
                          {item.name}
                        </span>
                      </div>
                      <span className="font-semibold text-xs text-foreground">
                        ৳{item.value.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Performance Matrix Radar Chart */}
        <Card className="shadow-none border-sky-100/40 dark:border-sky-900/20">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Operational Performance Matrix
            </CardTitle>
            <CardDescription className="mt-0.5">
              Multi-dimensional operational capability scaling
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-4">
            {loading ? (
              <Skeleton className="h-[200px] w-full rounded-lg" />
            ) : (
              <ChartContainer
                config={CHART_CONFIG}
                className="h-[200px] w-full max-w-[360px]"
              >
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="70%"
                  data={RADAR_DATA}
                >
                  <PolarGrid className="stroke-muted" />
                  <PolarAngleAxis
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: "var(--muted-foreground)" }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Radar
                    name="Target Profile"
                    dataKey="B"
                    stroke="#f43f5e"
                    fill="#f43f5e"
                    fillOpacity={0.05}
                  />
                  <Radar
                    name="Actual Profile"
                    dataKey="A"
                    stroke="#0ea5e9"
                    fill="#0ea5e9"
                    fillOpacity={0.2}
                  />
                  <Legend
                    tick={{ fontSize: 10 }}
                    wrapperStyle={{ bottom: -10 }}
                  />
                </RadarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent orders */}
      <Card className="shadow-none">
        <CardHeader className="flex flex-row items-center justify-between px-5 pt-5 pb-3">
          <div>
            <CardTitle className="text-sm font-semibold">
              Recent Orders
            </CardTitle>
            <CardDescription className="mt-0.5">
              Latest 5 transactions
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
    </div>
  );
};

/* ── Skeletons ── */
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
    <TableCell>
      <Skeleton className="h-7 w-7 rounded-lg" />
    </TableCell>
  </TableRow>
);

export default Dashboard;
