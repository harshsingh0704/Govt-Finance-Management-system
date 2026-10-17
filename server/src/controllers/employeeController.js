
const Employee = require("../models/Employee");
const User = require("../models/User");
const XLSX = require("xlsx");

// GET /api/employees
// Get all employees for dropdowns and lists
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await Employee.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    const formatted = employees.map((emp) => ({
      _id: emp._id,
      userId: emp.userId?._id || emp.userId || null,
      name: emp.userId?.name || emp.name || "Unnamed Employee",
      email: emp.userId?.email || emp.email || "",
      employeeCode: emp.employeeCode || "N/A",
      department: emp.department,
      designation: emp.designation,
      functionalAssignment: emp.functionalAssignment || "Employee",
      basicPay: emp.basicPay ?? 45000,
    }));

    return res.json({
      success: true,
      employees: formatted,
    });
  } catch (err) {
    console.error("Get employees error:", err);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees.",
      error: err.message,
    });
  }
};

// POST /api/employees
// Create a single employee profile
exports.createEmployee = async (req, res) => {
  try {
    const {
      userId,
      employeeCode,
      department,
      designation,
      functionalAssignment,
      basicPay,
      bankAccount,
      ifscCode,
    } = req.body;

    const employee = await Employee.create({
      userId: userId || null,
      employeeCode,
      department: department || "General Administration",
      designation: designation || "Officer",
      functionalAssignment: functionalAssignment || "Employee",
      basicPay: basicPay ?? 45000,
      bankAccount,
      ifscCode,
    });

    return res.status(201).json({
      success: true,
      employee,
    });
  } catch (err) {
    console.error("Create employee error:", err);

    return res.status(400).json({
      success: false,
      message: "Failed to create employee.",
      error: err.message,
    });
  }
};

