import { Navigate, createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import RoleRoute from "../components/auth/RoleRoute";

import LoginPage from "../features/auth/pages/LoginPage";
import SignupPage from "../features/auth/pages/SignupPage";
import UnauthorizedPage from "../features/auth/pages/UnauthorizedPage";

import DashboardPage from "../features/dashboard/DashboardPage";
import AdminPage from "../features/admin/AdminPage";
import SuperAdminPage from "../features/admin/SuperAdminPage";

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
        element: <RoleRoute allowedRoles={["employee"]} />,
        children: [
          {
            path: "/dashboard",
            element: <DashboardPage />,
          },
        ],
      },

      {
        element: <RoleRoute allowedRoles={["admin"]} />,
        children: [
          {
            path: "/admin",
            element: <AdminPage />,
          },
        ],
      },

      {
        element: <RoleRoute allowedRoles={["super_admin"]} />,
        children: [
          {
            path: "/super-admin",
            element: <SuperAdminPage />,
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