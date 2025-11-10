import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const RolesPage = () => {
  return (
    <PermissionGuard permission="roles">
      <ApiDataGrid
        title="Roles & Permissions"
        description="Define role templates, assign permissions, and audit access changes."
        endpoint="/roles"
        queryKey={["roles"]}
      />
    </PermissionGuard>
  );
};

export default RolesPage;

