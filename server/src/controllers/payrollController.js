const Payroll = require("../models/Payroll");
const { processPayrollExcel } = require("../services/payrollService");

exports.uploadPayroll = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Please upload a payroll Excel file." });
    }
    const { month, year } = req.body;
    const filePath = req.file.path;
    const fileName = req.file.originalname;
    const payroll = await processPayrollExcel(
      filePath,
      month,
      year,
      req.user?._id || req.body.uploadedBy,
      fileName
    );
    return res.status(201).json(payroll);
  } catch (err) {
    return res.status(400).json({ error: err.message });
  }
};

exports.getPayrollByMonth = async (req, res) => {
  try {
    const payroll = await Payroll.findOne({
      month: req.params.month,
      year: req.params.year,
    });
    return res.json(payroll);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
