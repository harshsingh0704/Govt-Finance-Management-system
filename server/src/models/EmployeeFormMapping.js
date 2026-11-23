const mongoose = require("mongoose");

const formResponsibilitiesSchema = new mongoose.Schema(
  {
    taClaim: { type: Boolean, default: false },
    taAdvance: { type: Boolean, default: false },
    ltcClaim: { type: Boolean, default: false },
    ltcAdvance: { type: Boolean, default: false },
    medicalClaim: { type: Boolean, default: false },
    medicalAdvance: { type: Boolean, default: false },
    accommodation: { type: Boolean, default: false },
  },
  { _id: false }
);

const employeeFormMappingSchema = new mongoose.Schema(
  {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    employeeName: { type: String, required: true, trim: true },
    userType: { type: String, default: "Employee", trim: true },
    location: {
      type: String,
      enum: [
        "Main Office",
        "Peenya Office",
        "Gottipura Field Station",
        "Kolkata Field Station",
      ],
      default: "Main Office",
      trim: true,
    },
    domain: {
      type: String,
      enum: [
        "Finance",
        "Admin",
        "IT Support",
        "Purchases & Receipts",
        "Estate Related",
        "Vehicle Requests",
        "Research",
      ],
      default: "Finance",
      trim: true,
    },
    department: { type: String, default: "Finance", trim: true },
    designation: { type: String, default: "Staff", trim: true },
    responsibilities: {
      type: formResponsibilitiesSchema,
      default: () => ({}),
    },
    isLocked: { type: Boolean, default: false },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EmployeeFormMapping", employeeFormMappingSchema);
