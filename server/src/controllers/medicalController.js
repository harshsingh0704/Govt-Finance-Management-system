const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const MedicalClaim = require("../models/MedicalClaim");
const MedicalAdvance = require("../models/MedicalAdvance");

async function getLinkedEmployee(user) {
  const userId = user?._id || user?.id;

  if (!userId || !mongoose.Types.ObjectId.isValid(String(userId))) {
    return null;
  }

  const linkedId =
    user.employeeId && typeof user.employeeId === "object"
      ? user.employeeId._id
      : user.employeeId;

  if (linkedId && mongoose.Types.ObjectId.isValid(String(linkedId))) {
    const linked = await Employee.findById(linkedId);

    if (linked && String(linked.userId) === String(userId)) {
      return linked;
    }
  }

  return Employee.findOne({ userId });
}

function employeeLinkError(res) {
  return res.status(400).json({
    success: false,
    message:
      "Your account is not linked to an employee record. Please ask the administrator to link your User account to your Employee record.",
  });
}

function amount(value, fieldName) {
  if (value === undefined || value === null || value === "") return 0;

  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) {
    throw new Error(`${fieldName} must be a valid non-negative number.`);
  }

  return n;
}

function optionalDate(value, fieldName) {
  if (value === undefined || value === null || value === "") return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return date;
}


