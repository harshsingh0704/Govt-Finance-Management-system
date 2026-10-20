const normalize = (value) =>
  typeof value === "string"
    ? value.trim().toLowerCase().replace(/[\s_-]+/g, " ")
    : "";

export function getFunctionalDashboard(user) {
  if (!user || typeof user !== "object") return null;

  const employee =
    user.employee && typeof user.employee === "object"
      ? user.employee
      : {};

  const assignment =
    user.functionalAssignment ??
    user.functionalRole ??
    user.assignedFunctionalRole ??
    employee.functionalAssignment ??
    employee.functionalRole ??
    employee.assignedFunctionalRole;

  const value = normalize(assignment);

  const destinations = {
    "finance clerk": "/admin/finance-clerk",
    "finance officer": "/admin/finance-officer",
    hod: "/admin/head-of-department",
    "head of department": "/admin/head-of-department",
    hoa: "/admin/head-of-office",
    "head of office": "/admin/head-of-office",
  };

  return destinations[value] || null;
}

export function getDashboardDestination(user, fallbackRole) {
  const role = normalize(user?.role ?? fallbackRole);

  const destinations = {
    establishment: "/super-admin",
    "super admin": "/super-admin",
    admin: "/admin",
    "head of office": "/admin/head-of-office",
    hoa: "/admin/head-of-office",
    "head of department": "/admin/head-of-department",
    hod: "/admin/head-of-department",
    "finance officer": "/finance-officer",
    "finance clerk": "/admin/finance-clerk",
    employee: "/dashboard",
  };

  return destinations[role] || "/unauthorized";
}

export function hasFunctionalDashboardAccess(user, pathname) {
  if (!user) return false;

  const role = normalize(user.role);
  const assignedDashboard = getFunctionalDashboard(user);

  if (role === "employee") {
    return Boolean(assignedDashboard && assignedDashboard === pathname);
  }

  return getDashboardDestination(user) === pathname;
}
