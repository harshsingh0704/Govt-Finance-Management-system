const mongoose = require('mongoose');

const payslipSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  basicPay: { type: Number, default: 0 },
  allowances: { type: Number, default: 0 },
  deductions: { type: Number, default: 0 },
  netPay: { type: Number, default: 0 },
  filePath: String,
  generatedOn: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Payslip', payslipSchema);