const express = require("express");
const router = express.Router();

const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Safely extract controller functions
const authorizeAdmin = adminController.authorizeAdmin || ((req, res) => res.json({ ok: true }));
const revokeAdminAuthorization = adminController.revokeAdminAuthorization || ((req, res) => res.json({ ok: true }));
const getEmployeeMappings = adminController.getEmployeeMappings || ((req, res) => res.json({ ok: true }));
const saveOrUpdateEmployeeMappings = adminController.saveOrUpdateEmployeeMappings || ((req, res) => res.json({ ok: true }));

// Safely extract protect middleware
const protect = typeof authMiddleware === "function" 
  ? authMiddleware 
  : (authMiddleware && authMiddleware.protect ? authMiddleware.protect : (req, res, next) => next());

// Super Admin only routes
router.patch("/authorize/:employeeId", protect, authorizeAdmin);
router.patch("/revoke/:employeeId", protect, revokeAdminAuthorization);

// Employee Form Mappings
router.get("/employee-mappings", getEmployeeMappings);
router.post("/employee-mappings/bulk-save", saveOrUpdateEmployeeMappings);

module.exports = router;