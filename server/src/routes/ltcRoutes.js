const express = require('express');
const router = express.Router();
const ltcController = require('../controllers/ltcController');
const authMiddleware = require('../middleware/authMiddleware');
const ltcAdvanceUpload = require('../middleware/ltcAdvanceUpload');
const { validateClaimInput } = require('../middleware/validateClaim');

// POST /api/ltc/claim - Submit LTC claim (validates numerical inputs & negative amounts)
router.post('/claim', authMiddleware, validateClaimInput, ltcController.createClaim);

// GET /api/ltc/claim/:id - Fetch single LTC claim details
router.get('/claim/:id', authMiddleware, ltcController.getClaimById);

// GET /api/ltc/claims/:employeeId - Fetch LTC claims history for an employee
router.get('/all', authMiddleware, ltcController.getAllClaims);
router.get('/claims/:employeeId', authMiddleware, ltcController.getClaimsByEmployee);

// PATCH /api/ltc/claim/:id/status - Approve / Reject LTC claim
router.patch('/claim/:id/status', authMiddleware, ltcController.updateClaimStatus);


// POST /api/ltc/advance - Save an LTC advance application and its documents.
router.post('/advance', authMiddleware, ltcAdvanceUpload.array('documents', 10), ltcController.createAdvance);

module.exports = router;