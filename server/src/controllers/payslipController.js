const Payslip = require('../models/Payslip');
const Employee = require('../models/Employee');
const { generatePayslipPDF } = require('../services/payslipService');

// POST /api/payslips/generate
exports.generatePayslip = async (req, res) => {
  try {
    const payslip = await generatePayslipPDF(req.body);
    res.status(201).json(payslip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// GET /api/payslips - Admin view all payslips
exports.getAllPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find()
      .populate({
        path: 'employeeId',
        populate: { path: 'userId', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, payslips });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/payslips/:employeeId - Employee specific
exports.getPayslipsByEmployee = async (req, res) => {
  try {
    const payslips = await Payslip.find({ employeeId: req.params.employeeId });
    res.json({ success: true, payslips });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET /api/payslips/download/:id
exports.downloadPayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);
    if (!payslip) return res.status(404).json({ error: 'Not found' });
    res.download(payslip.filePath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
