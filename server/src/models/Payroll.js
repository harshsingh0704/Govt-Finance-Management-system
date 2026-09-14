const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileName: String,
  totalEmployees: { type: Number, default: 0 },
  totalAmount: { type: Number, default: 0 },
  status: { type: String, enum: ['processing', 'completed', 'failed'], default: 'processing' },
  records: [{
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee' },
    basicPay: Number,
    allowances: Number,
    deductions: Number,
    netPay: Number
  }]
}, { timestamps: true });

module.exports = mongoose.model('Payroll', payrollSchema);