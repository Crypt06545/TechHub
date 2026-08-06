import api from "./Axios";

export const getProducts = async (params) => {
  const res = await api.get("/products", { params });
  return res.data;
};

export const getProductFilters = async () => {
  const res = await api.get("/products/filters");
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get("/products/categories");
  return res.data;
};

// ONE function for every homepage section. type = "featured" or any
// badge value ("Hot Deal", "New Arrival", "Best Seller", ...).
export const getProductSection = async (type) => {
  const res = await api.get(`/products/section/${encodeURIComponent(type)}`);
  return res.data;
};

export const getProductDetails = async (slug) => {
  const res = await api.get(`/products/${slug}`);
  return res.data;
};
