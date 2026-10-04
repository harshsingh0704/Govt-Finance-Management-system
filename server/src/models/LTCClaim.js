const mongoose = require("mongoose");

const ltcClaimSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeCode: { type: String, trim: true },
    designation: { type: String, trim: true },
    gradePay: { type: String, trim: true },
    
    // Excel LTC specifications
    ltcType: {
      type: String,
      enum: ["Home Town", "Anywhere in India", "Conversion to NER/J&K/A&N"],
      default: "Home Town",
      required: true,
    },
    blockPeriod: {
      type: String,
      required: true,
      trim: true,
      default: "2026-2029", // e.g. 2022-2025, 2026-2029
    },
    homeTown: {
      type: String,
      required: true,
      trim: true,
    },
    graceYear: {
      type: Boolean,
      default: false, // Grace year of Block Period (Yes/No)
    },
    publicTransportation: {
      type: String,
      enum: ["Bus", "Train", "Air", "Multiple"],
      default: "Train",
      required: true,
    },

    // Journey details
    familyMembers: [
      {
        name: { type: String, trim: true },
        relation: { type: String, trim: true },
        age: { type: Number },
      },
    ],
    destination: { type: String, required: true, trim: true },
    fromDate: { type: Date, required: true },
    toDate: { type: Date, required: true },

    // Financial calculations
    fareClaimed: { type: Number, default: 0 },
    advanceTaken: { type: Number, default: 0 },
    grossAmount: { type: Number, default: 0 },
    netAmount: { type: Number, default: 0 },
    
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

module.exports = mongoose.model("LTCClaim", ltcClaimSchema);
