
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getDashboardDestination } from "./dashboardRouting";

export default function RootRedirect() {
  const { user, role, isAuthenticated } = useSelector(
    (state) => state.auth
  );

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const destination = getDashboardDestination(user, role);

  return <Navigate to={destination} replace />;
}
