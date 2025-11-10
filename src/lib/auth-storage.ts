import type { AuthUser, Permission } from "../types/auth";

const STORAGE_KEY = "egtiaz_admin_portal_auth";

export interface StoredAuthState {
  token: string;
  user: AuthUser;
  roles: string[];
  permissions: string[];
  permissionDetails?: Permission[];
  storedAt: number;
}

export const loadAuthState = (): StoredAuthState | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as StoredAuthState;
    return parsed.token ? parsed : null;
  } catch (error) {
    console.warn("Failed to parse auth state", error);
    return null;
  }
};

export const persistAuthState = (state: StoredAuthState) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ ...state, storedAt: Date.now() })
  );
};

export const clearAuthState = () => {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(STORAGE_KEY);
};

export const getStoredToken = (): string | null => {
  return loadAuthState()?.token ?? null;
};

