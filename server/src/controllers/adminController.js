const Employee = require("../models/Employee");

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


module.exports = {
  authorizeAdmin,
  revokeAdminAuthorization,
};