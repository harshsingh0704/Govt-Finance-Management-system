import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function RootRedirect() {
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const effectiveRole = (user && user.role) || role;

  if (effectiveRole === "super_admin") {
    return <Navigate to="/super-admin" replace />;
  }

  if (effectiveRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return <Navigate to="/dashboard" replace />;
}
