const LTCClaim = require("../models/LTCClaim");
const TAClaim = require("../models/TAClaim");

exports.updateClaimStatus = async (req, res) => {
  try {
    const { claimId, claimType, status, remarks } = req.body;
    if (!claimId || !claimType || !status) {
      return res.status(400).json({
        success: false,
        error: "claimId, claimType, and status are required.",
      });
    }

    const normalizedType = String(claimType).trim().toUpperCase();
    const Model = normalizedType === "LTC" ? LTCClaim : TAClaim;

    const updatedClaim = await Model.findByIdAndUpdate(
      claimId,
      { status, remarks, updatedAt: Date.now() },
      { new: true }
    );

    if (!updatedClaim) {
      return res.status(404).json({ success: false, error: "Claim record not found." });
    }

    return res.json({
      success: true,
      message: `Claim status updated to ${status}`,
      claim: updatedClaim,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const locationFilter = req.query.location ? String(req.query.location).trim() : "";

    const [ltcClaims, taClaims] = await Promise.all([
      LTCClaim.find().populate("employeeId", "name designation employeeCode location domain"),
      TAClaim.find().populate("employeeId", "name designation employeeCode location domain"),
    ]);

    let allClaims = [
      ...ltcClaims.map((c) => ({ ...c.toObject(), claimType: "LTC" })),
      ...taClaims.map((c) => ({ ...c.toObject(), claimType: "TA" })),
    ];

    if (locationFilter) {
      allClaims = allClaims.filter(
        (c) => (c.employeeId?.location || c.location || "") === locationFilter
      );
    }

    allClaims.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const normStatus = (s) => String(s || "").toLowerCase();
    const counts = {
      pending: allClaims.filter((c) =>
        ["submitted", "pending", "draft"].includes(normStatus(c.status))
      ).length,
      verified: allClaims.filter((c) => normStatus(c.status) === "verified").length,
      approved: allClaims.filter((c) =>
        ["approved", "sanctioned"].includes(normStatus(c.status))
      ).length,
      processing: allClaims.filter((c) =>
        ["processing", "paid"].includes(normStatus(c.status))
      ).length,
      total: allClaims.length,
    };

    return res.json({
      success: true,
      counts,
      recentClaims: allClaims.slice(0, 10),
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};
