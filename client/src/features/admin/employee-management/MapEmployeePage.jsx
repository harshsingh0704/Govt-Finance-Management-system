import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  ChevronDown,
  FileSpreadsheet,
  Lock,
  Save,
  ShieldCheck,
  SlidersHorizontal,
  Unlock,
  Users,
  X,
} from "lucide-react";

import axios from "axios";
import "./MapEmployeePage.css";

/* ================================================================
   FORM TYPES
================================================================ */

const FORM_TYPES = [
  {
    id: "ta-claim",
    label: "TA Claim",
  },
  {
    id: "ta-advance",
    label: "TA Advance",
  },
  {
    id: "ltc-claim",
    label: "LTC Claim",
  },
  {
    id: "ltc-advance",
    label: "LTC Advance",
  },
  {
    id: "medical-claim",
    label: "Medical Claim",
  },
  {
    id: "medical-advance",
    label: "Medical Advance",
  },
  {
    id: "accommodation",
    label: "Accommodation",
  },
];

/* ================================================================
   FUNCTIONAL ROLES
================================================================ */

const FUNCTIONAL_ROLES = [
  "All",
  "Bill Clerk / Accounts Staff",
  "Administrative Officer",
  "Director",
  "Budget Officer",
];

/* ================================================================
   EMPLOYEES
================================================================ */

const EMPLOYEES = [
  {
    employeeId: "EMP-001",
    name: "Director",
    designation: "Director",
    departmentName: "Finance",
    functionalRole: "Director",
  },
  {
    employeeId: "EMP-002",
    name: "Employee 002",
    designation: "Accounts Officer",
    departmentName: "Finance",
    functionalRole: "Bill Clerk / Accounts Staff",
  },
  {
    employeeId: "EMP-003",
    name: "Employee 003",
    designation: "Administrative Officer",
    departmentName: "Administration",
    functionalRole: "Administrative Officer",
  },
  {
    employeeId: "EMP-004",
    name: "Employee 004",
    designation: "Budget Officer",
    departmentName: "Finance",
    functionalRole: "Budget Officer",
  },
];

/* ================================================================
   STORAGE
================================================================ */

const STORAGE_KEY = "fms.employee-form-mappings";

/* ================================================================
   EMPTY MAPPING
================================================================ */

const createEmptyMapping = () => ({
  "ta-claim": false,
  "ta-advance": false,
  "ltc-claim": false,
  "ltc-advance": false,
  "medical-claim": false,
  "medical-advance": false,
  accommodation: false,
  locked: false,
});

/* ================================================================
   LOAD MAPPINGS
================================================================ */

const loadMappings = () => {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return {};
    }

    const parsed = JSON.parse(saved);

    if (!parsed || typeof parsed !== "object") {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error("Failed to load mappings:", error);
    return {};
  }
};

/* ================================================================
   SAVE MAPPINGS
================================================================ */

const saveMappingsToStorage = (mappings) => {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(mappings)
    );

    return true;
  } catch (error) {
    console.error("Failed to save mappings:", error);
    return false;
  }
};

/* ================================================================
   TOGGLE COMPONENT
================================================================ */

function MappingToggle({
  checked,
  disabled,
  label,
  onChange,
}) {
  return (
    <button
      type="button"
      className={`mapping-toggle ${
        checked ? "is-on" : ""
      }`}
      disabled={disabled}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className="mapping-toggle-track">
        <span className="mapping-toggle-thumb" />
      </span>

      <span className="mapping-toggle-text">
        {checked ? "ON" : "OFF"}
      </span>
    </button>
  );
}

/* ================================================================
   MAIN COMPONENT
================================================================ */

