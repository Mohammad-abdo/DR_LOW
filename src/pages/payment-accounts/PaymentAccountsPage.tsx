import { PermissionGuard } from "../../routes/PermissionGuard";
import { ApiDataGrid } from "../../components/common/ApiDataGrid";

const PaymentAccountsPage = () => {
  return (
    <PermissionGuard permission="paymentAccounts">
      <ApiDataGrid
        title="Payment Accounts"
        description="Manage bank accounts and payment channels used for employee payroll and settlements."
        endpoint="/payment-accounts"
        queryKey={["payment-accounts"]}
      />
    </PermissionGuard>
  );
};

export default PaymentAccountsPage;

