const express = require("express");
const router = express.Router();
const approvalController = require("../controllers/approvalController");
const authMiddleware = require("../middleware/authMiddleware");

// GET all approvals
router.get("/", authMiddleware, approvalController.getApprovalQueue);

// PATCH process approval action
router.patch("/:id/action", authMiddleware, approvalController.processApprovalAction);

module.exports = router;
