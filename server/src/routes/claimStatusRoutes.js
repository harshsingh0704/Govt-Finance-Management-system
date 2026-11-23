const express = require("express");
const router = express.Router();
const { updateClaimStatus, getDashboardSummary } = require("../controllers/claimStatusController");
const authMiddleware = require("../middleware/authMiddleware");

const ALLOWED_STAFF = [
  "Establishment",
  "Super Admin",
  "Admin",
  "Head of Office",
  "Head of Department",
  "Finance Officer",
  "Finance Clerk",
];

const requireWorkflowRole = (req, res, next) => {
  if (!req.user?.role || !ALLOWED_STAFF.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Insufficient workflow permissions.",
    });
  }
  next();
};

router.patch("/update-status", authMiddleware, requireWorkflowRole, updateClaimStatus);
router.get("/dashboard-summary", authMiddleware, getDashboardSummary);

module.exports = router;
