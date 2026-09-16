const Approval = require("../models/Approval");
const AuditLog = require("../models/AuditLog");
const TAClaim = require("../models/TAClaim");
const MedicalClaim = require("../models/MedicalClaim");
const LTCClaim = require("../models/LTCClaim");
const Employee = require("../models/Employee");

const claimModelMap = {
  TAClaim,
  MedicalClaim,
  LTCClaim,
};

// GET /api/approvals - Fetch pending / all approval requests
exports.getApprovalQueue = async (req, res, next) => {
  try {
    const { status, claimType } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (claimType) filter.claimType = claimType;

    const approvals = await Approval.find(filter)
      .populate("employeeId")
      .populate("reviewedBy", "name email role")
      .populate("claimId")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: approvals.length,
      data: approvals,
    });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/approvals/:id/action - Approve / Reject / Hold with Audit Log
exports.processApprovalAction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const validStatuses = ["approved", "rejected", "hold", "verified"];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action status.",
      });
    }

    const approval = await Approval.findById(id);
    if (!approval) {
      return res.status(404).json({
        success: false,
        message: "Approval record not found.",
      });
    }

    approval.status = status;
    approval.remarks = remarks || approval.remarks;
    approval.reviewedBy = req.user ? req.user.id : null;
    approval.history.push({
      action: status.toUpperCase(),
      performedBy: req.user ? req.user.id : null,
      status,
      remarks,
      timestamp: new Date(),
    });

    await approval.save();

    // Sync status with the actual claim model
    const Model = claimModelMap[approval.claimType];
    if (Model) {
      await Model.findByIdAndUpdate(approval.claimId, {
        status: status === "hold" ? "draft" : status,
        remarks,
      });
    }

    // Create Audit Log
    await AuditLog.create({
      userId: req.user ? req.user.id : null,
      action: `CLAIM_${status.toUpperCase()}`,
      module: "APPROVAL",
      targetId: approval._id,
      details: {
        claimId: approval.claimId,
        claimType: approval.claimType,
        remarks,
      },
    });

    res.status(200).json({
      success: true,
      message: `Claim successfully updated to ${status}.`,
      data: approval,
    });
  } catch (error) {
    next(error);
  }
};

