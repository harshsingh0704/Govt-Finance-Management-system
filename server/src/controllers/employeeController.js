const Employee = require("../models/Employee");
const User = require("../models/User");
const XLSX = require("xlsx");

const VALID_LOCATIONS = Employee.LOCATIONS || [
  "Main Office",
  "Peenya Office",
  "Gottipura Field Station",
  "Kolkata Field Station",
];

const VALID_DOMAINS = Employee.DOMAINS || [
  "Finance",
  "Admin",
  "IT Support",
  "Purchases & Receipts",
  "Estate Related",
  "Vehicle Requests",
  "Research",
];

const normalizeLocation = (val) => {
  if (!val) return "Main Office";
  const cleaned = String(val).trim().toLowerCase();
  const match = VALID_LOCATIONS.find((loc) => loc.toLowerCase() === cleaned);
  return match || null;
};

const normalizeDomain = (val, department = "") => {
  const source = val || department;
  if (!source) return "Finance";
  const cleaned = String(source).trim().toLowerCase();
  const direct = VALID_DOMAINS.find((d) => d.toLowerCase() === cleaned);
  if (direct) return direct;
  if (cleaned.includes("fin") || cleaned.includes("acc")) return "Finance";
  if (cleaned.includes("it") || cleaned.includes("tech")) return "IT Support";
  if (cleaned.includes("purch") || cleaned.includes("store") || cleaned.includes("receipt")) {
    return "Purchases & Receipts";
  }
  if (cleaned.includes("estate") || cleaned.includes("quarter") || cleaned.includes("accomm")) {
    return "Estate Related";
  }
  if (cleaned.includes("veh") || cleaned.includes("transport")) return "Vehicle Requests";
  if (cleaned.includes("res")) return "Research";
  if (cleaned.includes("admin")) return "Admin";
  return "Finance";
};

exports.getAllEmployees = async (req, res) => {
  try {
    const query = {};
    if (req.query.location) {
      const loc = normalizeLocation(req.query.location);
      if (loc) query.location = loc;
    }
    if (req.query.domain) {
      query.domain = req.query.domain;
    }

    const employees = await Employee.find(query)
      .populate("userId", "name email role location domain")
      .sort({ createdAt: -1 });

    const formatted = employees.map((emp) => ({
      _id: emp._id,
      userId: emp.userId?._id || emp.userId || null,
      employeeId: emp.employeeId || emp.employeeCode || "",
      employeeCode: emp.employeeCode || emp.employeeId || "N/A",
      name: emp.userId?.name || emp.name || "Unnamed Employee",
      email: emp.userId?.email || emp.email || "",
      role: emp.userId?.role || "Employee",
      location: emp.location || emp.userId?.location || "Main Office",
      domain: emp.domain || emp.userId?.domain || "Finance",
      department: emp.department,
      designation: emp.designation,
      functionalAssignment: emp.functionalAssignment || "Employee",
      basicPay: emp.basicPay ?? 45000,
      isActive: emp.isActive !== false,
      adminEligible: !!emp.adminEligible,
    }));

    return res.json({ success: true, employees: formatted });
  } catch (err) {
    console.error("Get employees error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch employees.",
      error: err.message,
    });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const {
      userId,
      employeeId,
      employeeCode,
      name,
      email,
      location,
      domain,
      department,
      designation,
      functionalAssignment,
      basicPay,
      bankAccount,
      ifscCode,
    } = req.body;

    const resolvedCode = (employeeCode || employeeId || "").trim().toUpperCase() || undefined;
    const resolvedLocation = normalizeLocation(location) || "Main Office";
    const resolvedDomain = normalizeDomain(domain, department);

    const employee = await Employee.create({
      userId: userId || null,
      employeeId: resolvedCode,
      employeeCode: resolvedCode,
      name: name ? String(name).trim() : undefined,
      email: email ? String(email).trim().toLowerCase() : undefined,
      location: resolvedLocation,
      domain: resolvedDomain,
      department: department || resolvedDomain || "Finance",
      designation: designation || "Officer",
      functionalAssignment: functionalAssignment || "Employee",
      basicPay: basicPay ?? 45000,
      bankAccount,
      ifscCode,
    });

    return res.status(201).json({ success: true, employee });
  } catch (err) {
    console.error("Create employee error:", err);
    return res.status(400).json({
      success: false,
      message: "Failed to create employee.",
      error: err.message,
    });
  }
};

