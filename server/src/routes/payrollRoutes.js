const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/excel/' });
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/upload', authMiddleware, upload.single('file'), payrollController.uploadPayroll);
router.get('/:month/:year', authMiddleware, payrollController.getPayrollByMonth);

module.exports = router;