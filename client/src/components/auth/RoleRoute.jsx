import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { hasFunctionalDashboardAccess } from "./dashboardRouting";

export default function RoleRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    return <Navigate to="/unauthorized" replace />;
  }

  if (allowedRoles.includes(user.role)) {
    return <Outlet />;
  }

  if (hasFunctionalDashboardAccess(user, location.pathname)) {
    return <Outlet />;
  }

  return <Navigate to="/unauthorized" replace />;
}
