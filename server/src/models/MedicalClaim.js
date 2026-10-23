const mongoose = require('mongoose');

const medicalClaimSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },

  employeeNumber: { type: String, trim: true },
  employeeName: { type: String, trim: true },
  designation: { type: String, trim: true },
  gradePay: { type: String, trim: true },
  department: { type: String, trim: true },
  employeeType: { type: String, trim: true },

  dateOfBirth: { type: Date, default: null },
  gender: { type: String, trim: true },
  patientType: { type: String, trim: true },
  treatmentType: { type: String, trim: true },
  hospitalLocation: { type: String, trim: true },
  admissionDate: { type: Date, default: null },
  dischargeDate: { type: Date, default: null },
  diagnosis: { type: String, trim: true },
  treatmentDescription: { type: String, trim: true },

  expenseBreakdown: {
    consultationAmount: { type: Number, default: 0 },
    medicineAmount: { type: Number, default: 0 },
    testAmount: { type: Number, default: 0 },
    hospitalAmount: { type: Number, default: 0 },
    surgeryAmount: { type: Number, default: 0 },
    otherAmount: { type: Number, default: 0 }
  },
  patientName: { type: String, required: true },
  relationship: String,
  officePlaceOfDuty: String,
  hospitalName: String,
  treatmentDetails: {
    consultationAndInjections: { type: Number, default: 0 },
    diagnosticTests: { type: Number, default: 0 },
    medicines: { type: Number, default: 0 },
    hospitalAccommodation: { type: Number, default: 0 },
    surgeryTreatmentNursing: { type: Number, default: 0 }
  },
  specialistDetails: {
    name: String,
    consultationCount: Number,
    fees: { type: Number, default: 0 }
  },
  certificates: [String],
  totalAmountClaimed: { type: Number, default: 0 },
  advanceTaken: { type: Number, default: 0 },
  netAmountClaimed: { type: Number, default: 0 },
  currentStage: { type: String, default: null },

  status: {
    type: String,
    enum: ['PENDING', 'draft', 'submitted', 'verified', 'approved', 'rejected', 'paid'],
    default: 'PENDING'
  },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('MedicalClaim', medicalClaimSchema);