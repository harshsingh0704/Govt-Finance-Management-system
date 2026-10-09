const express = require("express");

const router = express.Router();

const {
  createTAClaim,
  getEmployeeTAClaims,
  getTAClaimById,
  updateTAClaim,
  submitTAClaim,
} = require("../controllers/taClaimController");


// ==========================================
// CREATE TA CLAIM
// POST /api/ta-claims
// ==========================================

router.post(
  "/",
  createTAClaim
);


// ==========================================
// GET EMPLOYEE CLAIMS
// GET /api/ta-claims/employee/:employeeId
// ==========================================

router.get(
  "/employee/:employeeId",
  getEmployeeTAClaims
);


// ==========================================
// GET SINGLE CLAIM
// GET /api/ta-claims/:id
// ==========================================

router.get(
  "/:id",
  getTAClaimById
);


// ==========================================
// UPDATE CLAIM
// PUT /api/ta-claims/:id
// ==========================================

router.put(
  "/:id",
  updateTAClaim
);


// ==========================================
// SUBMIT CLAIM
// PATCH /api/ta-claims/:id/submit
// ==========================================

router.patch(
  "/:id/submit",
  submitTAClaim
);


module.exports = router;