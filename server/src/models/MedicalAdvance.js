const mongoose = require("mongoose");

const medicalAdvanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    employeeNumber: { type: String, trim: true },
    employeeName: { type: String, trim: true },
    designation: { type: String, trim: true },
    department: { type: String, trim: true },
    headquarters: { type: String, trim: true },

    patientName: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    patientType: { type: String, required: true, trim: true },

    treatmentNature: { type: String, required: true, trim: true },
    treatmentType: { type: String, required: true, trim: true },
    hospitalName: { type: String, required: true, trim: true },
    hospitalLocation: { type: String, required: true, trim: true },
    hospitalStatus: { type: String, required: true, trim: true },
    proposedTreatment: { type: String, required: true, trim: true },
    proposedAdmissionDate: { type: Date, required: true },
    diagnosis: { type: String, required: true, trim: true },

    estimatedTreatmentExpense: { type: Number, required: true, min: 0 },
    estimatedMedicineInvestigationExpense: {
      type: Number,
      required: true,
      min: 0,
    },
    estimatedOtherExpense: { type: Number, default: 0, min: 0 },
    totalEstimatedExpense: { type: Number, required: true, min: 0 },
    advanceAmountRequested: { type: Number, required: true, min: 0 },

    medicalOfficerCertificate: { type: String, required: true },
    medicalHospitalEstimate: { type: String, required: true },
    otherSupportingDocuments: { type: String, default: null },

    remarks: { type: String, default: "", trim: true },

    currentStage: { type: String, default: null },
    status: {
      type: String,
      enum: ["PENDING", "draft", "submitted", "verified", "approved", "rejected", "paid"],
      default: "PENDING",
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.MedicalAdvance ||
  mongoose.model("MedicalAdvance", medicalAdvanceSchema);
