import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  FileCheck2,
  FileText,
  HeartPulse,
  Plane,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
} from "lucide-react";

import "./MapEmployeePage.css";

/* ============================================================
   DEMO EMPLOYEE DATA
   Replace with backend data later.
   ============================================================ */

const EMPLOYEES = [
 {
  employeeId: "EMP-001",
  name: "Employee 001",
  department: "Administration",
  designation: "Director",
  systemAccessRole: "Admin",
  status: "Active",
},
  {
    employeeId: "EMP-002",
    name: "Employee 002",
    department: "Finance",
    designation: "Accounts Assistant",
    systemAccessRole: "Employee",
    status: "Active",
  },
  {
    employeeId: "EMP-003",
    name: "Employee 003",
    department: "Administration",
    designation: "Administrative Officer",
    systemAccessRole: "Employee",
    status: "Active",
  },
  {
    employeeId: "EMP-004",
    name: "Employee 004",
    department: "Finance",
    designation: "Budget Officer",
    systemAccessRole: "Employee",
    status: "Active",
  },
];

/* ============================================================
   FORM ACCESS CATALOGUE
   Each form has one ENABLE / DISABLE permission.
   ============================================================ */

const FORMS = [
  {
    id: "ta-claim",
    title: "TA Claim",
    description:
      "Submit and manage Travel Allowance claims for official travel.",
    category: "Travel",
    icon: Plane,
  },
  {
    id: "ta-advance",
    title: "TA Advance",
    description:
      "Request an advance for approved official travel.",
    category: "Travel",
    icon: WalletCards,
  },
  {
    id: "ltc-claim",
    title: "LTC Claim",
    description:
      "Submit and manage Leave Travel Concession claims.",
    category: "LTC",
    icon: FileCheck2,
  },
  {
    id: "ltc-advance",
    title: "LTC Advance",
    description:
      "Request an advance under the Leave Travel Concession scheme.",
    category: "LTC",
    icon: WalletCards,
  },
  {
    id: "medical-claim",
    title: "Medical Claim",
    description:
      "Submit and manage eligible medical reimbursement claims.",
    category: "Medical",
    icon: HeartPulse,
  },
  {
    id: "medical-advance",
    title: "Medical Advance",
    description:
      "Request an advance for eligible medical expenses.",
    category: "Medical",
    icon: WalletCards,
  },
  {
    id: "accommodation",
    title: "Accommodation",
    description:
      "Submit and manage official accommodation requests.",
    category: "Accommodation",
    icon: FileText,
  },
];

/* ============================================================
   INITIAL FORM MAPPING
   ============================================================ */

const createInitialMapping = () =>
  FORMS.reduce((result, form) => {
    result[form.id] = false;
    return result;
  }, {});

/* ============================================================
   EMPLOYEE SELECT
   ============================================================ */

function EmployeeSelect({ value, employees, onChange }) {
  return (
    <label className="map-employee-field">
      <span className="map-employee-field-label">
        Select Employee
      </span>

      <div className="map-employee-select-wrap">
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select employee</option>

          {employees.map((employee) => (
            <option
              key={employee.employeeId}
              value={employee.employeeId}
            >
              {employee.employeeId} — {employee.name}
            </option>
          ))}
        </select>

        <ChevronDown size={17} />
      </div>
    </label>
  );
}

/* ============================================================
   FORM ACCESS CARD
   ============================================================ */

function FormAccessCard({ form, enabled, onChange }) {
  const Icon = form.icon;

  return (
    <article
      className={`map-form-card ${
        enabled ? "map-form-card-enabled" : ""
      }`}
    >
      <div className="map-form-card-top">
        <div className="map-form-card-icon">
          <Icon size={21} />
        </div>

        <div className="map-form-card-content">
          <div className="map-form-card-title-row">
            <div>
              <h3>{form.title}</h3>

              <span className="map-form-category">
                {form.category}
              </span>
            </div>

            <span
              className={`map-form-status ${
                enabled
                  ? "map-form-status-enabled"
                  : "map-form-status-disabled"
              }`}
            >
              {enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          <p>{form.description}</p>
        </div>
      </div>

      <div className="map-form-card-divider" />

      <div className="map-form-card-footer">
        <div>
          <strong>Form Access</strong>

          <small>
            {enabled
              ? "Employee is authorized to access this form."
              : "Employee cannot access this form."}
          </small>
        </div>

        <label className="map-form-toggle">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) =>
              onChange(form.id, event.target.checked)
            }
          />

          <span className="map-form-toggle-track">
            <span className="map-form-toggle-thumb" />
          </span>

          <span className="map-form-toggle-label">
            {enabled ? "Enabled" : "Disabled"}
          </span>
        </label>
      </div>
    </article>
  );
}

