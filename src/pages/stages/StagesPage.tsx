import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const StagesPage = () => {
  return (
    <PermissionGuard permission="stages">
      <ApiDataGrid
        title="Workflow Stages"
        description="Configure and monitor processing stages for onboarding, visa, or payroll workflows."
        endpoint="/stages"
        queryKey={["stages"]}
      />
    </PermissionGuard>
  );
};

export default StagesPage;

