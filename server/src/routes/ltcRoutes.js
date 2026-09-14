const express = require('express');
const router = express.Router();
const ltcController = require('../controllers/ltcController');

router.post('/claim', ltcController.createClaim);
router.get('/claim/:id', ltcController.getClaimById);
router.get('/claims/:employeeId', ltcController.getClaimsByEmployee);
router.patch('/claim/:id/status', ltcController.updateClaimStatus);

module.exports = router;