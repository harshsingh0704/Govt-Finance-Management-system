const mongoose = require('mongoose');

const ltcClaimSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  familyMembers: [{
    name: String,
    relation: String,
    age: Number
  }],
  destination: String,
  fromDate: Date,
  toDate: Date,
  modeOfTravel: String,
  fareClaimed: { type: Number, default: 0 },
  advanceTaken: { type: Number, default: 0 },
  grossAmount: { type: Number, default: 0 },
  netAmount: { type: Number, default: 0 },
  documents: [String],
  status: {
    type: String,
    enum: ['draft', 'submitted', 'verified', 'approved', 'rejected', 'paid'],
    default: 'draft'
  },
  remarks: String
}, { timestamps: true });

module.exports = mongoose.model('LTCClaim', ltcClaimSchema);