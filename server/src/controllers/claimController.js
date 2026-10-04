const LTCClaim = require("../models/LTCClaim");
const TAClaim = require("../models/TAClaim");
const Employee = require("../models/Employee");

// ==============================
// LTC CLAIMS
// ==============================

// Create LTC Claim (Employee / Admin)
exports.createLTCClaim = async (req, res) => {
  try {
    const {
      employeeId,
      ltcType,
      blockPeriod,
      homeTown,
      graceYear,
      publicTransportation,
      familyMembers,
      destination,
      fromDate,
      toDate,
      fareClaimed,
      advanceTaken,
      remarks,
    } = req.body;

    // Resolve employee details
    let emp = null;
    if (employeeId) {
      emp = await Employee.findById(employeeId);
    } else if (req.user?.employeeId) {
      emp = await Employee.findById(req.user.employeeId);
    }

    const fare = Number(fareClaimed || 0);
    const advance = Number(advanceTaken || 0);
    const gross = fare;
    const net = Math.max(0, gross - advance);

    const newLTC = new LTCClaim({
      employeeId: emp ? emp._id : employeeId,
      employeeCode: emp ? emp.employeeCode : "",
      designation: emp ? emp.designation : "",
      gradePay: emp?.salaryDetails?.gradePay || emp?.designation || "",
      ltcType: ltcType || "Home Town",
      blockPeriod: blockPeriod || "2026-2029",
      homeTown: homeTown || (emp?.personalDetails?.permanentAddress || "Home Town"),
      graceYear: Boolean(graceYear),
      publicTransportation: publicTransportation || "Train",
      familyMembers: familyMembers || [],
      destination,
      fromDate,
      toDate,
      fareClaimed: fare,
      advanceTaken: advance,
      grossAmount: gross,
      netAmount: net,
      remarks,
      status: "submitted",
    });

    await newLTC.save();
    return res.status(201).json({
      success: true,
      message: "LTC Claim submitted successfully under 7th CPC guidelines.",
      claim: newLTC,
    });
  } catch (error) {
    console.error("Error creating LTC claim:", error);
    return res.status(500).json({ error: error.message || "Failed to submit LTC claim" });
  }
};

// Get All LTC Claims
exports.getAllLTCClaims = async (req, res) => {
  try {
    const claims = await LTCClaim.find()
      .populate("employeeId", "name employeeCode designation cadre department")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    console.error("Error fetching LTC claims:", error);
    return res.status(500).json({ error: "Failed to fetch LTC claims" });
  }
};

// ==============================
// TA (TRAVEL ALLOWANCE) CLAIMS
// ==============================

// Create TA Claim
exports.createTAClaim = async (req, res) => {
  try {
    const {
      employeeId,
      projectName,
      tourType,
      officeTransportation,
      publicTransportation,
      fromPlace,
      toPlace,
      fromDate,
      toDate,
      fare,
      roadMileage,
      dailyAllowance,
      accommodationCharges,
      advanceAdjusted,
      remarks,
    } = req.body;

    let emp = null;
    if (employeeId) {
      emp = await Employee.findById(employeeId);
    } else if (req.user?.employeeId) {
      emp = await Employee.findById(req.user.employeeId);
    }

    const fareAmt = Number(fare || 0);
    const roadAmt = Number(roadMileage || 0);
    const daAmt = Number(dailyAllowance || 0);
    const hotelAmt = Number(accommodationCharges || 0);
    const advAmt = Number(advanceAdjusted || 0);

    const gross = fareAmt + roadAmt + daAmt + hotelAmt;
    const net = Math.max(0, gross - advAmt);

    const newTA = new TAClaim({
      employeeId: emp ? emp._id : employeeId,
      employeeCode: emp ? emp.employeeCode : "",
      designation: emp ? emp.designation : "",
      gradePay: emp?.salaryDetails?.gradePay || emp?.designation || "",
      projectName: projectName || "General Institutional Administration",
      tourType: tourType || "Out-of-station",
      officeTransportation: Boolean(officeTransportation),
      publicTransportation: officeTransportation ? "None" : (publicTransportation || "Train"),
      fromPlace,
      toPlace,
      fromDate,
      toDate,
      fare: fareAmt,
      roadMileage: roadAmt,
      dailyAllowance: daAmt,
      accommodationCharges: hotelAmt,
      grossAmount: gross,
      advanceAdjusted: advAmt,
      netAmount: net,
      remarks,
      status: "submitted",
    });

    await newTA.save();
    return res.status(201).json({
      success: true,
      message: "Tour Travel Allowance (TA) claim submitted successfully.",
      claim: newTA,
    });
  } catch (error) {
    console.error("Error creating TA claim:", error);
    return res.status(500).json({ error: error.message || "Failed to submit TA claim" });
  }
};

// Get All TA Claims
exports.getAllTAClaims = async (req, res) => {
  try {
    const claims = await TAClaim.find()
      .populate("employeeId", "name employeeCode designation cadre department")
      .sort({ createdAt: -1 });

    return res.json({ success: true, count: claims.length, claims });
  } catch (error) {
    console.error("Error fetching TA claims:", error);
    return res.status(500).json({ error: "Failed to fetch TA claims" });
  }
};

// ==============================
// CLAIM STATUS WORKFLOW (Approve / Reject)
// ==============================
exports.updateClaimStatus = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'ltc' or 'ta'
    const { status, remarks } = req.body;

    const validStatuses = ["draft", "submitted", "verified", "approved", "rejected", "paid"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status value." });
    }

    let claim = null;
    if (type.toLowerCase() === "ltc") {
      claim = await LTCClaim.findById(id);
    } else if (type.toLowerCase() === "ta") {
      claim = await TAClaim.findById(id);
    } else {
      return res.status(400).json({ error: "Unsupported claim type. Use 'ltc' or 'ta'." });
    }

    if (!claim) {
      return res.status(404).json({ error: "Claim record not found." });
    }

    claim.status = status;
    if (remarks) claim.remarks = remarks;
    await claim.save();

    return res.json({
      success: true,
      message: `Claim ${status.toUpperCase()} successfully.`,
      claim,
    });
  } catch (error) {
    console.error("Error updating claim status:", error);
    return res.status(500).json({ error: "Failed to update claim status" });
  }
};
