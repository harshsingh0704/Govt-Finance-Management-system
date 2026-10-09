const Employee = require("../models/Employee");
const EmployeeFormMapping = require("../models/EmployeeFormMapping");

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

    const employee = await Employee.findOne({
      employeeId: employeeId.toUpperCase().trim(),
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found.",
      });
    }

    if (!employee.isActive) {
      return res.status(403).json({
        success: false,
        message: "This employee is inactive.",
      });
    }

    // Already authorized
    if (employee.adminEligible) {
      return res.status(400).json({
        success: false,
        message: "Employee is already authorized as Admin.",
      });
    }

    employee.adminEligible = true;
    employee.adminApprovedAt = new Date();
    employee.adminApprovedBy = req.user._id;

    await employee.save();

    return res.status(200).json({
      success: true,
      message: "Employee has been authorized to create an Admin account.",
      employee: {
        employeeId: employee.employeeId,
        name: employee.fullName,
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

    const employee = await Employee.findOne({
      employeeId: employeeId.toUpperCase().trim(),
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
      return res.status(400).json({ success: false, message: "Invalid or empty mappings payload" });
    }

    const bulkOps = mappings.map((item) => ({
      updateOne: {
        filter: { employeeId: item.employeeId },
        update: {
          $set: {
            employeeName: item.employeeName || item.name,
            userType: item.userType || "Employee",
            department: item.department || "General",
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
            isLocked: item.isLocked !== undefined ? item.isLocked : false,
          },
        },
        upsert: true,
      },
    }));

    await EmployeeFormMapping.bulkWrite(bulkOps);

    return res.status(200).json({
      success: true,
      message: "MongoDB me Employee Mappings successfully update ho gaye hain",
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
    const mappings = await EmployeeFormMapping.find().sort({ employeeId: 1 });
    return res.status(200).json({ success: true, data: mappings });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// SINGLE COMBINED EXPORT FOR ALL CONTROLLERS
module.exports = {
  authorizeAdmin,
  revokeAdminAuthorization,
  saveOrUpdateEmployeeMappings,
  getEmployeeMappings,
};