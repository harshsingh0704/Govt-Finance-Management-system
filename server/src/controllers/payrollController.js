const { processPayrollExcel } = require('../services/payrollService');

exports.uploadPayroll = async (req, res) => {
  try {
    const { month, year } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const payroll = await processPayrollExcel(filePath, month, year, req.body.uploadedBy, fileName);
    res.status(201).json(payroll);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getPayrollByMonth = async (req, res) => {
  const Payroll = require('../models/Payroll');
  const payroll = await Payroll.findOne({ month: req.params.month, year: req.params.year });
  res.json(payroll);
};