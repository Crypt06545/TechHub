import { useQuery } from "@tanstack/react-query";
import {
  getDashboardStats,
  getRevenueAnalytics,
  getTopProducts,
  getRecentOrders,
} from "@/api/admin.api";

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000,
  });

export const useRevenueAnalytics = (range) =>
  useQuery({
    queryKey: ["revenue-analytics", range],
    queryFn: () => getRevenueAnalytics(range),
    staleTime: 2 * 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useTopProducts = (limit = 10) =>
  useQuery({
    queryKey: ["top-products", limit],
    queryFn: () => getTopProducts(limit),
    staleTime: 5 * 60 * 1000,
  });

export const useRecentOrders = (limit = 5) =>
  useQuery({
    queryKey: ["recent-orders", limit],
    queryFn: () => getRecentOrders(limit),
    staleTime: 60 * 1000,
  });
