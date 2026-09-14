const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const Payslip = require('../models/Payslip');

async function generatePayslipPDF(payslipData) {
  const { employeeId, month, year, basicPay, allowances, deductions, netPay } = payslipData;
  const fileName = `payslip_${employeeId}_${month}_${year}.pdf`;
  const filePath = path.join(__dirname, '../../uploads/payslips', fileName);

  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  doc.fontSize(18).text('Payslip', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Employee ID: ${employeeId}`);
  doc.text(`Month/Year: ${month}/${year}`);
  doc.text(`Basic Pay: Rs. ${basicPay}`);
  doc.text(`Allowances: Rs. ${allowances}`);
  doc.text(`Deductions: Rs. ${deductions}`);
  doc.text(`Net Pay: Rs. ${netPay}`);
  doc.end();

  const payslip = new Payslip({
    employeeId, month, year, basicPay, allowances, deductions, netPay,
    filePath: `uploads/payslips/${fileName}`
  });
  await payslip.save();
  return payslip;
}

module.exports = { generatePayslipPDF };