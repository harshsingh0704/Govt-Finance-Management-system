const Employee = require("../models/Employee");
const EmployeeFormMapping = require("../models/EmployeeFormMapping");

const ALLOWED_LOCATIONS = Employee.LOCATIONS || [
  "Main Office",
  "Peenya Office",
  "Gottipura Field Station",
  "Kolkata Field Station",
];

const ALLOWED_DOMAINS = Employee.DOMAINS || [
  "Finance",
  "Admin",
  "IT Support",
  "Purchases & Receipts",
  "Estate Related",
  "Vehicle Requests",
  "Research",
];

// ==========================================
// AUTHORIZE EMPLOYEE AS ADMIN
// ==========================================
const authorizeAdmin = async (req, res, next) => {
  try {
    const { employeeId } = req.params;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required.",
      });
    }

    const normalizedId = employeeId.toUpperCase().trim();
    const employee = await Employee.findOne({
      $or: [{ employeeId: normalizedId }, { employeeCode: normalizedId }],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (employee.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "This employee is inactive.",
      });
    }

    if (employee.adminEligible) {
      return res.status(400).json({
        success: false,
        message: "Employee is already authorized as Admin.",
      });
    }

    employee.adminEligible = true;
    employee.adminApprovedAt = new Date();
    employee.adminApprovedBy = req.user?._id || null;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee has been authorized to create an Admin account.",
      employee: {
        employeeId: employee.employeeId || employee.employeeCode,
        name: employee.name,
        location: employee.location,
        domain: employee.domain,
        department: employee.department,
        adminEligible: employee.adminEligible,
        adminApprovedAt: employee.adminApprovedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// REMOVE ADMIN ELIGIBILITY
// ==========================================
const revokeAdminAuthorization = async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const normalizedId = String(employeeId || "").toUpperCase().trim();

    const employee = await Employee.findOne({
      $or: [{ employeeId: normalizedId }, { employeeCode: normalizedId }],
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    employee.adminEligible = false;
    employee.adminApprovedAt = null;
    employee.adminApprovedBy = null;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Admin authorization revoked successfully.",
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// BULK SAVE / UPDATE EMPLOYEE MAPPINGS
// ==========================================
const saveOrUpdateEmployeeMappings = async (req, res) => {
  try {
    const { mappings } = req.body;

    if (!Array.isArray(mappings) || mappings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid or empty mappings payload",
      });
    }

    const bulkOps = mappings.map((item) => {
      const cleanId = String(item.employeeId || "").trim().toUpperCase();
      const rawLoc = String(item.location || "Main Office").trim();
      const location = ALLOWED_LOCATIONS.includes(rawLoc) ? rawLoc : "Main Office";
      const rawDom = String(item.domain || item.department || "Finance").trim();
      const domain = ALLOWED_DOMAINS.includes(rawDom) ? rawDom : "Finance";

      return {
        updateOne: {
          filter: { employeeId: cleanId },
          update: {
            $set: {
              employeeId: cleanId,
              employeeName: item.employeeName || item.name || cleanId,
              userType: item.userType || item.functionalRole || "Employee",
              location,
              domain,
              department: item.department || domain || "Finance",
              designation: item.designation || "Staff",
              responsibilities: item.responsibilities || {
                taClaim: !!item.taClaim,
                taAdvance: !!item.taAdvance,
                ltcClaim: !!item.ltcClaim,
                ltcAdvance: !!item.ltcAdvance,
                medicalClaim: !!item.medicalClaim,
                medicalAdvance: !!item.medicalAdvance,
                accommodation: !!item.accommodation,
              },
              isLocked: item.isLocked !== undefined ? !!item.isLocked : false,
              updatedBy: req.user?._id || undefined,
            },
          },
          upsert: true,
        },
      };
    });

    await EmployeeFormMapping.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "Employee mappings saved to MongoDB successfully.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// ==========================================
// GET ALL EMPLOYEE MAPPINGS
// ==========================================
const getEmployeeMappings = async (req, res) => {
  try {
    const filter = {};
    if (req.query.location && ALLOWED_LOCATIONS.includes(req.query.location)) {
      filter.location = req.query.location;
    }
    if (req.query.domain && ALLOWED_DOMAINS.includes(req.query.domain)) {
      filter.domain = req.query.domain;
    }

    const mappings = await EmployeeFormMapping.find(filter).sort({ employeeId: 1 });
    return res.status(200).json({ success: true, data: mappings });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  authorizeAdmin,
  revokeAdminAuthorization,
  saveOrUpdateEmployeeMappings,
  getEmployeeMappings,
};
