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
    designation: "System Administrator",
    department: "Finance Administration",
  },
];

export async function loginUser({ email, password }) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const user = DEMO_USERS.find(
    (item) =>
      item.email.toLowerCase() === email.toLowerCase() &&
      item.password === password,
  );

  if (!user) {
    throw new Error("Invalid email or password.");
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