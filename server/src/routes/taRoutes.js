const express = require('express');
const router = express.Router();
const taController = require('../controllers/taController');

router.post('/advance', taController.createAdvance);
router.post('/claim', taController.createClaim);
router.get('/claim/:id', taController.getClaimById);
router.get('/claims/:employeeId', taController.getClaimsByEmployee);
router.patch('/claim/:id/status', taController.updateClaimStatus);

module.exports = router;