import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1/`,
  withCredentials: true,
});

let isRefreshing = false;
let refreshQueue = [];
let sessionExpired = false;

const processQueue = (error) => {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(),
  );
  refreshQueue = [];
};

export const resetSessionExpired = () => {
  sessionExpired = false;
};

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    const isAuthEndpoint =
      originalRequest?.url?.includes("/users/login") ||
      originalRequest?.url?.includes("/users/refresh-token");

    if (
      status !== 401 ||
      isAuthEndpoint ||
      originalRequest._retry ||
      sessionExpired
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      }).then(() => {
        originalRequest._retry = true;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await api.post("/users/refresh-token");
      processQueue(null);
      sessionExpired = false;
      return api(originalRequest);
    } catch (refreshError) {
      sessionExpired = true;
      processQueue(refreshError);
      window.dispatchEvent(new Event("auth:logout"));
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default api;
