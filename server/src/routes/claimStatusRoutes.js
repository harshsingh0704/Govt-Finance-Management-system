const express = require('express');
const router = express.Router();
const { updateClaimStatus } = require('../controllers/claimStatusController');

router.patch('/update-status', updateClaimStatus);

module.exports = router;
