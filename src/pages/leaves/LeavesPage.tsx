import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const LeavesPage = () => {
  return (
    <PermissionGuard permission="leaves">
      <ApiDataGrid
        title="Leave Management"
        description="Track leave balances, approvals, and history for employees."
        endpoint="/leaves"
        queryKey={["leaves"]}
      />
    </PermissionGuard>
  );
};

export default LeavesPage;

