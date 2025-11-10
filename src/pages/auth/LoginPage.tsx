import { FormEvent, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { Moon, Sun } from "lucide-react";

const LoginPage = () => {
  const { login, isAuthenticating } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    try {
      await login({ email, password });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to login, please verify your credentials."
      );
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-border bg-card p-8 shadow-2xl shadow-primary/10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Welcome back
            </p>
            <h1 className="text-3xl font-semibold text-foreground">
              Admin Dashboard
            </h1>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-full border border-border p-2 text-foreground transition hover:bg-secondary"
            aria-label="Toggle theme"
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="admin@egtiaz.com"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-foreground shadow-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isAuthenticating}
            className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAuthenticating ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

