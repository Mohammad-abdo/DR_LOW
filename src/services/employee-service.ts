import apiClient from "./api-client";

export interface EmployeeCompany {
  id: number;
  name: string;
  description?: string | null;
  status?: string | null;
  banner_image?: string | null;
  image_url?: string | null;
}

export interface Employee {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  status?: string | null;
  address?: string | null;
  passport_number?: string | null;
  expired_date?: string | null;
  salary?: string | null;
  job_title?: string | null;
  national_id?: string | null;
  iqama_number?: string | null;
  iqamaType?: {
    id: number;
    name: {
      ar: string;
      en: string;
    };
    description?: {
      ar: string;
      en: string;
    };
    created_at?: string;
    updated_at?: string;
  } | null;
  upcomingStage?: EmployeeStage | null;
  employeeStages?: EmployeeStage[];
  company?: EmployeeCompany | null;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeStageFile {
  id: number;
  path?: string;
  url?: string;
}

export interface EmployeeStage {
  id: number;
  employee_id: number;
  stage_id: number;
  status: string;
  completed_at: string | null;
  done_by: number | null;
  expired_at: string | null;
  options: unknown;
  currently_type: number | null;
  created_at: string;
  updated_at: string;
  files: EmployeeStageFile[];
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

interface EmployeeListResponse {
  success: boolean;
  data: Employee[];
  meta: PaginatedResponse<Employee>["meta"];
}

interface EmployeeDetailResponse {
  success: boolean;
  data: Employee;
}

export const listEmployees = async (
  params?: Record<string, unknown>
): Promise<PaginatedResponse<Employee>> => {
  const { data } = await apiClient.get<EmployeeListResponse>("/employees", {
    params,
  });

  return {
    data: data.data,
    meta: data.meta,
  };
};

export const getEmployee = async (
  id: string | number
): Promise<Employee> => {
  const { data } = await apiClient.get<EmployeeDetailResponse>(
    `/employees/${id}`
  );
  return data.data;
};