/* ============================================================
   MAIN PAGE
   ============================================================ */

function MapEmployeePage() {
  const [search, setSearch] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState("");

  const [mapping, setMapping] = useState(
    createInitialMapping()
  );

  const [saved, setSaved] = useState(false);

  /* ----------------------------------------------------------
     Selected employee
     ---------------------------------------------------------- */

  const selectedEmployee = useMemo(
    () =>
      EMPLOYEES.find(
        (employee) =>
          employee.employeeId === selectedEmployeeId
      ),
    [selectedEmployeeId]
  );

  /* ----------------------------------------------------------
     Employee search
     ---------------------------------------------------------- */

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return EMPLOYEES;
    }

    return EMPLOYEES.filter((employee) =>
      [
        employee.employeeId,
        employee.name,
        employee.department,
        employee.designation,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  /* ----------------------------------------------------------
     Employee selection
     ---------------------------------------------------------- */

  const handleEmployeeChange = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setMapping(createInitialMapping());
    setSaved(false);
  };

  /* ----------------------------------------------------------
     Form access change
     ---------------------------------------------------------- */

  const handleFormAccessChange = (formId, enabled) => {
    setMapping((current) => ({
      ...current,
      [formId]: enabled,
    }));

    setSaved(false);
  };

  /* ----------------------------------------------------------
     Reset
     ---------------------------------------------------------- */

  const handleReset = () => {
    setMapping(createInitialMapping());
    setSaved(false);
  };

  /* ----------------------------------------------------------
     Save
     ---------------------------------------------------------- */

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    const payload = {
      employeeId: selectedEmployee.employeeId,
      employeeName: selectedEmployee.name,
      formAccess: mapping,
    };

    /*
      Backend integration will use this payload later.

      Example:

      {
        employeeId: "EMP-001",
        formAccess: {
          "ta-claim": true,
          "ta-advance": false,
          "ltc-claim": true,
          "ltc-advance": false,
          "medical-claim": true,
          "medical-advance": false,
          "accommodation": false
        }
      }
    */

    console.log("Employee form access mapping:", payload);

    setSaved(true);
  };

  /* ----------------------------------------------------------
     Summary
     ---------------------------------------------------------- */

  const summary = useMemo(() => {
    const enabled = Object.values(mapping).filter(
      Boolean
    ).length;

    const total = FORMS.length;

    return {
      enabled,
      disabled: total - enabled,
      total,
    };
  }, [mapping]);

  return (
    <div className="map-employee-page">

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header className="map-employee-page-header">
        <div className="map-employee-page-header-content">

          <div className="map-employee-page-header-icon">
            <ShieldCheck size={22} />
          </div>

          <div>
            <h1>Employee Form Access</h1>

            <p>
              Configure which financial forms an employee
              is authorized to access.
            </p>
          </div>

        </div>
      </header>

      <form onSubmit={handleSubmit}>

        {/* ====================================================
            EMPLOYEE SELECTION
            ==================================================== */}

        <section className="map-employee-section">

          <div className="map-employee-section-header">

            <div className="map-employee-section-number">
              01
            </div>

            <div>
              <h2>Select Employee</h2>

              <p>
                Choose the employee whose form access
                permissions you want to configure.
              </p>
            </div>

          </div>

          <div className="map-employee-selection-layout">

            <div className="map-employee-selection-form">

              <EmployeeSelect
                value={selectedEmployeeId}
                employees={filteredEmployees}
                onChange={handleEmployeeChange}
              />

              <label className="map-employee-field">
                <span className="map-employee-field-label">
                  Search Employee
                </span>

                <div className="map-employee-search-wrap">
                  <Search size={17} />

                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search by ID, name, department..."
                  />
                </div>
              </label>

            </div>

            {selectedEmployee ? (
              <div className="map-selected-employee">

                <div className="map-selected-employee-icon">
                  <UserRound size={21} />
                </div>

                <div className="map-selected-employee-info">

                  <span>SELECTED EMPLOYEE</span>

                  <strong>
                    {selectedEmployee.name}
                  </strong>

                  <small>
                    {selectedEmployee.employeeId} ·{" "}
                    {selectedEmployee.designation}
                  </small>

                </div>

                <span className="map-selected-employee-status">
                  {selectedEmployee.status}
                </span>

              </div>
            ) : (
              <div className="map-employee-empty-selection">
                <UserRound size={21} />

                <strong>
                  Select an employee
                </strong>

                <span>
                  Employee details will appear here.
                </span>
              </div>
            )}

          </div>

        </section>

        {/* ====================================================
            EMPLOYEE PROFILE
            ==================================================== */}

        {selectedEmployee && (
          <section className="map-employee-section">

            <div className="map-employee-section-header">

              <div className="map-employee-section-number">
                02
              </div>

              <div>
                <h2>Employee Profile</h2>

                <p>
                  Review the employee context before
                  assigning form access.
                </p>
              </div>

            </div>

            <div className="map-employee-profile-grid">

              <div>
                <span>EMPLOYEE ID</span>
                <strong>
                  {selectedEmployee.employeeId}
                </strong>
              </div>

              <div>
                <span>DEPARTMENT</span>
                <strong>
                  {selectedEmployee.department}
                </strong>
              </div>

              <div>
                <span>DESIGNATION</span>
                <strong>
                  {selectedEmployee.designation}
                </strong>
              </div>

              <div>
                <span>SYSTEM ACCESS</span>
                <strong>
                  {selectedEmployee.systemAccessRole}
                </strong>
              </div>

            </div>

          </section>
        )}

        {/* ====================================================
            FORM ACCESS
            ==================================================== */}

        <section className="map-employee-section">

          <div className="map-employee-section-header">

            <div className="map-employee-section-number">
              03
            </div>

            <div>
              <h2>Form Access & Permissions</h2>

              <p>
                Enable or disable individual financial
                forms for this employee.
              </p>
            </div>

          </div>

          {!selectedEmployee ? (
            <div className="map-employee-empty-state">

              <div className="map-employee-empty-icon">
                <UserRound size={22} />
              </div>

              <h3>
                Select an employee first
              </h3>

              <p>
                Choose an employee above to configure
                their form access permissions.
              </p>

            </div>
          ) : (
            <>
              <div className="map-form-access-info">

                <div>
                  <ShieldCheck size={18} />

                  <span>
                    <strong>Manual Form Access</strong>
                    {" "}— Admin can individually enable or
                    disable each form for this employee.
                  </span>
                </div>

              </div>

              <div className="map-form-grid">

                {FORMS.map((form) => (
                  <FormAccessCard
                    key={form.id}
                    form={form}
                    enabled={mapping[form.id]}
                    onChange={handleFormAccessChange}
                  />
                ))}

              </div>
            </>
          )}

        </section>

        {/* ====================================================
            MAPPING SUMMARY
            ==================================================== */}

        {selectedEmployee && (
          <section className="map-employee-summary">

            <div className="map-employee-summary-header">

              <div>
                <span>ACCESS SUMMARY</span>

                <strong>
                  {selectedEmployee.name}
                </strong>
              </div>

              <ShieldCheck size={21} />

            </div>

            <div className="map-employee-summary-stats">

              <div>
                <strong>{summary.enabled}</strong>
                <span>Forms Enabled</span>
              </div>

              <div>
                <strong>{summary.total}</strong>
                <span>Total Forms</span>
              </div>

              <div>
                <strong>{summary.disabled}</strong>
                <span>Forms Disabled</span>
              </div>

            </div>

          </section>
        )}

        {/* ====================================================
            ACTIONS
            ==================================================== */}

        <div className="map-employee-actions">

          <button
            type="button"
            className="map-employee-secondary-button"
            onClick={handleReset}
          >
            <RotateCcw size={17} />
            Reset Access
          </button>

          <button
            type="submit"
            className="map-employee-primary-button"
            disabled={!selectedEmployee}
          >
            <Save size={17} />
            Save Form Access
          </button>

        </div>

        {/* ====================================================
            SUCCESS
            ==================================================== */}

        {saved && (
          <div className="map-employee-success">

            <CheckCircle2 size={20} />

            <div>
              <strong>
                Form access mapping saved
              </strong>

              <p>
                The selected form permissions have been
                prepared successfully.
              </p>
            </div>

          </div>
        )}

      </form>
    </div>
  );
}

export default MapEmployeePage;