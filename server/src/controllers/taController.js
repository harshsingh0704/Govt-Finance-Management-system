const TAClaim = require("../models/TAClaim");
const TAAdvance = require("../models/TAAdvance");
const Approval = require("../models/Approval");
const AuditLog = require("../models/AuditLog");
const { calculateTAClaim } = require("../services/taCalculationService");

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
    const { grossAmount, netAmount } = calculateTAClaim({
      fare: Number(fare) || 0,
      roadMileage: Number(roadMileage) || 0,
      dailyAllowance: Number(dailyAllowance) || 0,
      accommodationCharges: Number(accommodationCharges) || 0,
      advanceAdjusted: Number(advanceAdjusted) || 0,
    });

    const claim = new TAClaim({
      ...req.body,
      grossAmount,
      netAmount,
      status: "submitted",
    });
    await claim.save();

    // Auto-create approval queue record
    const approval = await Approval.create({
      claimType: "TAClaim",
      claimId: claim._id,
      employeeId: req.body.employeeId,
      status: "submitted",
      currentStage: "verification",
      history: [
        {
          action: "SUBMITTED",
          performedBy: req.user ? req.user.id : null,
          status: "submitted",
          remarks: "Claim submitted for approval",
        },
      ],
    });

    // Create audit log entry
    if (req.user && req.user.id) {
      await AuditLog.create({
        userId: req.user.id,
        action: "SUBMIT_TA_CLAIM",
        module: "CLAIMS",
        targetId: claim._id,
        details: { netAmount, grossAmount },
      });
    }

    res.status(201).json({ success: true, claim, approvalId: approval._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getClaimById = async (req, res) => {
  const claim = await TAClaim.findById(req.params.id);
  if (!claim) return res.status(404).json({ error: "Not found" });
  res.json(claim);
};

exports.getClaimsByEmployee = async (req, res) => {
  const claims = await TAClaim.find({ employeeId: req.params.employeeId }).sort({ createdAt: -1 });
  res.json(claims);
};

exports.updateClaimStatus = async (req, res) => {
  const claim = await TAClaim.findByIdAndUpdate(
    req.params.id,
    { status: req.body.status, remarks: req.body.remarks },
    { new: true }
  );
  if (!claim) return res.status(404).json({ error: "Not found" });
  res.json(claim);
};
