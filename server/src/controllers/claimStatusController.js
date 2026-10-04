const LTCClaim = require('../models/LTCClaim');
const TAClaim = require('../models/TAClaim');

// Update Claim Status (Approve / Reject / Verify)
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
