const express = require('express');
const router = express.Router();
const payslipController = require('../controllers/payslipController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, payslipController.getAllPayslips);
router.post('/generate', authMiddleware, payslipController.generatePayslip);
router.get('/:employeeId', authMiddleware, payslipController.getPayslipsByEmployee);
router.get('/download/:id', authMiddleware, payslipController.downloadPayslip);

module.exports = router;
