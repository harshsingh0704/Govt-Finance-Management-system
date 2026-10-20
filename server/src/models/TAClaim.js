const mongoose = require("mongoose");

const taClaimSchema = new mongoose.Schema(
  {
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    employeeCode: { type: String, trim: true },
    designation: { type: String, trim: true },
    gradePay: { type: String, trim: true },
    // Employee TA form fields
employeeNumber: { type: String, trim: true },
employeeName: { type: String, trim: true },
pay: { type: Number, min: 0 },
headquarter: { type: String, trim: true },
claimType: {
  type: String,
  enum: ["Local", "Outstation"],
},
purposeOfJourney: { type: String, trim: true },
departureTime: { type: String, trim: true },
arrivalTime: { type: String, trim: true },
modeOfTravel: { type: String, trim: true },
taAdvanceApproved: {
  type: String,
  enum: ["Yes", "No"],
},
travelFare: { type: Number, min: 0 },
otherExpenses: { type: Number, min: 0 },
advanceAmountRequested: { type: Number, min: 0 },
declaration: { type: Boolean, default: false },
 // Approval workflow
currentStage: {
  type: String,
  enum: [
    "HOD",
    "HOA",
    "FINANCE_OFFICER",
    "FINANCE_CLERK",
    "FINAL_SANCTION",
    "COMPLETED",
  ],
  default: "HOD",
},

approvalHistory: [
  {
    stage: { type: String, required: true },
    officerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    action: {
      type: String,
      enum: ["APPROVED", "REJECTED", "SENT_BACK"],
      required: true,
    },
    comments: { type: String, trim: true },
    actionAt: { type: Date, default: Date.now },
  },
],

submittedAt: { type: Date },
sanctionedBy: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
},
sanctionedAt: { type: Date },
status: {
  type: String,
  enum: [
    "draft",
    "submitted",
    "verified",
    "approved",
    "rejected",
    "paid",
    "PENDING_HOD",
    "PENDING_HOA",
    "PENDING_FINANCE_OFFICER",
    "PENDING_FINANCE_CLERK",
    "PENDING_FINAL_SANCTION",
    "RETURNED_FOR_CORRECTION",
    "SANCTIONED",
  ],
  default: "draft",
},
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
   
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("TAClaim", taClaimSchema);
