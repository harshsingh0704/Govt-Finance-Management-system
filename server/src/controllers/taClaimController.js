const TAClaim = require("../models/TAClaim");


// ==========================================
// CREATE TA CLAIM
// ==========================================

const createTAClaim = async (req, res) => {
  try {
    const {
      employee,
      employeeId,
      employeeName,
      designation,
      gradePay,

      projectCode,
      projectName,
      subHead,

      travelAllowance,
      travelType,
      officeTransportation,
      publicTransportation,

      purposeOfTour,
      placesToVisit,
      tourStartDate,
      tourEndDate,

      journeys,

      daRate,
      daDays,

      accommodation,

      roadMileage,
      mileageRate,
      otherExpenses,

      advanceRequested,
      advanceSanctioned,
      previousAdvance,

      documents,
      remarks,
    } = req.body;


    // =====================================
    // REQUIRED FIELD VALIDATION
    // =====================================

    if (!employee) {
      return res.status(400).json({
        success: false,
        message: "Employee reference is required",
      });
    }

    if (!travelType) {
      return res.status(400).json({
        success: false,
        message: "Travel type is required",
      });
    }

    if (!purposeOfTour) {
      return res.status(400).json({
        success: false,
        message: "Purpose of tour is required",
      });
    }

    if (!tourStartDate || !tourEndDate) {
      return res.status(400).json({
        success: false,
        message: "Tour start and end dates are required",
      });
    }


    // =====================================
    // NUMBER CONVERSION
    // =====================================

    const travelAmount = Number(travelAllowance) || 0;

    const roadAmount = Number(roadMileage) || 0;

    const rate = Number(mileageRate) || 0;

    const allowanceRate = Number(daRate) || 0;

    const allowanceDays = Number(daDays) || 0;

    const accommodationAmount =
      Number(accommodation?.totalAmount) || 0;

    const extraExpenses =
      Number(otherExpenses) || 0;

    const advance =
      Number(previousAdvance) || 0;


    // =====================================
    // JOURNEY FARE
    // =====================================

    const totalJourneyFare = (journeys || []).reduce(
      (total, journey) => {
        return total + (Number(journey.fare) || 0);
      },
      0
    );


    // =====================================
    // DAILY ALLOWANCE
    // =====================================

    const totalDA =
      allowanceRate * allowanceDays;


    // =====================================
    // MILEAGE
    // =====================================

    const totalMileage =
      roadAmount * rate;


    // =====================================
    // GROSS AMOUNT
    // =====================================

    const grossAmount =
      travelAmount +
      totalJourneyFare +
      totalDA +
      accommodationAmount +
      totalMileage +
      extraExpenses;


    // =====================================
    // NET AMOUNT
    // =====================================

    const netAmount =
      grossAmount - advance;


    // =====================================
    // CREATE CLAIM
    // =====================================

    const claim = await TAClaim.create({

      employee,

      employeeId,
      employeeName,
      designation,
      gradePay,

      projectCode,
      projectName,
      subHead,

      travelAllowance: travelAmount,

      travelType,

      officeTransportation:
        officeTransportation || false,

      publicTransportation:
        publicTransportation || "NONE",

      purposeOfTour,

      placesToVisit:
        placesToVisit || [],

      tourStartDate,

      tourEndDate,

      journeys:
        journeys || [],

      daRate:
        allowanceRate,

      daDays:
        allowanceDays,

      totalDA,

      accommodation:
        accommodation || {},

      roadMileage:
        roadAmount,

      mileageRate:
        rate,

      otherExpenses:
        extraExpenses,

      advanceRequested:
        Number(advanceRequested) || 0,

      advanceSanctioned:
        Number(advanceSanctioned) || 0,

      previousAdvance:
        advance,

      grossAmount,

      netAmount,

      documents:
        documents || [],

      status: "DRAFT",

      remarks,
    });


    res.status(201).json({
      success: true,
      message: "TA claim created successfully",
      claim,
    });

  } catch (error) {

    console.error("Create TA Claim Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating TA claim",
      error: error.message,
    });
  }
};


// ==========================================
// GET ALL CLAIMS FOR AN EMPLOYEE
// ==========================================

const getEmployeeTAClaims = async (req, res) => {
  try {

    const { employeeId } = req.params;


    const claims = await TAClaim.find({
      employee: employeeId,
    })
      .populate("employee")
      .sort({ createdAt: -1 });


    res.status(200).json({
      success: true,
      count: claims.length,
      claims,
    });

  } catch (error) {

    console.error(
      "Get Employee TA Claims Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while fetching TA claims",
      error: error.message,
    });
  }
};


// ==========================================
// GET SINGLE CLAIM
// ==========================================

