const mongoose = require("mongoose");

const accommodationSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    employeeNumber: { type: String, required: true, trim: true },
    employeeName: { type: String, required: true, trim: true },
    instituteJoiningDate: { type: Date, required: true },
    officeAccommodation: {
      type: String,
      enum: ["Yes", "No"],
      required: true,
    },
    requestDate: { type: Date, required: true },
    approvalDate: { type: Date, required: true },
    occupancyDate: { type: Date, required: true },
    quartersType: {
      type: String,
      enum: ["Type 1", "Type 2", "Type 3", "Type 4"],
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "verified", "approved", "rejected", "hold"],
      default: "submitted",
      index: true,
    },
  },
  { timestamps: true }
);

accommodationSchema.index({ employeeId: 1, createdAt: -1 });

module.exports = mongoose.model("Accommodation", accommodationSchema);
