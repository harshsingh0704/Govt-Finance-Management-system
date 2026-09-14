const express = require('express');
const router = express.Router();
const medicalController = require('../controllers/medicalController');

router.post('/claim', medicalController.createClaim);
router.get('/claim/:id', medicalController.getClaimById);
router.get('/claims/:employeeId', medicalController.getClaimsByEmployee);
router.patch('/claim/:id/status', medicalController.updateClaimStatus);

module.exports = router;