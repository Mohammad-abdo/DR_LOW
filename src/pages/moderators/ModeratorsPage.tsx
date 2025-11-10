import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const ModeratorsPage = () => {
  return (
    <PermissionGuard permission="moderators">
      <ApiDataGrid
        title="Moderators"
        description="Create and manage moderator users, assign them to companies, and control their access."
        endpoint="/moderators"
        queryKey={["moderators"]}
      />
    </PermissionGuard>
  );
};

export default ModeratorsPage;

