
const express = require("express");
const router = express.Router();

const payslipController = require("../controllers/payslipController");
const authMiddleware = require("../middleware/authMiddleware");

router.get("/mine", authMiddleware, payslipController.getMyPayslips);

router.get("/download/:id", authMiddleware, payslipController.downloadPayslip);

router.post("/generate", authMiddleware, payslipController.generatePayslip);

router.get("/", authMiddleware, payslipController.getAllPayslips);

router.get("/:employeeId", authMiddleware, payslipController.getPayslipsByEmployee);

module.exports = router;
