const mongoose = require('mongoose');

const formResponsibilitiesSchema = new mongoose.Schema({
  taClaim: { type: Boolean, default: false },
  taAdvance: { type: Boolean, default: false },
  ltcClaim: { type: Boolean, default: false },
  ltcAdvance: { type: Boolean, default: false },
  medicalClaim: { type: Boolean, default: false },
  medicalAdvance: { type: Boolean, default: false },
  accommodation: { type: Boolean, default: false }
}, { _id: false });

const employeeFormMappingSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true, index: true },
  employeeName: { type: String, required: true },
  userType: { type: String, default: 'Employee' },
  department: { type: String, default: 'General' },
  designation: { type: String, default: 'Staff' },
  responsibilities: { type: formResponsibilitiesSchema, default: () => ({}) },
  isLocked: { type: Boolean, default: false },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('EmployeeFormMapping', employeeFormMappingSchema);
