import axios from "axios";
import { deduplicateRequest, retryRequest, withTimeout } from "./requestGuard.js";

// Production API URL - always use this in production
const PRODUCTION_API_URL = "http://localhost:5005/api"; 
// const PRODUCTION_API_URL = "https://dr-law.developteam.site/api";

// Use environment variable only if it's not localhost, otherwise force production URL
const getApiUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL;
  
  // In production mode, always use production URL
  if (import.meta.env.PROD) {
    return PRODUCTION_API_URL;
  }
  
  // In development, allow localhost if explicitly set
  if (envUrl && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    return envUrl; // Allow localhost only in development
  }
  
  // If env URL is set and not localhost, use it
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }
  
  // Default to production URL
  return PRODUCTION_API_URL;
};

const API_URL = getApiUrl();

// Log API URL to help debug
console.log('🔗 API URL:', API_URL, '(Mode:', import.meta.env.MODE + ')');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 300000, // 5 minutes timeout for large file uploads (videos can be up to 5GB)
});

api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("auth_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Don't set Content-Type for FormData - let axios set it automatically with boundary
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
        // Increase timeout for file uploads (especially videos)
        config.timeout = 600000; // 10 minutes for large file uploads
      }
      return config;
    } catch (error) {
      console.error("Error in request interceptor:", error);
      return Promise.reject(error);
    }
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 429 (Too Many Requests) - rate limiting
    if (error.response?.status === 429) {
      const retryAfter = error.response.headers['retry-after'] || 2;
      console.warn(`⚠️ Rate limit exceeded. Retrying after ${retryAfter} seconds...`);
      
      // Retry after delay
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      
      // Retry the request (only once to prevent infinite loops)
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        return api.request(originalRequest);
      }
    }
    
    // Handle 401 (Unauthorized) - Token expired or invalid
    if (error.response?.status === 401) {
      const isLoginPage = window.location.pathname === "/login" || 
                          window.location.pathname === "/student/login";
      const isAuthEndpoint = originalRequest?.url?.includes("/auth/login") || 
                            originalRequest?.url?.includes("/auth/register");
      const isVerifyingToken = originalRequest?.url?.includes("/auth/me");
      const isRefreshToken = originalRequest?.url?.includes("/auth/refresh");

      // Only clear auth data if it's a real authentication error (not during login/register)
      // Don't clear on token verification failures - let the app handle it
      if (!isAuthEndpoint && !isLoginPage && !isVerifyingToken && !isRefreshToken) {
        // Check if error message indicates token expiration
        const errorMessage = error.response?.data?.message || '';
        const isTokenExpired = errorMessage.toLowerCase().includes('expired') || 
                              errorMessage.toLowerCase().includes('invalid token');
        
        // Only clear and redirect if token is actually expired/invalid
        if (isTokenExpired) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          
          // Redirect to login if not already there
          const isStudentRoute = window.location.pathname.startsWith("/dashboard");
          const isAdminRoute = window.location.pathname.startsWith("/admin");
          
          if (isStudentRoute) {
            window.location.href = "/student/login";
          } else if (isAdminRoute) {
            window.location.href = "/login";
          } else {
            window.location.href = "/login";
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// Wrap API methods with deduplication for GET requests
const originalGet = api.get;
api.get = function(url, config = {}) {
  return deduplicateRequest(
    (cfg) => originalGet.call(this, url, cfg),
    { method: 'GET', url, ...config }
  );
};

export default api;
