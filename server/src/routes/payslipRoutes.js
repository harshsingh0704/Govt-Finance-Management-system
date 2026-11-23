const express = require("express");
const router = express.Router();

const payslipController = require("../controllers/payslipController");
const authMiddleware = require("../middleware/authMiddleware");

const PAYSLIP_MANAGERS = [
  "Establishment",
  "Super Admin",
  "Admin",
  "Head of Office",
  "Finance Officer",
  "Finance Clerk",
];

const requirePayslipManager = (req, res, next) => {
  if (!req.user?.role || !PAYSLIP_MANAGERS.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      error: "Access denied. Payslip management requires Finance or Admin permissions.",
    });
  }
  next();
};

router.get("/mine", authMiddleware, payslipController.getMyPayslips);
router.get("/download/:id", authMiddleware, payslipController.downloadPayslip);
router.post("/generate", authMiddleware, requirePayslipManager, payslipController.generatePayslip);
router.get("/", authMiddleware, requirePayslipManager, payslipController.getAllPayslips);
router.get("/:employeeId", authMiddleware, requirePayslipManager, payslipController.getPayslipsByEmployee);

module.exports = router;
