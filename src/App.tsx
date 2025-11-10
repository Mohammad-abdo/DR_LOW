import { Outlet, Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/auth/LoginPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import UnauthorizedPage from "./pages/UnauthorizedPage";
import NotFoundPage from "./pages/NotFoundPage";
import { DASHBOARD_ROUTES, type RouteConfig, ensureElement } from "./config/routes";
import { PermissionGuard } from "./routes/PermissionGuard";

const renderRoutes = (routes: RouteConfig[], parentKey = "route") =>
  routes.map((route, index) => {
    let element = route.element;

    if (route.children && !element) {
      element = <Outlet />;
    }

    element = ensureElement(element);

    if (route.permission) {
      element = (
        <PermissionGuard permission={route.permission}>{element}</PermissionGuard>
      );
    }

    const key = route.path ?? `${parentKey}-index-${index}`;

    return (
      <Route
        key={key}
        path={route.path}
        index={route.index}
        element={element}
      >
        {route.children ? renderRoutes(route.children, key) : null}
      </Route>
    );
  });

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {renderRoutes(DASHBOARD_ROUTES)}
        </Route>
      </Route>

      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
