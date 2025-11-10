import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { EmployeeTable } from "../../components/employees/EmployeeTable";
import {
  type Employee,
  listEmployees,
} from "../../services/employee-service";
import { PermissionGuard } from "../../routes/PermissionGuard";

const EmployeesPage = () => {
  const [page] = useState(1);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["employees", page],
    queryFn: () => listEmployees({ page }),
    keepPreviousData: true,
  });

  const employees: Employee[] = data?.data ?? [];

  return (
    <PermissionGuard permission="employees">
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              Employees
            </h1>
            <p className="text-sm text-white/70">
              View and manage all company employees, contract information, and documents.
            </p>
          </div>
        </div>

        <EmployeeTable
          employees={employees}
          isLoading={isLoading}
          isError={isError}
          onRetry={() => refetch()}
        />
      </section>
    </PermissionGuard>
  );
};

export default EmployeesPage;

