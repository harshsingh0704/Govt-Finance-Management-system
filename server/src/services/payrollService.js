const xlsx = require('xlsx');
const Payroll = require('../models/Payroll');

async function processPayrollExcel(filePath, month, year, uploadedBy, fileName) {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet);

  const records = rows.map(row => {
    const basicPay = Number(row.basicPay || row.BasicPay || 0);
    const allowances = Number(row.allowances || row.Allowances || 0);
    const deductions = Number(row.deductions || row.Deductions || 0);
    return {
      employeeId: row.employeeId || row.EmployeeId,
      basicPay,
      allowances,
      deductions,
      netPay: basicPay + allowances - deductions
    };
  });

  const totalAmount = records.reduce((sum, r) => sum + r.netPay, 0);

  const payroll = new Payroll({
    month, year, uploadedBy, fileName,
    totalEmployees: records.length,
    totalAmount,
    status: 'completed',
    records
  });

  await payroll.save();
  return payroll;
}

module.exports = { processPayrollExcel };