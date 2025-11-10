import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const IqamaTypesPage = () => {
  return (
    <PermissionGuard permission="iqamaTypes">
      <ApiDataGrid
        title="Iqama Types"
        description="Maintain iqama categories and requirements for expatriate employees."
        endpoint="/iqama-types"
        queryKey={["iqama-types"]}
      />
    </PermissionGuard>
  );
};

export default IqamaTypesPage;

