import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold text-foreground">404</h1>
        <p className="text-muted-foreground">
          The page you are looking for does not exist or has been moved.
        </p>
      </div>
      <Link
        to="/"
        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;

