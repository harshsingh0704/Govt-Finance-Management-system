
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

const FORM_TYPES = [
  { id: "ta-claim", label: "TA Claim" },
  { id: "ta-advance", label: "TA Advance" },
  { id: "ltc-claim", label: "LTC Claim" },
  { id: "ltc-advance", label: "LTC Advance" },
  { id: "medical-claim", label: "Medical Claim" },
  { id: "medical-advance", label: "Medical Advance" },
  { id: "accommodation", label: "Accommodation" },
];

const FUNCTIONAL_ROLES = [
  "Head of Office",
  "Head of Department (HOD)",
  "Finance Officer",
  "Finance Clerk",
  "IT Cell In-charge",
];

const DEMO_EMPLOYEES = [
  {
    employeeId: "EMP-001",
    name: "Director",
    designation: "Director",
    departmentName: "Finance",
    functionalRole: "Head of Office",
  },
  {
    employeeId: "EMP-002",
    name: "Employee 002",
    designation: "Accounts Officer",
    departmentName: "Finance",
    functionalRole: "Finance Officer",
  },
  {
    employeeId: "EMP-003",
    name: "Employee 003",
    designation: "Administrative Officer",
    departmentName: "Administration",
    functionalRole: "Head of Department (HOD)",
  },
  {
    employeeId: "EMP-004",
    name: "Employee 004",
    designation: "Budget Officer",
    departmentName: "Finance",
    functionalRole: "Finance Clerk",
  },
  {
    employeeId: "EMP-005",
    name: "IT Cell In-charge",
    designation: "IT Cell In-charge",
    departmentName: "IT Cell",
    functionalRole: "IT Cell In-charge",
  },
];

const STORAGE_KEY = "fms.employee-form-mappings";

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

const loadMappings = () => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
};

function MappingToggle({ checked, disabled, label, onChange }) {
  return (
    <button
      type="button"
      className={`mapping-toggle ${checked ? "is-on" : ""}`}
      disabled={disabled}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span className="mapping-toggle-track">
        <span className="mapping-toggle-thumb" />
      </span>
      <span className="mapping-toggle-text">{checked ? "ON" : "OFF"}</span>
    </button>
  );
}

