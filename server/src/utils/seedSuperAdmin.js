const User = require('../models/User');

const normalizeRole = (role) => {
  if (!role) return 'Employee';

  const normalized = String(role).trim().toLowerCase().replace(/[_-]+/g, ' ');

  const roleMap = {
    'super admin': 'Super Admin',
    'admin': 'Admin',
    'employee': 'Employee',
    'authorized officer': 'Authorized Officer',
    'accountant / accounts staff': 'Accountant / Accounts Staff',
    'payment authority': 'Payment Authority',
  };

  return roleMap[normalized] || 'Employee';
};

async function ensureDefaultSuperAdmin() {
  const email = (process.env.SUPER_ADMIN_EMAIL || 'superadmin@fms.gov.in').trim();
  const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';
  const employeeId = (process.env.SUPER_ADMIN_EMPLOYEE_ID || 'SUPER-ADMIN-001').trim();

  if (!email || !password) {
    return null;
  }

  const existingUser = await User.findOne({
    $or: [{ email }, { employeeId }],
  });

  if (existingUser) {
    if (existingUser.role !== 'Super Admin') {
      existingUser.role = 'Super Admin';
      await existingUser.save();
    }

    return existingUser;
  }

  const createdUser = await User.create({
    name: 'System Super Admin',
    email,
    employeeId,
    password,
    role: normalizeRole('Super Admin'),
    isActive: true,
  });

  return createdUser;
}

module.exports = { ensureDefaultSuperAdmin };