const getTAClaimById = async (req, res) => {
  try {

    const claim = await TAClaim.findById(
      req.params.id
    ).populate("employee");


    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "TA claim not found",
      });
    }


    res.status(200).json({
      success: true,
      claim,
    });

  } catch (error) {

    console.error(
      "Get TA Claim Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while fetching TA claim",
      error: error.message,
    });
  }
};


// ==========================================
// UPDATE TA CLAIM
// ==========================================

const updateTAClaim = async (req, res) => {
  try {

    const claim = await TAClaim.findById(
      req.params.id
    );


    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "TA claim not found",
      });
    }


    // Only draft/rejected claims can be edited

    if (
      claim.status !== "DRAFT" &&
      claim.status !== "REJECTED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only draft or rejected claims can be edited",
      });
    }


    const {
      projectCode,
      projectName,
      subHead,

      travelAllowance,
      travelType,
      officeTransportation,
      publicTransportation,

      purposeOfTour,
      placesToVisit,
      tourStartDate,
      tourEndDate,

      journeys,

      daRate,
      daDays,

      accommodation,

      roadMileage,
      mileageRate,
      otherExpenses,

      advanceRequested,
      advanceSanctioned,
      previousAdvance,

      documents,
      remarks,
    } = req.body;


    // =====================================
    // CALCULATIONS
    // =====================================

    const travelAmount =
      Number(travelAllowance) || 0;

    const roadAmount =
      Number(roadMileage) || 0;

    const rate =
      Number(mileageRate) || 0;

    const allowanceRate =
      Number(daRate) || 0;

    const allowanceDays =
      Number(daDays) || 0;

    const accommodationAmount =
      Number(accommodation?.totalAmount) || 0;

    const extraExpenses =
      Number(otherExpenses) || 0;

    const advance =
      Number(previousAdvance) || 0;


    const totalJourneyFare =
      (journeys || []).reduce(
        (total, journey) => {
          return total + (Number(journey.fare) || 0);
        },
        0
      );


    const totalDA =
      allowanceRate * allowanceDays;


    const totalMileage =
      roadAmount * rate;


    const grossAmount =
      travelAmount +
      totalJourneyFare +
      totalDA +
      accommodationAmount +
      totalMileage +
      extraExpenses;


    const netAmount =
      grossAmount - advance;


    // =====================================
    // UPDATE
    // =====================================

    claim.projectCode = projectCode;
    claim.projectName = projectName;
    claim.subHead = subHead;

    claim.travelAllowance = travelAmount;

    claim.travelType = travelType;

    claim.officeTransportation =
      officeTransportation || false;

    claim.publicTransportation =
      publicTransportation || "NONE";

    claim.purposeOfTour =
      purposeOfTour;

    claim.placesToVisit =
      placesToVisit || [];

    claim.tourStartDate =
      tourStartDate;

    claim.tourEndDate =
      tourEndDate;

    claim.journeys =
      journeys || [];

    claim.daRate =
      allowanceRate;

    claim.daDays =
      allowanceDays;

    claim.totalDA =
      totalDA;

    claim.accommodation =
      accommodation || {};

    claim.roadMileage =
      roadAmount;

    claim.mileageRate =
      rate;

    claim.otherExpenses =
      extraExpenses;

    claim.advanceRequested =
      Number(advanceRequested) || 0;

    claim.advanceSanctioned =
      Number(advanceSanctioned) || 0;

    claim.previousAdvance =
      advance;

    claim.grossAmount =
      grossAmount;

    claim.netAmount =
      netAmount;

    claim.documents =
      documents || [];

    claim.remarks =
      remarks;


    await claim.save();


    res.status(200).json({
      success: true,
      message: "TA claim updated successfully",
      claim,
    });

  } catch (error) {

    console.error(
      "Update TA Claim Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Server error while updating TA claim",
      error: error.message,
    });
  }
};


// ==========================================
// SUBMIT TA CLAIM
// ==========================================

const submitTAClaim = async (req, res) => {
  try {

    const claim = await TAClaim.findById(
      req.params.id
    );


    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "TA claim not found",
      });
    }


    if (
      claim.status !== "DRAFT" &&
      claim.status !== "REJECTED"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "This claim cannot be submitted",
      });
    }


    claim.status = "SUBMITTED";

    claim.submittedAt = new Date();


    await claim.save();


    res.status(200).json({
      success: true,
      message:
        "TA claim submitted successfully",
      claim,
    });

  } catch (error) {

    console.error(
      "Submit TA Claim Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Server error while submitting TA claim",
      error: error.message,
    });
  }
};


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  createTAClaim,
  getEmployeeTAClaims,
  getTAClaimById,
  updateTAClaim,
  submitTAClaim,
};