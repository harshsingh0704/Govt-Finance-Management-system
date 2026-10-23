const {
  notifyUser,
  notifyRole,
  notifyEmployee,
} = require("../services/notificationService");
const Employee = require("../models/Employee");
const mongoose = require("mongoose");
const TAClaim = require("../models/TAClaim");
const TAAdvance = require("../models/TAAdvance");
const Approval = require("../models/Approval");
const AuditLog = require("../models/AuditLog");
const { calculateTAClaim } = require("../services/taCalculationService");

// Approval workflow
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

// Find the Employee record linked to the authenticated user.
// Never trust employeeId supplied by the frontend.
async function getEmployeeId(user) {
  const userId = user?._id || user?.id;

  if (
    !userId ||
    !mongoose.Types.ObjectId.isValid(String(userId))
  ) {
    return null;
  }

  // Support an explicitly linked employee ID if present.
  const linkedEmployeeId =
    user.employeeId && typeof user.employeeId === "object"
      ? user.employeeId._id
      : user.employeeId;

  if (
    linkedEmployeeId &&
    mongoose.Types.ObjectId.isValid(String(linkedEmployeeId))
  ) {
    const linkedEmployee = await Employee.findById(
      linkedEmployeeId
    ).select("_id");

    if (
      linkedEmployee &&
      String(linkedEmployee.userId) === String(userId)
    ) {
      return linkedEmployee._id;
    }
  }

  // Standard relationship: Employee.userId references User._id.
  const employee = await Employee.findOne({
    userId,
  }).select("_id");

  if (employee) {
    return employee._id;
  }

  console.warn(
    `No Employee record linked to User ${String(userId)}. ` +
      "Check that Employee.userId matches User._id."
  );

  return null;
}

// Convert form values to safe numbers.
function toNumber(value, fallback = 0) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function employeeNotLinked(res) {
  return res.status(400).json({
    success: false,
    message:
      "Your account is not linked to an employee record. " +
      "Please ask the administrator to link your User account " +
      "to your Employee record.",
  });
}

// Submit TA advance
exports.createAdvance = async (req, res) => {
  try {
    const employeeId = await getEmployeeId(req.user);

    if (!employeeId) {
      return employeeNotLinked(res);
    }

    const advance = new TAAdvance({
      ...req.body,
      // The authenticated employee is always used.
      employeeId,
    });

    await advance.save();

    return res.status(201).json({
      success: true,
      message: "TA advance application submitted successfully.",
      advance,
    });
  } catch (error) {
    console.error("TA advance submission error:", error);

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
      return employeeNotLinked(res);
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

    // Validate required fields.
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
          "Project name, journey origin, journey destination, " +
          "departure date, and return date are required.",
      });
    }

    const departure = new Date(fromDate);
    const returnDate = new Date(toDate);

    if (
      Number.isNaN(departure.getTime()) ||
      Number.isNaN(returnDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid travel dates.",
      });
    }

    if (departure > returnDate) {
      return res.status(400).json({
        success: false,
        message:
          "The return date cannot be earlier than the departure date.",
      });
    }

    if (declaration !== true && declaration !== "true") {
      return res.status(400).json({
        success: false,
        message:
          "Please accept the declaration before submitting.",
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

    const { grossAmount: calculatedGross } = calculateTAClaim({
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
        claimType === "Outstation"
          ? "Out-of-station"
          : claimType || "Local",

      purposeOfJourney,
      projectName,
      fromPlace,
      toPlace,
      fromDate: departure,
      toDate: returnDate,
      departureTime,
      arrivalTime,
      modeOfTravel,

      taAdvanceApproved,

      officeTransportation:
        officeTransportation === true ||
        officeTransportation === "true",

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

    // Save the claim in MongoDB.
    await claim.save();

    // Notify HOD users about the new claim.
    try {
      await notifyRole("Head of Department", {
        actor: req.user._id,
        title: "New TA claim submitted",
        message: `${employeeName || "An employee"} submitted a TA claim for approval.`,
        type: "CLAIM_SUBMITTED",
        claimId: claim._id,
        claimType: "TAClaim",
        metadata: {
          currentStage: "HOD",
          status: "PENDING_HOD",
        },
      });
    } catch (notificationError) {
      console.error(
        "TA submission notification failed:",
        notificationError.message
      );
    }

    let approvalId = null;

    // Create approval queue record.
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
      console.error(
        "TA claim saved, but approval queue creation failed:",
        approvalError.message
      );
    }

    // Audit log is best-effort.
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
      console.error(
        "TA claim audit log failed:",
        auditError.message
      );
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

// Get a single TA claim
exports.getClaimById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid claim ID.",
      });
    }

    const claim = await TAClaim.findById(req.params.id).populate(
      "employeeId",
      "name employeeCode designation department"
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "TA claim not found.",
      });
    }

    return res.json({
      success: true,
      claim,
    });
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
      return employeeNotLinked(res);
    }

    const claims = await TAClaim.find({
      employeeId,
    }).sort({
      createdAt: -1,
    });

    return res.json({
      success: true,
      count: claims.length,
      claims,
    });
  } catch (error) {
    console.error("Employee TA claims fetch error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get pending claims for the current approval role
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
      currentStage: {
        $in: stages,
      },
      status: {
        $in: [
          "PENDING_HOD",
          "PENDING_HOA",
          "PENDING_FINANCE_OFFICER",
          "PENDING_FINANCE_CLERK",
          "PENDING_FINAL_SANCTION",
        ],
      },
    })
      .populate(
        "employeeId",
        "name employeeCode designation department"
      )
      .sort({
        submittedAt: 1,
      });

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

