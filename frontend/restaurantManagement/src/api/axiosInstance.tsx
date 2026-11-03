import axios from "axios";
import { session } from "./auth";

const axiosInstance = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Tự động đính kèm token nếu đã đăng nhập
axiosInstance.interceptors.request.use((config) => {
  const token = session.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý 401 khi token hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && session.token) {
      session.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
