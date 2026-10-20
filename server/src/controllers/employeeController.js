
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
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file.",
      });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName || !workbook.Sheets[sheetName]) {
      return res.status(400).json({
        success: false,
        message: "The Excel file contains no readable worksheet.",
      });
    }

    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
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

    const norm = (s) => String(s ?? "").trim().toLowerCase()
      .replace(/[\s_-]+/g, "");
    const value = (row, ...aliases) => {
      const map = {};
      for (const [k, v] of Object.entries(row)) map[norm(k)] = v;
      for (const alias of aliases) {
        const v = map[norm(alias)];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          return String(v).trim();
        }
      }
      return "";
    };
    const yesNo = (v) => {
      const s = String(v).trim().toLowerCase();
      if (["yes", "y", "true", "1"].includes(s)) return true;
      if (["no", "n", "false", "0"].includes(s)) return false;
      return null;
    };
    const parseDate = (v) => {
      if (v === null || v === undefined || String(v).trim() === "") {
        return null;
      }

      if (typeof v === "number" && Number.isFinite(v)) {
        if (v < 1 || v > 2958465) return null;
        const d = new Date(Date.UTC(1899, 11, 30) + v * 86400000);
        return Number.isNaN(d.getTime()) ? null : d;
      }

      const text = String(v).trim();
      let year, month, day;
      let match = text.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);

      if (match) {
        [, year, month, day] = match.map(Number);
      } else {
        match = text.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
        if (!match) return null;
        [, day, month, year] = match.map(Number);
      }

      const d = new Date(Date.UTC(year, month - 1, day));

      if (
        d.getUTCFullYear() !== year ||
        d.getUTCMonth() !== month - 1 ||
        d.getUTCDate() !== day
      ) {
        return null;
      }

      return d;
    };

    const errors = [];
    const candidates = [];
    const seenCodes = new Set();
    const seenEmails = new Set();

    rows.forEach((row, i) => {
      const rowNumber = i + 2;
      const employeeCode = value(row, "Employee ID", "Employee_ID",
        "employeeCode", "Employee Code");
      const name = value(row, "Full Name", "Full_Name", "name",
        "Employee Name");
      const email = value(row, "Official Email ID", "Official Email",
        "Email", "Email Address").toLowerCase();
      const joiningText = value(row, "Joining Date", "joiningDate");
      const department = value(row, "Department Name", "Department");
      const designation = value(row, "Designation");
      const payband = value(row, "Payband / Payscale", "Payband",
        "Payscale", "Pay Scale");
      const functionalAssignment = value(row, "Functional Role / Authority",
        "Functional Role", "Functional Assignment", "Functional_Assignment");
      const supervisorFlagText = value(row, "Is Supervisor", "isSupervisor");
      const supervisorFlag = yesNo(supervisorFlagText);
      const supervisorRole = value(row, "Supervisor Type", "supervisorRole");
      const reportingSupervisor = value(row, "Reporting Supervisor",
        "Supervisor", "Reports To", "reportingSupervisor");
      const supervisorPosition = value(row, "Position / Incharge",
        "Position/Incharge", "Supervisor Position", "supervisorPosition");
      const parentLabText = value(row, "Parent Lab", "parentLab");
      const parentLabFlag = yesNo(parentLabText);
      const deputationText = value(row, "Deputation", "isDeputed");
      const deputationFlag = yesNo(deputationText);
      const parentInstituteName = value(row, "Parent Research Institute Name",
        "Parent Research Institute", "Parent Institute Name",
        "parentInstituteName");
      const accountsOfficerName = value(row, "Accounts Officer Name",
        "Accounts Officer", "accountsOfficerName");

      const rowErrors = [];
      if (!employeeCode) rowErrors.push("Employee ID is required.");
      if (!name) rowErrors.push("Full Name is required.");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrors.push("A valid Official Email ID is required.");
      }
      if (!joiningText || !parseDate(joiningText)) {
        rowErrors.push("A valid Joining Date is required.");
      }
      if (!department) rowErrors.push("Department Name is required.");
      if (!designation) rowErrors.push("Designation is required.");
      if (!payband) rowErrors.push("Payband / Payscale is required.");
      if (!functionalAssignment) {
        rowErrors.push("Functional Role / Authority is required.");
      }
      if (supervisorFlag === null) {
        rowErrors.push("Is Supervisor must be Yes or No.");
      }
      if (parentLabFlag === null) {
        rowErrors.push("Parent Lab must be Yes or No.");
      }
      if (deputationFlag === null) {
        rowErrors.push("Deputation must be Yes or No.");
      }
      if (supervisorFlag === true && !supervisorRole) {
        rowErrors.push("Supervisor Type is required for a supervisor.");
      }
      if (supervisorFlag === true && reportingSupervisor) {
        rowErrors.push("A supervisor should not have Reporting Supervisor set.");
      }
      if (supervisorFlag === false && !reportingSupervisor) {
        rowErrors.push("Reporting Supervisor is required for a non-supervisor.");
      }
      if (supervisorFlag !== true && supervisorPosition) {
        rowErrors.push("Position / Incharge is only valid for supervisors.");
      }
      if (parentLabFlag === false && deputationFlag === true &&
          (!parentInstituteName || !accountsOfficerName)) {
        rowErrors.push(
          "Parent Research Institute Name and Accounts Officer Name are required when Parent Lab is No and Deputation is Yes."
        );
      }

      const codeKey = employeeCode.toUpperCase();
      if (employeeCode && seenCodes.has(codeKey)) {
        rowErrors.push("Duplicate Employee ID in the Excel file.");
      }
      if (employeeCode) seenCodes.add(codeKey);

      if (email && seenEmails.has(email)) {
        rowErrors.push("Duplicate email in the Excel file.");
      }
      if (email) seenEmails.add(email);

      if (rowErrors.length) {
        errors.push({
          row: rowNumber,
          employeeCode,
          message: rowErrors.join(" "),
        });
        return;
      }

      candidates.push({
        rowNumber,
        employeeCode,
        name,
        email,
        joiningDate: parseDate(joiningText),
        department,
        designation,
        payband,
        // Kept configurable until the organization confirms the role list.
        functionalAssignment,
        isSupervisor: supervisorFlag,
        supervisorRole: supervisorRole || undefined,
        reportingSupervisor: reportingSupervisor || undefined,
        supervisorPosition: supervisorPosition || undefined,
        parentLab: parentLabFlag ? "Yes" : "No",
        isDeputed: deputationFlag,
        parentInstituteName: parentInstituteName || undefined,
        accountsOfficerName: accountsOfficerName || undefined,
      });
    });

    if (errors.length) {
      return res.status(400).json({
        success: false,
        message: "Import validation failed. No employees were imported.",
        totalRows: rows.length,
        created: 0,
        failed: errors.length,
        errors,
      });
    }

    const codes = candidates.map((e) => e.employeeCode.toUpperCase());
    const emails = candidates.map((e) => e.email.toLowerCase());

    const existingEmployees = await Employee.find({
      $or: [
        { employeeId: { $in: codes } },
        { employeeCode: { $in: codes } },
        { email: { $in: emails } },
      ],
    }).select("employeeId employeeCode email");

    const existingUsers = await User.find({
      email: { $in: emails },
    }).select("email");

    const existingCodes = new Set(existingEmployees
      .flatMap((e) => [
        String(e.employeeId || "").toUpperCase(),
        String(e.employeeCode || "").toUpperCase(),
      ]));
    const existingEmails = new Set([
      ...existingEmployees.map((e) => String(e.email || "").toLowerCase()),
      ...existingUsers.map((u) => String(u.email || "").toLowerCase()),
    ]);

    const duplicateErrors = [];
    for (const e of candidates) {
      if (existingCodes.has(e.employeeCode.toUpperCase())) {
        duplicateErrors.push({
          row: e.rowNumber,
          employeeCode: e.employeeCode,
          message: "Employee ID already exists in the database.",
        });
      }
      if (existingEmails.has(e.email.toLowerCase())) {
        duplicateErrors.push({
          row: e.rowNumber,
          employeeCode: e.employeeCode,
          message: "Official email already exists in the database.",
        });
      }
    }

    if (duplicateErrors.length) {
      return res.status(409).json({
        success: false,
        message: "Duplicate records found. No employees were imported.",
        totalRows: rows.length,
        created: 0,
        failed: duplicateErrors.length,
        errors: duplicateErrors,
      });
    }

    const newEmployees = candidates.map((e) => ({
      employeeId: e.employeeCode,
      employeeCode: e.employeeCode,
      name: e.name,
      email: e.email,
      joiningDate: e.joiningDate,
      department: e.department,
      designation: e.designation,
      payband: e.payband,
      functionalAssignment: e.functionalAssignment,
      isSupervisor: e.isSupervisor,
      supervisorRole: e.supervisorRole,
      reportingSupervisor: e.reportingSupervisor,
      supervisorPosition: e.supervisorPosition,
      parentLab: e.parentLab,
      isDeputed: e.isDeputed,
      parentInstituteName: e.parentInstituteName,
      accountsOfficerName: e.accountsOfficerName,
      userId: null,
    }));

    const inserted = await Employee.insertMany(newEmployees, { ordered: true });
    return res.status(201).json({
      success: true,
      message: "Employee bulk import completed.",
      totalRows: rows.length,
      created: inserted.length,
      failed: 0,
      errors: [],
    });
  } catch (error) {
    console.error("Employee bulk import error:", error);
    if (error.name === "ValidationError" || error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Employee data failed validation.",
        error: error.message,
      });
    }
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "A duplicate employee record already exists.",
        error: error.message,
        duplicateKey: error.keyValue || null,
      });
    }
    return res.status(500).json({
      success: false,
      message: "Employee import failed.",
      error: error.message,
    });
  }
};
