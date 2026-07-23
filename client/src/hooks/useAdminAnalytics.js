import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getDashboardStats,
  getRevenueAnalytics,
  getTopProducts,
  getRecentOrders,
  getAdminOrders,
  updateOrderStatus,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeaturedProduct,
  getAdminCategories,
  getAdminProducts,
} from "@/api/admin.api";

export const useAdminCategories = () =>
  useQuery({
    queryKey: ["admin-categories"],
    queryFn: getAdminCategories,
    staleTime: 15 * 60 * 1000,
  });

export const useAdminProducts = (filters = {}, cursor = null, limit = 12) =>
  useQuery({
    queryKey: ["admin-products", filters, cursor, limit],
    queryFn: () =>
      getAdminProducts({
        limit,
        cursor: cursor || undefined,
        search: filters.search || undefined,
        category: filters.category || undefined,
        status: filters.status || undefined,
        isFeatured: filters.isFeatured ?? undefined,
        sort: filters.sort || undefined,
      }),
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

export const useToggleFeaturedProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleFeaturedProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

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
