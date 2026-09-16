const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeCode: { type: String, unique: true, sparse: true },
    department: { type: String, default: "General Administration" },
    designation: { type: String, default: "Officer" },
    basicPay: { type: Number, default: 45000 },
    bankAccount: { type: String },
    ifscCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
