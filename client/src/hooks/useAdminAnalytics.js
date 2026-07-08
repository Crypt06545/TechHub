import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardStats,
  getRevenueAnalytics,
  getTopProducts,
  getRecentOrders,
  getAdminOrders,
  updateOrderStatus,
} from "@/api/admin.api";

export const useDashboardStats = () =>
  useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 60 * 1000,
  });

export const useAdminOrders = (filters = {}, cursor = null, limit = 20) =>
  useQuery({
    queryKey: ["admin-orders", filters, cursor, limit],
    queryFn: () =>
      getAdminOrders({
        limit,
        cursor: cursor || undefined,
        payment_status: filters.payment_status || undefined,
        order_status: filters.order_status || undefined,
        search: filters.search || undefined,
        sort: filters.sort || undefined,
      }),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => updateOrderStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });
};
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
