const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');

router.post('/generate', payslipController.generatePayslip);
router.get('/:employeeId', payslipController.getPayslipsByEmployee);
router.get('/download/:id', payslipController.downloadPayslip);

module.exports = router;