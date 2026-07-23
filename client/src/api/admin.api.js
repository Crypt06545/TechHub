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

export const getAdminProducts = async (params) => {
  const res = await api.get("/admin/products", { params });
  return res.data;
};

export const getAdminOrders = async (params) => {
  const res = await api.get("/admin/orders", { params });
  return res.data;
};

export const getAdminCategories = async () => {
  const res = await api.get("/admin/categories");
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

export const createProduct = async (formData) => {
  const res = await api.post("/admin/products", formData);
  return res.data;
};

export const updateProduct = async ({ id, formData }) => {
  const res = await api.put(`/admin/products/${id}`, formData);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/admin/products/${id}`);
  return res.data;
};

export const toggleFeaturedProduct = async (id) => {
  const res = await api.patch(`/admin/products/${id}/featured`);
  return res.data;
};
