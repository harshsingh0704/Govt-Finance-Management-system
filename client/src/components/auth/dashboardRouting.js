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

  // Explicit API assignment fields only.
  // Never infer dashboard access from name, email, designation, or department.
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
    "hod": "/admin/head-of-department",
    "head of department": "/admin/head-of-department",
    "head of office": "/admin/head-of-office",
    "hoa": "/admin/head-of-office",
  };

  return destinations[value] || null;
}

export function getDashboardDestination(user, fallbackRole) {
  const role = normalize(user?.role ?? fallbackRole).replace(/ /g, "_");

  if (role === "super_admin") return "/super-admin";
  if (role === "admin") return "/admin";

  if (role === "employee") {
    return getFunctionalDashboard(user) || "/dashboard";
  }

  return "/dashboard";
}

export function hasFunctionalDashboardAccess(user, pathname) {
  const role = normalize(user?.role).replace(/ /g, "_");

  if (role !== "employee") return false;

  const assignedDashboard = getFunctionalDashboard(user);
  return Boolean(assignedDashboard && assignedDashboard === pathname);
}
