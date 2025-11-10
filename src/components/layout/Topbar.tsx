import { LogOut, Menu, Moon, Sun } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../hooks/useTheme";
import { useState } from "react";

interface TopbarProps {
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Topbar = ({ onToggleSidebar }: TopbarProps) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#173468]/40 via-white/12 to-[#C7A46A]/40 px-6 shadow-[0_14px_44px_-18px_rgba(23,52,104,0.55)] backdrop-blur-2xl transition duration-500">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-lg border border-white/20 bg-white/10 p-2 text-muted-foreground transition hover:border-[#C7A46A]/40 hover:bg-[#173468]/20 lg:hidden"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Welcome back
          </p>
          <p className="text-lg font-semibold text-foreground">
            {user?.name ?? "Admin"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-full border border-white/20 bg-white/10 p-2 text-muted-foreground transition hover:border-[#C7A46A]/40 hover:bg-[#173468]/25"
          aria-label="Toggle color theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#173468] via-[#1f4b8f] to-[#C7A46A] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03] focus:scale-[1.03] disabled:opacity-60"
        >
          <LogOut size={16} />
          {isLoggingOut ? "Signing out..." : "Logout"}
        </button>
      </div>
    </header>
  );
};

