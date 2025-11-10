import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const CompaniesPage = () => {
  return (
    <PermissionGuard permission="companies">
      <ApiDataGrid
        title="Companies"
        description="Register and maintain company profiles, licensing, and compliance status."
        endpoint="/companies"
        queryKey={["companies"]}
      />
    </PermissionGuard>
  );
};

export default CompaniesPage;

