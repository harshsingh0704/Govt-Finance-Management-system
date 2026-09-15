const express = require('express');
const router = express.Router();
const ltcController = require('../controllers/ltcController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/claim', authMiddleware, ltcController.createClaim);
router.get('/claim/:id', authMiddleware, ltcController.getClaimById);
router.get('/claims/:employeeId', authMiddleware, ltcController.getClaimsByEmployee);
router.patch('/claim/:id/status', authMiddleware, ltcController.updateClaimStatus);

module.exports = router;