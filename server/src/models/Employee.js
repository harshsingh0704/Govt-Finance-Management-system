const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    employeeCode: { type: String, unique: true, sparse: true },
    
    // 1. Personal Profile Fields (From Excel Sheet 1)
    dob: { type: Date },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    nationality: { type: String, default: "Indian" },
    religion: { type: String },
    caste: { type: String },
    subCaste: { type: String },
    bloodGroup: { type: String },
    maritalStatus: { type: String, enum: ["Single", "Married", "Divorced", "Widowed"] },
    correspondingAddress: { type: String },
    permanentAddress: { type: String },
    
    // Family & Nominees
    fatherName: { type: String },
    motherName: { type: String },
    spouseName: { type: String },
    children: [{ type: String }],

    // 2. Office Profile Fields (From Excel Sheet 2)
    joiningDate: { type: Date },
    department: { type: String, default: "General Administration" },
    designation: { type: String, default: "Officer" },
    cadreCategory: { 
      type: String, 
      enum: ["Research", "Administration"], 
      default: "Administration" 
    },
    pensionScheme: { 
      type: String, 
      enum: ["Old Pension (GPF)", "New Pension Scheme (NPS)"], 
      default: "New Pension Scheme (NPS)" 
    },
    supervisorRole: { type: String },
    parentLab: { type: String, default: "IWST Bangalore" },
    isDeputed: { type: Boolean, default: false },
    parentInstituteName: { type: String },
    accountsOfficerName: { type: String },

    // 3. Accommodation Details (From Excel Sheet 3)
    quartersAvailed: { type: Boolean, default: false },
    quartersAllotmentDate: { type: Date },
    quartersType: { 
      type: String, 
      enum: ["None", "Type 1", "Type 2", "Type 3", "Type 4"], 
      default: "None" 
    },

    // 4. Pay & Financial Details
    basicPay: { type: Number, default: 45000 },
    gradePay: { type: Number, default: 0 },
    bankAccount: { type: String },
    ifscCode: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
