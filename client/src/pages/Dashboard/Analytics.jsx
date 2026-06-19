import React, { useState, useEffect } from "react";
import {
  TrendingUp, TrendingDown, Users, RefreshCw,
  DollarSign, ShoppingCart, MousePointerClick,
} from "lucide-react";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ToggleGroup, ToggleGroupItem,
} from "@/components/ui/toggle-group";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent,
} from "@/components/ui/chart";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell, ResponsiveContainer,
} from "recharts";

/* ── data ── */
const MONTHLY = [
  { date: "2024-04-01", revenue: 32000, orders: 210, customers: 180 },
  { date: "2024-04-08", revenue: 41000, orders: 280, customers: 240 },
  { date: "2024-04-15", revenue: 38000, orders: 245, customers: 200 },
  { date: "2024-04-22", revenue: 52000, orders: 320, customers: 290 },
  { date: "2024-05-01", revenue: 48000, orders: 295, customers: 260 },
  { date: "2024-05-08", revenue: 61000, orders: 380, customers: 340 },
  { date: "2024-05-15", revenue: 55000, orders: 340, customers: 310 },
  { date: "2024-05-22", revenue: 67000, orders: 410, customers: 370 },
  { date: "2024-06-01", revenue: 59000, orders: 370, customers: 330 },
  { date: "2024-06-08", revenue: 72000, orders: 450, customers: 400 },
  { date: "2024-06-15", revenue: 68000, orders: 420, customers: 380 },
  { date: "2024-06-22", revenue: 81000, orders: 500, customers: 445 },
  { date: "2024-06-30", revenue: 75000, orders: 460, customers: 420 },
];

const WEEKLY = [
  { date: "2024-06-24", revenue: 8200,  orders: 52,  customers: 44 },
  { date: "2024-06-25", revenue: 9400,  orders: 61,  customers: 55 },
  { date: "2024-06-26", revenue: 7800,  orders: 48,  customers: 42 },
  { date: "2024-06-27", revenue: 11000, orders: 74,  customers: 66 },
  { date: "2024-06-28", revenue: 14200, orders: 92,  customers: 83 },
  { date: "2024-06-29", revenue: 16500, orders: 108, customers: 97 },
  { date: "2024-06-30", revenue: 12300, orders: 79,  customers: 71 },
];

const TRAFFIC = [
  { name: "Organic", value: 38, color: "hsl(var(--foreground))"          },
  { name: "Social",  value: 27, color: "hsl(var(--muted-foreground))"    },
  { name: "Direct",  value: 21, color: "hsl(var(--border))"              },
  { name: "Referral",value: 14, color: "hsl(var(--accent-foreground)/0.3)" },
];

const TOP_PRODUCTS = [
  { name: "AirPods Pro",       revenue: 84500, growth: "+18%", pos: true  },
  { name: "Smart Watch X1",   revenue: 61200, growth: "+12%", pos: true  },
  { name: "Attar Rose Oud",   revenue: 42000, growth: "+24%", pos: true  },
  { name: "BT Speaker",       revenue: 38400, growth: "+8%",  pos: true  },
  { name: "Wireless Charger", revenue: 29800, growth: "-3%",  pos: false },
];

const KPI = [
  { label: "Avg Order Value", value: "৳3,756", change: "+6.2%",  up: true,  icon: DollarSign      },
  { label: "Conversion Rate", value: "4.8%",   change: "+0.9%",  up: true,  icon: MousePointerClick},
  { label: "Return Rate",     value: "2.1%",   change: "-0.4%",  up: false, icon: RefreshCw       },
  { label: "New Customers",   value: "342",    change: "+14.3%", up: true,  icon: Users           },
];

const filterData = (data, range) => {
  const ref = new Date("2024-06-30");
  const days = range === "30d" ? 30 : range === "7d" ? 7 : 90;
  const start = new Date(ref);
  start.setDate(start.getDate() - days);
  return data.filter((d) => new Date(d.date) >= start);
};

const CHART_CONFIG = {
  revenue:   { label: "Revenue",   color: "var(--primary)"           },
  orders:    { label: "Orders",    color: "var(--muted-foreground)"  },
  customers: { label: "Customers", color: "var(--primary)"           },
};

const fmtDate = (v) =>
  new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" });

/* ── Skeletons ── */
const KpiSkeleton = () => (
  <Card className="shadow-none">
    <CardContent className="p-4 space-y-3">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-7 rounded-md" />
      </div>
      <Skeleton className="h-6 w-20" />
      <Skeleton className="h-3 w-16" />
    </CardContent>
  </Card>
);

const ChartSkeleton = ({ h = 240 }) => (
  <Skeleton className={`w-full rounded-lg`} style={{ height: h }} />
);

