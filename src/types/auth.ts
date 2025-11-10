export interface AuthUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  type: string | null;
  salary: string;
  image: string | null;
  fcm_token: string | null;
  moderator_company_id: number | null;
  email_verified_at: string | null;
  status: "active" | "inactive" | string;
  is_phone_verified: boolean;
}

export interface Permission {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
  permissions: Permission[];
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
  auth_token: string;
  roles: Role[];
}

export interface LoginPayload {
  email: string;
  password: string;
  remember?: boolean;
}

