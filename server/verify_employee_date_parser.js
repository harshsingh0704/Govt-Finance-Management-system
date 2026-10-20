const XLSX = require("xlsx");
const Employee = require("./src/models/Employee");
const User = require("./src/models/User");
const controller = require("./src/controllers/employeeController");

const original = {
  find: Employee.find,
  insertMany: Employee.insertMany,
  userFind: User.find
};

function workbookFor(date) {
  const row = {
    "Employee ID": "DATE_TEST",
    "Full Name": "Date Test Employee",
    "Official Email ID": "date.test@example.com",
    "Joining Date": date,
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

async function run(date) {
  let captured;
  Employee.find = () => ({ select: async () => [] });
  User.find = () => ({ select: async () => [] });
  Employee.insertMany = async docs => {
    captured = docs;
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
      buffer: workbookFor(date),
      originalname: "date_test.xlsx"
    }
  }, res);

  return { res, captured };
}

(async () => {
  try {
    for (const date of ["2025-01-15", "15/01/2025", "15-01-2025"]) {
      const result = await run(date);
      if (result.res.statusCode !== 201) {
        throw new Error(`${date} rejected: ${JSON.stringify(result.res.body)}`);
      }
      const actual = new Date(result.captured[0].joiningDate).toISOString().slice(0, 10);
      if (actual !== "2025-01-15") {
        throw new Error(`${date} parsed incorrectly as ${actual}`);
      }
      console.log(`PASS: ${date} -> ${actual}`);
    }

    const invalid = await run("31/02/2025");
    if (invalid.res.statusCode >= 200 && invalid.res.statusCode < 300) {
      throw new Error("Impossible calendar date was accepted.");
    }
    console.log("PASS: Impossible date rejected.");
  } catch (error) {
    console.error("FAIL:", error.stack || error.message);
    process.exitCode = 1;
  } finally {
    Employee.find = original.find;
    Employee.insertMany = original.insertMany;
    User.find = original.userFind;
  }
})();
