import { createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "../components/auth/ProtectedRoute";
import RoleRoute from "../components/auth/RoleRoute";
import RootRedirect from "../components/auth/RootRedirect";

import LoginPage from "../features/auth/pages/LoginPage";
import UnauthorizedPage from "../features/auth/pages/UnauthorizedPage";

import DashboardPage from "../features/dashboard/DashboardPage";
import ProfilePage from "../features/profile/ProfilePage";
import ClaimsPage from "../features/claims/pages/ClaimsPage";
import AdminPage from "../features/admin/AdminPage";
import SuperAdminPage from "../features/admin/SuperAdminPage";
import EmployeeManagementPage from "../features/admin/employee-management/EmployeeManagementPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
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
          { path: "/dashboard", element: <DashboardPage /> },
          { path: "/profile", element: <ProfilePage /> },
          { path: "/claims", element: <ClaimsPage /> },
        ],
      },
      {
        element: <RoleRoute allowedRoles={["admin"]} />,
        children: [
          {
            path: "/admin",
            element: <AdminPage />,
          },
          {
            path: "/admin/employee-management",
            element: <EmployeeManagementPage />,
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
    element: <RootRedirect />,
  },
  {
    path: "*",
    element: <RootRedirect />,
  },
]);
