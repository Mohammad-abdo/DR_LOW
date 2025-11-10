import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const EosPage = () => {
  return (
    <PermissionGuard permission="eos">
      <ApiDataGrid
        title="End of Service"
        description="Handle end-of-service settlements, gratuity calculations, and approvals."
        endpoint="/eos"
        queryKey={["eos"]}
      />
    </PermissionGuard>
  );
};

export default EosPage;

