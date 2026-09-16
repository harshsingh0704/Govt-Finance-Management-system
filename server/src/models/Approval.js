const mongoose = require("mongoose");

const approvalSchema = new mongoose.Schema(
  {
    claimType: {
      type: String,
      enum: ["TAClaim", "MedicalClaim", "LTCClaim"],
      required: true,
    },
    claimId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "claimType",
    },
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["submitted", "verified", "approved", "rejected", "hold"],
      default: "submitted",
    },
    currentStage: {
      type: String,
      enum: ["verification", "admin_approval", "finance_release", "completed"],
      default: "verification",
    },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    remarks: { type: String, default: "" },
    history: [
      {
        action: String,
        performedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        status: String,
        remarks: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Approval", approvalSchema);
