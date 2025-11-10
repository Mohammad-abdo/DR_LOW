import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const UnauthorizedPage = () => {
  const location = useLocation() as {
    state?: { from?: string; permission?: string };
  };
  const { permission } = location.state ?? {};
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-foreground">
          Access Restricted
        </h1>
        <p className="text-muted-foreground">
          You do not have the required permission
          {permission ? ` (${permission})` : ""} to view this page.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          to="/"
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          Go to Dashboard
        </Link>
        <button
          onClick={logout}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage;

