const DEMO_USERS = [
  {
    id: "EMP001",
    employeeId: "EMP001",
    name: "Sahaj Dubey",
    email: "employee@fms.gov.in",
    password: "Employee@123",
    role: "employee",
    designation: "Senior Assistant",
    department: "Finance Department",
  },

  {
    id: "ADM001",
    employeeId: "ADM001",
    name: "FMS Administrator",
    email: "admin@fms.gov.in",
    password: "Admin@123",
    role: "admin",
    designation: "Accountant",
    department: "Finance Administration",
  },

  {
    id: "SADM001",
    employeeId: "SADM001",
    name: "FMS Super Administrator",
    email: "superadmin@fms.gov.in",
    password: "SuperAdmin@123",
    role: "super_admin",
    designation: "Chief Executive / Management",
    department: "Organization Management",
  },
];

export async function loginUser({ email, password, role }) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const user = DEMO_USERS.find(
    (item) =>
      item.email.toLowerCase() === email.trim().toLowerCase() &&
      item.password === password,
  );

  if (!user) {
    throw new Error("Invalid email or password.");
  }

  /*
   * The selected role is only an attempted role.
   * The actual role stored against the account is authoritative.
   */
  if (user.role !== role) {
    throw new Error(
      `This account is not registered as ${getRoleLabel(role)}.`,
    );
  }

  const { password: _password, ...safeUser } = user;

  return {
    user: safeUser,
    token: `fms-demo-token-${safeUser.id}`,
  };
}

export async function registerUser(data) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  return {
    success: true,
    message:
      "Registration request created successfully. Your account will be activated after verification.",
    data,
  };
}

function getRoleLabel(role) {
  const labels = {
    super_admin: "Super Admin",
    admin: "Admin",
    employee: "Employee",
  };

  return labels[role] || "the selected role";
}