const mongoose = require("mongoose");
const dotenv = require("dotenv");

const connectDB = require("../config/db");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

dotenv.config();

const permissions = [
  // Claims
  {
    name: "claims.create",
    description: "Create financial claims",
  },
  {
    name: "claims.view",
    description: "View financial claims",
  },
  {
    name: "claims.approve",
    description: "Approve financial claims",
  },
  {
    name: "claims.reject",
    description: "Reject financial claims",
  },

  // TA
  {
    name: "ta.create",
    description: "Create TA requests",
  },
  {
    name: "ta.view",
    description: "View TA requests",
  },
  {
    name: "ta.approve",
    description: "Approve TA requests",
  },
  {
    name: "ta.reject",
    description: "Reject TA requests",
  },

  // LTC
  {
    name: "ltc.create",
    description: "Create LTC requests",
  },
  {
    name: "ltc.view",
    description: "View LTC requests",
  },
  {
    name: "ltc.approve",
    description: "Approve LTC requests",
  },
  {
    name: "ltc.reject",
    description: "Reject LTC requests",
  },

  // Medical
  {
    name: "medical.create",
    description: "Create medical claims",
  },
  {
    name: "medical.view",
    description: "View medical claims",
  },
  {
    name: "medical.approve",
    description: "Approve medical claims",
  },
  {
    name: "medical.reject",
    description: "Reject medical claims",
  },

  // Users
  {
    name: "users.view",
    description: "View users",
  },
  {
    name: "users.create",
    description: "Create users",
  },
  {
    name: "users.update",
    description: "Update users",
  },
  {
    name: "users.deactivate",
    description: "Deactivate users",
  },

  // Reports
  {
    name: "reports.view",
    description: "View financial reports",
  },
];

const seedRolesAndPermissions = async () => {
  try {
    await connectDB();

    console.log("Seeding permissions...");

    // Create permissions if they don't already exist
    const createdPermissions = {};

    for (const permissionData of permissions) {
      const permission = await Permission.findOneAndUpdate(
        { name: permissionData.name },
        permissionData,
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }
      );

      createdPermissions[permission.name] = permission._id;
    }

    console.log("Permissions seeded successfully");

    // Employee permissions
    const employeePermissions = [
      "claims.create",
      "claims.view",
      "ta.create",
      "ta.view",
      "ltc.create",
      "ltc.view",
      "medical.create",
      "medical.view",
    ];

    // Admin permissions
    const adminPermissions = [
      ...employeePermissions,
      "claims.approve",
      "claims.reject",
      "ta.approve",
      "ta.reject",
      "ltc.approve",
      "ltc.reject",
      "medical.approve",
      "medical.reject",
      "users.view",
      "reports.view",
    ];

    // Super Admin gets everything
    const superAdminPermissions = permissions.map(
      (permission) => permission.name
    );

    const permissionIds = (permissionNames) =>
      permissionNames.map((name) => createdPermissions[name]);

    // Create/update Employee role
    await Role.findOneAndUpdate(
      { name: "employee" },
      {
        name: "employee",
        description: "Regular government employee",
        permissions: permissionIds(employeePermissions),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Create/update Admin role
    await Role.findOneAndUpdate(
      { name: "admin" },
      {
        name: "admin",
        description: "Finance and administrative officer",
        permissions: permissionIds(adminPermissions),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    // Create/update Super Admin role
    await Role.findOneAndUpdate(
      { name: "super_admin" },
      {
        name: "super_admin",
        description: "System administrator with full access",
        permissions: permissionIds(superAdminPermissions),
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    console.log("Roles seeded successfully");

    console.log("Employee → permissions:", employeePermissions.length);
    console.log("Admin → permissions:", adminPermissions.length);
    console.log(
      "Super Admin → permissions:",
      superAdminPermissions.length
    );

    console.log("Role and permission seeding completed.");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error.message);

    await mongoose.connection.close();
    process.exit(1);
  }
};

seedRolesAndPermissions();