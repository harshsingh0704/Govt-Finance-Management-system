const LTCClaim = require('../models/LTCClaim');
const { calculateLTCClaim } = require('../services/ltcCalculationService');

exports.createClaim = async (req, res) => {
  try {
    const { fareClaimed, advanceTaken } = req.body;
    const { grossAmount, netAmount } = calculateLTCClaim({ fareClaimed, advanceTaken });
    const claim = new LTCClaim({ ...req.body, grossAmount, netAmount, status: 'submitted' });
    await claim.save();
    res.status(201).json(claim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getClaimById = async (req, res) => {
  const claim = await LTCClaim.findById(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
};

exports.getClaimsByEmployee = async (req, res) => {
  const claims = await LTCClaim.find({ employeeId: req.params.employeeId });
  res.json(claims);
};

exports.updateClaimStatus = async (req, res) => {
  const claim = await LTCClaim.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
};