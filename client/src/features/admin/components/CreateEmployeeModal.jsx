import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  ChevronDown,
  Mail,
  ShieldCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";

import "./CreateEmployeeModal.css";

import {
  SUPERVISOR_HIERARCHY,
  getSupervisorPositions,
} from "../constants/supervisorHierarchy";

const FUNCTIONAL_ROLES = [
  {
    id: "bill_clerk",
    title: "Bill Clerk / Accounts Staff",
    description:
      "Handles claim preparation and accounts-related operations.",
  },
  {
    id: "controlling_officer",
    title: "Controlling Officer / HoD",
    description:
      "Reviews and supervises departmental financial activity.",
  },
  {
    id: "medical_officer",
    title: "Medical Officer",
    description:
      "Handles medical verification and related claim responsibilities.",
  },
  {
    id: "ddo",
    title: "DDO / Competent Authority",
    description:
      "Performs designated financial approval and sanction responsibilities.",
  },
];

const INITIAL_FORM = {
  employeeId: "",
  name: "",
  officialEmail: "",
  joiningDate: "",
  departmentName: "",
  designation: "",
  payband: "",
  functionalRole: "",
  isSupervisor: false,
  supervisor: "",
  supervisorType: "",
  supervisorPosition: "",
  parentLab: "",
  deputation: "",
  parentResearchInstitute: "",
  accountsOfficer: "",
};

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  type = "text",
  error,
}) {
  return (
    <div className="ce-field">
      <label htmlFor={name}>
        {label}
        {required && <span>*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={error ? "error" : ""}
      />

      {error && <small className="ce-field-error">{error}</small>}
    </div>
  );
}

function StepIndicator({ currentStep }) {
  const steps = [
  { number: 1, label: "Employee Details" },
  { number: 2, label: "Role & Employment" },
  { number: 3, label: "Reporting" },
  { number: 4, label: "Lab & Deputation" },
  { number: 5, label: "Review" },
];

  return (
    <div className="ce-stepper">
      {steps.map((step, index) => (
        <div className="ce-step-wrapper" key={step.number}>
          <div
            className={`ce-step ${
              currentStep === step.number
                ? "active"
                : currentStep > step.number
                  ? "completed"
                  : ""
            }`}
          >
            <span className="ce-step-number">
              {currentStep > step.number ? (
                <Check size={15} />
              ) : (
                step.number
              )}
            </span>

            <span className="ce-step-label">{step.label}</span>
          </div>

          {index < steps.length - 1 && (
            <div
              className={`ce-step-line ${
                currentStep > step.number ? "completed" : ""
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="ce-section-heading">
      <span>{eyebrow}</span>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
    </div>
  );
}

export default function CreateEmployeeModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [created, setCreated] = useState(false);
  const [entryMode, setEntryMode] = useState("choose");
  const [excelFile, setExcelFile] = useState(null);
  const [excelRows, setExcelRows] = useState([]);
  const [excelError, setExcelError] = useState("");
  const [excelLoading, setExcelLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  if (!isOpen) {
    return null;
  }

  const updateField = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setErrors((current) => ({
      ...current,
      [name]: "",
    }));
  };

  const validateStep = () => {
    const nextErrors = {};

    if (currentStep === 1) {
      if (!form.employeeId.trim()) {
        nextErrors.employeeId = "Employee ID is required.";
      }

      if (!form.name.trim()) {
        nextErrors.name = "Employee name is required.";
      }

      if (!form.officialEmail.trim()) {
        nextErrors.officialEmail = "Official email is required.";
      } else if (!/^\S+@\S+\.\S+$/.test(form.officialEmail)) {
        nextErrors.officialEmail =
          "Enter a valid official email address.";
      }

      if (!form.joiningDate) {
        nextErrors.joiningDate = "Joining date is required.";
      }
    }

    if (currentStep === 2) {
      if (!form.departmentName.trim()) {
        nextErrors.departmentName = "Department name is required.";
      }

      if (!form.designation.trim()) {
        nextErrors.designation = "Designation is required.";
      }

      if (!form.payband.trim()) {
        nextErrors.payband = "Payband / Payscale is required.";
      }

      if (!form.functionalRole) {
        nextErrors.functionalRole = "Select a functional role.";
      }
    }

   if (currentStep === 3) {
  if (!form.supervisor.trim()) {
    nextErrors.supervisor = "Supervisor is required.";
  }

  if (form.isSupervisor && !form.supervisorType) {
    nextErrors.supervisorType =
      "Select a supervisor type.";
  }
}

/* STEP 4 VALIDATION */
if (currentStep === 4) {
  if (!form.parentLab) {
    nextErrors.parentLab =
      "Select whether the employee has a Parent Lab.";
  }

  if (!form.deputation) {
    nextErrors.deputation =
      "Select the deputation status.";
  }

  if (
    form.parentLab === "no" &&
    form.deputation === "yes"
  ) {
    if (!form.parentResearchInstitute.trim()) {
      nextErrors.parentResearchInstitute =
        "Parent Research Institute Name is required.";
    }

    if (!form.accountsOfficer.trim()) {
      nextErrors.accountsOfficer =
        "Accounts Officer Name is required.";
    }
  }
}

setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 5));
  };

  const handleBack = () => {
    setErrors({});
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  const handleClose = () => {
    setCurrentStep(1);
    setForm(INITIAL_FORM);
    setErrors({});
    setCreated(false);
    setEntryMode("choose");
    setExcelFile(null);
    setExcelRows([]);
    setExcelError("");
    setExcelLoading(false);
    setImporting(false);
    setImportResult(null);
    onClose();
  };

  const handleCreate = () => {
    /*
     * Backend integration will be connected after the dedicated
     * Admin -> Employee API is available.
     *
     * We intentionally do not call /auth/register here because
     * that endpoint currently allows arbitrary role submission.
     */

    setCreated(true);
  };

  const handleExcelSelection = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setExcelError("");
    setImportResult(null);
    setExcelRows([]);
    setExcelFile(null);

    if (!/\.(xlsx|xls)$/i.test(file.name)) {
      setExcelError("Please upload an Excel file (.xlsx or .xls).");
      event.target.value = "";
      return;
    }

    setExcelLoading(true);
    try {
      const XLSX = await import("xlsx");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array", cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) throw new Error("The workbook does not contain a worksheet.");

      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
      if (!rows.length) throw new Error("The Excel worksheet is empty.");

      const normalizeKey = (key) => String(key).trim().toLowerCase().replace(/[^a-z0-9]/g, "");
      const getValue = (row, ...aliases) => {
        for (const alias of aliases) {
          const value = row[normalizeKey(alias)];
          if (value !== undefined && String(value).trim() !== "") return String(value).trim();
        }
        return "";
      };
      const yesNo = (value) => {
        const normalized = String(value || "").trim().toLowerCase();
        if (["yes", "y", "true", "1"].includes(normalized)) return "Yes";
        if (["no", "n", "false", "0"].includes(normalized)) return "No";
        return String(value || "").trim();
      };

      const normalizedRows = rows.map((sourceRow, index) => {
        const source = Object.fromEntries(Object.entries(sourceRow).map(([key, value]) => [normalizeKey(key), value]));
        const employeeId = getValue(source, "Employee ID", "Employee Code", "Emp ID");
        const name = getValue(source, "Full Name", "Employee Name", "Name");
        const officialEmail = getValue(source, "Official Email ID", "Official Email", "Email");
        const joiningDate = getValue(source, "Joining Date", "Date of Joining");
        const department = getValue(source, "Department Name", "Department");
        const designation = getValue(source, "Designation");
        const payband = getValue(source, "Payband / Payscale", "Payband", "Payscale", "Pay Scale");
        const functionalRole = getValue(source, "Functional Role / Authority", "Functional Role", "Functional Assignment");
        const isSupervisor = yesNo(getValue(source, "Is Supervisor", "Supervisor Yes No"));
        const supervisorType = getValue(source, "Supervisor Type", "Supervisor Position Type");
        const reportingSupervisor = getValue(source, "Reporting Supervisor", "Supervisor", "Reports To");
        const supervisorPosition = getValue(source, "Position / Incharge", "Position Incharge", "Position", "Incharge");
        const parentLab = yesNo(getValue(source, "Parent Lab", "Has Parent Lab"));
        let deputation = yesNo(getValue(source, "Deputation", "On Deputation"));
        const parentResearchInstitute = getValue(source, "Parent Research Institute Name", "Parent Research Institute");
        const accountsOfficer = getValue(source, "Accounts Officer Name", "Accounts Officer");

        // Match the wizard rule: Parent Lab employees are not on deputation.
        if (parentLab === "Yes") deputation = "No";

        const issues = [];
        if (!employeeId) issues.push("Employee ID is required");
        if (!name) issues.push("Full Name is required");
        if (!officialEmail) issues.push("Official Email ID is required");
        else if (!/^\S+@\S+\.\S+$/.test(officialEmail)) issues.push("Official Email ID is invalid");
        if (!joiningDate) issues.push("Joining Date is required");
        if (!department) issues.push("Department Name is required");
        if (!designation) issues.push("Designation is required");
        if (!payband) issues.push("Payband / Payscale is required");
        if (!functionalRole) issues.push("Functional Role / Authority is required");
        if (!["Yes", "No"].includes(isSupervisor)) issues.push("Is Supervisor must be Yes or No");
        if (isSupervisor === "Yes" && !supervisorType) issues.push("Supervisor Type is required when Is Supervisor is Yes");
        if (isSupervisor === "No" && !reportingSupervisor) issues.push("Reporting Supervisor is required when Is Supervisor is No");
        if (isSupervisor === "Yes" && reportingSupervisor) issues.push("Reporting Supervisor should be blank for a supervisor");
        if (isSupervisor === "No" && supervisorType) issues.push("Supervisor Type should be blank for a non-supervisor");
        if (supervisorPosition && isSupervisor !== "Yes") issues.push("Position / Incharge applies only to supervisors");
        if (!["Yes", "No"].includes(parentLab)) issues.push("Parent Lab must be Yes or No");
        if (!["Yes", "No"].includes(deputation)) issues.push("Deputation must be Yes or No");
        if (parentLab === "No" && deputation === "Yes" && !parentResearchInstitute) issues.push("Parent Research Institute Name is required for this deputation case");
        if (parentLab === "No" && deputation === "Yes" && !accountsOfficer) issues.push("Accounts Officer Name is required for this deputation case");

        return {
          rowNumber: index + 2,
          employeeId, name, officialEmail, joiningDate, department, designation,
          payband, functionalRole, isSupervisor, supervisorType, reportingSupervisor,
          supervisorPosition, parentLab, deputation, parentResearchInstitute,
          accountsOfficer, issues,
        };
      });

      const seen = new Set();
      normalizedRows.forEach((row) => {
        if (!row.employeeId) return;
        const key = row.employeeId.trim().toUpperCase();
        if (seen.has(key)) row.issues.push("Duplicate Employee ID in this file");
        seen.add(key);
      });

      const invalidCount = normalizedRows.filter((row) => row.issues.length).length;
      if (invalidCount) {
        setExcelError(`${invalidCount} row(s) need correction. Review the preview below before continuing.`);
      }
      setExcelFile(file);
      setExcelRows(normalizedRows);
    } catch (error) {
      setExcelError(error.message || "Unable to read the Excel file.");
    } finally {
      setExcelLoading(false);
      event.target.value = "";
    }
  };

  const handleBulkImport = async () => {
    setExcelError("The current /api/employees/bulk-import endpoint does not save all 16 Individual Entry fields. The sheet is validated and previewed, but import is paused to prevent reporting, role, payband, lab, or deputation data from being silently discarded. The backend import contract must support these fields before full import can be enabled.");
    return;

    if (!excelFile || !excelRows.length) {
      setExcelError("Choose a valid Excel file before importing.");
      return;
    }
    const invalidRows = excelRows.filter((row) => row.issues.length);
    if (invalidRows.length) {
      setExcelError("Correct all highlighted rows in the Excel file and upload it again before importing.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setExcelError("Authentication token not found. Please sign in again.");
      return;
    }

    setImporting(true);
    setExcelError("");
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append("file", excelFile);
      const response = await fetch("http://localhost:5000/api/employees/bulk-import", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error || `Import failed (HTTP ${response.status}).`);
      }
      setImportResult(data);
    } catch (error) {
      setExcelError(error.message || "Employee import failed.");
    } finally {
      setImporting(false);
    }
  };

  const selectedRole = FUNCTIONAL_ROLES.find(
    (role) => role.id === form.functionalRole,
  );

  const selectedSupervisorHierarchy = SUPERVISOR_HIERARCHY.find(
    (item) => item.label === form.supervisorType,
  );

  const supervisorPositions = getSupervisorPositions(
    form.supervisorType,
  );

  return (
    <div className="ce-modal-backdrop" role="presentation">
      <div
        className="ce-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-employee-title"
      >
        <header className="ce-modal-header">
          <div className="ce-modal-title">
            <div className="ce-modal-icon">
              <UserPlus size={20} />
            </div>

            <div>
              <span>Employee Management</span>
              <h2 id="create-employee-title">
                Create Employee Account
              </h2>
            </div>
          </div>

          <button
            type="button"
            className="ce-close-button"
            onClick={handleClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </header>

        {!created && entryMode === "choose" ? (
          <div className="ce-entry-body">
            <SectionHeading
              eyebrow="Add Employee"
              title="Choose an entry method"
              description="Create one employee using the existing guided form, or upload an Excel sheet for a bulk import."
            />
            <div className="ce-entry-options">
              <button type="button" className="ce-entry-option" onClick={() => setEntryMode("individual")}>
                <span className="ce-entry-option-icon"><UserPlus size={24} /></span>
                <strong>Individual Entry</strong>
                <span>Enter one employee through the existing five-step wizard.</span>
                <span className="ce-entry-option-action">Continue individually <ArrowRight size={16} /></span>
              </button>
              <button type="button" className="ce-entry-option" onClick={() => setEntryMode("mass")}>
                <span className="ce-entry-option-icon"><Users size={24} /></span>
                <strong>Mass Entry</strong>
                <span>Upload an Excel file, review validation results, then import valid rows.</span>
                <span className="ce-entry-option-action">Upload Excel file <ArrowRight size={16} /></span>
              </button>
            </div>
            <div className="ce-entry-note">Mass import currently requires Employee ID, Full Name, and Department. Other fields are sent only as supported by the existing import API.</div>
            <footer className="ce-modal-footer ce-entry-footer">
              <button type="button" className="ce-secondary-button" onClick={handleClose}>Cancel</button>
            </footer>
          </div>
        ) : !created && entryMode === "mass" ? (
          <div className="ce-mass-body">
            <SectionHeading
              eyebrow="Mass Entry"
              title="Import employees from Excel"
              description="Upload .xlsx or .xls containing all 16 Individual Entry fields. Review validation results before import."
            />
            <div className="ce-mass-toolbar">
              <button type="button" className="ce-secondary-button" onClick={() => { setEntryMode("choose"); setExcelError(""); setImportResult(null); }}> <ArrowLeft size={16} /> Change entry method</button>
              <label className="ce-upload-button">
                {excelLoading ? "Reading file…" : "Choose Excel file"}
                <input type="file" accept=".xlsx,.xls" onChange={handleExcelSelection} disabled={excelLoading || importing} />
              </label>
            </div>
            <p className="ce-mass-hint">Use all 16 wizard columns: Employee ID, Full Name, Official Email ID, Joining Date, Department Name, Designation, Payband / Payscale, Functional Role / Authority, Is Supervisor, Supervisor Type, Reporting Supervisor, Position / Incharge, Parent Lab, Deputation, Parent Research Institute Name, and Accounts Officer Name. Use Yes/No for Is Supervisor, Parent Lab, and Deputation.</p>
            {excelFile && <div className="ce-file-chip"><Check size={16} /> {excelFile.name} <span>{excelRows.length} row(s)</span></div>}
            {excelError && <div className="ce-mass-alert" role="alert">{excelError}</div>}
            {excelRows.length > 0 && (
              <>
                <div className="ce-mass-summary">
                  <div><strong>{excelRows.length}</strong><span>Total rows</span></div>
                  <div><strong>{excelRows.filter((row) => !row.issues.length).length}</strong><span>Valid rows</span></div>
                  <div><strong>{excelRows.filter((row) => row.issues.length).length}</strong><span>Rows to fix</span></div>
                </div>
                <div className="ce-preview-table-wrap">
                  <table className="ce-preview-table ce-preview-full-table">
                    <thead><tr>
                      <th>Row</th><th>Employee ID</th><th>Full Name</th><th>Official Email ID</th><th>Joining Date</th>
                      <th>Department</th><th>Designation</th><th>Payband / Payscale</th><th>Functional Role / Authority</th>
                      <th>Is Supervisor</th><th>Supervisor Type</th><th>Reporting Supervisor</th><th>Position / Incharge</th>
                      <th>Parent Lab</th><th>Deputation</th><th>Parent Research Institute Name</th><th>Accounts Officer Name</th><th>Validation</th>
                    </tr></thead>
                    <tbody>{excelRows.slice(0, 100).map((row) => (
                      <tr key={`${row.rowNumber}-${row.employeeId}`} className={row.issues.length ? "ce-preview-invalid" : ""}>
                        <td>{row.rowNumber}</td><td>{row.employeeId || "—"}</td><td>{row.name || "—"}</td><td>{row.officialEmail || "—"}</td><td>{row.joiningDate || "—"}</td>
                        <td>{row.department || "—"}</td><td>{row.designation || "—"}</td><td>{row.payband || "—"}</td><td>{row.functionalRole || "—"}</td>
                        <td>{row.isSupervisor || "—"}</td><td>{row.supervisorType || "—"}</td><td>{row.reportingSupervisor || "—"}</td><td>{row.supervisorPosition || "—"}</td>
                        <td>{row.parentLab || "—"}</td><td>{row.deputation || "—"}</td><td>{row.parentResearchInstitute || "—"}</td><td>{row.accountsOfficer || "—"}</td>
                        <td>{row.issues.length ? row.issues.join("; ") : "Ready"}</td>
                      </tr>
                    ))}</tbody>
                  </table>
                  {excelRows.length > 100 && <p className="ce-mass-hint">Showing first 100 rows of {excelRows.length}. Validation covers all rows.</p>}
                </div>
              </>
            )}
            {importResult && (
              <div className="ce-import-result" role="status">
                <strong>{importResult.message || "Import response received"}</strong>
                <div className="ce-mass-summary">
                  <div><strong>{importResult.totalRows ?? excelRows.length}</strong><span>Total rows</span></div>
                  <div><strong>{importResult.created ?? importResult.successCount ?? 0}</strong><span>Imported</span></div>
                  <div><strong>{importResult.failed ?? importResult.failedCount ?? importResult.skipped ?? 0}</strong><span>Failed / skipped</span></div>
                </div>
                {Array.isArray(importResult.errors) && importResult.errors.length > 0 && <ul className="ce-import-errors">{importResult.errors.map((item, index) => <li key={index}>{typeof item === "string" ? item : JSON.stringify(item)}</li>)}</ul>}
              </div>
            )}
            <footer className="ce-modal-footer ce-entry-footer">
              <button type="button" className="ce-secondary-button" onClick={handleClose} disabled={importing}>Cancel</button>
              <button type="button" className="ce-primary-button" onClick={handleBulkImport} disabled={!excelFile || !excelRows.length || importing || excelLoading}>
                {importing ? "Importing…" : "Import employees"}
              </button>
            </footer>
          </div>
        ) : !created ? (
          <>
            {entryMode === "individual" && <div className="ce-individual-toolbar"><button type="button" className="ce-secondary-button" onClick={() => setEntryMode("choose")}><ArrowLeft size={16} /> Change entry method</button></div>}
            <div className="ce-modal-body">
              <StepIndicator currentStep={currentStep} />

              {/* STEP 1 */}
              {currentStep === 1 && (
                <div className="ce-step-content">
                  <SectionHeading
                    eyebrow="Step 1"
                    title="Employee Details"
                    description="Enter the employee's basic official information."
                  />

                  <div className="ce-info-banner">
                    <div className="ce-info-banner-icon">
                      <ShieldCheck size={18} />
                    </div>

                    <div>
                      <strong>
                        Organization-managed information
                      </strong>

                      <p>
                        These details are entered by the administrator
                        and become part of the employee's official record.
                      </p>
                    </div>
                  </div>

                  <div className="ce-form-grid">
                    <Field
                      label="Employee ID"
                      name="employeeId"
                      value={form.employeeId}
                      onChange={updateField}
                      placeholder="e.g. EMP-2026-001"
                      required
                      error={errors.employeeId}
                    />

                    <Field
                      label="Full Name"
                      name="name"
                      value={form.name}
                      onChange={updateField}
                      placeholder="Enter employee name"
                      required
                      error={errors.name}
                    />

                    <Field
                      label="Official Email ID"
                      name="officialEmail"
                      value={form.officialEmail}
                      onChange={updateField}
                      placeholder="employee@department.gov.in"
                      required
                      type="email"
                      error={errors.officialEmail}
                    />

                    <Field
                      label="Joining Date"
                      name="joiningDate"
                      value={form.joiningDate}
                      onChange={updateField}
                      type="date"
                      required
                      error={errors.joiningDate}
                    />
                  </div>
                </div>
              )}

              {/* STEP 2 */}
              {currentStep === 2 && (
                <div className="ce-step-content">
                  <SectionHeading
                    eyebrow="Step 2"
                    title="Role & Employment"
                    description="Define the employee's organizational position and functional authority."
                  />

                  <div className="ce-form-grid">
                    <Field
                      label="Department Name"
                      name="departmentName"
                      value={form.departmentName}
                      onChange={updateField}
                      placeholder="e.g. Finance & Accounts"
                      required
                      error={errors.departmentName}
                    />

                    <Field
                      label="Designation"
                      name="designation"
                      value={form.designation}
                      onChange={updateField}
                      placeholder="e.g. Senior Accounts Assistant"
                      required
                      error={errors.designation}
                    />

                    <Field
                      label="Payband / Payscale"
                      name="payband"
                      value={form.payband}
                      onChange={updateField}
                      placeholder="e.g. Level 6 / ₹35,400–1,12,400"
                      required
                      error={errors.payband}
                    />
                  </div>

                  <div className="ce-role-section">
                    <div className="ce-role-heading">
                      <div>
                        <label>
                          Functional Role / Authority <span>*</span>
                        </label>

                        <p>
                          Select the employee's functional responsibility.
                        </p>
                      </div>

                      {errors.functionalRole && (
                        <small className="ce-field-error">
                          {errors.functionalRole}
                        </small>
                      )}
                    </div>

                    <div className="ce-role-grid">
                      {FUNCTIONAL_ROLES.map((role) => {
                        const selected =
                          form.functionalRole === role.id;

                        return (
                          <button
                            type="button"
                            key={role.id}
                            className={`ce-role-card ${
                              selected ? "selected" : ""
                            }`}
                            onClick={() => {
                              setForm((current) => ({
                                ...current,
                                functionalRole: role.id,
                              }));

                              setErrors((current) => ({
                                ...current,
                                functionalRole: "",
                              }));
                            }}
                          >
                            <span className="ce-role-radio">
                              {selected && <span />}
                            </span>

                            <span className="ce-role-card-content">
                              <strong>{role.title}</strong>
                              <small>{role.description}</small>
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="ce-locked-role">
                    <div className="ce-locked-role-icon">
                      <ShieldCheck size={17} />
                    </div>

                    <div>
                      <span>System Access Role</span>
                      <strong>Employee</strong>
                    </div>

                    <small>Locked</small>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {currentStep === 3 && (
                <div className="ce-step-content">
                  <SectionHeading
                    eyebrow="Step 3"
                    title="Reporting Structure"
                    description="Define who the employee reports to within the organization."
                  />

                  <div className="ce-supervisor-question">
                    <div>
                      <label>
                        Is this employee a Supervisor?
                      </label>

                      <p>
                        Select whether this employee holds a supervisory
                        or authority position in the organizational
                        hierarchy.
                      </p>
                    </div>

                    <div className="ce-supervisor-choice">
                      {/* YES */}
                      <button
                        type="button"
                        className={`ce-supervisor-choice-button ${
                          form.isSupervisor ? "active" : ""
                        }`}
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            isSupervisor: true,
                          }));

                          setErrors((current) => ({
                            ...current,
                            isSupervisor: "",
                          }));
                        }}
                      >
                        <strong>Yes</strong>
                        <span>
                          This employee is a Supervisor
                        </span>
                      </button>

                      {/* NO */}
                      <button
                        type="button"
                        className={`ce-supervisor-choice-button ${
                          !form.isSupervisor ? "active" : ""
                        }`}
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            isSupervisor: false,
                            supervisorType: "",
                            supervisorPosition: "",
                          }));

                          setErrors((current) => ({
                            ...current,
                            isSupervisor: "",
                            supervisorType: "",
                            supervisorPosition: "",
                          }));
                        }}
                      >
                        <strong>No</strong>
                        <span>
                          This employee is not a Supervisor
                        </span>
                      </button>
                    </div>

                    {errors.isSupervisor && (
                      <small className="ce-field-error">
                        {errors.isSupervisor}
                      </small>
                    )}
                  </div>

                  <div className="ce-reporting-banner">
                    <div className="ce-reporting-icon">
                      <Users size={19} />
                    </div>

                    <div>
                      <strong>
                        Supervisor is an organizational relationship
                      </strong>

                      <p>
                        The supervisor can be another employee with a
                        different functional role. It does not have to be
                        the FMS Admin.
                      </p>
                    </div>
                  </div>

                  <div className="ce-form-grid">
                    {/* ACTUAL SUPERVISOR */}
                    <div className="ce-field">
                      <label htmlFor="supervisor">
                        Supervisor <span>*</span>
                      </label>

                      <div className="ce-select-wrapper">
                        <Users size={17} />

                        <input
                          id="supervisor"
                          name="supervisor"
                          value={form.supervisor}
                          onChange={updateField}
                          placeholder="Search or select supervisor"
                          className={
                            errors.supervisor ? "error" : ""
                          }
                        />

                        <ChevronDown size={16} />
                      </div>

                      {errors.supervisor && (
                        <small className="ce-field-error">
                          {errors.supervisor}
                        </small>
                      )}

                      <small className="ce-field-help">
                        Employee directory integration will populate this
                        selection.
                      </small>
                    </div>

                    {/* SUPERVISOR TYPE */}
                    {form.isSupervisor && (
                      <div className="ce-field">
                        <label htmlFor="supervisorType">
                          Supervisor Type <span>*</span>
                        </label>

                        <div className="ce-select-wrapper">
                          <Building2 size={17} />

                          <select
                            id="supervisorType"
                            name="supervisorType"
                            value={form.supervisorType}
                            onChange={(event) => {
                              updateField(event);

                              setForm((current) => ({
                                ...current,
                                supervisorPosition: "",
                              }));

                              setErrors((current) => ({
                                ...current,
                                supervisorPosition: "",
                              }));
                            }}
                            className={
                              errors.supervisorType ? "error" : ""
                            }
                          >
                            <option value="">
                              Select supervisor / authority type
                            </option>

                            {SUPERVISOR_HIERARCHY.map((item) => (
                              <option
                                value={item.label}
                                key={item.label}
                              >
                                {item.label}
                              </option>
                            ))}
                          </select>

                          <ChevronDown size={16} />
                        </div>

                        {errors.supervisorType && (
                          <small className="ce-field-error">
                            {errors.supervisorType}
                          </small>
                        )}
                      </div>
                    )}

                    {/* DEPENDENT POSITION / INCHARGE */}
                    {form.isSupervisor &&
                      form.supervisorType &&
                      supervisorPositions.length > 0 && (
                        <div className="ce-field">
                          <label htmlFor="supervisorPosition">
                            Position / Incharge
                          </label>

                          <div className="ce-select-wrapper">
                            <Building2 size={17} />

                            <select
                              id="supervisorPosition"
                              name="supervisorPosition"
                              value={form.supervisorPosition}
                              onChange={updateField}
                              className={
                                errors.supervisorPosition
                                  ? "error"
                                  : ""
                              }
                            >
                              <option value="">
                                Select position / incharge
                              </option>

                              {supervisorPositions.map((position) => (
                                <option
                                  value={position}
                                  key={position}
                                >
                                  {position}
                                </option>
                              ))}
                            </select>

                            <ChevronDown size={16} />
                          </div>

                          {errors.supervisorPosition && (
                            <small className="ce-field-error">
                              {errors.supervisorPosition}
                            </small>
                          )}
                        </div>
                      )}
                  </div>

                  <div className="ce-account-note">
                    <Mail size={18} />

                    <div>
                      <strong>Account credentials</strong>

                      <p>
                        The official email will be used as the employee's
                        organizational login identity. Secure credential
                        setup will be connected to the backend
                        account-creation API.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4 */}
              {/* STEP 4 */}
{currentStep === 4 && (
  <div className="ce-step-content">
    <SectionHeading
      eyebrow="Step 4"
      title="Lab & Deputation"
      description="Define the employee's parent laboratory and deputation status."
    />

    <div className="ce-info-banner">
      <div className="ce-info-banner-icon">
        <Building2 size={18} />
      </div>

      <div>
        <strong>Lab assignment information</strong>

        <p>
          Select whether the employee belongs to a Parent Lab and
          define deputation details where applicable.
        </p>
      </div>
    </div>

    {/* PARENT LAB */}
    <div className="ce-role-section">
      <div className="ce-role-heading">
        <div>
          <label>
            Parent Lab <span>*</span>
          </label>

          <p>
            Does this employee belong to a Parent Lab?
          </p>
        </div>

        {errors.parentLab && (
          <small className="ce-field-error">
            {errors.parentLab}
          </small>
        )}
      </div>

      <div className="ce-supervisor-choice">
        <button
          type="button"
          className={`ce-supervisor-choice-button ${
            form.parentLab === "yes" ? "active" : ""
          }`}
          onClick={() => {
            setForm((current) => ({
              ...current,
              parentLab: "yes",
              deputation: "no",
              parentResearchInstitute: "",
              accountsOfficer: "",
            }));

            setErrors((current) => ({
              ...current,
              parentLab: "",
              deputation: "",
              parentResearchInstitute: "",
              accountsOfficer: "",
            }));
          }}
        >
          <strong>Yes</strong>
          <span>Employee belongs to a Parent Lab</span>
        </button>

        <button
          type="button"
          className={`ce-supervisor-choice-button ${
            form.parentLab === "no" ? "active" : ""
          }`}
          onClick={() => {
            setForm((current) => ({
              ...current,
              parentLab: "no",
              deputation: "",
              parentResearchInstitute: "",
              accountsOfficer: "",
            }));

            setErrors((current) => ({
              ...current,
              parentLab: "",
              deputation: "",
              parentResearchInstitute: "",
              accountsOfficer: "",
            }));
          }}
        >
          <strong>No</strong>
          <span>Employee does not belong to a Parent Lab</span>
        </button>
      </div>
    </div>

    {/* DEPUTATION */}
    <div className="ce-role-section">
      <div className="ce-role-heading">
        <div>
          <label>
            Deputation <span>*</span>
          </label>

          <p>
            Is this employee on deputation from another laboratory?
          </p>
        </div>

        {errors.deputation && (
          <small className="ce-field-error">
            {errors.deputation}
          </small>
        )}
      </div>

      <div className="ce-supervisor-choice">
        {/* YES */}
        <button
          type="button"
          disabled={form.parentLab === "yes"}
          className={`ce-supervisor-choice-button ${
            form.deputation === "yes" ? "active" : ""
          } ${form.parentLab === "yes" ? "disabled" : ""}`}
          onClick={() => {
            if (form.parentLab === "yes") {
              return;
            }

            setForm((current) => ({
              ...current,
              deputation: "yes",
            }));

            setErrors((current) => ({
              ...current,
              deputation: "",
            }));
          }}
        >
          <strong>Yes</strong>
          <span>Employee is on deputation</span>
        </button>

        {/* NO */}
        <button
          type="button"
          disabled={form.parentLab === "yes"}
          className={`ce-supervisor-choice-button ${
            form.deputation === "no" ? "active" : ""
          } ${form.parentLab === "yes" ? "disabled" : ""}`}
          onClick={() => {
            if (form.parentLab === "yes") {
              return;
            }

            setForm((current) => ({
              ...current,
              deputation: "no",
              parentResearchInstitute: "",
              accountsOfficer: "",
            }));

            setErrors((current) => ({
              ...current,
              deputation: "",
              parentResearchInstitute: "",
              accountsOfficer: "",
            }));
          }}
        >
          <strong>No</strong>
          <span>Employee is not on deputation</span>
        </button>
      </div>

      {form.parentLab === "yes" && (
        <small className="ce-field-help">
          Deputation is automatically set to No because the employee
          belongs to a Parent Lab.
        </small>
      )}
    </div>

    {/* DEPUTATION DETAILS */}
    {form.parentLab === "no" && form.deputation === "yes" && (
      <div className="ce-form-grid">
        <Field
          label="Parent Research Institute Name"
          name="parentResearchInstitute"
          value={form.parentResearchInstitute}
          onChange={updateField}
          placeholder="Enter parent research institute name"
          required
          error={errors.parentResearchInstitute}
        />

        <Field
          label="Accounts Officer Name"
          name="accountsOfficer"
          value={form.accountsOfficer}
          onChange={updateField}
          placeholder="Enter accounts officer name"
          required
          error={errors.accountsOfficer}
        />
      </div>
    )}
  </div>
)}
              {currentStep === 5 && (
                <div className="ce-step-content">
                  <SectionHeading
                    eyebrow="Step 4"
                    title="Review Employee"
                    description="Review the information before creating the employee account."
                  />

                  <div className="ce-review-grid">
                    {/* BASIC DETAILS */}
                    <section className="ce-review-card">
                      <div className="ce-review-card-header">
                        <div className="ce-review-card-icon">
                          <UserPlus size={17} />
                        </div>

                        <div>
                          <span>Employee</span>
                          <h3>Basic Details</h3>
                        </div>
                      </div>

                      <div className="ce-review-list">
                        <div>
                          <span>Employee ID</span>
                          <strong>{form.employeeId}</strong>
                        </div>

                        <div>
                          <span>Full Name</span>
                          <strong>{form.name}</strong>
                        </div>

                        <div>
                          <span>Official Email</span>
                          <strong>{form.officialEmail}</strong>
                        </div>

                        <div>
                          <span>Joining Date</span>
                          <strong>{form.joiningDate}</strong>
                        </div>
                      </div>
                    </section>

                    {/* EMPLOYMENT */}
                    <section className="ce-review-card">
                      <div className="ce-review-card-header">
                        <div className="ce-review-card-icon">
                          <Building2 size={17} />
                        </div>

                        <div>
                          <span>Employment</span>
                          <h3>Organization Details</h3>
                        </div>
                      </div>

                      <div className="ce-review-list">
                        <div>
                          <span>Department</span>
                          <strong>{form.departmentName}</strong>
                        </div>

                        <div>
                          <span>Designation</span>
                          <strong>{form.designation}</strong>
                        </div>

                        <div>
                          <span>Payband / Payscale</span>
                          <strong>{form.payband}</strong>
                        </div>
                      </div>
                    </section>

                    {/* FUNCTIONAL ROLE */}
                    <section className="ce-review-card">
                      <div className="ce-review-card-header">
                        <div className="ce-review-card-icon">
                          <ShieldCheck size={17} />
                        </div>

                        <div>
                          <span>Authority</span>
                          <h3>Functional Role</h3>
                        </div>
                      </div>

                      <div className="ce-review-role">
                        <strong>
                          {selectedRole?.title || "Not selected"}
                        </strong>

                        <span>
                          System Role: Employee
                        </span>
                      </div>
                    </section>

                    {/* REPORTING */}
                    <section className="ce-review-card">
                      <div className="ce-review-card-header">
                        <div className="ce-review-card-icon">
                          <Users size={17} />
                        </div>

                        <div>
                          <span>Reporting</span>
                          <h3>Supervisor</h3>
                        </div>
                      </div>

                      <div className="ce-review-list">
                        <div>
                          <span>Supervisor</span>
                          <strong>
                            {form.supervisor || "Not selected"}
                          </strong>
                        </div>

                        <div>
                          <span>Is Supervisor?</span>
                          <strong>
                            {form.isSupervisor ? "Yes" : "No"}
                          </strong>
                        </div>

                        {form.isSupervisor && (
                          <div>
                            <span>Supervisor Type</span>
                            <strong>
                              {form.supervisorType || "Not selected"}
                            </strong>
                          </div>
                        )}

                        {form.isSupervisor &&
                          form.supervisorPosition && (
                            <div>
                              <span>Position / Incharge</span>
                              <strong>
                                {form.supervisorPosition}
                              </strong>
                            </div>
                          )}
                      </div>
                    </section>
                  </div>

                  <div className="ce-review-notice">
                    <ShieldCheck size={18} />

                    <div>
                      <strong>Employee account</strong>

                      <p>
                        This workflow creates an employee-level account.
                        Personal information such as date of birth,
                        gender, address, nationality, religion, caste,
                        category, phone and personal email will be
                        completed by the employee from My Profile.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <footer className="ce-modal-footer">
              <button
                type="button"
                className="ce-secondary-button"
                onClick={
                  currentStep === 1 ? handleClose : handleBack
                }
              >
                {currentStep === 1 ? (
                  "Cancel"
                ) : (
                  <>
                    <ArrowLeft size={16} />
                    Back
                  </>
                )}
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  className="ce-primary-button"
                  onClick={handleNext}
                >
                  Continue
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="ce-primary-button"
                  onClick={handleCreate}
                >
                  <UserPlus size={16} />
                  Create Employee
                </button>
              )}
            </footer>
          </>
        ) : (
          <div className="ce-success-state">
            <div className="ce-success-icon">
              <Check size={30} />
            </div>

            <span className="ce-success-eyebrow">
              Employee Management
            </span>

            <h2>Employee details are ready</h2>

            <p>
              The employee creation workflow has been completed in the
              frontend. The final account creation request will be
              connected once the secured Admin → Employee backend API is
              available.
            </p>

            <div className="ce-success-summary">
              <strong>{form.name}</strong>

              <span>
                {form.employeeId} · {form.designation}
              </span>

              <span>{form.officialEmail}</span>
            </div>

            <button
              type="button"
              className="ce-primary-button"
              onClick={handleClose}
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}