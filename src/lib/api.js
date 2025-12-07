import axios from "axios";

// Use environment variable for API URL, fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5005/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 600000, // 10 minutes timeout for large file uploads (videos)
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't set Content-Type for FormData - let axios set it automatically with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect if we're already on login page or if it's during token verification
      const isLoginPage = window.location.pathname === "/login";
      const isVerifyingToken = error.config?.url?.includes("/auth/me");

      // Clear auth data
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");

      // Only redirect if not on login page and not during token verification
      // Token verification will be handled by AuthContext
      if (!isLoginPage && !isVerifyingToken) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