// POST /api/employees/bulk-import
// Import employee master records from Excel
exports.bulkImportEmployees = async (req, res) => {
  try {
    // 1. Check uploaded file
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file.",
      });
    }

    // 2. Read Excel workbook from memory
    const workbook = XLSX.read(req.file.buffer, {
      type: "buffer",
    });

    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return res.status(400).json({
        success: false,
        message: "The Excel file contains no worksheets.",
      });
    }

    const sheet = workbook.Sheets[firstSheetName];

    if (!sheet) {
      return res.status(400).json({
        success: false,
        message: "Could not read the first worksheet.",
      });
    }

    const rows = XLSX.utils.sheet_to_json(sheet, {
      defval: "",
      raw: false,
    });

    if (!rows.length) {
      return res.status(400).json({
        success: false,
        message: "The Excel worksheet is empty.",
      });
    }

    if (rows.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Upload a maximum of 1000 employees per batch.",
      });
    }

    // 3. Normalize column names so these headers are equivalent:
    // Employee_ID, Employee ID, employeeId, Employee-ID
    const normalizeKey = (key) =>
      String(key)
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, "");

    const getValue = (row, ...keys) => {
      const normalizedRow = {};

      for (const [key, value] of Object.entries(row)) {
        normalizedRow[normalizeKey(key)] = value;
      }

      for (const key of keys) {
        const value = normalizedRow[normalizeKey(key)];

        if (
          value !== undefined &&
          value !== null &&
          String(value).trim() !== ""
        ) {
          return String(value).trim();
        }
      }

      return "";
    };

    // 4. Supported functional assignments
    const allowedAssignments = new Set([
      "Employee",
      "Head of Office",
      "Head of Department",
      "Finance Officer",
      "Finance Clerk",
      "IT Cell In-charge",
      "Sample In-charge",
      "Facilities In-charge",
      "Vehicles In-charge",
      "Field Station 1 In-charge",
      "Field Station 2 In-charge",
    ]);

    const errors = [];
    const seenCodes = new Set();
    const candidates = [];

    // 5. Validate Excel rows
    rows.forEach((row, index) => {
      const rowNumber = index + 2;

      const employeeCode = getValue(
        row,
        "Employee_ID",
        "Employee ID",
        "employeeCode",
        "Employee Code"
      );

      const name = getValue(
        row,
        "Full_Name",
        "Full Name",
        "name",
        "Employee Name"
      );

      const email = getValue(row, "Email", "Email Address");
      const department = getValue(row, "Department");
      const designation =
        getValue(row, "Designation") || "Officer";

      const functionalAssignment =
        getValue(
          row,
          "Functional_Assignment",
          "Functional Assignment"
        ) || "Employee";

      if (!employeeCode || !name || !department) {
        errors.push({
          row: rowNumber,
          employeeCode: employeeCode || "",
          message:
            "Employee ID, Full Name, and Department are required.",
        });

        return;
      }

      const normalizedCode = employeeCode.toUpperCase();

      if (seenCodes.has(normalizedCode)) {
        errors.push({
          row: rowNumber,
          employeeCode,
          message: "Duplicate Employee ID in the Excel file.",
        });

        return;
      }

      seenCodes.add(normalizedCode);

      if (!allowedAssignments.has(functionalAssignment)) {
        errors.push({
          row: rowNumber,
          employeeCode,
          message: `Invalid functional assignment: ${functionalAssignment}`,
        });

        return;
      }

      const basicPayText = getValue(
        row,
        "Basic_Pay",
        "Basic Pay",
        "basicPay"
      );

      const basicPay = basicPayText
        ? Number(basicPayText.replace(/,/g, ""))
        : 45000;

      if (!Number.isFinite(basicPay) || basicPay < 0) {
        errors.push({
          row: rowNumber,
          employeeCode,
          message: "Basic Pay must be a non-negative number.",
        });

        return;
      }

      candidates.push({
        employeeCode,
        name,
        email,
        department,
        designation,
        functionalAssignment,
        basicPay,
        rowNumber,
      });
    });

    if (!candidates.length) {
      return res.status(400).json({
        success: false,
        message: "No valid employee rows were found.",
        totalRows: rows.length,
        created: 0,
        failed: errors.length,
        errors,
      });
    }

    // 6. Check employee IDs already in MongoDB
    const existing = await Employee.find({
      employeeCode: {
        $in: candidates.map((employee) => employee.employeeCode),
      },
    }).select("employeeCode");

    const existingCodes = new Set(
      existing.map((employee) =>
        String(employee.employeeCode).toUpperCase()
      )
    );

    // 7. Prepare new employee master records
    const newEmployees = [];

    for (const employee of candidates) {
      if (existingCodes.has(employee.employeeCode.toUpperCase())) {
        errors.push({
          row: employee.rowNumber,
          employeeCode: employee.employeeCode,
          message: "Employee ID already exists in MongoDB.",
        });

        continue;
      }

      newEmployees.push({
        employeeCode: employee.employeeCode,
        name: employee.name,
        email: employee.email,
        department: employee.department,
        designation: employee.designation,
        functionalAssignment: employee.functionalAssignment,
        basicPay: employee.basicPay,

        // Imported employee records do not need login accounts.
        userId: null,
      });
    }

    // 8. Save records to MongoDB
    let created = 0;

    if (newEmployees.length > 0) {
      const inserted = await Employee.insertMany(newEmployees, {
        ordered: true,
      });

      created = inserted.length;
    }

    // 9. Return import summary
    return res.status(201).json({
      success: true,
      message:
        created > 0
          ? "Employee bulk import completed."
          : "No new employees were imported.",
      totalRows: rows.length,
      created,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    console.error("Employee bulk import error:", error);

    // Mongoose schema validation failure
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: "Employee data failed schema validation.",
        error: error.message,
      });
    }

    // Invalid MongoDB field value
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid employee field value.",
        error: error.message,
      });
    }

    // Duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A duplicate employee record already exists.",
        error: error.message,
        duplicateKey: error.keyValue || null,
      });
    }

    // Unexpected database or server error
    return res.status(500).json({
      success: false,
      message: "Employee import failed.",
      error: error.message,
    });
  }
};
