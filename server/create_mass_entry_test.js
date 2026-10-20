const XLSX = require("xlsx");

const row = {
  "Employee ID": "E2E_MASS_TEST_20261019",
  "Full Name": "Mass Entry Integration Test",
  "Official Email ID": "e2e.mass.test.20261019@example.com",
  "Joining Date": "15/01/2025",
  "Department Name": "Integration Test Department",
  "Designation": "Integration Test Officer",
  "Payband / Payscale": "TEST-PAYBAND",
  "Functional Role / Authority": "temporary_role_for_testing",
  "Is Supervisor": "No",
  "Supervisor Type": "",
  "Reporting Supervisor": "E2E_SUPERVISOR_TEST",
  "Position / Incharge": "",
  "Parent Lab": "Yes",
  "Deputation": "No",
  "Parent Research Institute Name": "",
  "Accounts Officer Name": ""
};

const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(
  workbook,
  XLSX.utils.json_to_sheet([row]),
  "Employees"
);

XLSX.writeFile(workbook, "mass_entry_e2e_test.xlsx");
console.log("PASS: Created mass_entry_e2e_test.xlsx");
