const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/claim', authMiddleware, medicalController.createClaim);
router.get('/claim/:id', authMiddleware, medicalController.getClaimById);
router.get('/claims/:employeeId', authMiddleware, medicalController.getClaimsByEmployee);
router.patch('/claim/:id/status', authMiddleware, medicalController.updateClaimStatus);

module.exports = router;