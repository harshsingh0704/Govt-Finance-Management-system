import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export default function RoleRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useSelector(
    (state) => state.auth,
  );

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}