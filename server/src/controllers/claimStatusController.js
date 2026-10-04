const LTCClaim = require('../models/LTCClaim');
const TAClaim = require('../models/TAClaim');

exports.updateClaimStatus = async (req, res) => {
  try {
    const { claimId, claimType, status, remarks } = req.body;
    if (!claimId || !claimType || !status) {
      return res.status(400).json({ error: "claimId, claimType, and status are required." });
    }

    let updatedClaim;
    if (claimType.toUpperCase() === "LTC") {
      updatedClaim = await LTCClaim.findByIdAndUpdate(
        claimId,
        { status, remarks, updatedAt: Date.now() },
        { new: true }
      );
    } else {
      updatedClaim = await TAClaim.findByIdAndUpdate(
        claimId,
        { status, remarks, updatedAt: Date.now() },
        { new: true }
      );
    }

    if (!updatedClaim) {
      return res.status(404).json({ error: "Claim record not found." });
    }

    res.json({ success: true, message: `Claim status updated to ${status}`, claim: updatedClaim });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const ltcClaims = await LTCClaim.find().populate('employeeId', 'name designation employeeCode');
    const taClaims = await TAClaim.find().populate('employeeId', 'name designation employeeCode');

    const allClaims = [
      ...ltcClaims.map(c => ({ ...c.toObject(), claimType: 'LTC' })),
      ...taClaims.map(c => ({ ...c.toObject(), claimType: 'TA' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const counts = {
      pending: allClaims.filter(c => c.status === 'Submitted' || c.status === 'Pending').length,
      verified: allClaims.filter(c => c.status === 'Verified').length,
      approved: allClaims.filter(c => c.status === 'Approved' || c.status === 'Sanctioned').length,
      processing: allClaims.filter(c => c.status === 'Processing' || c.status === 'Paid').length,
      total: allClaims.length
    };

    res.json({ success: true, counts, recentClaims: allClaims.slice(0, 10) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
