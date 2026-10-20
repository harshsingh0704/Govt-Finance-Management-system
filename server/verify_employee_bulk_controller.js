const XLSX = require("xlsx");
const Employee = require("./src/models/Employee");
const User = require("./src/models/User");
const controller = require("./src/controllers/employeeController");

const original = {
  employeeFind: Employee.find,
  employeeInsertMany: Employee.insertMany,
  userFind: User.find
};

(async () => {
  try {
    const rows = [{
      "Employee ID": "TEST_MASS_001",
      "Full Name": "Dummy Test Employee",
      "Official Email ID": "dummy.mass001@example.com",
      "Joining Date": "2025-01-15",
      "Department Name": "Test Department",
      "Designation": "Test Officer",
      "Payband / Payscale": "Temporary Payband",
      "Functional Role / Authority": "temporary_role_for_testing",
      "Is Supervisor": "No",
      "Supervisor Type": "",
      "Reporting Supervisor": "TEST_SUPERVISOR_001",
      "Position / Incharge": "",
      "Parent Lab": "Yes",
      "Deputation": "No",
      "Parent Research Institute Name": "",
      "Accounts Officer Name": ""
    }];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      XLSX.utils.json_to_sheet(rows),
      "Employees"
    );
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx"
    });

    let insertedDocuments = null;

    Employee.find = () => ({ select: async () => [] });
    User.find = () => ({ select: async () => [] });
    Employee.insertMany = async (docs) => {
      insertedDocuments = docs;
      return docs;
    };

    const req = {
      file: {
        buffer,
        originalname: "dummy_mass_entry.xlsx",
        mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      }
    };

    const res = {
      statusCode: 200,
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      json(body) {
        this.body = body;
        return this;
      }
    };

    await controller.bulkImportEmployees(req, res);

    console.log("HTTP status:", res.statusCode);
    console.log("Response:", JSON.stringify(res.body, null, 2));

    if (
      res.statusCode !== 201 ||
      res.body?.created !== 1 ||
      insertedDocuments?.length !== 1
    ) {
      throw new Error("Controller test failed.");
    }

    const saved = insertedDocuments[0];
    const expected = {
      employeeCode: "TEST_MASS_001",
      name: "Dummy Test Employee",
      email: "dummy.mass001@example.com",
      payband: "Temporary Payband",
      functionalAssignment: "temporary_role_for_testing",
      isSupervisor: false,
      reportingSupervisor: "TEST_SUPERVISOR_001",
      parentLab: "Yes",
      isDeputed: false,
      userId: null
    };

    for (const [key, value] of Object.entries(expected)) {
      if (String(saved[key] ?? "") !== String(value ?? "")) {
        throw new Error(
          `Mismatch for ${key}: expected ${value}, got ${saved[key]}`
        );
      }
    }

    console.log("PASS: Controller mapped all tested fields correctly.");
    console.log("PASS: Database insertion was mocked; no record was created.");
  } catch (error) {
    console.error("FAIL:", error.stack || error.message);
    process.exitCode = 1;
  } finally {
    Employee.find = original.employeeFind;
    Employee.insertMany = original.employeeInsertMany;
    User.find = original.userFind;
  }
})();
