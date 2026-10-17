
const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    // Link employee profile to the system user account
    
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "User",
  default: null,
  required: false,
},

    employeeCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    // 1. Personal Profile Fields
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    nationality: {
      type: String,
      default: "Indian",
    },
    religion: {
      type: String,
    },
    caste: {
      type: String,
    },
    subCaste: {
      type: String,
    },
    bloodGroup: {
      type: String,
    },
    maritalStatus: {
      type: String,
      enum: ["Single", "Married", "Divorced", "Widowed"],
    },
    correspondingAddress: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },

    // Family & Nominees
    fatherName: {
      type: String,
    },
    motherName: {
      type: String,
    },
    spouseName: {
      type: String,
    },
    children: [
      {
        type: String,
      },
    ],

    // 2. Office Profile Fields
    joiningDate: {
      type: Date,
    },
    department: {
      type: String,
      default: "General Administration",
      trim: true,
    },
    designation: {
      type: String,
      default: "Officer",
      trim: true,
    },

    // Functional responsibility within the department.
    // Separate from User.role, which controls system access.
    functionalAssignment: {
      type: String,
      enum: [
        "Employee",
        "Head of Office",
        "Head of Department",
        "Finance Officer",
        "Finance Clerk",
        "IT Cell In-charge",
      ],
      default: "Employee",
      trim: true,
    },

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
    supervisorRole: {
      type: String,
    },
    parentLab: {
      type: String,
      default: "IWST Bangalore",
    },
    isDeputed: {
      type: Boolean,
      default: false,
    },
    parentInstituteName: {
      type: String,
    },
    accountsOfficerName: {
      type: String,
    },

    // 3. Accommodation Details
    quartersAvailed: {
      type: Boolean,
      default: false,
    },
    quartersAllotmentDate: {
      type: Date,
    },
    quartersType: {
      type: String,
      enum: ["None", "Type 1", "Type 2", "Type 3", "Type 4"],
      default: "None",
    },

    // 4. Pay & Financial Details
    basicPay: {
      type: Number,
      default: 45000,
      min: 0,
    },
    gradePay: {
      type: Number,
      default: 0,
      min: 0,
    },
    bankAccount: {
      type: String,
    },
    ifscCode: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Employee", employeeSchema);
