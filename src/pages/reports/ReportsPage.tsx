import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const ReportsPage = () => {
  return (
    <PermissionGuard permission="reports">
      <ApiDataGrid
        title="Reports & Analytics"
        description="Generate performance dashboards, export data, and review KPIs."
        endpoint="/reports/employees"
        queryKey={["reports", "employees"]}
      />
    </PermissionGuard>
  );
};

export default ReportsPage;

