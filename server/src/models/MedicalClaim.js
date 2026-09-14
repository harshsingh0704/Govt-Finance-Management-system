const mongoose = require('mongoose');

const medicalClaimSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
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
  status: {
    type: String,
    enum: ['draft', 'submitted', 'verified', 'approved', 'rejected', 'paid'],
    default: 'draft'
  },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('MedicalClaim', medicalClaimSchema);