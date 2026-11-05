const Approval = require("../models/Approval");
const AuditLog = require("../models/AuditLog");
const TAClaim = require("../models/TAClaim");
const MedicalClaim = require("../models/MedicalClaim");
const LTCClaim = require("../models/LTCClaim");
const Employee = require("../models/Employee");
const { notifyEmployee } = require("../services/notificationService");

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

    // Send real-time notification to the claim applicant
    try {
      const claimTypeLabels = {
        TAClaim: "TA Claim",
        MedicalClaim: "Medical Claim",
        LTCClaim: "LTC Claim",
        LTCAdvance: "LTC Advance",
      };

      const readableType = claimTypeLabels[approval.claimType] || approval.claimType;
      const statusTitleMap = {
        approved: `${readableType} Approved`,
        rejected: `${readableType} Rejected`,
        verified: `${readableType} Verified`,
        hold: `${readableType} Placed On Hold`,
      };

      const statusMsgMap = {
        approved: `Your ${readableType} has been approved. Remarks: ${remarks || "No additional remarks."}`,
        rejected: `Your ${readableType} was rejected. Reason: ${remarks || "No reason specified."}`,
        verified: `Your ${readableType} has been verified and moved to the next processing stage.`,
        hold: `Your ${readableType} has been put on hold. Remarks: ${remarks || "Please check with the finance department."}`,
      };

      const notifTypeMap = {
        approved: "CLAIM_APPROVED",
        rejected: "CLAIM_REJECTED",
        verified: "CLAIM_APPROVED",
        hold: "CLAIM_RETURNED",
      };

      await notifyEmployee(approval.employeeId, {
        actor: req.user ? req.user.id : null,
        claimId: approval.claimId,
        claimType: approval.claimType,
        link: "/claims",
        title: statusTitleMap[status] || `${readableType} Update`,
        message: statusMsgMap[status] || `Your ${readableType} status changed to ${status}.`,
        type: notifTypeMap[status] || "GENERAL",
        metadata: {
          status,
          remarks: remarks || "",
          reviewedBy: req.user ? req.user.id : null,
        },
      });
    } catch (notifErr) {
      console.error("Approval action notification error:", notifErr.message);
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

