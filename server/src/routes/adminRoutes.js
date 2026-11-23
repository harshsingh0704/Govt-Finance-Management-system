const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

const requireAdminOrSuperAdmin = (req, res, next) => {
  const role = req.user?.role;
  if (!role || !["Admin", "Super Admin", "Establishment"].includes(role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required.",
    });
  }
  next();
};

// Super Admin / Admin authorization routes
router.patch(
  "/authorize/:employeeId",
  authMiddleware,
  requireAdminOrSuperAdmin,
  adminController.authorizeAdmin
);
router.patch(
  "/revoke/:employeeId",
  authMiddleware,
  requireAdminOrSuperAdmin,
  adminController.revokeAdminAuthorization
);

// Employee Form Mappings
router.get(
  "/employee-mappings",
  authMiddleware,
  requireAdminOrSuperAdmin,
  adminController.getEmployeeMappings
);
router.post(
  "/employee-mappings/bulk-save",
  authMiddleware,
  requireAdminOrSuperAdmin,
  adminController.saveOrUpdateEmployeeMappings
);

module.exports = router;
