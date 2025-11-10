import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../components/layout/Sidebar";
import { Topbar } from "../components/layout/Topbar";

export const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="glow-gradient relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-foreground transition-colors duration-700 lg:flex-row dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen dark:mix-blend-normal">
        <div className="floating-orb absolute -left-24 top-10 h-72 w-72 rounded-full bg-gradient-to-br from-primary/40 via-indigo-400/20 to-cyan-300/20 blur-3xl dark:from-primary/30 dark:via-indigo-500/20 dark:to-cyan-400/20" />
        <div className="floating-orb delay-1 absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-gradient-to-tr from-rose-400/35 via-purple-400/30 to-primary/25 blur-[160px]" />
        <div className="floating-orb delay-2 absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-bl from-cyan-400/20 via-sky-400/12 to-indigo-500/12 blur-[220px]" />
      </div>

      <div
        className={`fixed inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 ease-in-out lg:static lg:flex ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
      </div>

      {isSidebarOpen ? (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen flex-1 flex-col transition-all duration-300">
        <Topbar
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          isSidebarCollapsed={!isSidebarOpen}
        />
        <main className="relative flex-1 overflow-y-auto p-6">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

