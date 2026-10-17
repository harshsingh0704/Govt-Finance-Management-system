import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { getDashboardDestination } from "./dashboardRouting";

export default function RootRedirect() {
  const { user, role, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Navigate
      to={getDashboardDestination(user, role)}
      replace
    />
  );
}
