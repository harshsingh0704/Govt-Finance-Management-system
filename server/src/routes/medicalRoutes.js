const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateClaimInput } = require('../middleware/validateClaim');

// POST /api/medical/claim - Submit Medical claim (validates numerical inputs & negative amounts)
router.post('/claim', authMiddleware, validateClaimInput, medicalController.createClaim);

// GET /api/medical/claim/:id - Fetch single Medical claim details
router.get('/claim/:id', authMiddleware, medicalController.getClaimById);

// GET /api/medical/claims/:employeeId - Fetch Medical claims history for an employee
router.get('/claims/:employeeId', authMiddleware, medicalController.getClaimsByEmployee);

// PATCH /api/medical/claim/:id/status - Approve / Reject Medical claim
router.patch('/claim/:id/status', authMiddleware, medicalController.updateClaimStatus);

module.exports = router;