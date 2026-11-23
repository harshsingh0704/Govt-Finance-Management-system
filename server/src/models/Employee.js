const mongoose = require("mongoose");

const LOCATIONS = [
  "Main Office",
  "Peenya Office",
  "Gottipura Field Station",
  "Kolkata Field Station",
];

const DOMAINS = [
  "Finance",
  "Admin",
  "IT Support",
  "Purchases & Receipts",
  "Estate Related",
  "Vehicle Requests",
  "Research",
];

const employeeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      required: false,
    },
    employeeId: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },
    employeeCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    location: {
      type: String,
      enum: LOCATIONS,
      default: "Main Office",
      trim: true,
      index: true,
    },
    domain: {
      type: String,
      enum: DOMAINS,
      default: "Finance",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    adminEligible: {
      type: Boolean,
      default: false,
    },
    adminApprovedAt: {
      type: Date,
      default: null,
    },
    adminApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    name: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    payband: { type: String, trim: true },
    isSupervisor: { type: Boolean, default: false },
    supervisorPosition: { type: String, trim: true },
    reportingSupervisor: { type: String, trim: true },
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    nationality: { type: String, default: "Indian" },
    religion: { type: String },
    caste: { type: String },
    subCaste: { type: String },
    bloodGroup: { type: String },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },
    correspondingAddress: { type: String },
    permanentAddress: { type: String },
    fatherName: { type: String },
    motherName: { type: String },
    spouseName: { type: String },
    children: [{ type: String }],
    joiningDate: { type: Date },
    department: { type: String, default: "Finance", trim: true },
    designation: { type: String, default: "Officer", trim: true },
    functionalAssignment: { type: String, default: "Employee", trim: true },
    cadreCategory: {
      type: String,
      enum: ["Research", "Administration"],
      default: "Administration",
    },
    pensionScheme: {
      type: String,
      enum: ["Old Pension (GPF)", "New Pension Scheme (NPS)"],
      default: "New Pension Scheme (NPS)",
    },
    supervisorRole: { type: String },
    parentLab: { type: String, default: "IWST Bangalore" },
    isDeputed: { type: Boolean, default: false },
    parentInstituteName: { type: String },
    accountsOfficerName: { type: String },
    quartersAvailed: { type: Boolean, default: false },
    quartersAllotmentDate: { type: Date },
    quartersType: {
      type: String,
      enum: ["None", "Type 1", "Type 2", "Type 3", "Type 4"],
      default: "None",
    },
    basicPay: { type: Number, default: 45000, min: 0 },
    gradePay: { type: Number, default: 0, min: 0 },
    bankAccount: { type: String },
    ifscCode: { type: String, trim: true },
  },
  { timestamps: true }
);

employeeSchema.statics.LOCATIONS = LOCATIONS;
employeeSchema.statics.DOMAINS = DOMAINS;

module.exports = mongoose.model("Employee", employeeSchema);
