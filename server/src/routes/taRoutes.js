const express = require('express');
const router = express.Router();
const taController = require('../controllers/taController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/advance', authMiddleware, taController.createAdvance);
router.post('/claim', authMiddleware, taController.createClaim);
router.get('/claim/:id', authMiddleware, taController.getClaimById);
router.get('/claims/:employeeId', authMiddleware, taController.getClaimsByEmployee);
router.patch('/claim/:id/status', authMiddleware, taController.updateClaimStatus);

module.exports = router;