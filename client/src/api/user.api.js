import api from "./Axios";

export const registerUser = async (data) => {
  const res = await api.post("/users/register", data);
  return res.data;
};

export const loginUser = async (data) => {
  const res = await api.post("/users/login", data);
  return res.data;
};

export const getUser = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const logoutUser = async () => {
  const res = await api.post("/users/logout");
  return res.data;
};

export const updateUserProfile = async (data) => {
  const res = await api.put("/users/update-details", data);
  return res.data;
};

export const updateAvatar = async (formData) => {
  const res = await api.patch("/users/update-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const forgotPassword = async (data) => {
  const res = await api.post("/users/forgot-password", data);
  return res.data;
};

export const verifyForgotPasswordOtp = async (data) => {
  const res = await api.post("/users/verify-forgot-password-otp", data);
  return res.data;
};

export const resetPassword = async (data) => {
  const res = await api.post("/users/reset-password", data);
  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await api.post("/users/verify-email", { token });
  return res.data;
};
