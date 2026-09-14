const mongoose = require('mongoose');

const taAdvanceSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  purposeOfJourney: { type: String, required: true },
  fromPlace: String,
  toPlace: String,
  fromDate: Date,
  toDate: Date,
  modeOfTravel: String,
  advanceAmountRequested: { type: Number, required: true },
  advanceAmountSanctioned: { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'verified', 'approved', 'rejected', 'paid'],
    default: 'draft'
  },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('TAAdvance', taAdvanceSchema);