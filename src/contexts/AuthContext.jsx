import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const verifyToken = async (tokenToVerify) => {
    try {
      const response = await api.get("/auth/me");
      // Backend returns: { success: true, data: { user: {...} } }
      const userData = response.data?.data?.user || response.data?.user;
      
      if (!userData) {
        throw new Error("Invalid response structure");
      }
      
      // Normalize role to lowercase for frontend compatibility
      const userRole = (userData.role || 'admin').toLowerCase();
      
      const userWithRole = {
        ...userData,
        role: userRole,
      };
      
      // Update localStorage with the verified user data
      localStorage.setItem("auth_user", JSON.stringify(userWithRole));
      setUser(userWithRole);
      setToken(tokenToVerify);
    } catch (error) {
      console.error("Token verification failed:", error);
      // Only clear if it's an authentication error (401)
      if (error.response?.status === 401) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setUser(null);
        setToken(null);
      } else {
        // For other errors, keep the stored data but mark as not verified
        console.warn("Token verification failed but keeping stored data:", error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("auth_token");
      const storedUser = localStorage.getItem("auth_user");

      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Normalize role to lowercase for frontend compatibility
          const userRole = (parsedUser.role || 'admin').toLowerCase();
          
          const userWithRole = {
            ...parsedUser,
            role: userRole,
          };
          
          // Set user and token immediately to prevent redirect during verification
          setToken(storedToken);
          setUser(userWithRole);
          
          // Verify token in background
          await verifyToken(storedToken);
        } catch (error) {
          console.error("Error parsing stored user:", error);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("auth_user");
          setUser(null);
          setToken(null);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email, password, role = "ADMIN") => {
    try {
      console.log(email, password, role);
      const response = await api.post("/auth/login", { email, password, role });
      const data = response.data.data || response.data;
      const newToken = data.accessToken || data.token;
      const newUser = data.user;

      // Normalize role to lowercase for frontend compatibility
      const userRole = (newUser.role || role).toLowerCase();

      const userWithRole = {
        ...newUser,
        role: userRole,
      };

      localStorage.setItem("auth_token", newToken);
      localStorage.setItem("auth_user", JSON.stringify(userWithRole));

      setToken(newToken);
      setUser(userWithRole);
    } catch (error) {
      throw new Error(error.response?.data?.message || error.response?.data?.error || "Login failed");
    }
  };

  const logout = async () => {
    try {
      // Clear state first to prevent any new requests
      setUser(null);
      setToken(null);
      
      // Clear all auth-related data from localStorage
      localStorage.removeItem("auth_token");
      localStorage.removeItem("auth_user");
      
      // Clear axios default headers if api is available
      try {
        if (api && api.defaults && api.defaults.headers) {
          delete api.defaults.headers.common['Authorization'];
        }
      } catch (headerError) {
        // Ignore errors when clearing headers
        console.warn("Could not clear axios headers:", headerError);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      // Force clear even if there's an error
      try {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        setUser(null);
        setToken(null);
      } catch (clearError) {
        console.error("Critical error clearing auth data:", clearError);
      }
    }
  };

  const isAdmin = user?.role === "admin" || (user?.role_names && user.role_names.includes("admin"));
  const isDoctor = user?.role === "doctor" || (user?.role_names && user.role_names.includes("doctor"));
  const isRepresentative = user?.role === "representative" || (user?.role_names && user.role_names.includes("representative"));
  const isUser = !isAdmin && !isDoctor && !isRepresentative;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        isAdmin,
        isDoctor,
        isRepresentative,
        isUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
