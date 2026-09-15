const express = require('express');
const router = express.Router();
const taController = require('../controllers/taController');
const authMiddleware = require('../middleware/authMiddleware');
const { validateClaimInput } = require('../middleware/validateClaim');

// POST /api/ta/advance - Apply for TA advance (validates negative amounts)
router.post('/advance', authMiddleware, validateClaimInput, taController.createAdvance);

// POST /api/ta/claim - Submit TA claim (validates numerical inputs)
router.post('/claim', authMiddleware, validateClaimInput, taController.createClaim);

// GET /api/ta/claim/:id - Fetch single claim details
router.get('/claim/:id', authMiddleware, taController.getClaimById);

// GET /api/ta/claims/:employeeId - Fetch claims history for an employee
router.get('/claims/:employeeId', authMiddleware, taController.getClaimsByEmployee);

// PATCH /api/ta/claim/:id/status - Approve / Reject claim
router.patch('/claim/:id/status', authMiddleware, taController.updateClaimStatus);

module.exports = router;