exports.bulkImportEmployees = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload an Excel file." });
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
      return res.status(400).json({ success: false, message: "The Excel worksheet is empty." });
    }
    if (rows.length > 1000) {
      return res.status(400).json({
        success: false,
        message: "Upload a maximum of 1000 employees per batch.",
      });
    }

    const norm = (s) =>
      String(s ?? "")
        .trim()
        .toLowerCase()
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
      if (v === null || v === undefined || String(v).trim() === "") return null;
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
      const rawCode = value(row, "Employee ID", "Employee_ID", "employeeCode", "Employee Code");
      const employeeCode = rawCode.toUpperCase();
      const name = value(row, "Full Name", "Full_Name", "name", "Employee Name");
      const email = value(
        row,
        "Official Email ID",
        "Official Email",
        "Email",
        "Email Address"
      ).toLowerCase();
      const joiningText = value(row, "Joining Date", "joiningDate");
      const locationRaw = value(row, "Location", "Office Location", "Station", "Work Location");
      const parsedLocation = locationRaw ? normalizeLocation(locationRaw) : "Main Office";
      const domainRaw = value(row, "Domain", "Category", "Vertical");
      const department = value(row, "Department Name", "Department");
      const resolvedDomain = normalizeDomain(domainRaw, department);
      const designation = value(row, "Designation");
      const payband = value(row, "Payband / Payscale", "Payband", "Payscale", "Pay Scale");
      const functionalAssignment = value(
        row,
        "Functional Role / Authority",
        "Functional Role",
        "Functional Assignment",
        "Functional_Assignment"
      );
      const supervisorFlag = yesNo(value(row, "Is Supervisor", "isSupervisor"));
      const supervisorRole = value(row, "Supervisor Type", "supervisorRole");
      const reportingSupervisor = value(
        row,
        "Reporting Supervisor",
        "Supervisor",
        "Reports To",
        "reportingSupervisor"
      );
      const supervisorPosition = value(
        row,
        "Position / Incharge",
        "Position/Incharge",
        "Supervisor Position",
        "supervisorPosition"
      );
      const parentLabFlag = yesNo(value(row, "Parent Lab", "parentLab"));
      const deputationFlag = yesNo(value(row, "Deputation", "isDeputed"));
      const parentInstituteName = value(
        row,
        "Parent Research Institute Name",
        "Parent Research Institute",
        "Parent Institute Name",
        "parentInstituteName"
      );
      const accountsOfficerName = value(
        row,
        "Accounts Officer Name",
        "Accounts Officer",
        "accountsOfficerName"
      );

      const rowErrors = [];
      if (!employeeCode) rowErrors.push("Employee ID is required.");
      if (!name) rowErrors.push("Full Name is required.");
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        rowErrors.push("A valid Official Email ID is required.");
      }
      if (!joiningText || !parseDate(joiningText)) {
        rowErrors.push("A valid Joining Date is required.");
      }
      if (!parsedLocation) {
        rowErrors.push(
          `Invalid Location "${locationRaw}". Allowed: ${VALID_LOCATIONS.join(", ")}.`
        );
      }
      if (!department) rowErrors.push("Department Name is required.");
      if (!designation) rowErrors.push("Designation is required.");
      if (!payband) rowErrors.push("Payband / Payscale is required.");
      if (!functionalAssignment) rowErrors.push("Functional Role / Authority is required.");
      if (supervisorFlag === null) rowErrors.push("Is Supervisor must be Yes or No.");
      if (parentLabFlag === null) rowErrors.push("Parent Lab must be Yes or No.");
      if (deputationFlag === null) rowErrors.push("Deputation must be Yes or No.");
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
      if (
        parentLabFlag === false &&
        deputationFlag === true &&
        (!parentInstituteName || !accountsOfficerName)
      ) {
        rowErrors.push(
          "Parent Research Institute Name and Accounts Officer Name are required when Parent Lab is No and Deputation is Yes."
        );
      }

      if (employeeCode && seenCodes.has(employeeCode)) {
        rowErrors.push("Duplicate Employee ID in the Excel file.");
      }
      if (employeeCode) seenCodes.add(employeeCode);

      if (email && seenEmails.has(email)) {
        rowErrors.push("Duplicate email in the Excel file.");
      }
      if (email) seenEmails.add(email);

      if (rowErrors.length) {
        errors.push({ row: rowNumber, employeeCode, message: rowErrors.join(" ") });
        return;
      }

      candidates.push({
        rowNumber,
        employeeCode,
        name,
        email,
        joiningDate: parseDate(joiningText),
        location: parsedLocation || "Main Office",
        domain: resolvedDomain,
        department,
        designation,
        payband,
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

    const codes = candidates.map((e) => e.employeeCode);
    const emails = candidates.map((e) => e.email);

    const existingEmployees = await Employee.find({
      $or: [
        { employeeId: { $in: codes } },
        { employeeCode: { $in: codes } },
        { email: { $in: emails } },
      ],
    }).select("employeeId employeeCode email");

    const existingUsers = await User.find({ email: { $in: emails } }).select("email");

    const existingCodes = new Set(
      existingEmployees.flatMap((e) => [
        String(e.employeeId || "").toUpperCase(),
        String(e.employeeCode || "").toUpperCase(),
      ])
    );
    const existingEmails = new Set([
      ...existingEmployees.map((e) => String(e.email || "").toLowerCase()),
      ...existingUsers.map((u) => String(u.email || "").toLowerCase()),
    ]);

    const duplicateErrors = [];
    for (const e of candidates) {
      if (existingCodes.has(e.employeeCode)) {
        duplicateErrors.push({
          row: e.rowNumber,
          employeeCode: e.employeeCode,
          message: "Employee ID already exists in the database.",
        });
      }
      if (existingEmails.has(e.email)) {
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
      location: e.location,
      domain: e.domain,
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
