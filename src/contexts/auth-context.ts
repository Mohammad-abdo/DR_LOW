import { createContext } from "react";
import type { AuthUser, LoginPayload, Role, Permission } from "../types/auth";

export interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  roles: string[];
  roleDetails: Role[];
  permissions: Set<string>;
  permissionDetails: Permission[];
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