// Medical Advance: create a request with uploaded supporting documents.
exports.createAdvance = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);
    if (!employee) return employeeLinkError(res);

    const body = req.body || {};
    const requiredFields = [
      "employeeNumber",
      "employeeName",
      "designation",
      "department",
      "headquarters",
      "patientName",
      "relationship",
      "patientType",
      "treatmentNature",
      "treatmentType",
      "hospitalName",
      "hospitalLocation",
      "hospitalStatus",
      "proposedTreatment",
      "proposedAdmissionDate",
      "diagnosis",
      "estimatedTreatmentExpense",
      "estimatedMedicineInvestigationExpense",
      "advanceAmountRequested",
    ];

    const missing = requiredFields.filter(
      (key) => typeof body[key] !== "string" || !body[key].trim()
    );

    const files = req.files || {};
    const certificate = files.medicalOfficerCertificate?.[0];
    const estimate = files.medicalHospitalEstimate?.[0];
    const otherDocument = files.otherSupportingDocuments?.[0];

    if (!certificate) missing.push("medicalOfficerCertificate");
    if (!estimate) missing.push("medicalHospitalEstimate");

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Required fields are missing: ${missing.join(", ")}.`,
      });
    }

    const treatmentExpense = amount(
      body.estimatedTreatmentExpense,
      "Estimated treatment expense"
    );
    const medicineExpense = amount(
      body.estimatedMedicineInvestigationExpense,
      "Estimated medicine/investigation expense"
    );
    const otherExpense = amount(
      body.estimatedOtherExpense,
      "Estimated other expense"
    );
    const requestedAmount = amount(
      body.advanceAmountRequested,
      "Advance amount requested"
    );
    const totalEstimatedExpense =
      treatmentExpense + medicineExpense + otherExpense;

    if (requestedAmount > totalEstimatedExpense) {
      return res.status(400).json({
        success: false,
        message: "Advance amount cannot exceed the total estimated expense.",
      });
    }

    const admissionDate = optionalDate(
      body.proposedAdmissionDate,
      "Proposed admission date"
    );

    if (!admissionDate) {
      return res.status(400).json({
        success: false,
        message: "Proposed admission date is required.",
      });
    }

    const documentPath = (file) =>
      file ? `/uploads/medical-advance/${file.filename}` : null;

    const record = await MedicalAdvance.create({
      employeeId: employee._id,
      employeeNumber: String(
        body.employeeNumber || employee.employeeId || employee.employeeCode || ""
      ).trim(),
      employeeName: body.employeeName.trim(),
      designation: body.designation.trim(),
      department: body.department.trim(),
      headquarters: body.headquarters.trim(),

      patientName: body.patientName.trim(),
      relationship: body.relationship.trim(),
      patientType: body.patientType.trim(),

      treatmentNature: body.treatmentNature.trim(),
      treatmentType: body.treatmentType.trim(),
      hospitalName: body.hospitalName.trim(),
      hospitalLocation: body.hospitalLocation.trim(),
      hospitalStatus: body.hospitalStatus.trim(),
      proposedTreatment: body.proposedTreatment.trim(),
      proposedAdmissionDate: admissionDate,
      diagnosis: body.diagnosis.trim(),

      estimatedTreatmentExpense: treatmentExpense,
      estimatedMedicineInvestigationExpense: medicineExpense,
      estimatedOtherExpense: otherExpense,
      totalEstimatedExpense,
      advanceAmountRequested: requestedAmount,

      medicalOfficerCertificate: documentPath(certificate),
      medicalHospitalEstimate: documentPath(estimate),
      otherSupportingDocuments: documentPath(otherDocument),
      remarks: String(body.remarks || "").trim(),

      status: "PENDING",
      currentStage: null,
    });

    return res.status(201).json({
      success: true,
      message: "Medical Advance request saved successfully.",
      record,
    });
  } catch (error) {
    console.error("Medical Advance submission error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError" ||
      error.message?.includes("must be a valid")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save the Medical Advance request.",
    });
  }
};

exports.getMyAdvances = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);
    if (!employee) return employeeLinkError(res);

    const records = await MedicalAdvance.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      records,
    });
  } catch (error) {
    console.error("Medical Advance history error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve Medical Advance requests.",
    });
  }
};

exports.getAdvanceById = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);
    if (!employee) return employeeLinkError(res);

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Medical Advance request ID.",
      });
    }

    const record = await MedicalAdvance.findOne({
      _id: req.params.id,
      employeeId: employee._id,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Medical Advance request not found.",
      });
    }

    return res.status(200).json({
      success: true,
      record,
    });
  } catch (error) {
    console.error("Medical Advance lookup error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve the Medical Advance request.",
    });
  }
};

exports.createClaim = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);
    if (!employee) return employeeLinkError(res);

    const body = req.body || {};
    const requiredFields = [
      "employeeName",
      "designation",
      "department",
      "patientName",
      "relationship",
      "treatmentType",
      "hospitalName",
      "diagnosis",
    ];

    const missing = requiredFields.filter(
      (key) => typeof body[key] !== "string" || !body[key].trim()
    );

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Required fields are missing: ${missing.join(", ")}.`,
      });
    }

    const expenseBreakdown = {
      consultationAmount: amount(body.consultationAmount, "Consultation amount"),
      medicineAmount: amount(body.medicineAmount, "Medicine amount"),
      testAmount: amount(body.testAmount, "Test amount"),
      hospitalAmount: amount(body.hospitalAmount, "Hospital amount"),
      surgeryAmount: amount(body.surgeryAmount, "Surgery amount"),
      otherAmount: amount(body.otherAmount, "Other amount"),
    };

    const totalAmountClaimed = Object.values(expenseBreakdown).reduce(
      (sum, value) => sum + value,
      0
    );

    const advanceTaken = amount(body.advanceTaken, "Advance taken");

    const claim = await MedicalClaim.create({
      employeeId: employee._id,
      employeeNumber: String(
        body.employeeNumber || employee.employeeId || employee.employeeCode || ""
      ).trim(),
      employeeName: body.employeeName.trim(),
      designation: body.designation.trim(),
      gradePay: String(body.gradePay || "").trim(),
      department: body.department.trim(),
      employeeType: String(body.employeeType || "").trim(),

      patientName: body.patientName.trim(),
      relationship: body.relationship.trim(),
      dateOfBirth: optionalDate(body.dateOfBirth, "Date of birth"),
      gender: body.gender || "",
      patientType: body.patientType || "",

      treatmentType: body.treatmentType.trim(),
      hospitalName: body.hospitalName.trim(),
      hospitalLocation: body.hospitalLocation || "",
      admissionDate: optionalDate(body.admissionDate, "Admission date"),
      dischargeDate: optionalDate(body.dischargeDate, "Discharge date"),
      diagnosis: body.diagnosis.trim(),
      treatmentDescription: body.treatmentDescription || "",

      expenseBreakdown,
      totalAmountClaimed,
      advanceTaken,
      netAmountClaimed: totalAmountClaimed - advanceTaken,
      remarks: body.remarks || "",

      status: "PENDING",
      currentStage: null,
    });

    return res.status(201).json({
      success: true,
      message: "Medical claim saved successfully.",
      record: claim,
    });
  } catch (error) {
    console.error("Medical claim submission error:", error);

    if (
      error.name === "ValidationError" ||
      error.name === "CastError" ||
      error.message?.includes("must be a valid")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save the medical claim.",
    });
  }
};

exports.getMyClaims = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);
    if (!employee) return employeeLinkError(res);

    const records = await MedicalClaim.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Medical claims retrieval error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load medical claims.",
    });
  }
};

exports.getClaimById = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);
    if (!employee) return employeeLinkError(res);

    const claim = await MedicalClaim.findOne({
      _id: req.params.id,
      employeeId: employee._id,
    });

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Medical claim not found.",
      });
    }

    return res.json({ success: true, record: claim });
  } catch (error) {
    console.error("Medical claim retrieval error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load the medical claim.",
    });
  }
};

exports.getClaimsByEmployee = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);
    if (!employee) return employeeLinkError(res);

    if (String(employee._id) !== String(req.params.employeeId)) {
      return res.status(403).json({
        success: false,
        message: "You can only view your own medical claims.",
      });
    }

    const records = await MedicalClaim.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.json({ success: true, count: records.length, records });
  } catch (error) {
    console.error("Medical claims retrieval error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load medical claims.",
    });
  }
};

exports.updateClaimStatus = async (req, res) => {
  try {
    const claim = await MedicalClaim.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Medical claim not found.",
      });
    }

    return res.json({ success: true, record: claim });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

