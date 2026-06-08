import api from "./Axios";

export const getProducsts = async (params) => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get("/products/categories");
  return res.data;
};

export const getFeaturedProducts = async () => {
  const res = await api.get("/products/featured");
  return res.data;
};

export const getProductDetails = async (slug) => {
  const res = await api.get(`/products/${slug}`);
  return res.data;
};
