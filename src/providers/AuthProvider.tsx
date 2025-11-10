import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { isAxiosError } from "axios";
import type { AuthUser, LoginPayload, LoginResponse, Permission, Role } from "../types/auth";
import type { StoredAuthState } from "../lib/auth-storage";
import { clearAuthState, loadAuthState, persistAuthState } from "../lib/auth-storage";
import { login as loginRequest, logout as logoutRequest } from "../services/auth-service";
import { AuthContext, type AuthContextValue } from "../contexts/auth-context";

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  roles: string[];
  roleDetails: Role[];
  permissions: Set<string>;
  permissionDetails: Permission[];
  isAuthenticating: boolean;
}

const INITIAL_STATE: AuthState = {
  user: null,
  token: null,
  roles: [],
  roleDetails: [],
  permissions: new Set<string>(),
  permissionDetails: [],
  isAuthenticating: true,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthState>(INITIAL_STATE);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = loadAuthState();
    if (!stored) {
      setState((prev) => ({ ...prev, isAuthenticating: false }));
      return;
    }

    setState({
      user: stored.user,
      token: stored.token,
      roles: stored.roles,
      roleDetails: [],
      permissions: new Set(stored.permissions),
      permissionDetails: stored.permissionDetails ?? [],
      isAuthenticating: false,
    });
  }, []);

  const applyAuthResponse = useCallback((response: LoginResponse) => {
    const permissionItems = response.roles.flatMap(
      (role) => role.permissions ?? []
    );
    const permissions = permissionItems.map((permission) => permission.name);

    const uniquePermissions = Array.from(new Set(permissions));
    const permissionMap = new Map<number, Permission>();
    permissionItems.forEach((permission) => {
      if (!permissionMap.has(permission.id)) {
        permissionMap.set(permission.id, permission);
      }
    });
    const uniquePermissionDetails = Array.from(permissionMap.values());

    const newState: AuthState = {
      user: response.user,
      token: response.auth_token,
      roles: response.roles.map((role) => role.name),
      roleDetails: response.roles,
      permissions: new Set(uniquePermissions),
      permissionDetails: uniquePermissionDetails,
      isAuthenticating: false,
    };

    const storageState: StoredAuthState = {
      token: newState.token!,
      user: newState.user!,
      roles: newState.roles,
      permissions: uniquePermissions,
      permissionDetails: uniquePermissionDetails,
      storedAt: Date.now(),
    };

    persistAuthState(storageState);
    setState(newState);
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      setState((prev) => ({ ...prev, isAuthenticating: true }));
      try {
        const response = await loginRequest(payload);
        applyAuthResponse(response);
        const origin = (location.state as { from?: string } | undefined)?.from;
        navigate(origin ?? "/", { replace: true });
      } catch (error) {
        setState((prev) => ({ ...prev, isAuthenticating: false }));
        if (isAxiosError(error)) {
          const message =
            (error.response?.data as { message?: string } | undefined)?.message ??
            "Invalid credentials. Please check your email and password.";
          throw new Error(message);
        }
        throw error instanceof Error
          ? error
          : new Error("Unable to login. Please try again later.");
      }
    },
    [applyAuthResponse, location.state, navigate]
  );

  const logout = useCallback(async () => {
    try {
      await logoutRequest();
    } catch (error) {
      console.warn("Logout request failed", error);
    }
    clearAuthState();
    setState({
      ...INITIAL_STATE,
      isAuthenticating: false,
      permissions: new Set(),
    });
    navigate("/login", { replace: true });
  }, [navigate]);

  const hasPermission = useCallback(
    (permission: string) => state.permissions.has(permission),
    [state.permissions]
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) => permissions.some((permission) => hasPermission(permission)),
    [hasPermission]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      isAuthenticated: Boolean(state.token),
      login,
      logout,
      hasPermission,
      hasAnyPermission,
    }),
    [hasAnyPermission, hasPermission, login, logout, state]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

