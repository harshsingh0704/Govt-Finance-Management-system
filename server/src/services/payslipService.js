const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const Payslip = require("../models/Payslip");
const Employee = require("../models/Employee");

async function generatePayslipPDF(payslipData) {
  const { employeeId, month, year } = payslipData;
  
  // Fetch employee with linked user details
  const emp = await Employee.findById(employeeId).populate("userId");
  if (!emp) throw new Error("Employee not found");

  const empName = emp.userId ? emp.userId.name : "Employee";
  const empCode = emp.employeeCode || "N/A";
  const designation = emp.designation || "Officer";
  const department = emp.department || "Administration";

  // --- 7th CPC Calculation Rules (From Excel Master Sheet) ---
  const basic = Number(payslipData.basicPay || emp.basicPay || 45000);
  
  // Allowances
  const daPay = Math.round(basic * 0.58); // DA on 7th Pay = 58%
  const taBase = 3600;                     // 7th CPC level base TA
  const daTa = Math.round(taBase * 0.58);   // DA on TA = 58%
  const totalTa = taBase + daTa;           // 5688
  const hra = emp.quartersAvailed ? 0 : Math.round(basic * 0.30); // 30% if no govt quarters
  const specialPay = Number(payslipData.specialPay || 0);

  const totalAllowances = daPay + totalTa + hra + specialPay;
  const grossPay = basic + totalAllowances;

  // Deductions
  const npsEmp = emp.pensionScheme && emp.pensionScheme.includes("NPS") 
    ? Math.round((basic + daPay) * 0.10) 
    : 0; // 10% of Basic + DA
  const profTax = 200;
  const licenseFee = emp.quartersAvailed ? 850 : 0; // Quarter license fee
  const cgegis = 60;
  const otherDeductions = Number(payslipData.deductions || 0);

  const totalDeductions = npsEmp + profTax + licenseFee + cgegis + otherDeductions;
  const netPay = grossPay - totalDeductions;

  // --- PDF Generation ---
  const uploadsDir = path.join(__dirname, "../../uploads/payslips");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  const fileName = `payslip_${empCode}_${month}_${year}.pdf`;
  const filePath = path.join(uploadsDir, fileName);

  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(fs.createWriteStream(filePath));

  // Header
  doc.fontSize(16).text("INSTITUTE OF WOOD SCIENCE AND TECHNOLOGY", { align: "center", bold: true });
  doc.fontSize(10).text("(Indian Council of Forestry Research and Education)", { align: "center" });
  doc.text("18th Cross, Malleshwaram, Bengaluru - 560003", { align: "center" });
  doc.moveDown(0.5);
  doc.fontSize(13).text(`SALARY PAY BILL FOR THE MONTH OF ${month}/${year}`, { align: "center", underline: true });
  doc.moveDown();

  // Employee Meta Table
  doc.fontSize(10);
  doc.text(`Employee Name : ${empName}`, 50, doc.y);
  doc.text(`Employee Code : ${empCode}`, 330, doc.y - 12);
  doc.text(`Designation   : ${designation}`, 50, doc.y + 4);
  doc.text(`Department    : ${department}`, 330, doc.y - 12);
  doc.text(`Cadre Category: ${emp.cadreCategory || "Research"}`, 50, doc.y + 4);
  doc.text(`Pension Scheme: ${emp.pensionScheme || "NPS"}`, 330, doc.y - 12);
  doc.moveDown(1.5);

  // Divider Line
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
  doc.moveDown(0.5);

  // Two Column Breakdown: Earnings vs Deductions
  const startY = doc.y;
  doc.fontSize(11).text("EARNINGS (₹)", 50, startY, { bold: true });
  doc.fontSize(10);
  doc.text(`Basic Pay (7th CPC): ₹${basic.toLocaleString("en-IN")}`, 50, startY + 20);
  doc.text(`DA on Pay (58%)    : ₹${daPay.toLocaleString("en-IN")}`, 50, startY + 36);
  doc.text(`Transport Allowance: ₹${taBase.toLocaleString("en-IN")}`, 50, startY + 52);
  doc.text(`DA on TA (58%)     : ₹${daTa.toLocaleString("en-IN")}`, 50, startY + 68);
  doc.text(`House Rent (HRA)   : ₹${hra.toLocaleString("en-IN")}`, 50, startY + 84);
  if (specialPay > 0) {
    doc.text(`Special Pay        : ₹${specialPay.toLocaleString("en-IN")}`, 50, startY + 100);
  }

  doc.fontSize(11).text("DEDUCTIONS (₹)", 330, startY, { bold: true });
  doc.fontSize(10);
  doc.text(`NPS Employee (10%) : ₹${npsEmp.toLocaleString("en-IN")}`, 330, startY + 20);
  doc.text(`Professional Tax   : ₹${profTax.toLocaleString("en-IN")}`, 330, startY + 36);
  doc.text(`CGEGIS / GSLIS     : ₹${cgegis.toLocaleString("en-IN")}`, 330, startY + 52);
  if (licenseFee > 0) {
    doc.text(`License Fee (Govt) : ₹${licenseFee.toLocaleString("en-IN")}`, 330, startY + 68);
  }
  if (otherDeductions > 0) {
    doc.text(`Other Deductions   : ₹${otherDeductions.toLocaleString("en-IN")}`, 330, startY + 84);
  }

  // Bottom Summary
  const endY = startY + 130;
  doc.moveTo(50, endY).lineTo(550, endY).stroke();
  doc.fontSize(11);
  doc.text(`Gross Earnings: ₹${grossPay.toLocaleString("en-IN")}`, 50, endY + 10, { bold: true });
  doc.text(`Total Deductions: ₹${totalDeductions.toLocaleString("en-IN")}`, 330, endY + 10, { bold: true });
  
  doc.rect(50, endY + 35, 500, 30).fillAndStroke("#f1f5f9", "#cbd5e1");
  doc.fillColor("#0f172a").fontSize(13).text(`NET PAYABLE: ₹${netPay.toLocaleString("en-IN")}`, 70, endY + 43, { bold: true });

  doc.end();

  const payslip = new Payslip({
    employeeId,
    month,
    year,
    basicPay: basic,
    allowances: totalAllowances,
    deductions: totalDeductions,
    netPay,
    filePath: `uploads/payslips/${fileName}`
  });
  await payslip.save();
  return payslip;
}

module.exports = { generatePayslipPDF };
