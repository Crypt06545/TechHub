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
  getAdminProductById,
  getAdminCoupons,
  getAdminCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponActive,
  getInventorySummary,
  getLowStockProducts,
  restockProduct,
  adjustStock,
  getStockLogs,
  deleteExpense,
  updateExpense,
  createExpense,
  getExpenseBreakdown,
  getExpenses,
  getMonthlyRevenue,
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

export const useAdminProductDetails = (id) =>
  useQuery({
    queryKey: ["admin-product", id],
    queryFn: () => getAdminProductById(id),
    enabled: !!id,
    staleTime: 0,
  });

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useToggleFeaturedProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFeaturedProduct,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["products"],
      });
    },
  });
};

export const useMonthlyRevenue = (months = 6) =>
  useQuery({
    queryKey: ["monthly-revenue", months],
    queryFn: () => getMonthlyRevenue(months),
    staleTime: 5 * 60 * 1000,
  });

export const useDashboardStats = (range = "week") =>
  useQuery({
    queryKey: ["dashboard-stats", range],
    queryFn: () => getDashboardStats(range),
    staleTime: 60 * 1000,
    placeholderData: (previousData) => previousData,
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
      queryClient.invalidateQueries({
        queryKey: ["admin-orders"],
      });
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

export const useAdminCoupons = (filters = {}, cursor = null, limit = 20) =>
  useQuery({
    queryKey: ["admin-coupons", filters, cursor, limit],

    queryFn: () =>
      getAdminCoupons({
        limit,
        cursor: cursor || undefined,
        isActive: filters.isActive ?? undefined,
        search: filters.search || undefined,
      }),

    staleTime: 30 * 1000,

    placeholderData: (previousData) => previousData,
  });

export const useAdminCouponDetails = (id) =>
  useQuery({
    queryKey: ["admin-coupon", id],

    queryFn: () => getAdminCouponById(id),

    enabled: !!id,
  });

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCoupon,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });
    },
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCoupon,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });
    },
  });
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCoupon,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });
    },
  });
};

export const useInventorySummary = () =>
  useQuery({
    queryKey: ["inventory-summary"],

    queryFn: getInventorySummary,

    staleTime: 60 * 1000,
  });

export const useLowStockProducts = () =>
  useQuery({
    queryKey: ["low-stock-products"],

    queryFn: getLowStockProducts,

    staleTime: 60 * 1000,
  });

// ─────────────────────────────────────────────
// Stock Logs
// ─────────────────────────────────────────────

export const useStockLogs = (params = {}) =>
  useQuery({
    queryKey: ["stock-logs", params.productId],

    queryFn: () => getStockLogs(params),

    enabled: !!params.productId,

    staleTime: 30 * 1000,
  });

export const useRestockProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: restockProduct,

    onSuccess: (_, { id }) => {
      // Narrow invalidation — only the queries this action could actually
      // change, not a blanket refetch of unrelated admin data.

      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["inventory-summary"],
      });

      queryClient.invalidateQueries({
        queryKey: ["low-stock-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["stock-logs", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-product", id],
      });
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: adjustStock,

    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({
        queryKey: ["admin-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["inventory-summary"],
      });

      queryClient.invalidateQueries({
        queryKey: ["low-stock-products"],
      });

      queryClient.invalidateQueries({
        queryKey: ["stock-logs", id],
      });

      queryClient.invalidateQueries({
        queryKey: ["admin-product", id],
      });
    },
  });
};

export const useToggleCouponActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCouponActive,

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["admin-coupons"],
      });
    },
  });
};

export const useExpenses = (filters = {}, cursor = null, limit = 20) =>
  useQuery({
    queryKey: ["expenses", filters, cursor, limit],
    queryFn: () =>
      getExpenses({
        limit,
        cursor: cursor || undefined,
        category: filters.category || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      }),
    staleTime: 30 * 1000,
    placeholderData: (previousData) => previousData,
  });

export const useExpenseBreakdown = (range) =>
  useQuery({
    queryKey: ["expense-breakdown", range],
    queryFn: () => getExpenseBreakdown(range),
    staleTime: 60 * 1000,
  });

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-breakdown"] });
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-breakdown"] });
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteExpense,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      queryClient.invalidateQueries({ queryKey: ["expense-breakdown"] });
    },
  });
};
