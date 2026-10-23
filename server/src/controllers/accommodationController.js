const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const Accommodation = require("../models/Accommodation");

function getTodayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

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

function dateIsValid(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
}

function dateValue(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function employeeLinkError(res) {
  return res.status(400).json({
    success: false,
    message:
      "Your account is not linked to an employee record. Please ask the administrator to link your User account to your Employee record.",
  });
}

exports.createAccommodation = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);

    if (!employee) {
      return employeeLinkError(res);
    }

    const {
      employeeNumber,
      employeeName,
      instituteJoiningDate,
      officeAccommodation,
      requestDate,
      approvalDate,
      occupancyDate,
      quartersType,
    } = req.body || {};

    const requiredValues = {
      employeeNumber,
      employeeName,
      instituteJoiningDate,
      officeAccommodation,
      requestDate,
      approvalDate,
      occupancyDate,
      quartersType,
    };

    const missing = Object.entries(requiredValues)
      .filter(([, value]) => value === undefined || value === null || String(value).trim() === "")
      .map(([key]) => key);

    if (missing.length) {
      return res.status(400).json({
        success: false,
        message: `Required fields are missing: ${missing.join(", ")}.`,
      });
    }

    if (!dateIsValid(instituteJoiningDate)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid institute joining date.",
      });
    }

    for (const [label, value] of [
      ["Request Date", requestDate],
      ["Approval Date", approvalDate],
      ["Occupancy Date", occupancyDate],
    ]) {
      if (!dateIsValid(value)) {
        return res.status(400).json({
          success: false,
          message: `${label} must be a valid date in YYYY-MM-DD format.`,
        });
      }
    }

    if (requestDate < getTodayInIndia()) {
      return res.status(400).json({
        success: false,
        message: "Request Date must be today or a future date.",
      });
    }

    if (approvalDate < requestDate) {
      return res.status(400).json({
        success: false,
        message: "Approval Date cannot be earlier than Request Date.",
      });
    }

    if (occupancyDate < approvalDate) {
      return res.status(400).json({
        success: false,
        message: "Occupancy Date cannot be earlier than Approval Date.",
      });
    }

    if (!["Yes", "No"].includes(officeAccommodation)) {
      return res.status(400).json({
        success: false,
        message: "Office Accommodation must be Yes or No.",
      });
    }

    if (!["Type 1", "Type 2", "Type 3", "Type 4"].includes(quartersType)) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid quarters type.",
      });
    }

    const record = await Accommodation.create({
      employeeId: employee._id,
      employeeNumber: String(employeeNumber).trim(),
      employeeName: String(employeeName).trim(),
      instituteJoiningDate: dateValue(instituteJoiningDate),
      officeAccommodation,
      requestDate: dateValue(requestDate),
      approvalDate: dateValue(approvalDate),
      occupancyDate: dateValue(occupancyDate),
      quartersType,
      status: "submitted",
    });

    return res.status(201).json({
      success: true,
      message: "Accommodation application saved successfully.",
      record,
    });
  } catch (error) {
    console.error("Accommodation submission error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Unable to save the accommodation application.",
    });
  }
};

exports.getMyAccommodations = async (req, res) => {
  try {
    const employee = await getLinkedEmployee(req.user);

    if (!employee) {
      return employeeLinkError(res);
    }

    const records = await Accommodation.find({
      employeeId: employee._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    console.error("Accommodation retrieval error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load accommodation records.",
    });
  }
};
