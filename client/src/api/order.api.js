import api from "./Axios";

export const placeOrder = async (data) => {
  const res = await api.post("/orders/place", data);
  return res.data;
};

export const getUserOrders = async () => {
  const res = await api.get("/orders");
  return res.data;
};

export const getSingleOrder = async (id) => {
  const res = await api.get(`/orders/${id}`);
  return res.data;
};

// Public — no auth needed, orderId only
export const trackOrder = async (orderId) => {
  const res = await api.get(`/orders/track/${orderId}`);
  return res.data;
};
