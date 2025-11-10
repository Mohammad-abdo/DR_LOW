import {
  BadgeDollarSign,
  Building2,
  CalendarCheck,
  CreditCard,
  FileBadge,
  FileText,
  Flag,
  Shield,
  SquareStack,
  UserCog,
  UserCircle,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

export interface NavItem {
  label: string;
  to: string;
  permission: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  description?: string;
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: "Admins",
    to: "/admins",
    permission: "admins",
    icon: Shield,
    description: "Manage all administrator accounts",
  },
  {
    label: "Moderators",
    to: "/moderators",
    permission: "moderators",
    icon: UserCog,
    description: "Assign and control moderators",
  },
  {
    label: "Users",
    to: "/users",
    permission: "users",
    icon: UserCircle,
    description: "Handle internal user accounts",
  },
  {
    label: "Employees",
    to: "/employees",
    permission: "employees",
    icon: Users,
    description: "Track company employees",
  },
  {
    label: "Companies",
    to: "/companies",
    permission: "companies",
    icon: Building2,
    description: "Manage company records",
  },
  {
    label: "Payment Accounts",
    to: "/payment-accounts",
    permission: "paymentAccounts",
    icon: CreditCard,
    description: "Configure payroll payment channels",
  },
  {
    label: "Iqama Types",
    to: "/iqama-types",
    permission: "iqamaTypes",
    icon: FileBadge,
    description: "Maintain iqama categories",
  },
  {
    label: "Workflow Stages",
    to: "/stages",
    permission: "stages",
    icon: Flag,
    description: "Customize processing pipelines",
  },
  {
    label: "Leave Requests",
    to: "/leaves",
    permission: "leaves",
    icon: CalendarCheck,
    description: "Approve and track staff leave",
  },
  {
    label: "End of Service",
    to: "/eos",
    permission: "eos",
    icon: BadgeDollarSign,
    description: "Calculate EOS settlements",
  },
  {
    label: "Reports",
    to: "/reports",
    permission: "reports",
    icon: FileText,
    description: "Insights & analytics",
  },
  {
    label: "Roles",
    to: "/roles",
    permission: "roles",
    icon: SquareStack,
    description: "Configure access levels",
  },
];

