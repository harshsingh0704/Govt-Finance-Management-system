
const Payslip = require("../models/Payslip");
const Employee = require("../models/Employee");
const path = require("path");
const fs = require("fs");
const { generatePayslipPDF } = require("../services/payslipService");

// POST /api/payslips/generate
exports.generatePayslip = async (req, res) => {
  try {
    const payslip = await generatePayslipPDF(req.body);
    return res.status(201).json({
      success: true,
      payslip,
    });
  } catch (err) {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }
};

// GET /api/payslips
// Admin view: all payslips
exports.getAllPayslips = async (req, res) => {
  try {
    const payslips = await Payslip.find()
      .populate({
        path: "employeeId",
        populate: {
          path: "userId",
          select: "name email",
        },
      })
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      payslips,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// GET /api/payslips/mine
// Resolve the employee from the authenticated account.
exports.getMyPayslips = async (req, res) => {
  try {
    const employee = await Employee.findOne({
      userId: req.user._id,
    }).select("_id");

    if (!employee) {
      return res.json({
        success: true,
        payslips: [],
      });
    }

    const payslips = await Payslip.find({
      employeeId: employee._id,
    }).sort({
      year: -1,
      month: -1,
      generatedOn: -1,
    });

    return res.json({
      success: true,
      payslips,
    });
  } catch (err) {
    console.error("Failed to load employee payslips:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to load your payslips",
    });
  }
};

// GET /api/payslips/:employeeId
exports.getPayslipsByEmployee = async (req, res) => {
  try {
    const payslips = await Payslip.find({
      employeeId: req.params.employeeId,
    });

    return res.json({
      success: true,
      payslips,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.message,
    });
  }
};

// GET /api/payslips/download/:id
exports.downloadPayslip = async (req, res) => {
  try {
    const payslip = await Payslip.findById(req.params.id);

    if (!payslip) {
      return res.status(404).json({
        success: false,
        error: "Payslip not found",
      });
    }

    // Employees may download only their own payslips.
    // Other roles must be restricted by the route permissions.
    if (String(req.user.role).toLowerCase() === "employee") {
      const employee = await Employee.findOne({
        userId: req.user._id,
      }).select("_id");

      if (
        !employee ||
        String(payslip.employeeId) !== String(employee._id)
      ) {
        return res.status(403).json({
          success: false,
          error: "You are not allowed to download this payslip",
        });
      }
    }

    const uploadsRoot = path.resolve(
      __dirname,
      "../../uploads/payslips"
    );

    const absolutePath = path.resolve(
      __dirname,
      "../..",
      payslip.filePath || ""
    );

    // Prevent access to files outside the payslip upload directory.
    if (
      !payslip.filePath ||
      !absolutePath.startsWith(uploadsRoot + path.sep) ||
      !fs.existsSync(absolutePath)
    ) {
      return res.status(404).json({
        success: false,
        error: "Payslip PDF file not found",
      });
    }

    return res.download(absolutePath);
  } catch (err) {
    console.error("Failed to download payslip:", err);

    return res.status(500).json({
      success: false,
      error: "Failed to download payslip",
    });
  }
};
