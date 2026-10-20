
const mongoose = require("mongoose");
const TAClaim = require("../models/TAClaim");
const TAAdvance = require("../models/TAAdvance");
const Approval = require("../models/Approval");
const AuditLog = require("../models/AuditLog");
const { calculateTAClaim } = require("../services/taCalculationService");

// Approval workflow stages
const WORKFLOW = {
  HOD: {
    next: "HOA",
    status: "PENDING_HOA",
  },
  HOA: {
    next: "FINANCE_OFFICER",
    status: "PENDING_FINANCE_OFFICER",
  },
  FINANCE_OFFICER: {
    next: "FINANCE_CLERK",
    status: "PENDING_FINANCE_CLERK",
  },
  FINANCE_CLERK: {
    next: "FINAL_SANCTION",
    status: "PENDING_FINAL_SANCTION",
  },
  FINAL_SANCTION: {
    next: "COMPLETED",
    status: "SANCTIONED",
  },
};

const normalizeRole = (role) =>
  String(role || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");

const STAGE_ROLES = {
  HOD: ["head of department", "hod"],
  HOA: ["head of office", "hoa"],
  FINANCE_OFFICER: ["finance officer"],
  FINANCE_CLERK: ["finance clerk"],
  FINAL_SANCTION: ["finance officer"],
};

function userCanActAtStage(user, stage) {
  return (STAGE_ROLES[stage] || []).includes(
    normalizeRole(user?.role)
  );
}


async function getEmployeeId(user) {
  if (!user?._id) return null;

  const employee = await require("../models/Employee").findOne({
    userId: user._id,
  }).select("_id");

  return employee ? employee._id : null;
}

// Helper: safely convert a number
function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

// Apply for TA advance
exports.createAdvance = async (req, res) => {
  try {
    const advance = new TAAdvance({
      ...req.body,
      employeeId:await getEmployeeId(req.user),
    });

    if (!advance.employeeId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not linked to an employee record. Please contact the administrator.",
      });
    }

    await advance.save();

    return res.status(201).json({
      success: true,
      message: "TA advance application submitted successfully.",
      advance,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Submit employee TA claim
exports.createClaim = async (req, res) => {
  try {
    const employeeId = await getEmployeeId(req.user);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message:
          "Your account is not linked to an employee record. Please contact the administrator.",
      });
    }

    const {
      employeeNumber,
      employeeName,
      employeeCode,
      designation,
      gradePay,
      pay,
      headquarter,
      claimType,
      purposeOfJourney,
      projectName,
      fromPlace,
      toPlace,
      fromDate,
      toDate,
      departureTime,
      arrivalTime,
      modeOfTravel,
      taAdvanceApproved,
      travelFare,
      fare,
      roadMileage,
      dailyAllowance,
      accommodation,
      accommodationCharges,
      otherExpenses,
      advanceAmountRequested,
      advanceAdjusted,
      officeTransportation,
      publicTransportation,
      remarks,
      declaration,
      documents,
    } = req.body;

    // Required schema fields
    if (
      !projectName ||
      !fromPlace ||
      !toPlace ||
      !fromDate ||
      !toDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Project name, journey origin, journey destination, departure date, and return date are required.",
      });
    }

    if (new Date(fromDate) > new Date(toDate)) {
      return res.status(400).json({
        success: false,
        message: "The return date cannot be earlier than the departure date.",
      });
    }

    if (declaration !== true && declaration !== "true") {
      return res.status(400).json({
        success: false,
        message: "Please accept the declaration before submitting.",
      });
    }

    const normalizedFare = toNumber(travelFare ?? fare);
    const normalizedMileage = toNumber(roadMileage);
    const normalizedAllowance = toNumber(dailyAllowance);
    const normalizedAccommodation = toNumber(
      accommodation ?? accommodationCharges
    );
    const normalizedOtherExpenses = toNumber(otherExpenses);
    const normalizedAdvance = toNumber(advanceAmountRequested);
    const normalizedAdjustedAdvance = toNumber(advanceAdjusted);

    const { grossAmount: calculatedGross, netAmount: calculatedNet } =
      calculateTAClaim({
        fare: normalizedFare,
        roadMileage: normalizedMileage,
        dailyAllowance: normalizedAllowance,
        accommodationCharges: normalizedAccommodation,
        advanceAdjusted: normalizedAdjustedAdvance,
      });

    const grossAmount =
      calculatedGross + normalizedOtherExpenses;

    const netAmount =
      grossAmount - normalizedAdjustedAdvance;

    const claim = new TAClaim({
      employeeId,

      employeeNumber,
      employeeName,
      employeeCode: employeeCode || employeeNumber,
      designation,
      gradePay,
      pay: toNumber(pay),
      headquarter,

      claimType,
      tourType:
        claimType === "Outstation" ? "Out-of-station" : claimType || "Local",

      purposeOfJourney,
      projectName,
      fromPlace,
      toPlace,
      fromDate,
      toDate,
      departureTime,
      arrivalTime,
      modeOfTravel,

      taAdvanceApproved,
      officeTransportation:
        officeTransportation === true || officeTransportation === "true",
      publicTransportation: publicTransportation || "Train",

      travelFare: normalizedFare,
      fare: normalizedFare,
      roadMileage: normalizedMileage,
      dailyAllowance: normalizedAllowance,
      accommodation: normalizedAccommodation,
      accommodationCharges: normalizedAccommodation,
      otherExpenses: normalizedOtherExpenses,
      advanceAmountRequested: normalizedAdvance,
      advanceAdjusted: normalizedAdjustedAdvance,

      grossAmount,
      netAmount,

      declaration: true,
      documents: Array.isArray(documents) ? documents : [],

      currentStage: "HOD",
      status: "PENDING_HOD",
      submittedAt: new Date(),
      remarks,
      approvalHistory: [],
    });

    await claim.save();

    // Create the approval queue record.
    // This retains the existing Approval model integration.
    let approvalId = null;

    try {
      const approval = await Approval.create({
        claimType: "TAClaim",
        claimId: claim._id,
        employeeId,
        status: "submitted",
        currentStage: "HOD",
        history: [
          {
            action: "SUBMITTED",
            performedBy: req.user._id,
            status: "PENDING_HOD",
            remarks: "TA claim submitted for HOD approval.",
          },
        ],
      });

      approvalId = approval._id;
    } catch (approvalError) {
      // Do not leave a saved claim appearing to have failed.
      console.error(
        "TA claim saved, but approval queue creation failed:",
        approvalError.message
      );
    }

    try {
      await AuditLog.create({
        userId: req.user._id,
        action: "SUBMIT_TA_CLAIM",
        module: "CLAIMS",
        targetId: claim._id,
        details: {
          grossAmount,
          netAmount,
          currentStage: "HOD",
        },
      });
    } catch (auditError) {
      console.error("TA claim audit log failed:", auditError.message);
    }

    return res.status(201).json({
      success: true,
      message: "TA claim submitted successfully and sent to HOD.",
      claim,
      approvalId,
    });
  } catch (error) {
    console.error("TA claim submission error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get a single claim
exports.getClaimById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    const claim = await TAClaim.findById(req.params.id)
      .populate("employeeId", "name employeeCode designation department");

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "TA claim not found.",
      });
    }

    return res.json({ success: true, claim });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get claims belonging to the logged-in employee
