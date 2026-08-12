import api from "./Axios";

export const checkCoupon = async (data) => {
  const res = await api.post("/coupons/check", data);
  return res.data;
};
