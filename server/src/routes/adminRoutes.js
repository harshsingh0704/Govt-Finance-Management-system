const express = require("express");

const router = express.Router();

const {
  authorizeAdmin,
  revokeAdminAuthorization,
} = require("../controllers/adminController");

const { protect } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Super Admin only
router.patch(
  "/authorize/:employeeId",
  protect,
  requireRole("super_admin"),
  authorizeAdmin
);

// Super Admin only
router.patch(
  "/revoke/:employeeId",
  protect,
  requireRole("super_admin"),
  revokeAdminAuthorization
);

module.exports = router;
