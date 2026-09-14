const Payslip = require('../models/Payslip');
const { generatePayslipPDF } = require('../services/payslipService');

exports.generatePayslip = async (req, res) => {
  try {
    const payslip = await generatePayslipPDF(req.body);
    res.status(201).json(payslip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPayslipsByEmployee = async (req, res) => {
  const payslips = await Payslip.find({ employeeId: req.params.employeeId });
  res.json(payslips);
};

exports.downloadPayslip = async (req, res) => {
  const payslip = await Payslip.findById(req.params.id);
  if (!payslip) return res.status(404).json({ error: 'Not found' });
  res.download(payslip.filePath);
};