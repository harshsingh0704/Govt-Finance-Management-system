const mongoose = require("mongoose");

const taClaimSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeCode: { type: String, trim: true },
    designation: { type: String, trim: true },
    gradePay: { type: String, trim: true },

    // Excel TA specifications
    projectName: {
      type: String,
      required: true,
      trim: true, // Specific Research project name or Institutional Admin
    },
    tourType: {
      type: String,
      enum: ["Local", "Out-of-station"],
      default: "Out-of-station",
      required: true,
    },
    officeTransportation: {
      type: Boolean,
      default: false, // Yes / No
    },
    publicTransportation: {
      type: String,
      enum: ["Bus", "Train", "Air", "Taxi/Auto", "None"],
      default: "Train",
    },

    // Tour Journey Points
    fromPlace: { type: String, required: true, trim: true },
    toPlace: { type: String, required: true, trim: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },

    // Financial elements under 7th CPC TA Rules
    fare: { type: Number, default: 0 },
    roadMileage: { type: Number, default: 0 },
    dailyAllowance: { type: Number, default: 0 },
    accommodationCharges: { type: Number, default: 0 },
    grossAmount: { type: Number, default: 0 },
    advanceAdjusted: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },

    advanceId: { type: mongoose.Schema.Types.ObjectId, ref: "TAAdvance" },
    documents: [{ type: String }],
    status: {
      type: String,
      enum: ["draft", "submitted", "verified", "approved", "rejected", "paid"],
      default: "submitted",
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TAClaim", taClaimSchema);
