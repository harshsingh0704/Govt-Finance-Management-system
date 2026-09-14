const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/excel/' });
const payrollController = require('../controllers/payrollController');

router.post('/upload', upload.single('file'), payrollController.uploadPayroll);
router.get('/:month/:year', payrollController.getPayrollByMonth);

module.exports = router;