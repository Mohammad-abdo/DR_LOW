import apiClient from "./api-client";
import type { LoginPayload, LoginResponse } from "../types/auth";

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>("/login", payload);
  return data;
};

export const logout = async () => {
  try {
    await apiClient.post("/logout");
  } catch (error) {
    // Optional: backend might not support logout endpoint; swallow silently.
    console.warn("Logout request failed", error);
  }
};

