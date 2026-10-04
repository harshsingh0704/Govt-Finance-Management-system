const express = require("express");
const router = express.Router();
const claimController = require("../controllers/claimController");
const authMiddleware = require("../middleware/authMiddleware");

// LTC Claims Endpoints
router.post("/ltc", authMiddleware, claimController.createLTCClaim);
router.get("/ltc", authMiddleware, claimController.getAllLTCClaims);

// TA Claims Endpoints
router.post("/ta", authMiddleware, claimController.createTAClaim);
router.get("/ta", authMiddleware, claimController.getAllTAClaims);

// Status Update (Approval Workflow)
router.patch("/:type/:id/status", authMiddleware, claimController.updateClaimStatus);

module.exports = router;
