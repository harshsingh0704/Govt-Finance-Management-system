const mongoose = require('mongoose');

const taClaimSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  advanceId: { type: mongoose.Schema.Types.ObjectId, ref: 'TAAdvance' },
  fromPlace: String,
  toPlace: String,
  fromDate: Date,
  toDate: Date,
  modeOfTravel: String,
  fare: { type: Number, default: 0 },
  roadMileage: { type: Number, default: 0 },
  dailyAllowance: { type: Number, default: 0 },
  accommodationCharges: { type: Number, default: 0 },
  grossAmount: { type: Number, default: 0 },
  advanceAdjusted: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  documents: [String],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'verified', 'approved', 'rejected', 'paid'],
    default: 'draft'
  },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('TAClaim', taClaimSchema);