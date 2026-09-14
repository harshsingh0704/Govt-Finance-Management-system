const TAClaim = require('../models/TAClaim');
const TAAdvance = require('../models/TAAdvance');
const { calculateTAClaim } = require('../services/taCalculationService');

exports.createAdvance = async (req, res) => {
  try {
    const advance = new TAAdvance(req.body);
    await advance.save();
    res.status(201).json(advance);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createClaim = async (req, res) => {
  try {
    const { fare, roadMileage, dailyAllowance, accommodationCharges, advanceAdjusted } = req.body;
    const { grossAmount, netAmount } = calculateTAClaim({ fare, roadMileage, dailyAllowance, accommodationCharges, advanceAdjusted });
    const claim = new TAClaim({ ...req.body, grossAmount, netAmount, status: 'submitted' });
    await claim.save();
    res.status(201).json(claim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getClaimById = async (req, res) => {
  const claim = await TAClaim.findById(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
};

exports.getClaimsByEmployee = async (req, res) => {
  const claims = await TAClaim.find({ employeeId: req.params.employeeId });
  res.json(claims);
};

exports.updateClaimStatus = async (req, res) => {
  const claim = await TAClaim.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
};