function MapEmployeePage({ onClose }) {
  const [mappingMode, setMappingMode] = useState("individual");
  const [functionalRole, setFunctionalRole] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [mappings, setMappings] = useState(loadMappings);
  const [saved, setSaved] = useState(false);

  const [excelFile, setExcelFile] = useState(null);
  const [excelEmployees, setExcelEmployees] = useState([]);
  const [excelLoading, setExcelLoading] = useState(false);
  const [excelError, setExcelError] = useState("");
  const [importResult, setImportResult] = useState(null);
  const [importing, setImporting] = useState(false);

  const topScrollRef = useRef(null);
  const topScrollContentRef = useRef(null);
  const tableWrapperRef = useRef(null);
  const tableRef = useRef(null);

  const normalizeRole = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, " ");

  const employeesForRole = useMemo(() => {
    if (!functionalRole) return DEMO_EMPLOYEES;

    return DEMO_EMPLOYEES.filter(
      (employee) =>
        normalizeRole(employee.functionalRole) ===
        normalizeRole(functionalRole)
    );
  }, [functionalRole]);

  const selectedEmployee = useMemo(
    () =>
      [...DEMO_EMPLOYEES, ...excelEmployees].find(
        (employee) => employee.employeeId === selectedEmployeeId
      ),
    [selectedEmployeeId, excelEmployees]
  );

  const selectedMapping =
    mappings[selectedEmployeeId] || createEmptyMapping();

  const allSelected = FORM_TYPES.every((form) =>
    Boolean(selectedMapping[form.id])
  );

  useEffect(() => {
    if (
      !employeesForRole.some(
        (employee) => employee.employeeId === selectedEmployeeId
      )
    ) {
      setSelectedEmployeeId(employeesForRole[0]?.employeeId || "");
    }
  }, [employeesForRole, selectedEmployeeId]);

  useEffect(() => {
    const top = topScrollRef.current;
    const wrapper = tableWrapperRef.current;
    const table = tableRef.current;
    const content = topScrollContentRef.current;

    if (!top || !wrapper || !table || !content) return;

    const updateWidth = () => {
      content.style.width = `${table.scrollWidth}px`;
    };

    const onTopScroll = () => {
      wrapper.scrollLeft = top.scrollLeft;
    };

    const onTableScroll = () => {
      top.scrollLeft = wrapper.scrollLeft;
    };

    updateWidth();
    top.addEventListener("scroll", onTopScroll);
    wrapper.addEventListener("scroll", onTableScroll);
    window.addEventListener("resize", updateWidth);

    return () => {
      top.removeEventListener("scroll", onTopScroll);
      wrapper.removeEventListener("scroll", onTableScroll);
      window.removeEventListener("resize", updateWidth);
    };
  }, [excelEmployees, mappingMode]);

  const persistMappings = (next = mappings) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setMappings(next);
      setSaved(true);
      window.setTimeout(() => setSaved(false), 2500);
    } catch (error) {
      console.error("Failed to save mappings:", error);
      setExcelError("Could not save mappings to browser storage.");
    }
  };

  const updateMapping = (employeeId, formId, value) => {
    setSaved(false);
    setMappings((current) => {
      const mapping = current[employeeId] || createEmptyMapping();
      if (mapping.locked) return current;

      return {
        ...current,
        [employeeId]: { ...mapping, [formId]: value },
      };
    });
  };

  const handleSelectAll = () => {
    if (!selectedEmployeeId || selectedMapping.locked) return;

    const updated = {
      ...mappings,
      [selectedEmployeeId]: {
        ...selectedMapping,
        ...Object.fromEntries(FORM_TYPES.map((form) => [form.id, true])),
      },
    };
    setMappings(updated);
    setSaved(false);
  };

  const handleLockAll = () => {
    if (!selectedEmployeeId) return;
    setMappings((current) => ({
      ...current,
      [selectedEmployeeId]: {
        ...(current[selectedEmployeeId] || createEmptyMapping()),
        locked: true,
      },
    }));
    setSaved(false);
  };

  const handleUnlockAll = () => {
    if (!selectedEmployeeId) return;
    setMappings((current) => ({
      ...current,
      [selectedEmployeeId]: {
        ...(current[selectedEmployeeId] || createEmptyMapping()),
        locked: false,
      },
    }));
    setSaved(false);
  };

  const toggleRowLock = (employeeId) => {
    setMappings((current) => {
      const mapping = current[employeeId] || createEmptyMapping();
      return {
        ...current,
        [employeeId]: { ...mapping, locked: !mapping.locked },
      };
    });
    setSaved(false);
  };

  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExcelError("");
    setImportResult(null);
    setExcelEmployees([]);
    setExcelFile(null);

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setExcelError("Please upload a valid Excel file (.xlsx or .xls).");
      event.target.value = "";
      return;
    }

    setExcelLoading(true);

    try {
      const XLSX = await import("xlsx");
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];

      if (!sheet) throw new Error("The workbook has no worksheet.");

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      if (!rows.length) throw new Error("The Excel file is empty.");

      const normalizeKey = (key) =>
        String(key).trim().toLowerCase().replace(/[\s_-]+/g, "");

      const parsed = rows.map((row, index) => {
        const normalized = Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            normalizeKey(key),
            String(value ?? "").trim(),
          ])
        );

        const employeeId =
          normalized.employeeid ||
          normalized.employeecode ||
          normalized.empid;

        const name =
          normalized.fullname ||
          normalized.employeename ||
          normalized.name;

        if (!employeeId || !name) {
          throw new Error(
            `Row ${index + 2}: Employee ID and Full Name are required.`
          );
        }

        return {
          employeeId,
          name,
          email: normalized.email || "",
          departmentName: normalized.department || "",
          designation: normalized.designation || "Officer",
          functionalRole:
            normalized.functionalassignment || "Employee",
          basicPay: normalized.basicpay || "45000",
          formMappings: {
            "ta-claim": false,
            "ta-advance": false,
            "ltc-claim": false,
            "ltc-advance": false,
            "medical-claim": false,
            "medical-advance": false,
            accommodation: false,
          },
        };
      });

      const seen = new Set();
      for (const employee of parsed) {
        const key = employee.employeeId.toUpperCase();
        if (seen.has(key)) {
          throw new Error(`Duplicate Employee ID in Excel: ${employee.employeeId}`);
        }
        seen.add(key);
      }

      setExcelFile(file);
      setExcelEmployees(parsed);

      setMappings((current) => {
        const updated = { ...current };
        parsed.forEach((employee) => {
          updated[employee.employeeId] =
            updated[employee.employeeId] || createEmptyMapping();
        });
        return updated;
      });

      setSelectedEmployeeId(parsed[0]?.employeeId || "");
    } catch (error) {
      console.error("Excel upload error:", error);
      setExcelError(error.message || "Unable to read the Excel file.");
      setExcelFile(null);
      setExcelEmployees([]);
    } finally {
      setExcelLoading(false);
      event.target.value = "";
    }
  };

  const removeExcel = () => {
    setExcelFile(null);
    setExcelEmployees([]);
    setExcelError("");
    setImportResult(null);
  };

  const handleBulkSave = async () => {
    if (!excelFile || excelEmployees.length === 0) {
      setExcelError("Please upload a valid employee Excel file first.");
      return;
    }

    setImporting(true);
    setExcelError("");
    setImportResult(null);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error(
          "Authentication token not found. Please sign in again."
        );
      }

      const formData = new FormData();
      formData.append("file", excelFile);

      const response = await axios.post(
        "http://localhost:5000/api/employees/bulk-import",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setImportResult(response.data);
    } catch (error) {
      console.error("Employee bulk import error:", error);
      setExcelError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Employee import failed."
      );
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    if (typeof onClose === "function") {
      onClose();
    } else {
      window.history.back();
    }
  };

  const employeesToDisplay =
    excelEmployees.length > 0
      ? excelEmployees
      : employeesForRole;

  return (
    <div
      className="map-employee-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="map-employee-title"
    >
      <div className="map-employee-modal">
        <header className="map-modal-header">
          <div className="map-modal-heading">
            <div className="map-modal-icon">
              <Users size={23} />
            </div>
            <div>
              <span className="map-modal-eyebrow">EMPLOYEE MANAGEMENT</span>
              <h1 id="map-employee-title">Map Employee</h1>
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

        <div className="map-modal-body">
          <section className="map-intro">
            <div>
              <span className="map-section-kicker">FORM RESPONSIBILITY</span>
              <h2>Employee Form Mapping</h2>
              <p>
                Assign financial forms to employees and upload employee
                records in bulk.
              </p>
            </div>
            <div className="map-security-note">
              <ShieldCheck size={18} />
              <span>Admin controlled</span>
            </div>
          </section>

          <div className="map-mode-tabs">
            <button
              type="button"
              className={`map-mode-tab ${mappingMode === "individual" ? "active" : ""}`}
              onClick={() => setMappingMode("individual")}
            >
              <Users size={16} />
              Individual Employee
            </button>

            <button
              type="button"
              className={`map-mode-tab ${mappingMode === "mass" ? "active" : ""}`}
              onClick={() => setMappingMode("mass")}
            >
              <FileSpreadsheet size={16} />
              Mass Entry
            </button>
          </div>

          {mappingMode === "individual" && (
            <section className="map-control-panel">
              <div className="map-control-grid">
                <label className="map-field">
                  <span className="map-field-label">Functional Role</span>
                  <span className="map-select-container">
                    <select
                      value={functionalRole}
                      onChange={(event) => setFunctionalRole(event.target.value)}
                    >
                      <option value="">All demo roles</option>
                      {FUNCTIONAL_ROLES.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                    <ChevronDown size={17} className="map-select-icon" />
                  </span>
                </label>

                <label className="map-field">
                  <span className="map-field-label">Employee</span>
                  <span className="map-select-container">
                    <select
                      value={selectedEmployeeId}
                      onChange={(event) =>
                        setSelectedEmployeeId(event.target.value)
                      }
                    >
                      {employeesForRole.length === 0 ? (
                        <option value="">No employees in this role</option>
                      ) : (
                        employeesForRole.map((employee) => (
                          <option
                            key={employee.employeeId}
                            value={employee.employeeId}
                          >
                            {employee.name} — {employee.designation}
                          </option>
                        ))
                      )}
                    </select>
                    <ChevronDown size={17} className="map-select-icon" />
                  </span>
                </label>
              </div>

              <div className="map-form-area">
                <div className="map-form-options">
                  {FORM_TYPES.map((form) => {
                    const checked = Boolean(selectedMapping[form.id]);

                    return (
                      <label
                        key={form.id}
                        className={`map-form-option ${checked ? "is-selected" : ""} ${selectedMapping.locked ? "is-disabled" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={selectedMapping.locked || !selectedEmployeeId}
                          onChange={(event) =>
                            updateMapping(
                              selectedEmployeeId,
                              form.id,
                              event.target.checked
                            )
                          }
                        />
                        <span className="map-checkbox">
                          {checked && <Check size={13} />}
                        </span>
                        <span>{form.label}</span>
                      </label>
                    );
                  })}
                </div>

                <div className="map-bulk-actions">
                  <button
                    type="button"
                    className="map-action-button secondary"
                    disabled={!selectedEmployeeId || selectedMapping.locked || allSelected}
                    onClick={handleSelectAll}
                  >
                    <SlidersHorizontal size={15} />
                    Select All
                  </button>

                  <button
                    type="button"
                    className="map-action-button warning"
                    disabled={!selectedEmployeeId || selectedMapping.locked}
                    onClick={handleLockAll}
                  >
                    <Lock size={15} />
                    Lock All
                  </button>

                  <button
                    type="button"
                    className="map-action-button secondary"
                    disabled={!selectedEmployeeId || !selectedMapping.locked}
                    onClick={handleUnlockAll}
                  >
                    <Unlock size={15} />
                    Unlock All
                  </button>

                  <button
                    type="button"
                    className="map-action-button primary"
                    disabled={!selectedEmployeeId}
                    onClick={() => persistMappings(mappings)}
                  >
                    <Save size={15} />
                    {saved ? "Saved" : "Save"}
                  </button>
                </div>
              </div>

              {selectedEmployee && (
                <div className="map-selected-employee">
                  <div className="map-selected-avatar">
                    {selectedEmployee.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div className="map-selected-info">
                    <strong>{selectedEmployee.name}</strong>
                    <span>
                      {selectedEmployee.employeeId} ·{" "}
                      {selectedEmployee.departmentName} ·{" "}
                      {selectedEmployee.functionalRole}
                    </span>
                  </div>
                  <span
                    className={`map-lock-state ${selectedMapping.locked ? "locked" : "editable"}`}
                  >
                    {selectedMapping.locked ? <Lock size={13} /> : <Unlock size={13} />}
                    {selectedMapping.locked ? "Locked" : "Editable"}
                  </span>
                </div>
              )}
            </section>
          )}

          {mappingMode === "mass" && (
            <section className="mass-entry-container">
              <div className="mass-entry-header">
                <div className="mass-entry-number">01</div>
                <div>
                  <span className="map-section-kicker">EMPLOYEE BULK ENTRY</span>
                  <h2>Upload Employee Excel</h2>
                  <p>
                    Upload an Excel workbook to create employee master records
                    in the database.
                  </p>
                </div>
              </div>

              {!excelFile ? (
                <div className="mass-excel-upload">
                  <div className="mass-excel-icon">
                    <FileSpreadsheet size={32} />
                  </div>
                  <h3>Upload Employee Excel</h3>
                  <p>Select your employee master workbook.</p>
                  <label className="mass-upload-button">
                    <FileSpreadsheet size={16} />
                    Choose Excel File
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleExcelUpload}
                      hidden
                    />
                  </label>
                  <span className="mass-upload-hint">
                    Required columns: Employee_ID, Full_Name, Department
                  </span>
                </div>
              ) : (
                <div className="mass-excel-file">
                  <div className="mass-file-icon">
                    <FileSpreadsheet size={25} />
                  </div>
                  <div className="mass-file-info">
                    <strong>{excelFile.name}</strong>
                    <span>{excelEmployees.length} employees found</span>
                  </div>
                  <button
                    type="button"
                    className="mass-remove-file"
                    onClick={removeExcel}
                    aria-label="Remove Excel file"
                  >
                    <X size={17} />
                  </button>
                </div>
              )}

              {excelLoading && (
                <div className="mass-excel-message loading">
                  <FileSpreadsheet size={16} />
                  Reading Excel file...
                </div>
              )}

              {excelError && (
                <div className="mass-excel-message error" role="alert">
                  <AlertCircle size={16} />
                  <span>{excelError}</span>
                </div>
              )}

              {excelEmployees.length > 0 && (
                <>
                  <div className="mass-upload-success">
                    <div className="mass-success-icon">
                      <CheckCircle2 size={18} />
                    </div>
                    <div>
                      <strong>Excel preview ready</strong>
                      <span>
                        {excelEmployees.length} employees are ready to import.
                      </span>
                    </div>
                    <button
                      type="button"
                      className="mass-upload-button"
                      onClick={handleBulkSave}
                      disabled={importing || excelLoading}
                    >
                      {importing ? "Importing..." : "Import Employees to Database"}
                    </button>
                  </div>

                  <div className="mass-table-preview">
                    <h3>Preview first 10 employees</h3>
                    <div className="map-table-wrapper">
                      <table className="map-table">
                        <thead>
                          <tr>
                            <th>Employee ID</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Department</th>
                            <th>Designation</th>
                            <th>Functional Assignment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {excelEmployees.slice(0, 10).map((employee) => (
                            <tr key={employee.employeeId}>
                              <td>{employee.employeeId}</td>
                              <td>{employee.name}</td>
                              <td>{employee.email || "—"}</td>
                              <td>{employee.departmentName || "—"}</td>
                              <td>{employee.designation}</td>
                              <td>{employee.functionalRole}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}

              {importResult && (
                <div className="mass-upload-success">
                  <CheckCircle2 size={20} />
                  <div>
                    <strong>{importResult.message || "Import completed"}</strong>
                    <p>Total rows: {importResult.totalRows ?? excelEmployees.length}</p>
                    <p>Created: {importResult.created ?? 0}</p>
                    <p>Failed or skipped: {importResult.failed ?? 0}</p>

                    {importResult.errors?.length > 0 && (
                      <ul>
                        {importResult.errors.map((item, index) => (
                          <li key={`${item.row}-${index}`}>
                            Row {item.row} — {item.employeeCode || "Unknown ID"}:{" "}
                            {item.message}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              )}
            </section>
          )}

          <section className="map-table-section">
            <div className="map-table-header">
              <div>
                <span className="map-section-kicker">CONFIGURATION</span>
                <h2>Forms Mapping View</h2>
              </div>
              <span className="map-count">
                {employeesToDisplay.length} employees · {FORM_TYPES.length} forms
              </span>
            </div>

            <div className="map-employee-top-scroll" ref={topScrollRef}>
              <div
                className="map-employee-top-scroll-content"
                ref={topScrollContentRef}
              />
            </div>

            <div className="map-table-wrapper" ref={tableWrapperRef}>
              <table className="map-table" ref={tableRef}>
                <thead>
                  <tr>
                    <th className="serial-column">SL NO</th>
                    <th className="employee-column">EMPLOYEE</th>
                    {FORM_TYPES.map((form) => (
                      <th key={form.id} className="form-column">
                        {form.label}
                      </th>
                    ))}
                    <th className="actions-column">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {employeesToDisplay.map((employee, index) => {
                    const rowMapping =
                      mappings[employee.employeeId] || createEmptyMapping();

                    return (
                      <tr
                        key={employee.employeeId}
                        className={
                          employee.employeeId === selectedEmployeeId
                            ? "current-row"
                            : ""
                        }
                      >
                        <td className="serial-column">{index + 1}</td>
                        <td className="employee-column">
                          <button
                            type="button"
                            className="table-employee-button"
                            onClick={() => {
                              setSelectedEmployeeId(employee.employeeId);
                              setMappingMode("individual");
                            }}
                          >
                            <span className="table-avatar">
                              {employee.name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <span className="table-employee-details">
                              <strong>{employee.name}</strong>
                              <small>{employee.functionalRole}</small>
                            </span>
                          </button>
                        </td>

                        {FORM_TYPES.map((form) => (
                          <td key={form.id} className="form-column">
                            <MappingToggle
                              checked={Boolean(rowMapping[form.id])}
                              disabled={Boolean(rowMapping.locked)}
                              label={`${employee.name} ${form.label}`}
                              onChange={() =>
                                updateMapping(
                                  employee.employeeId,
                                  form.id,
                                  !rowMapping[form.id]
                                )
                              }
                            />
                          </td>
                        ))}

                        <td className="actions-column">
                          <div className="row-actions">
                            <button
                              type="button"
                              className="row-save-button"
                              onClick={() => persistMappings(mappings)}
                            >
                              <Save size={14} />
                              Save
                            </button>
                            <button
                              type="button"
                              className={`row-lock-button ${rowMapping.locked ? "unlock" : ""}`}
                              onClick={() => toggleRowLock(employee.employeeId)}
                            >
                              {rowMapping.locked ? (
                                <Unlock size={14} />
                              ) : (
                                <Lock size={14} />
                              )}
                              {rowMapping.locked ? "Unlock" : "Lock"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </div>

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
                Responsibility changes require an explicit save
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

export default MapEmployeePage;
