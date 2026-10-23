const Approval = require('../models/Approval');
const Employee = require('../models/Employee');
const mongoose = require('mongoose');
const LTCClaim = require('../models/LTCClaim');
const LTCAdvance = require('../models/LTCAdvance');
const AuditLog = require('../models/AuditLog');
const { calculateLTCClaim } = require('../services/ltcCalculationService');



// Create an LTC advance application for the authenticated employee.
exports.createAdvance = async (req, res) => {
  let savedAdvance = null;
  try {
    const user = req.user;
    const userId = user?._id || user?.id;
    if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required.",
      });
    }

    const employee = await Employee.findOne({ userId }).select(
      "_id employeeId employeeCode name designation department payband"
    );
    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Your account is not linked to an employee record. Please contact the administrator.",
      });
    }

    const required = ["employeeNumber", "employeeName", "destination", "leaveFrom", "leaveTo", "journeyStart", "journeyEnd"];
    const missing = required.filter((key) => !String(req.body[key] || "").trim());
    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Required fields are missing: ${missing.join(", ")}.`,
      });
    }

    const leaveFrom = new Date(req.body.leaveFrom);
    const leaveTo = new Date(req.body.leaveTo);
    const journeyStart = new Date(req.body.journeyStart);
    const journeyEnd = new Date(req.body.journeyEnd);
    const requestDate = req.body.requestDate ? new Date(req.body.requestDate) : new Date();

    if ([leaveFrom, leaveTo, journeyStart, journeyEnd, requestDate].some((d) => Number.isNaN(d.getTime()))) {
      return res.status(400).json({
        success: false,
        message: "One or more dates are invalid.",
      });
    }
    if (leaveFrom > leaveTo || journeyStart > journeyEnd) {
      return res.status(400).json({
        success: false,
        message: "End dates cannot be earlier than their corresponding start dates.",
      });
    }

    const accepted = (value) => value === true || value === "true";
    if (!accepted(req.body.declaration1) || !accepted(req.body.declaration2)) {
      return res.status(400).json({
        success: false,
        message: "Both declarations must be accepted before submission.",
      });
    }

    const amount = (value, label) => {
      const parsed = Number(value || 0);
      if (!Number.isFinite(parsed) || parsed < 0) {
        throw new Error(`${label} must be a valid non-negative amount.`);
      }
      return parsed;
    };

    const estimatedFare = amount(req.body.estimatedFare, "Estimated fare");
    const advanceRequested = amount(req.body.advanceRequested, "Advance requested");

    let family;
    try {
      family = JSON.parse(req.body.family || "[]");
    } catch {
      return res.status(400).json({
        success: false,
        message: "Family details could not be read. Please review the form and try again.",
      });
    }
    if (!Array.isArray(family)) {
      return res.status(400).json({
        success: false,
        message: "Family details must be a list.",
      });
    }

    const documents = (req.files || []).map((file) => ({
      originalName: file.originalname,
      filename: file.filename,
      path: `/uploads/ltc-advance/${file.filename}`,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const advance = new LTCAdvance({
      employeeId: employee._id,
      submittedBy: userId,
      employeeNumber: String(req.body.employeeNumber).trim(),
      employeeName: String(req.body.employeeName).trim(),
      designation: String(req.body.designation || employee.designation || "").trim(),
      headquarters: String(req.body.headquarters || "").trim(),
      department: String(req.body.department || employee.department || "").trim(),
      payGrade: String(req.body.payGrade || employee.payband || "").trim(),
      requestDate,
      ltcType: String(req.body.ltcType || "Home Town LTC").trim(),
      blockPeriod: String(req.body.blockPeriod || "").trim(),
      graceYear: String(req.body.graceYear || "").trim(),
      destination: String(req.body.destination).trim(),
      leaveFrom,
      leaveTo,
      journeyStart,
      journeyEnd,
      placeOfVisit: String(req.body.placeOfVisit || "").trim(),
      transport: String(req.body.transport || "").trim(),
      trainClass: String(req.body.trainClass || "").trim(),
      from: String(req.body.from || "").trim(),
      to: String(req.body.to || "").trim(),
      estimatedFare,
      advanceRequested,
      eligibleAmount: estimatedFare,
      family: family.map((member) => ({
        name: String(member?.name || "").trim(),
        relationship: String(member?.relationship || "").trim(),
        age: member?.age === "" || member?.age == null ? undefined : Number(member.age),
        travelling: member?.travelling === true || member?.travelling === "true",
      })),
      documents,
      declaration1: true,
      declaration2: true,
      status: "submitted",
    });

    await advance.save();
    savedAdvance = advance;

    let approval;
    try {
      approval = await Approval.create({
        claimType: "LTCAdvance",
        claimId: advance._id,
        employeeId: employee._id,
        status: "submitted",
        currentStage: "verification",
        history: [{
          action: "SUBMITTED",
          performedBy: userId,
          status: "submitted",
          remarks: "LTC advance application submitted.",
        }],
      });
    } catch (approvalError) {
      await LTCAdvance.findByIdAndDelete(advance._id);
      savedAdvance = null;
      throw new Error(`Application was not submitted because its approval record could not be created: ${approvalError.message}`);
    }

    try {
      await AuditLog.create({
        userId,
        action: "SUBMIT_LTC_ADVANCE",
        module: "CLAIMS",
        targetId: advance._id,
        details: { approvalId: approval._id, advanceRequested },
      });
    } catch (auditError) {
      console.error("LTC advance audit log failed:", auditError.message);
    }

    return res.status(201).json({
      success: true,
      message: "LTC Advance application submitted successfully.",
      advance,
      approvalId: approval._id,
    });
  } catch (error) {
    console.error("LTC advance submission error:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Unable to save LTC advance application.",
    });
  }
};

exports.createClaim = async (req, res) => {
  let claimId = null;
  let session = null;

  try {
    const user = req.user;

    if (!user || !user._id) {
      return res.status(401).json({
        success: false,
        message: "Authentication is required."
      });
    }

    let employee = await Employee.findOne({ userId: user._id });

    if (!employee && user.email) {
      employee = await Employee.findOne({
        email: user.email.toLowerCase()
      });
    }

    if (!employee) {
      return res.status(403).json({
        success: false,
        message: "No employee profile is linked to this account."
      });
    }

    const body = req.body || {};

    const typeMap = {
      "Home Town LTC": "Home Town",
      "Anywhere in India LTC": "Anywhere in India",
      "Other": "Conversion to NER/J&K/A&N"
    };

    const ltcType = typeMap[body.ltcType] || body.ltcType;
    const homeTown = body.homeTown || body.homeTownDestination;
    const destination =
      body.destination || body.journeyTo || body.homeTownDestination;
    const fromDate = body.fromDate || body.leaveFrom;
    const toDate = body.toDate || body.leaveTo;

    const transportMap = {
      Road: "Bus",
      Other: "Multiple"
    };

    const publicTransportation =
      transportMap[body.modeOfTravel] ||
      body.publicTransportation ||
      body.modeOfTravel ||
      "Train";

    const fareClaimed = Number(
      body.fareClaimed ?? body.farePaid ?? body.fare ?? body.totalFare ?? 0
    );

    const advanceTaken = Number(
      body.advanceTaken ??
      body.advanceAdjustment ??
      body.advanceAmount ??
      0
    );

    if (![
      "Home Town",
      "Anywhere in India",
      "Conversion to NER/J&K/A&N"
    ].includes(ltcType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid LTC type."
      });
    }

    if (!body.blockPeriod || !homeTown || !destination || !fromDate || !toDate) {
      return res.status(400).json({
        success: false,
        message: "Block period, home town, destination and journey dates are required."
      });
    }

    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate < startDate
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid journey dates."
      });
    }

    if (
      !Number.isFinite(fareClaimed) ||
      !Number.isFinite(advanceTaken) ||
      fareClaimed < 0 ||
      advanceTaken < 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Fare and advance must be non-negative numbers."
      });
    }

    if (!["Bus", "Train", "Air", "Multiple"].includes(publicTransportation)) {
      return res.status(400).json({
        success: false,
        message: "Invalid transportation type."
      });
    }

    const familyMembers = Array.isArray(body.familyMembers)
      ? body.familyMembers.map((member) => ({
          name: member.name || "",
          relation: member.relation || member.relationship || "",
          age: member.age === "" || member.age == null
            ? undefined
            : Number(member.age)
        }))
      : [];

    if (familyMembers.some(
      (member) => member.age !== undefined &&
        (!Number.isFinite(member.age) || member.age < 0)
    )) {
      return res.status(400).json({
        success: false,
        message: "Family member ages must be valid non-negative numbers."
      });
    }

    const { grossAmount, netAmount } = calculateLTCClaim({
      fareClaimed,
      advanceTaken
    });

    const claim = new LTCClaim({
      employeeId: employee._id,
      employeeCode: employee.employeeCode || employee.employeeId || "",
      designation: body.designation || employee.designation || "",
      gradePay: body.gradePay ??
        (employee.gradePay == null ? "" : String(employee.gradePay)),
      ltcType,
      blockPeriod: body.blockPeriod,
      homeTown,
      graceYear: body.graceYear === true || body.graceYear === "Yes",
      publicTransportation,
      familyMembers,
      destination,
      fromDate: startDate,
      toDate: endDate,
      fareClaimed,
      advanceTaken,
      grossAmount,
      netAmount,
      documents: Array.isArray(body.documents)
        ? body.documents.filter((item) => typeof item === "string")
        : [],
      status: "submitted"
    });

    await claim.validate();
    claimId = claim._id;

    session = await mongoose.startSession();

    await session.withTransaction(async () => {
      await claim.save({ session });

      await Approval.create([{
        claimType: "LTCClaim",
        claimId: claim._id,
        employeeId: employee._id,
        status: "submitted",
        currentStage: "verification",
        history: [{
          action: "submitted",
          performedBy: user._id,
          status: "submitted",
          remarks: "LTC claim submitted by employee.",
          timestamp: new Date()
        }]
      }], { session });
    });

    return res.status(201).json({
      success: true,
      message: "LTC claim submitted successfully.",
      data: claim
    });
  } catch (err) {
    console.error("LTC claim submission failed:", err);

    if (err.name === "ValidationError" || err.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid LTC claim data.",
        error: err.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save LTC claim.",
      error: process.env.NODE_ENV === "development" ? err.message : undefined
    });
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

exports.getClaimById = async (req, res) => {
  const claim = await LTCClaim.findById(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
};

exports.getClaimsByEmployee = async (req, res) => {
  const claims = await LTCClaim.find({ employeeId: req.params.employeeId });
  res.json(claims);
};

exports.updateClaimStatus = async (req, res) => {
  const claim = await LTCClaim.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!claim) return res.status(404).json({ error: 'Not found' });
  res.json(claim);
};
exports.getAllClaims = async (req, res) => {
  try {
    const claims = await LTCClaim.find()
      .populate("employeeId", "name employeeCode designation cadre department")
      .sort({ createdAt: -1 });
    res.json({ success: true, count: claims.length, claims });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};