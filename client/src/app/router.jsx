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
import ITCellInchargeDashboard from "../features/admin/it-cell-incharge/ItCellIncharge";
import SampleInchargeDashboard from "../features/admin/sample-incharge/SampleIncharge";
import FacilitiesInchargeDashboard from "../features/admin/facilities-incharge/App";
import FinanceClerkPage from "../features/admin/FinanceClerk/FinanceClerkPage";
import FinanceOfficerPage from "../features/admin/FinanceOfficer/FinanceOfficerPage";
import HeadOfDepartmentPage from "../features/admin/HOD/HeadOfDepartmentPage";
import HeadOfOfficePage from "../features/admin/HOA/HeadOfOfficePage";
import SuperAdminPage from "../features/admin/SuperAdminPage";
import EmployeeManagementPage from "../features/admin/employee-management/EmployeeManagementPage";
import EmployeeAuditLogPage from "../features/admin/employee-management/EmployeeAuditLogPage";
import EmployeeAuditLogDetailPage from "../features/admin/employee-management/EmployeeAuditLogDetailPage";
import MapEmployeePage from "../features/admin/employee-management/MapEmployeePage";
import AccommodationPage from "../features/accommodation/AccommodationPage";
import TAClaimPage from "../features/ta/TAClaimPage";
import TAAdvancePage from "../features/ta/TAAdvancePage";
import LTCClaimPage from "../features/ltc/LTCClaimPage";
import LTCAdvancePage from "../features/ltc/LTCAdvancePage";
import MedicalClaimPage from "../features/medical/MedicalClaimPage";
import MedicalAdvancePage from "../features/medical/MedicalAdvancePage";
import OrganizationHierarchyPage from "../features/admin/employee-management/OrganizationHierarchyPage";

const enableITCellPreview =
  import.meta.env.DEV &&
  import.meta.env.VITE_IT_CELL_PREVIEW === "true";

const enableFacilitiesPreview =
  import.meta.env.DEV &&
  import.meta.env.VITE_FACILITIES_PREVIEW === "true";

export const router = createBrowserRouter([


  ...(enableFacilitiesPreview
    ? [
        {
          path: "/admin/facilities-incharge",
          element: <FacilitiesInchargeDashboard />,
        },
      ]
    : []),
  ...(enableITCellPreview
    ? [
        {
          path: "/admin/it-cell-incharge",
          element: <ITCellInchargeDashboard />,
        },
        {
          path: "/admin/sample-incharge",
          element: <SampleInchargeDashboard />,
        },
      ]
    : []),

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
            path: "/admin/it-cell-incharge",
            element: <ITCellInchargeDashboard />,
          },
          {
            path: "/admin/finance-clerk",
            element: <FinanceClerkPage />,
          },
          {
            path: "/admin/finance-officer",
            element: <FinanceOfficerPage />,
          },
          {
            path: "/admin/head-of-department",
            element: <HeadOfDepartmentPage />,
          },
          {
            path: "/admin/head-of-office",
            element: <HeadOfOfficePage />,
          },
          {
            path: "/admin/employee-management",
            element: <EmployeeManagementPage />,
          },
          {
            path: "/admin/employee-management/audit-log",
            element: <EmployeeAuditLogPage />,
          },
          {
            path: "/admin/employee-management/audit-log/:auditId",
            element: <EmployeeAuditLogDetailPage />,
          },
          {
            path: "/admin/employee-management/map",
            element: <MapEmployeePage />,
          },
          {
           path: "/admin/employee-management/hierarchy",
          element: <OrganizationHierarchyPage />,
},

          {
            path: "/admin/services/accommodation",
            element: <AccommodationPage />,
          },
          {
            path: "/admin/services/medical/claim",
            element: <MedicalClaimPage />,
          },
          {
            path: "/admin/services/medical/advance",
            element: <MedicalAdvancePage />,
          },
          {
            path: "/admin/services/ltc/claim",
            element: <LTCClaimPage />,
          },
          {
            path: "/admin/services/ltc/advance",
            element: <LTCAdvancePage />,
          },
          {
  path: "/admin/services/ta/claim",
  element: <TAClaimPage />,
},          {
            path: "/admin/services/ta/advance",
            element: <TAAdvancePage />,
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











