import type { ReactNode } from "react";
import { Outlet } from "react-router-dom";
import DashboardIndexRedirect from "../routes/DashboardIndexRedirect";
import AdminListPage from "../pages/admin/AdminListPage";
import AdminCreatePage from "../pages/admin/AdminCreatePage";
import AdminDetailPage from "../pages/admin/AdminDetailPage";
import AdminEditPage from "../pages/admin/AdminEditPage";
import ModeratorsPage from "../pages/moderators/ModeratorsPage";
import EmployeesPage from "../pages/employees/EmployeesPage";
import EmployeeDetailPage from "../pages/employees/EmployeeDetailPage";
import UsersPage from "../pages/users/UsersPage";
import CompaniesPage from "../pages/companies/CompaniesPage";
import PaymentAccountsPage from "../pages/payment-accounts/PaymentAccountsPage";
import IqamaTypesPage from "../pages/iqama-types/IqamaTypesPage";
import StagesPage from "../pages/stages/StagesPage";
import LeavesPage from "../pages/leaves/LeavesPage";
import EosPage from "../pages/eos/EosPage";
import ReportsPage from "../pages/reports/ReportsPage";
import RolesPage from "../pages/roles/RolesPage";

export interface RouteConfig {
  path?: string;
  index?: boolean;
  permission?: string;
  element?: ReactNode;
  children?: RouteConfig[];
}

export const DASHBOARD_ROUTES: RouteConfig[] = [
  {
    index: true,
    element: <DashboardIndexRedirect />,
  },
  {
    path: "admins",
    permission: "admins",
    children: [
      {
        index: true,
        element: <AdminListPage />,
      },
      {
        path: "create",
        element: <AdminCreatePage />,
      },
      {
        path: ":id",
        element: <AdminDetailPage />,
      },
      {
        path: ":id/edit",
        element: <AdminEditPage />,
      },
    ],
  },
  {
    path: "moderators",
    permission: "moderators",
    element: <ModeratorsPage />,
  },
  {
    path: "users",
    permission: "users",
    element: <UsersPage />,
  },
  {
    path: "employees",
    permission: "employees",
    children: [
      {
        index: true,
        element: <EmployeesPage />,
      },
      {
        path: ":id",
        element: <EmployeeDetailPage />,
      },
    ],
  },
  {
    path: "companies",
    permission: "companies",
    element: <CompaniesPage />,
  },
  {
    path: "payment-accounts",
    permission: "paymentAccounts",
    element: <PaymentAccountsPage />,
  },
  {
    path: "iqama-types",
    permission: "iqamaTypes",
    element: <IqamaTypesPage />,
  },
  {
    path: "stages",
    permission: "stages",
    element: <StagesPage />,
  },
  {
    path: "leaves",
    permission: "leaves",
    element: <LeavesPage />,
  },
  {
    path: "eos",
    permission: "eos",
    element: <EosPage />,
  },
  {
    path: "reports",
    permission: "reports",
    element: <ReportsPage />,
  },
  {
    path: "roles",
    permission: "roles",
    element: <RolesPage />,
  },
];

export const ensureElement = (node?: ReactNode) => node ?? <Outlet />;

