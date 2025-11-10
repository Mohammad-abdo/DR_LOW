import { NavLink, useLocation } from "react-router-dom";
import { NAV_ITEMS } from "../../config/navigation";
import { useAuth } from "../../hooks/useAuth";
import { cn } from "../../lib/utils";
import egtiazLogo from "../../assets/egtiaz-logo.svg";

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const { hasPermission } = useAuth();
  const location = useLocation();

  const allowedItems = NAV_ITEMS.filter((item) =>
    hasPermission(item.permission)
  );

  return (
    <aside className="flex h-full flex-col gap-6 border-r border-white/10 bg-gradient-to-br from-white/20 via-white/5 to-white/0 p-5 text-sidebar-foreground shadow-xl backdrop-blur-2xl transition-[background] duration-500 dark:from-white/10 dark:via-white/5 dark:to-white/0">
      <div className="flex items-center gap-2 px-2">
        <img
          src={egtiazLogo}
          alt="Egtiaz Typing & Document Clearing"
          className="w-40 drop-shadow-[0_6px_20px_rgba(23,52,104,0.35)]"
        />
      </div>
      <nav className="flex flex-1 flex-col gap-1">
        {allowedItems.map(({ label, to, icon: Icon, description }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={onNavigate}
              className={({ isActive: routeActive }) =>
                cn(
                  "group flex flex-col gap-1 rounded-xl border border-transparent px-3 py-2 transition-all hover:border-white/30 hover:bg-white/15 hover:text-sidebar-accent-foreground",
                  (isActive || routeActive) &&
                    "border-white/30 bg-white/20 text-sidebar-primary-foreground shadow-lg"
                )
              }
            >
              <span className="flex items-center gap-2 text-sm font-medium">
                <span className="rounded-lg bg-gradient-to-br from-[#173468]/80 via-white/10 to-[#C7A46A]/70 p-1.5 text-sidebar-primary shadow-lg transition group-hover:scale-110">
                  <Icon size={16} />
                </span>
                {label}
              </span>
              {description ? (
                <span className="text-xs text-muted-foreground/80">
                  {description}
                </span>
              ) : null}
            </NavLink>
          );
        })}
        {allowedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 px-3 py-4 text-sm text-muted-foreground">
            No modules available. Contact your administrator.
          </div>
        ) : null}
      </nav>
    </aside>
  );
};

