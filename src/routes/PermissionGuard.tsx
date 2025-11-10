import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
}

export const PermissionGuard = ({
  permission,
  children,
}: PermissionGuardProps) => {
  const { hasPermission } = useAuth();
  const location = useLocation();

  if (!hasPermission(permission)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{ from: location.pathname, permission }}
      />
    );
  }

  return <>{children}</>;
};

