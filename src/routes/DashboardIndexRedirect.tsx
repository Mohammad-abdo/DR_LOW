import { Navigate } from "react-router-dom";
import { NAV_ITEMS } from "../config/navigation";
import { useAuth } from "../hooks/useAuth";

const DashboardIndexRedirect = () => {
  const { hasPermission } = useAuth();
  const firstAccessible = NAV_ITEMS.find((item) =>
    hasPermission(item.permission)
  );

  if (!firstAccessible) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Navigate to={firstAccessible.to} replace />;
};

export default DashboardIndexRedirect;

