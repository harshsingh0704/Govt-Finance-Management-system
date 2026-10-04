const mongoose = require('mongoose');
const Employee = require('./src/models/Employee');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fms_db';

async function seedData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB for seeding...");

    const count = await Employee.countDocuments();
    if (count === 0) {
      const mockUserId = new mongoose.Types.ObjectId();
      await Employee.create({
        userId: mockUserId,
        name: "Rahul Kumar",
        employeeCode: "EMP202601",
        designation: "Assistant Section Officer",
        cadre: "Group B",
        department: "Finance & Accounts",
        payLevel: 7,
        basicPay: 44900,
        gpfNpsNo: "NPS123456789",
        joiningDate: new Date("2021-01-15")
      });
      console.log("Default seed employee created successfully!");
    } else {
      console.log("Employee records already exist. Skipping seed.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Seeding Error:", err.message);
    process.exit(1);
  }
}

seedData();
