import React, { useState, useEffect } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCards from "./Dashboard/StatCards";
import MetricsTier from "./Dashboard/MetricsTier";
import ChartsGrid from "./Dashboard/ChartsGrid";
import RecentOrders from "./Dashboard/RecentOrder";

// Sub-components importing


const Dashboard = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

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

      {/* 1. Summary Stat Cards */}
      <StatCards loading={loading} />

      {/* 2. Real-time Operational Metrics Tier (Payment, Inventory, Logistics) */}
      <MetricsTier loading={loading} />

      {/* 3. Analytical Charts Grid (Area, Bar, Pie, Radar) */}
      <ChartsGrid loading={loading} />

      {/* 4. Recent Transactions Table */}
      <RecentOrders loading={loading} />
    </div>
  );
};

export default Dashboard;
