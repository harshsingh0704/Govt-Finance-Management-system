import { Navigate, createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import RoleRoute from "../components/auth/RoleRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import UnauthorizedPage from "../features/auth/pages/UnauthorizedPage";

import DashboardPage from "../features/dashboard/DashboardPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },

  {
    path: "/signup",
    element: <SignupPage />,
  },

  {
    path: "/unauthorized",
    element: <UnauthorizedPage />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/dashboard",
        element: (
          <RoleRoute allowedRoles={["employee", "admin"]} />
        ),
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
        ],
      },
    ],
  },

  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },

  {
    path: "*",
    element: <Navigate to="/dashboard" replace />,
  },
]);