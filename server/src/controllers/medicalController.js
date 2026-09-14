const MedicalClaim = require('../models/MedicalClaim');
const { calculateMedicalClaim } = require('../services/medicalCalculationService');

exports.createClaim = async (req, res) => {
  try {
    const { treatmentDetails, specialistDetails, advanceTaken } = req.body;
    const { totalAmountClaimed, netAmountClaimed } = calculateMedicalClaim({ treatmentDetails, specialistDetails, advanceTaken });
    const claim = new MedicalClaim({ ...req.body, totalAmountClaimed, netAmountClaimed, status: 'submitted' });
    await claim.save();
    res.status(201).json(claim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getClaimById = async (req, res) => {
  const claim = await MedicalClaim.findById(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
};

exports.getClaimsByEmployee = async (req, res) => {
  const claims = await MedicalClaim.find({ employeeId: req.params.employeeId });
  res.json(claims);
};

exports.updateClaimStatus = async (req, res) => {
  const claim = await MedicalClaim.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
};