// Get all TA claims
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await TAClaim.find()
      .populate(
        "employeeId",
        "name employeeCode designation department"
      )
      .sort({
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
        message:
          "Your role is not authorized to process this claim at its current stage.",
      });
    }

    if (
      ["REJECTED", "SENT_BACK"].includes(finalAction) &&
      !String(comments || "").trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide a reason for rejection or sending the claim back.",
      });
    }

    if (!WORKFLOW[stage]) {
      return res.status(400).json({
        success: false,
        message:
          "This claim is not awaiting an approval action.",
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
      claim.currentStage = WORKFLOW[stage].next;
      claim.status = WORKFLOW[stage].status;
    }

    if (comments) {
      claim.remarks = comments;
    }

    await claim.save();
    
   
    // Persist notifications after a successful workflow transition.
    try {
      const claimLabel = claim.employeeName || "Employee";
      const stageLabel = stage.replaceAll("_", " ");
      const claimLink = `/claims/ta/${claim._id}`;

      const notificationBase = {
        actor: req.user._id,
        claimId: claim._id,
        claimType: "TAClaim",
        link: claimLink,
        metadata: {
          previousStage: stage,
          currentStage: claim.currentStage,
          status: claim.status,
          comments: comments || "",
        },
      };

      // Notify the employee of the decision at this stage.
      const employeeType =
        finalAction === "REJECTED"
          ? "CLAIM_REJECTED"
          : finalAction === "SENT_BACK"
            ? "CLAIM_RETURNED"
            : "CLAIM_APPROVED";

      const employeeTitle =
        finalAction === "REJECTED"
          ? "TA claim rejected"
          : finalAction === "SENT_BACK"
            ? "TA claim returned for correction"
            : `TA claim approved by ${stageLabel}`;

      await notifyEmployee(claim.employeeId, {
        ...notificationBase,
        title: employeeTitle,
        message:
          finalAction === "APPROVED"
            ? `Your TA claim has been approved at the ${stageLabel} stage. Current stage: ${claim.currentStage}.`
            : `Your TA claim was ${finalAction === "REJECTED" ? "rejected" : "returned for correction"} at the ${stageLabel} stage. Reason: ${comments}`,
        type: employeeType,
      });

      // Notify the next responsible role after an approval.
      if (finalAction === "APPROVED") {
        const nextRoleByStage = {
          HOD: "Head of Office",
          HOA: "Finance Officer",
          FINANCE_OFFICER: "Finance Clerk",
          FINANCE_CLERK: "Finance Officer",
        };

        const nextRole = nextRoleByStage[stage];

        if (nextRole) {
          await notifyRole(
            nextRole,
            {
              ...notificationBase,
              title: "TA claim awaiting your action",
              message: `${claimLabel}'s TA claim has passed the ${stageLabel} stage and is awaiting your review.`,
              type: "CLAIM_SUBMITTED",
            },
            req.user._id
          );
        }

        // Final sanction completes the workflow.
        if (stage === "FINAL_SANCTION") {
          await notifyEmployee(claim.employeeId, {
            ...notificationBase,
            title: "TA claim sanctioned",
            message: "Your TA claim has received final sanction.",
            type: "CLAIM_SANCTIONED",
          });
        }
      }
    } catch (notificationError) {
      // Do not undo a successful approval if notification delivery fails.
      console.error(
        "TA workflow notification failed:",
        notificationError.message
      );
    }


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
      console.error(
        "TA claim audit log failed:",
        auditError.message
      );
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