function MapEmployeePage({ onClose }) {
  const handleBulkSave = async () => {
    if (!excelEmployees || excelEmployees.length === 0) {
      alert("No employees found from Excel upload!");
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/admin/employee-mappings/bulk-save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ mappings: excelEmployees })
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ All 5 Excel Employees saved successfully to MongoDB Atlas!");
      } else {
        alert("❌ Save failed: " + (data.message || "Server Error"));
      }
    } catch (error) {
      console.error("Bulk save error:", error);
      alert("❌ Network Error: " + error.message);
    }
  };
  /* ================================================================
     BASIC STATE
  ================================================================ */

  const [mappingMode, setMappingMode] =
    useState("individual");

  const [functionalRole, setFunctionalRole] =
    useState("All");

  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState("EMP-001");

  const [mappings, setMappings] =
    useState(loadMappings);

  const [saved, setSaved] = useState(false);

  /* ================================================================
     MASS ENTRY — EXCEL STATE
  ================================================================ */

  const [excelFile, setExcelFile] =
    useState(null);

  const [excelEmployees, setExcelEmployees] =
    useState([]);

  const [excelLoading, setExcelLoading] =
    useState(false);

  const [excelError, setExcelError] =
    useState("");

  /* ================================================================
     REFS
  ================================================================ */

  const mapEmployeeTopScrollRef = useRef(null);

  const mapEmployeeTopScrollContentRef =
    useRef(null);

  const mapEmployeeTableWrapperRef =
    useRef(null);

  const mapEmployeeTableRef =
    useRef(null);

  /* ================================================================
     FILTER EMPLOYEES
  ================================================================ */

  const employeesForRole = useMemo(() => {
    if (functionalRole === "All") {
      return EMPLOYEES;
    }

    return EMPLOYEES.filter(
      (employee) =>
        employee.functionalRole === functionalRole
    );
  }, [functionalRole]);

  /* ================================================================
     KEEP SELECTED EMPLOYEE VALID
  ================================================================ */

  useEffect(() => {
    const exists = employeesForRole.some(
      (employee) =>
        employee.employeeId === selectedEmployeeId
    );

    if (!exists) {
      setSelectedEmployeeId(
        employeesForRole[0]?.employeeId || ""
      );
    }
  }, [
    employeesForRole,
    selectedEmployeeId,
  ]);

  /* ================================================================
     SELECTED EMPLOYEE
  ================================================================ */

  const selectedEmployee = useMemo(() => {
    return EMPLOYEES.find(
      (employee) =>
        employee.employeeId ===
        selectedEmployeeId
    );
  }, [selectedEmployeeId]);

  /* ================================================================
     SELECTED MAPPING
  ================================================================ */

  const selectedMapping =
    mappings[selectedEmployeeId] ||
    createEmptyMapping();
    /* ================================================================
   INDIVIDUAL SELECT ALL STATUS
================================================================ */

