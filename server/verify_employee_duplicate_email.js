const XLSX = require("xlsx");
const Employee = require("./src/models/Employee");
const User = require("./src/models/User");
const controller = require("./src/controllers/employeeController");

const original = {
  employeeFind: Employee.find,
  employeeInsertMany: Employee.insertMany,
  userFind: User.find
};

function makeWorkbook() {
  const row = {
    "Employee ID": "EMAIL_DUPLICATE_TEST",
    "Full Name": "Email Duplicate Test",
    "Official Email ID": "existing@example.com",
    "Joining Date": "2025-01-15",
    "Department Name": "Test Department",
    "Designation": "Test Officer",
    "Payband / Payscale": "Test Payband",
    "Functional Role / Authority": "temporary_role",
    "Is Supervisor": "No",
    "Supervisor Type": "",
    "Reporting Supervisor": "SUPERVISOR_TEST",
    "Position / Incharge": "",
    "Parent Lab": "Yes",
    "Deputation": "No",
    "Parent Research Institute Name": "",
    "Accounts Officer Name": ""
  };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet([row]), "Employees");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

(async () => {
  let insertCalls = 0;

  try {
    Employee.find = () => ({
      select: async () => []
    });

    User.find = () => ({
      select: async () => [{ email: "existing@example.com" }]
    });

    Employee.insertMany = async docs => {
      insertCalls++;
      return docs;
    };

    const res = {
      statusCode: 200,
      body: null,
      status(code) { this.statusCode = code; return this; },
      json(body) { this.body = body; return this; }
    };

    await controller.bulkImportEmployees({
      file: {
        buffer: makeWorkbook(),
        originalname: "duplicate_email_test.xlsx"
      }
    }, res);

    console.log("HTTP status:", res.statusCode);
    console.log("Response:", JSON.stringify(res.body, null, 2));

    if (res.statusCode < 400 || insertCalls !== 0) {
      throw new Error("Existing email was not safely rejected.");
    }

    console.log("PASS: Existing user email rejected; no insertion attempted.");
  } catch (error) {
    console.error("FAIL:", error.stack || error.message);
    process.exitCode = 1;
  } finally {
    Employee.find = original.employeeFind;
    Employee.insertMany = original.employeeInsertMany;
    User.find = original.userFind;
  }
})();
