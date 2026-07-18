// src/components/dashboard/ChartsGrid.jsx
import React, { useState } from "react";
import { useRevenueAnalytics } from "@/hooks/useAdminAnalytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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

// --- সময়ের রেঞ্জ অপশন — এখন সরাসরি ব্যাকএন্ডের range প্যারামের সাথে ম্যাপ করা ---
const RANGE_OPTIONS = [
  { key: "day", label: "Day" },
  { key: "week", label: "Week" },
  { key: "month", label: "Month" },
  { key: "3month", label: "3 Months" },
];

// রেঞ্জ অনুযায়ী X-axis এ কীভাবে তারিখ ফরম্যাট হবে (backend যে dateFormat পাঠায় সেটার সাথে মিলিয়ে)
const formatTick = (dateStr, range) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr; // পার্স না হলে raw স্ট্রিং ফেরত

  if (range === "day") {
    return d.toLocaleTimeString("en-US", { hour: "numeric" });
  }
  if (range === "week") {
    return d.toLocaleDateString("en-US", { weekday: "short" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const PIE_DATA = [
  { name: "April Sales", value: 163000, color: "#f43f5e" },
  { name: "May Sales", value: 231000, color: "#0ea5e9" },
  { name: "June Sales", value: 890000, color: "#6366f1" },
];

const RADAR_DATA = [
  { subject: "Vol. Velocity", A: 120, B: 90 },
  { subject: "Margin Ratio", A: 98, B: 130 },
  { subject: "Retention", A: 86, B: 110 },
  { subject: "Market Reach", A: 135, B: 100 },
  { subject: "Support Res.", A: 110, B: 120 },
  { subject: "Conversion", A: 140, B: 95 },
];

// টাইম-রেঞ্জ ড্রপডাউন
const RangeSelector = ({ value, onChange }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger className="h-8 w-[130px] text-xs font-medium border-gray-200 bg-white shadow-sm focus:ring-0 focus:ring-offset-0">
      <SelectValue />
    </SelectTrigger>
    <SelectContent align="end">
      {RANGE_OPTIONS.map((opt) => (
        <SelectItem key={opt.key} value={opt.key} className="text-xs">
          {opt.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
);

const ChartsGrid = () => {
  const [range, setRange] = useState("week");
  const { data: response, isLoading, isError } = useRevenueAnalytics(range);
  const chartData = response?.data ?? [];
  // console.log(response);


  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-[280px] w-full" />
          <Skeleton className="h-[280px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* টাইম-রেঞ্জ ফিল্টার */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Overview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Revenue & orders trend
          </p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {isError && (
        <p className="text-xs text-rose-500">
          Couldn't load analytics. Please try again.
        </p>
      )}

      {/* Row 1: Area & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-none border-muted">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan-500" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6">
            {chartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                No revenue data for this period
              </div>
            ) : (
              <ChartContainer config={{}} className="h-[200px] w-full">
                <AreaChart
                  data={chartData}
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
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
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
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => formatTick(v, range)}
                    minTickGap={20}
                  />
                  <ChartTooltip
                    cursor={{ stroke: "#0ea5e9", strokeWidth: 1 }}
                    content={<ChartTooltipContent indicator="dot" />}
                  />
                  <Area
                    dataKey="revenue"
                    type="monotone"
                    stroke="#0ea5e9"
                    strokeWidth={2}
                    fill="url(#vibrantRevGrad)"
                  />
                </AreaChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-muted">
          <CardHeader>
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              Orders Volume
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-4 sm:px-6">
            {chartData.length === 0 ? (
              <div className="h-[200px] flex items-center justify-center text-xs text-muted-foreground">
                No order data for this period
              </div>
            ) : (
              <ChartContainer config={{}} className="h-[200px] w-full">
                <BarChart
                  data={chartData}
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
                    tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                    tickFormatter={(v) => formatTick(v, range)}
                    minTickGap={20}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent indicator="line" />}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#6366f1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                  />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Pie & Radar Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Monthly Revenue Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row items-center justify-around gap-4 pb-6">
            <div className="w-[180px] h-[180px]">
              <ChartContainer config={{}} className="w-full h-full">
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
                    {PIE_DATA.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>
            <div className="space-y-2.5 text-xs w-full max-w-[200px]">
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
                    <span className="text-muted-foreground font-medium">
                      {item.name}
                    </span>
                  </div>
                  <span className="font-semibold text-foreground">
                    ৳{item.value.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              Operational Performance Matrix
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center pb-4">
            <ChartContainer
              config={{}}
              className="h-[200px] w-full max-w-[360px]"
            >
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChartsGrid;