const allSelected = FORM_TYPES.every(
  (form) =>
    Boolean(selectedMapping[form.id])
);

  /* ================================================================
     UPDATE INDIVIDUAL FORM
  ================================================================ */

  const updateMapping = (
    employeeId,
    formId,
    value
  ) => {
    setSaved(false);

    setMappings((current) => {
      const currentMapping =
        current[employeeId] ||
        createEmptyMapping();

      if (currentMapping.locked) {
        return current;
      }

      return {
        ...current,

        [employeeId]: {
          ...currentMapping,
          [formId]: value,
        },
      };
    });
  };

  /* ================================================================
     SELECT ALL INDIVIDUAL FORMS
  ================================================================ */

  const handleSelectAll = () => {
    if (!selectedEmployeeId) {
      return;
    }

    if (selectedMapping.locked) {
      return;
    }

    setSaved(false);

    setMappings((current) => {
      const currentMapping =
        current[selectedEmployeeId] ||
        createEmptyMapping();

      const updated = {
        ...currentMapping,
      };

      FORM_TYPES.forEach((form) => {
        updated[form.id] = true;
      });

      return {
        ...current,
        [selectedEmployeeId]: updated,
      };
    });
  };

  /* ================================================================
     LOCK INDIVIDUAL
  ================================================================ */

  const handleLockAll = () => {
    if (!selectedEmployeeId) {
      return;
    }

    setSaved(false);

    setMappings((current) => {
      const currentMapping =
        current[selectedEmployeeId] ||
        createEmptyMapping();

      return {
        ...current,

        [selectedEmployeeId]: {
          ...currentMapping,
          locked: true,
        },
      };
    });
  };

  /* ================================================================
     UNLOCK INDIVIDUAL
  ================================================================ */

  const handleUnlockAll = () => {
    if (!selectedEmployeeId) {
      return;
    }

    setSaved(false);

    setMappings((current) => {
      const currentMapping =
        current[selectedEmployeeId] ||
        createEmptyMapping();

      return {
        ...current,

        [selectedEmployeeId]: {
          ...currentMapping,
          locked: false,
        },
      };
    });
  };

  /* ================================================================
     ROW LOCK
  ================================================================ */

  const toggleRowLock = (employeeId) => {
    setSaved(false);

    setMappings((current) => {
      const currentMapping =
        current[employeeId] ||
        createEmptyMapping();

      return {
        ...current,

        [employeeId]: {
          ...currentMapping,
          locked: !currentMapping.locked,
        },
      };
    });
  };

  /* ================================================================
     SAVE ALL CURRENT FRONTEND MAPPINGS
  ================================================================ */

  const persistMappings = (
    nextMappings = mappings
  ) => {
    const success =
      saveMappingsToStorage(nextMappings);

    if (!success) {
      return;
    }

    setMappings(nextMappings);
    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  /* ================================================================
     SAVE CURRENT EMPLOYEE
  ================================================================ */

  const handleSave = () => {
    if (!selectedEmployeeId) {
      return;
    }

    persistMappings(mappings);
  };

  /* ================================================================
     EXCEL UPLOAD
     
     NOTE:
     This dynamically imports xlsx so the component does not
     require XLSX processing until an Excel file is uploaded.

     Install once if not already installed:
       npm install xlsx
  ================================================================ */

 /* ================================================================
     EXCEL UPLOAD
     ================================================================ */
  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setExcelError("");
    setExcelEmployees([]);
    setExcelFile(null);

    const fileName = file.name.toLowerCase();
    const isExcelFile = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isExcelFile) {
      setExcelError("Please upload a valid Excel file (.xlsx or .xls).");
      event.target.value = "";
      return;
    }

    setExcelLoading(true);

    try {
      const XLSX = await import("xlsx");
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error("The Excel file does not contain any worksheet.");
      }

      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });

      if (!rows.length) {
        throw new Error("The uploaded Excel file is empty.");
      }

      /* ------------------------------------------------------------
         Normalize Excel column names
      ------------------------------------------------------------ */
      const normalizeKey = (key) =>
        String(key)
          .trim()
          .toLowerCase()
          .replace(/[\s_-]+/g, "");

      const firstRow = rows[0];
      const columnMap = {};

      Object.keys(firstRow).forEach((key) => {
        columnMap[normalizeKey(key)] = key;
      });

      const employeeIdColumn =
        columnMap.employeeid ||
        columnMap.empid ||
        columnMap.employeeidno;

      const employeeNameColumn =
        columnMap.employeename ||
        columnMap.name;

      if (!employeeIdColumn) {
        throw new Error("Required column missing: Employee ID.");
      }

      if (!employeeNameColumn) {
        throw new Error("Required column missing: Employee Name.");
      }

      /* ------------------------------------------------------------
         Convert rows & map form boolean fields
      ------------------------------------------------------------ */
      const parseBool = (val) => String(val).trim().toUpperCase() === "TRUE" || val === true;

      const parsedEmployees = rows
        .map((row, index) => {
          const empId = String(row[employeeIdColumn] ?? "").trim();
          const empName = String(row[employeeNameColumn] ?? "").trim();

          if (!empId || !empName) return null;

          return {
            id: empId || `EMP-${101 + index}`,
            employeeId: empId,
            employeeName: empName,
            name: empName, 
            formMappings: {
              taClaim: parseBool(row["TA Claim"] || row[columnMap.taclaim]),
              medicalClaim: parseBool(row["Medical Claim"] || row[columnMap.medicalclaim]),
              accommodation: parseBool(row["Accommodation"] || row[columnMap.accommodation])
            }
          };
        })
        .filter(Boolean);

      if (parsedEmployees.length === 0) {
        throw new Error("No valid employee records were found in the Excel file.");
      }

      setExcelFile(file);
      setExcelEmployees(parsedEmployees);

    } catch (error) {
      console.error("Excel upload error:", error);

      setExcelError(
        error?.message || "Unable to read the Excel file."
      );

      setExcelFile(null);
      setExcelEmployees([]);
    } finally {
      setExcelLoading(false);
      event.target.value = "";
    }
  };


  /* ================================================================
     REMOVE EXCEL
  ================================================================ */

  const removeExcel = () => {
    setExcelFile(null);
    setExcelEmployees([]);
    setExcelError("");
    setExcelLoading(false);
  };

  /* ================================================================
     TABLE SCROLL SYNC
  ================================================================ */

  useEffect(() => {
    const topScroll =
      mapEmployeeTopScrollRef.current;

    const tableWrapper =
      mapEmployeeTableWrapperRef.current;

    const table =
      mapEmployeeTableRef.current;

    const topContent =
      mapEmployeeTopScrollContentRef.current;

    if (
      !topScroll ||
      !tableWrapper ||
      !table ||
      !topContent
    ) {
      return;
    }

    const updateWidth = () => {
      topContent.style.width =
        `${table.scrollWidth}px`;
    };

    const handleTopScroll = () => {
      tableWrapper.scrollLeft =
        topScroll.scrollLeft;
    };

    const handleTableScroll = () => {
      topScroll.scrollLeft =
        tableWrapper.scrollLeft;
    };

    updateWidth();

    topScroll.addEventListener(
      "scroll",
      handleTopScroll
    );

    tableWrapper.addEventListener(
      "scroll",
      handleTableScroll
    );

    window.addEventListener(
      "resize",
      updateWidth
    );

    return () => {
      topScroll.removeEventListener(
        "scroll",
        handleTopScroll
      );

      tableWrapper.removeEventListener(
        "scroll",
        handleTableScroll
      );

      window.removeEventListener(
        "resize",
        updateWidth
      );

      topContent.style.width = "";
    };
  }, []);

  /* ================================================================
     CLOSE
  ================================================================ */

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
      return;
    }

    window.history.back();
  };

  /* ================================================================
     RENDER
  ================================================================ */

  return (
    <div
      className="map-employee-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-employee-title"
    >
      <div className="map-employee-modal">

        {/* ==========================================================
            HEADER
        =========================================================== */}

        <header className="map-modal-header">

          <div className="map-modal-heading">

            <div className="map-modal-icon">
              <Users size={23} />
            </div>

            <div>
              <span className="map-modal-eyebrow">
                EMPLOYEE MANAGEMENT
              </span>

              <h1 id="map-employee-title">
                Map Employee
              </h1>
            </div>

          </div>

          <button
            type="button"
            className="map-close-button"
            onClick={handleClose}
            aria-label="Close employee mapping"
          >
            <X size={25} />
          </button>

        </header>

        {/* ==========================================================
            BODY
        =========================================================== */}

        <div className="map-modal-body">

          {/* ========================================================
              INTRO
          ========================================================= */}

          <section className="map-intro">

            <div>

              <span className="map-section-kicker">
                FORM RESPONSIBILITY
              </span>

              <h2>
                Employee Form Mapping
              </h2>

              <p>
                Assign the financial forms that
                each employee is responsible for
                handling.
              </p>

            </div>

            <div className="map-security-note">
              <ShieldCheck size={18} />

              <span>
                Admin controlled
              </span>
            </div>

          </section>

          {/* ========================================================
              MODE TABS
          ========================================================= */}

          <div className="map-mode-tabs">

            <button
              type="button"
              className={`map-mode-tab ${
                mappingMode ===
                "individual"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setMappingMode(
                  "individual"
                )
              }
            >
              <Users size={16} />

              Individual Employee
            </button>

            <button
              type="button"
              className={`map-mode-tab ${
                mappingMode === "mass"
                  ? "active"
                  : ""
              }`}
              onClick={() =>
                setMappingMode("mass")
              }
            >
              <FileSpreadsheet
                size={16}
              />

              Mass Entry
            </button>

          </div>

          {/* ========================================================
              INDIVIDUAL MODE
          ========================================================= */}

          {mappingMode ===
            "individual" && (

            <section className="map-control-panel">

              {/* ====================================================
                  SELECTORS
              ===================================================== */}

              <div className="map-control-grid">

                <label className="map-field">

                  <span className="map-field-label">
                    User Type
                  </span>

                  <span className="map-select-container">

                    <select
                      value={functionalRole}
                      onChange={(event) =>
                        setFunctionalRole(
                          event.target.value
                        )
                      }
                    >

                      {FUNCTIONAL_ROLES.map(
                        (role) => (
                          <option
                            key={role}
                            value={role}
                          >
                            {role}
                          </option>
                        )
                      )}

                    </select>

                    <ChevronDown
                      size={17}
                      className="map-select-icon"
                    />

                  </span>

                </label>

                <label className="map-field">

                  <span className="map-field-label">
                    Name
                  </span>

                  <span className="map-select-container">

                    <select
                      value={
                        selectedEmployeeId
                      }
                      disabled={
                        employeesForRole.length ===
                        0
                      }
                      onChange={(event) =>
                        setSelectedEmployeeId(
                          event.target.value
                        )
                      }
                    >

                      {employeesForRole.length ===
                      0 ? (
                        <option value="">
                          No employees in this role
                        </option>
                      ) : (
                        employeesForRole.map(
                          (employee) => (
                            <option
                              key={
                                employee.employeeId
                              }
                              value={
                                employee.employeeId
                              }
                            >
                              {employee.name} —{" "}
                              {
                                employee.designation
                              }
                            </option>
                          )
                        )
                      )}

                    </select>

                    <ChevronDown
                      size={17}
                      className="map-select-icon"
                    />

                  </span>

                </label>

              </div>

              {/* ====================================================
                  FORM OPTIONS
              ===================================================== */}

              <div className="map-form-area">

                <div className="map-form-options">

                  {FORM_TYPES.map(
                    (form) => {

                      const checked =
                        Boolean(
                          selectedMapping[
                            form.id
                          ]
                        );

                      return (
                        <label
                          key={form.id}
                          className={`map-form-option ${
                            checked
                              ? "is-selected"
                              : ""
                          } ${
                            selectedMapping.locked
                              ? "is-disabled"
                              : ""
                          }`}
                        >

                          <input
                            type="checkbox"
                            checked={
                              checked
                            }
                            disabled={
                              selectedMapping.locked ||
                              !selectedEmployeeId
                            }
                            onChange={(
                              event
                            ) =>
                              updateMapping(
                                selectedEmployeeId,
                                form.id,
                                event.target
                                  .checked
                              )
                            }
                          />

                          <span className="map-checkbox">

                            {checked && (
                              <Check
                                size={13}
                              />
                            )}

                          </span>

                          <span>
                            {form.label}
                          </span>

                        </label>
                      );
                    }
                  )}

                </div>

                {/* ==================================================
                    INDIVIDUAL ACTIONS
                =================================================== */}

                <div className="map-bulk-actions">

                  <button
                    type="button"
                    className="map-action-button secondary"
                    disabled={
                      !selectedEmployeeId ||
                      selectedMapping.locked ||
                      allSelected
                    }
                    onClick={
                      handleSelectAll
                    }
                  >
                    <SlidersHorizontal
                      size={15}
                    />

                    Select All
                  </button>

                  <button
                    type="button"
                    className="map-action-button warning"
                    disabled={
                      !selectedEmployeeId ||
                      selectedMapping.locked
                    }
                    onClick={
                      handleLockAll
                    }
                  >
                    <Lock size={15} />

                    Lock All
                  </button>

                  <button
                    type="button"
                    className="map-action-button secondary"
                    disabled={
                      !selectedEmployeeId ||
                      !selectedMapping.locked
                    }
                    onClick={
                      handleUnlockAll
                    }
                  >
                    <Unlock size={15} />

                    Unlock All
                  </button>

                  <button
                    type="button"
                    className="map-action-button primary"
                    disabled={
                      !selectedEmployeeId
                    }
                    onClick={handleSave}
                  >
                    <Save size={15} />

                    {saved
                      ? "Saved"
                      : "Save"}
                  </button>

                </div>

              </div>


              {/* ================================================================
    EXCEL FILE UPLOAD INPUT SECTION
   ================================================================ */}
<div className="excel-upload-container mb-4">
  <input
    type="file"
    id="excelFileInput"
    accept=".xlsx, .xls"
    style={{ display: 'none' }}
    onChange={handleExcelUpload}
  />
  
  <label
    htmlFor="excelFileInput"
    className="cursor-pointer inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition shadow-sm"
  >
    📁 Upload Excel File (.xlsx)
  </label>

  {/* Agar koi error ho toh display karein */}
  {excelError && (
    <p className="text-red-500 text-sm mt-2">{excelError}</p>
  )}
</div>

              {/* ====================================================
                  SELECTED EMPLOYEE
              ===================================================== */}

              {selectedEmployee && (
                <div className="map-selected-employee">

                  <div className="map-selected-avatar">
                    {selectedEmployee.name
                      .split(" ")
                      .map(
                        (part) =>
                          part[0]
                      )
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div className="map-selected-info">

                    <strong>
                      {
                        selectedEmployee.name
                      }
                    </strong>

                    <span>
                      {
                        selectedEmployee.employeeId
                      }
                      {" · "}
                      {
                        selectedEmployee.departmentName
                      }
                      {" · "}
                      {
                        selectedEmployee.functionalRole
                      }
                    </span>

                  </div>

                  <span
                    className={`map-lock-state ${
                      selectedMapping.locked
                        ? "locked"
                        : "editable"
                    }`}
                  >

                    {selectedMapping.locked ? (
                      <Lock size={13} />
                    ) : (
                      <Unlock size={13} />
                    )}

                    {selectedMapping.locked
                      ? "Locked"
                      : "Editable"}

                  </span>

                </div>
              )}

            </section>
          )}

          {/* ========================================================
              MASS ENTRY MODE — EXCEL ONLY
          ========================================================= */}

          {mappingMode === "mass" && (

            <section className="mass-entry-container">

              {/* ==================================================
                  HEADER
              ================================================== */}

              <div className="mass-entry-header">

                <div className="mass-entry-number">
                  01
                </div>

                <div>

                  <span className="map-section-kicker">
                    BULK ASSIGNMENT
                  </span>

                  <h2>
                    Upload Employee Excel
                  </h2>

                  <p>
                    Upload an Excel file containing
                    the employees for mass entry
                    processing.
                  </p>

                </div>

              </div>

              {/* ==================================================
                  UPLOAD AREA
              ================================================== */}

              {!excelFile ? (

                <div className="mass-excel-upload">

                  <div className="mass-excel-icon">

                    <FileSpreadsheet
                      size={32}
                    />

                  </div>

                  <h3>
                    Upload Employee Excel
                  </h3>

                  <p>
                    Upload an Excel file containing
                    employee details.
                  </p>

                  <label className="mass-upload-button">

                    <FileSpreadsheet
                      size={16}
                    />

                    Choose Excel File

                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={
                        handleExcelUpload
                      }
                      hidden
                    />

                  </label>

                  <span className="mass-upload-hint">
                    Required columns: Employee ID,
                    Employee Name
                  </span>

                </div>

              ) : (

                <div className="mass-excel-file">

                  <div className="mass-file-icon">

                    <FileSpreadsheet
                      size={25}
                    />

                  </div>

                  <div className="mass-file-info">

                    <strong>
                      {excelFile.name}
                    </strong>

                    <span>
                      {excelEmployees.length}
                      {" "}
                      employees found
                    </span>

                  </div>

                  <button
                    type="button"
                    className="mass-remove-file"
                    onClick={
                      removeExcel
                    }
                    aria-label="Remove Excel file"
                  >
                    <X size={17} />
                  </button>

                </div>

              )}

              {/* ==================================================
                  LOADING
              ================================================== */}

              {excelLoading && (

                <div className="mass-excel-message loading">

                  <FileSpreadsheet
                    size={16}
                  />

                  Reading Excel file...

                </div>

              )}

              {/* ==================================================
                  ERROR
              ================================================== */}

              {excelError && (

                <div className="mass-excel-message error">

                  <AlertCircle
                    size={16}
                  />

                  <span>
                    {excelError}
                  </span>

                </div>

              )}

              {/* ==================================================
                  SUCCESS
              ================================================== */}

              {excelEmployees.length > 0 && (

                <div className="mass-upload-success">

                  <div className="mass-success-icon">

                    <CheckCircle2
                      size={18}
                    />

                  </div>

                  <div>

                    <strong>
                      Excel uploaded successfully
                    </strong>

                    <span>
                      {excelEmployees.length}
                      {" "}
                      employees are ready for
                      mass entry processing.
                    </span>

                  </div>
                  <button
  type="button"
  onClick={handleBulkSave}
  style={{
    marginLeft: "auto",
    padding: "8px 16px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "600",
    cursor: "pointer"
  }}
>
  Save Mappings to DB
</button>

                </div>

              )}

            </section>

          )}

          {/* ========================================================
              MAPPING TABLE
          ========================================================= */}

          <section className="map-table-section">

            <div className="map-table-header">

              <div>

                <span className="map-section-kicker">
                  CONFIGURATION
                </span>

                <h2>
                  Forms Mapping View
                </h2>

              </div>

              <span className="map-count">
                {EMPLOYEES.length} employees
                {" · "}
                {FORM_TYPES.length} forms
              </span>

            </div>

            <div
              className="map-employee-top-scroll"
              ref={
                mapEmployeeTopScrollRef
              }
            >
              <div
                className="map-employee-top-scroll-content"
                ref={
                  mapEmployeeTopScrollContentRef
                }
              />
            </div>

            <div
              className="map-table-wrapper"
              ref={
                mapEmployeeTableWrapperRef
              }
            >

              <table
                className="map-table"
                ref={
                  mapEmployeeTableRef
                }
              >

                <thead>

                  <tr>

                    <th className="serial-column">
                      SL NO
                    </th>

                    <th className="employee-column">
                      EMPLOYEE
                    </th>

                    {FORM_TYPES.map(
                      (form) => (
                        <th
                          key={form.id}
                          className="form-column"
                        >
                          {form.label}
                        </th>
                      )
                    )}

                    <th className="actions-column">
                      ACTIONS
                    </th>

                  </tr>

                </thead>

                <tbody>

                      {(excelEmployees.length > 0 ? excelEmployees : EMPLOYEES).map(
                      (employee, index) => {
      

                      const rowMapping =
                        mappings[
                          employee.employeeId
                        ] ||
                        createEmptyMapping();

                      const isCurrent =
                        employee.employeeId ===
                        selectedEmployeeId;

                      return (
                        <tr
                          key={
                            employee.employeeId
                          }
                          className={
                            isCurrent
                              ? "current-row"
                              : ""
                          }
                        >

                          <td className="serial-column">
                            {index + 1}
                          </td>

                          <td className="employee-column">

                            <button
                              type="button"
                              className="table-employee-button"
                              onClick={() => {

                                setMappingMode(
                                  "individual"
                                );

                                setFunctionalRole(
                                  employee.functionalRole
                                );

                                setSelectedEmployeeId(
                                  employee.employeeId
                                );

                              }}
                            >

                              <span className="table-avatar">

                                {employee.name
                                  .split(" ")
                                  .map(
                                    (part) =>
                                      part[0]
                                  )
                                  .slice(0, 2)
                                  .join("")}

                              </span>

                              <span className="table-employee-details">

                                <strong>
                                  {
                                    employee.name
                                  }
                                </strong>

                                <small>
                                  {
                                    employee.functionalRole
                                  }
                                </small>

                              </span>

                            </button>

                          </td>

                          {FORM_TYPES.map(
                            (form) => (

                              <td
                                key={
                                  form.id
                                }
                                className="form-column"
                              >

                                <MappingToggle
                                  checked={Boolean(
                                    rowMapping[
                                      form.id
                                    ]
                                  )}
                                  disabled={Boolean(
                                    rowMapping.locked
                                  )}
                                  label={`${employee.name} ${form.label}`}
                                  onChange={() =>
                                    updateMapping(
                                      employee.employeeId,
                                      form.id,
                                      !rowMapping[
                                        form.id
                                      ]
                                    )
                                  }
                                />

                              </td>

                            )
                          )}

                          <td className="actions-column">

                            <div className="row-actions">

                              <button
                                type="button"
                                className="row-save-button"
                                onClick={() =>
                                  persistMappings(
                                    mappings
                                  )
                                }
                              >
                                <Save
                                  size={14}
                                />

                                Save
                              </button>

                              <button
                                type="button"
                                className={`row-lock-button ${
                                  rowMapping.locked
                                    ? "unlock"
                                    : ""
                                }`}
                                onClick={() =>
                                  toggleRowLock(
                                    employee.employeeId
                                  )
                                }
                              >

                                {rowMapping.locked ? (
                                  <Unlock
                                    size={14}
                                  />
                                ) : (
                                  <Lock
                                    size={14}
                                  />
                                )}

                                {rowMapping.locked
                                  ? "Unlock"
                                  : "Lock"}

                              </button>

                            </div>

                          </td>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

            </div>

          </section>

        </div>

        {/* ==========================================================
            FOOTER
        =========================================================== */}

        <footer className="map-modal-footer">

          <div className="map-footer-status">

            {saved ? (
              <>
                <Check size={17} />

                Mapping saved successfully
              </>
            ) : (
              <>
                <ShieldCheck size={17} />

                Responsibility changes require an
                explicit save
              </>
            )}

          </div>

          <button
            type="button"
            className="map-footer-close"
            onClick={handleClose}
          >
            Close
          </button>

        </footer>

      </div>
    </div>
  );
}


 const handleBulkSave = async () => {
    if (!excelEmployees || excelEmployees.length === 0) {
      return alert("No employees found! Please upload an Excel file first.");
    }

    try {
      const res = await axios.post("/api/admin/employee-mappings/bulk-save", {
        mappings: excelEmployees,
      });

      if (res.status === 200 || res.status === 201) {
        alert("Mass mappings saved successfully to MongoDB!");
        if (typeof fetchMappings === "function") {
          fetchMappings();
        }
      }
    } catch (err) {
      console.error("Bulk save error:", err);
      alert("Save failed: " + (err.response?.data?.message || err.message));
    }
  };

export default MapEmployeePage;