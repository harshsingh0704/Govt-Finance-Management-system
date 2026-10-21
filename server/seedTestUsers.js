
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./src/models/User");
const Employee = require("./src/models/Employee");

const testUsers = [
  {
    name: "Test Admin",
    email: "admintest@gmail.com",
    role: "Admin",
  },
  {
    name: "Test Employee",
    email: "employeetest@gmail.com",
    role: "Employee",
  },
  {
    name: "Test Finance Clerk",
    email: "financeclerk@gmail.com",
    role: "Finance Clerk",
  },
  {
    name: "Test Finance Officer",
    email: "financeofficer@gmail.com",
    role: "Finance Officer",
  },
  {
    name: "Test Head of Department",
    email: "hod@gmail.com",
    role: "Head of Department",
  },
  {
    name: "Test Head of Office",
    email: "headoffice@gmail.com",
    role: "Head of Office",
  },
  {
    name: "Test Super Admin",
    email: "super@gmail.com",
    role: "Establishment",
  },
  
];

const TEST_PASSWORD = process.env.FMS_TEST_PASSWORD;

async function seedTestUsers() {
  try {
    if (!process.env.MONGO_URL) {
      throw new Error("MONGO_URL is missing from server/.env");
    }

    if (!TEST_PASSWORD || TEST_PASSWORD.length < 12) {
      throw new Error(
        "Set FMS_TEST_PASSWORD in server/.env (minimum 12 characters)."
      );
    }

    await mongoose.connect(process.env.MONGO_URL);

    for (const testUser of testUsers) {
      let user = await User.findOne({
        email: testUser.email,
      });

      if (!user) {
        user = await User.create({
          ...testUser,
          password: TEST_PASSWORD,
        });

        console.log(`Created user: ${testUser.email}`);
      } else {
        console.log(`User already exists: ${testUser.email}`);
      }

      // Create a linked Employee record for the test employee.
     // Create Employee profile for the test employee
if (testUser.email === "employeetest@gmail.com") {
  const user = await User.findOne({
    email: "employeetest@gmail.com",
  });

  if (!user) {
    throw new Error(
      "Test employee user was not found in the database."
    );
  }

  let employee = await Employee.findOne({
    userId: user._id,
  });

  if (!employee) {
    employee = await Employee.create({
      userId: user._id,
      employeeId: "TEST-EMP-001",
      employeeCode: "TEST-EMP-001",
      designation: "Test Employee",
      department: "General Administration",
      functionalAssignment: "Employee",
      basicPay: 45000,
      gradePay: 4200,
      parentLab: "IWST Bangalore",
    });

    console.log("Created Employee profile:", employee._id);
  } else {
    console.log("Employee profile already exists:", employee._id);
  }
}
       
    }

    console.log("\nTest account seeding completed.");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

seedTestUsers();