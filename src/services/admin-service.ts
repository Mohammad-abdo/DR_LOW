import apiClient from "./api-client";

export interface Admin {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  image?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface AdminPayload {
  name: string;
  email: string;
  phone?: string | null;
  password?: string;
  password_confirmation?: string;
  status?: string;
  permissions?: Array<string | number>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta?: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
}

export const listAdmins = async (
  params?: Record<string, unknown>
): Promise<PaginatedResponse<Admin>> => {
  const { data } = await apiClient.get<PaginatedResponse<Admin>>("/admins", {
    params,
  });
  return data;
};

export const getAdmin = async (id: string | number): Promise<Admin> => {
  const { data } = await apiClient.get<Admin>(`/admins/${id}`);
  return data;
};

export const createAdmin = async (payload: AdminPayload): Promise<Admin> => {
  const { data } = await apiClient.post<Admin>("/admins", payload);
  return data;
};

export const updateAdmin = async (
  id: string | number,
  payload: AdminPayload
): Promise<Admin> => {
  const { data } = await apiClient.post<Admin>(`/admins/update/${id}`, payload);
  return data;
};

export const deleteAdmin = async (id: string | number): Promise<void> => {
  await apiClient.delete(`/admins/${id}`);
};

