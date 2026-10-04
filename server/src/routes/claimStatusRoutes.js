const express = require('express');
const router = express.Router();
const { updateClaimStatus, getDashboardSummary } = require('../controllers/claimStatusController');

router.patch('/update-status', updateClaimStatus);
router.get('/dashboard-summary', getDashboardSummary);

module.exports = router;
