import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const UsersPage = () => {
  return (
    <PermissionGuard permission="users">
      <ApiDataGrid
        title="Users"
        description="Handle internal user accounts, invitations, and status changes."
        endpoint="/users"
        queryKey={["users"]}
      />
    </PermissionGuard>
  );
};

export default UsersPage;

