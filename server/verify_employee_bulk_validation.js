const XLSX = require("xlsx");
const Employee = require("./src/models/Employee");
const User = require("./src/models/User");
const controller = require("./src/controllers/employeeController");

const original = {
  employeeFind: Employee.find,
  employeeInsertMany: Employee.insertMany,
  userFind: User.find
};

function makeWorkbook(rows) {
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), "Employees");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

function makeResponse() {
  return {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; }
  };
}

function validRow(overrides = {}) {
  return {
    "Employee ID": "TEST_MASS_002",
    "Full Name": "Dummy Employee Two",
    "Official Email ID": "dummy.mass002@example.com",
    "Joining Date": "2025-01-15",
    "Department Name": "Test Department",
    "Designation": "Test Officer",
    "Payband / Payscale": "Temporary Payband",
    "Functional Role / Authority": "temporary_role_for_testing",
    "Is Supervisor": "No",
    "Supervisor Type": "",
    "Reporting Supervisor": "SUPERVISOR_TEST",
    "Position / Incharge": "",
    "Parent Lab": "Yes",
    "Deputation": "No",
    "Parent Research Institute Name": "",
    "Accounts Officer Name": "",
    ...overrides
  };
}

(async () => {
  let insertCalls = 0;

  try {
    Employee.find = () => ({ select: async () => [] });
    User.find = () => ({ select: async () => [] });
    Employee.insertMany = async (docs) => {
      insertCalls++;
      return docs;
    };

    // Test 1: missing required employee ID
    let res = makeResponse();
    await controller.bulkImportEmployees({
      file: {
        buffer: makeWorkbook([validRow({ "Employee ID": "" })]),
        originalname: "invalid.xlsx"
      }
    }, res);

    console.log("Invalid-row status:", res.statusCode);
    console.log("Invalid-row response:", JSON.stringify(res.body));

    if (res.statusCode >= 200 && res.statusCode < 300) {
      throw new Error("Invalid row was unexpectedly accepted.");
    }
    if (insertCalls !== 0) {
      throw new Error("Invalid row caused an insertion.");
    }
    console.log("PASS: Invalid row rejected without insertion.");

    // Test 2: duplicate employee IDs within the same workbook
    res = makeResponse();
    await controller.bulkImportEmployees({
      file: {
        buffer: makeWorkbook([
          validRow({ "Employee ID": "DUPLICATE_TEST", "Official Email ID": "first@example.com" }),
          validRow({ "Employee ID": "DUPLICATE_TEST", "Official Email ID": "second@example.com" })
        ]),
        originalname: "duplicates.xlsx"
      }
    }, res);

    console.log("Duplicate-row status:", res.statusCode);
    console.log("Duplicate-row response:", JSON.stringify(res.body));

    if (res.statusCode >= 200 && res.statusCode < 300) {
      throw new Error("Duplicate employee IDs were unexpectedly accepted.");
    }
    if (insertCalls !== 0) {
      throw new Error("Duplicate rows caused an insertion.");
    }
    console.log("PASS: Duplicate IDs rejected without insertion.");

    console.log("PASS: Both negative tests completed; insertMany was never called.");
  } catch (error) {
    console.error("FAIL:", error.stack || error.message);
    process.exitCode = 1;
  } finally {
    Employee.find = original.employeeFind;
    Employee.insertMany = original.employeeInsertMany;
    User.find = original.userFind;
  }
})();