exports.getClaimsByEmployee = async (req, res) => {
  try {
    const employeeId = await getEmployeeId(req.user);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Your account is not linked to an employee record.",
      });
    }

    // Ignore employeeId supplied in the URL for employee-owned history.
    const claims = await TAClaim.find({ employeeId }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getPendingClaims = async (req, res) => {
  try {
    const role = normalizeRole(req.user?.role);

    const stagesByRole = {
      hod: ["HOD"],
      "head of department": ["HOD"],
      hoa: ["HOA"],
      "head of office": ["HOA"],
      "finance officer": ["FINANCE_OFFICER", "FINAL_SANCTION"],
      "finance clerk": ["FINANCE_CLERK"],
    };

    const stages = stagesByRole[role];

    if (!stages) {
      return res.status(403).json({
        success: false,
        message: "Your role cannot access approval queues.",
      });
    }

    const claims = await TAClaim.find({
      currentStage: { $in: stages },
      status: { $in: [
        "PENDING_HOD",
        "PENDING_HOA",
        "PENDING_FINANCE_OFFICER",
        "PENDING_FINANCE_CLERK",
        "PENDING_FINAL_SANCTION",
      ]},
    })
      .populate("employeeId", "name employeeCode designation department")
      .sort({ submittedAt: 1 });

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Pending claims fetch error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load pending claims.",
    });
  }
};

