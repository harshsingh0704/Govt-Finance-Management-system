const express = require('express');
const router = express.Router();
const ltcController = require('../controllers/ltcController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateClaimInput } = require('../middleware/validateClaim');

// POST /api/ltc/claim - Submit LTC claim (validates numerical inputs & negative amounts)
router.post('/claim', authMiddleware, validateClaimInput, ltcController.createClaim);

// GET /api/ltc/claim/:id - Fetch single LTC claim details
router.get('/claim/:id', authMiddleware, ltcController.getClaimById);

// GET /api/ltc/claims/:employeeId - Fetch LTC claims history for an employee
router.get('/claims/:employeeId', authMiddleware, ltcController.getClaimsByEmployee);

// PATCH /api/ltc/claim/:id/status - Approve / Reject LTC claim
router.patch('/claim/:id/status', authMiddleware, ltcController.updateClaimStatus);

module.exports = router;