/* ── Analytics ── */
const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState("90d");

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const data = range === "7d"
    ? WEEKLY
    : filterData(MONTHLY, range);

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Performance overview for TechHub & Senzo.
          </p>
        </div>

        {/* Range toggle — desktop */}
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single" value={range} onValueChange={(v) => v && setRange(v)}
            variant="outline" size="sm"
            className="hidden @[600px]/main:flex"
          >
            <ToggleGroupItem value="7d"  className="text-xs px-3">7 days</ToggleGroupItem>
            <ToggleGroupItem value="30d" className="text-xs px-3">30 days</ToggleGroupItem>
            <ToggleGroupItem value="90d" className="text-xs px-3">3 months</ToggleGroupItem>
          </ToggleGroup>
          {/* Mobile select */}
          <Select value={range} onValueChange={setRange}>
            <SelectTrigger className="w-36 h-8 text-xs @[600px]/main:hidden">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <KpiSkeleton key={i} />)
          : KPI.map(({ label, value, change, up, icon: Icon }) => (
              <Card key={label} className="shadow-none">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground font-medium">{label}</p>
                    <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
                      <Icon size={13} className="text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xl font-semibold tracking-tight">{value}</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    {up
                      ? <TrendingUp size={11} className="text-emerald-500" />
                      : <TrendingDown size={11} className="text-rose-500" />}
                    <span className={`text-xs font-medium ${up ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                      {change}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>

      {/* Revenue & Orders — dual axis line chart */}
      <Card className="shadow-none @container/card">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Revenue & Orders</CardTitle>
          <CardDescription>
            {range === "7d" ? "Daily" : range === "30d" ? "Weekly" : "Bi-weekly"} breakdown
          </CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-4 sm:px-6">
          {loading ? <ChartSkeleton h={240} /> : (
            <ChartContainer config={CHART_CONFIG} className="h-[240px] w-full">
              <LineChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false}
                  tickMargin={8} minTickGap={24} tick={{ fontSize: 11 }}
                  tickFormatter={fmtDate} />
                <ChartTooltip
                  cursor={{ stroke: "hsl(var(--border))", strokeWidth: 1 }}
                  content={
                    <ChartTooltipContent
                      labelFormatter={fmtDate}
                      indicator="dot"
                    />
                  }
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line dataKey="revenue" type="natural" stroke="var(--color-revenue)"
                  strokeWidth={2} dot={false} activeDot={{ r: 3.5 }} />
                <Line dataKey="orders" type="natural" stroke="var(--color-orders)"
                  strokeWidth={2} dot={false} strokeDasharray="4 2" activeDot={{ r: 3.5 }} />
              </LineChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Traffic donut */}
        <Card className="lg:col-span-2 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Traffic Sources</CardTitle>
            <CardDescription>Where visitors come from</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loading ? (
              <div className="flex items-center gap-6">
                <Skeleton className="w-[120px] h-[120px] rounded-full" />
                <div className="space-y-3 flex-1">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-3 w-full" />)}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={120} height={120}>
                  <PieChart>
                    <Pie data={TRAFFIC} dataKey="value" cx="50%" cy="50%"
                      innerRadius={36} outerRadius={56} strokeWidth={0} paddingAngle={2}>
                      {TRAFFIC.map((t) => <Cell key={t.name} fill={t.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-2.5 flex-1">
                  {TRAFFIC.map((t) => (
                    <div key={t.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: t.color }} />
                        <span className="text-xs text-muted-foreground">{t.name}</span>
                      </div>
                      <span className="text-xs font-semibold">{t.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card className="lg:col-span-3 shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Top Products</CardTitle>
            <CardDescription>By revenue this period</CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            {loading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <Skeleton className="h-3 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-1.5 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3.5">
                {TOP_PRODUCTS.map((p, i) => {
                  const pct = Math.round((p.revenue / TOP_PRODUCTS[0].revenue) * 100);
                  return (
                    <div key={p.name}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4 text-right">{i + 1}</span>
                          <span className="text-sm font-medium">{p.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-medium ${p.pos ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500"}`}>
                            {p.growth}
                          </span>
                          <span className="text-xs font-semibold w-20 text-right">
                            ৳{p.revenue.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <div className="h-1 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full bg-foreground transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Customer growth */}
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Customer Growth</CardTitle>
          <CardDescription>New customers over time</CardDescription>
        </CardHeader>
        <CardContent className="px-2 pb-4 sm:px-6">
          {loading ? <ChartSkeleton h={180} /> : (
            <ChartContainer config={CHART_CONFIG} className="h-[180px] w-full">
              <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="var(--primary)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="date" tickLine={false} axisLine={false}
                  tickMargin={8} minTickGap={24} tick={{ fontSize: 11 }}
                  tickFormatter={fmtDate} />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent labelFormatter={fmtDate} indicator="dot" />}
                />
                <Area dataKey="customers" type="natural"
                  stroke="var(--color-customers)" strokeWidth={2}
                  fill="url(#custGrad)" dot={false} />
              </AreaChart>
            </ChartContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