// Get all TA claims (existing endpoint)
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await TAClaim.find()
      .populate("employeeId", "name employeeCode designation department")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Approve, reject, or send back a claim
exports.updateClaimStatus = async (req, res) => {
  try {
    const { action, comments, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    const claim = await TAClaim.findById(req.params.id);

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "TA claim not found.",
      });
    }

    // Support legacy callers that send status: approved/rejected.
    const normalizedAction = String(action || status || "")
      .trim()
      .toUpperCase();

    const actionMap = {
      APPROVE: "APPROVED",
      APPROVED: "APPROVED",
      REJECT: "REJECTED",
      REJECTED: "REJECTED",
      SEND_BACK: "SENT_BACK",
      SENT_BACK: "SENT_BACK",
      RETURNED_FOR_CORRECTION: "SENT_BACK",
    };

    const finalAction = actionMap[normalizedAction];

    if (!finalAction) {
      return res.status(400).json({
        success: false,
        message:
          "Action must be APPROVED, REJECTED, or SENT_BACK.",
      });
    }

    const stage = claim.currentStage;
    
if (!userCanActAtStage(req.user, stage)) {
  return res.status(403).json({
    success: false,
    message: "Your role is not authorized to process this claim at its current stage.",
  });
}

if (
  ["REJECTED", "SENT_BACK"].includes(finalAction) &&
  !String(comments || "").trim()
) {
  return res.status(400).json({
    success: false,
    message: "Please provide a reason for rejection or sending the claim back.",
  });
}


    if (!WORKFLOW[stage]) {
      return res.status(400).json({
        success: false,
        message: "This claim is not awaiting an approval action.",
      });
    }

    claim.approvalHistory.push({
      stage,
      officerId: req.user._id,
      action: finalAction,
      comments: comments || "",
      actionAt: new Date(),
    });

    if (finalAction === "REJECTED") {
      claim.status = "rejected";
      claim.currentStage = stage;
    } else if (finalAction === "SENT_BACK") {
      claim.status = "RETURNED_FOR_CORRECTION";
      claim.currentStage = stage;
    } else if (stage === "FINAL_SANCTION") {
      claim.currentStage = "COMPLETED";
      claim.status = "SANCTIONED";
      claim.sanctionedBy = req.user._id;
      claim.sanctionedAt = new Date();
    } else {
      const nextStage = WORKFLOW[stage].next;
      claim.currentStage = nextStage;
      claim.status = WORKFLOW[stage].status;
    }

    if (comments) {
      claim.remarks = comments;
    }

    await claim.save();

    try {
      await AuditLog.create({
        userId: req.user._id,
        action: `TA_CLAIM_${finalAction}`,
        module: "CLAIMS",
        targetId: claim._id,
        details: {
          stage,
          nextStage: claim.currentStage,
          comments: comments || "",
        },
      });
    } catch (auditError) {
      console.error("TA claim audit log failed:", auditError.message);
    }

    return res.json({
      success: true,
      message:
        finalAction === "APPROVED"
          ? `Claim action recorded. Current stage: ${claim.currentStage}.`
          : `Claim ${finalAction.toLowerCase().replace("_", " ")} successfully.`,
      claim,
    });
  } catch (error) {
    console.error("TA claim status update error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
