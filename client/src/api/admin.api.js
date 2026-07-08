import api from "./Axios";

export const getDashboardStats = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

export const getRevenueAnalytics = async (range) => {
  const res = await api.get("/admin/analytics/revenue", { params: { range } });
  return res.data;
};

export const getTopProducts = async (limit) => {
  const res = await api.get("/admin/analytics/top-products", {
    params: { limit },
  });
  return res.data;
};

export const getAdminOrders = async (params) => {
  const res = await api.get("/admin/orders", { params });
  return res.data;
};

export const updateOrderStatus = async (id, payload) => {
  const res = await api.patch(`/admin/orders/${id}/status`, payload);
  return res.data;
};

export const getRecentOrders = async (limit) => {
  const res = await api.get("/admin/orders", { params: { page: 1, limit } });
  return res.data;
};
