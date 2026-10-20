
require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./src/models/User");

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
      const existingUser = await User.findOne({
        email: testUser.email,
      });

      if (existingUser) {
        console.log(`Already exists: ${testUser.email} — skipped`);
        continue;
      }

      await User.create({
        ...testUser,
        password: TEST_PASSWORD,
      });

      console.log(`Created: ${testUser.email} (${testUser.role})`);
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
