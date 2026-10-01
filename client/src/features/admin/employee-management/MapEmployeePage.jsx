import { useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileCheck2,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  UserRound,
  WalletCards,
  X,
} from "lucide-react";

import "./MapEmployeePage.css";

/* ============================================================
   DEMO EMPLOYEE DATA
   Backend integration will replace this later.
   ============================================================ */

const EMPLOYEES = [
  {
    employeeId: "EMP-001",
    name: "Employee 001",
    department: "Finance",
    designation: "Accounts Officer",
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
   FINANCIAL WORK RESPONSIBILITY CATALOGUE
   ============================================================ */

const WORK_AREAS = [
  {
    id: "budget-management",
    title: "Budget Management",
    description:
      "Planning, allocation, monitoring and control of departmental budgets.",
    icon: WalletCards,
    responsibilities: [
      "Budget preparation",
      "Budget allocation",
      "Budget monitoring",
      "Fund availability review",
    ],
  },
  {
    id: "expense-management",
    title: "Expense Management",
    description:
      "Processing and monitoring organizational expenditure and financial claims.",
    icon: ClipboardCheck,
    responsibilities: [
      "Expense processing",
      "Bill verification",
      "Claim processing",
      "Expenditure review",
    ],
  },
  {
    id: "procurement-payments",
    title: "Procurement & Payments",
    description:
      "Financial processing related to procurement, invoices and vendor payments.",
    icon: FileCheck2,
    responsibilities: [
      "Purchase processing",
      "Invoice verification",
      "Payment processing",
      "Vendor payment review",
    ],
  },
  {
    id: "payroll-employee-finance",
    title: "Payroll & Employee Finance",
    description:
      "Financial operations associated with employee salary and related payments.",
    icon: UserRound,
    responsibilities: [
      "Payroll processing",
      "Salary verification",
      "Employee claims",
      "Employee financial adjustments",
    ],
  },
  {
    id: "revenue-receipts",
    title: "Revenue & Receipts",
    description:
      "Management and monitoring of organizational receipts and revenue.",
    icon: WalletCards,
    responsibilities: [
      "Receipt processing",
      "Revenue recording",
      "Collection monitoring",
      "Receipt reconciliation",
    ],
  },
  {
    id: "financial-reporting",
    title: "Financial Reporting",
    description:
      "Preparation, verification and review of financial statements and reports.",
    icon: FileCheck2,
    responsibilities: [
      "Financial statement preparation",
      "Financial report generation",
      "Data verification",
      "Report review",
    ],
  },
  {
    id: "assets-financial-inventory",
    title: "Assets & Financial Inventory",
    description:
      "Financial tracking and control of organizational assets and inventory.",
    icon: ClipboardCheck,
    responsibilities: [
      "Asset recording",
      "Asset verification",
      "Inventory valuation",
      "Asset reconciliation",
    ],
  },
  {
    id: "audit-compliance",
    title: "Audit & Compliance",
    description:
      "Financial audit support, compliance verification and corrective actions.",
    icon: ShieldCheck,
    responsibilities: [
      "Audit preparation",
      "Compliance verification",
      "Observation handling",
      "Corrective action tracking",
    ],
  },
];

/* ============================================================
   INITIAL RESPONSIBILITY STATE
   ============================================================ */

const createInitialMapping = () =>
  WORK_AREAS.reduce((result, workArea) => {
    result[workArea.id] = {
      responsible: false,
      authorized: false,
    };

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
   WORK RESPONSIBILITY CARD
   ============================================================ */

function WorkResponsibilityCard({
  workArea,
  mapping,
  onChange,
}) {
  const Icon = workArea.icon;

  const responsible = mapping.responsible;
  const authorized = mapping.authorized;

  return (
    <article
      className={`map-work-card ${
        responsible || authorized
          ? "map-work-card-active"
          : ""
      }`}
    >
      <div className="map-work-card-header">
        <div className="map-work-card-icon">
          <Icon size={20} />
        </div>

        <div className="map-work-card-title">
          <h3>{workArea.title}</h3>
          <p>{workArea.description}</p>
        </div>
      </div>

      <div className="map-work-card-responsibilities">
        <span>Work covered</span>

        <ul>
          {workArea.responsibilities.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>

      <div className="map-work-card-divider" />

      <div className="map-work-card-controls">
        <label
          className={`map-responsibility-option ${
            responsible ? "map-responsibility-option-active" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={responsible}
            onChange={(event) =>
              onChange(
                workArea.id,
                "responsible",
                event.target.checked
              )
            }
          />

          <span className="map-responsibility-check">
            {responsible && <Check size={14} />}
          </span>

          <span>
            <strong>Assigned Responsibility</strong>
            <small>
              Employee handles and processes the assigned financial work.
            </small>
          </span>
        </label>

        <label
          className={`map-responsibility-option ${
            authorized ? "map-responsibility-option-active" : ""
          }`}
        >
          <input
            type="checkbox"
            checked={authorized}
            onChange={(event) =>
              onChange(
                workArea.id,
                "authorized",
                event.target.checked
              )
            }
          />

          <span className="map-responsibility-check">
            {authorized && <Check size={14} />}
          </span>

          <span>
            <strong>Authorization</strong>
            <small>
              Employee can authorize or approve actions within this financial work area.
            </small>
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
     Responsibility change
     ---------------------------------------------------------- */

  const handleResponsibilityChange = (
    workAreaId,
    responsibility,
    value
  ) => {
    setMapping((current) => ({
      ...current,
      [workAreaId]: {
        ...current[workAreaId],
        [responsibility]: value,
      },
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

    /*
      Frontend-only phase.

      Later this object will be sent to the backend:

      {
        employeeId,
        workResponsibilities: mapping
      }
    */

    console.log("Employee responsibility mapping:", {
      employeeId: selectedEmployee.employeeId,
      employeeName: selectedEmployee.name,
      workResponsibilities: mapping,
    });

    setSaved(true);
  };

  /* ----------------------------------------------------------
     Mapping summary
     ---------------------------------------------------------- */

  const summary = useMemo(() => {
    const entries = Object.values(mapping);

    return {
      responsible: entries.filter(
        (item) => item.responsible
      ).length,

      authorized: entries.filter(
        (item) => item.authorized
      ).length,

      mapped: entries.filter(
        (item) => item.responsible || item.authorized
      ).length,
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
            <h1>Employee Work Assignment</h1>

            <p>
              Define the financial work responsibilities and
              authorization authority assigned to an employee.
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
                Choose the employee whose financial
                responsibilities you want to configure.
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

                  {search && (
                    <button
                      type="button"
                      className="map-employee-search-clear"
                      onClick={() => setSearch("")}
                      aria-label="Clear employee search"
                    >
                      <X size={15} />
                    </button>
                  )}

                </div>
              </label>

            </div>

            {selectedEmployee && (
              <div className="map-selected-employee">

                <div className="map-selected-employee-icon">
                  <UserRound size={20} />
                </div>

                <div className="map-selected-employee-info">

                  <span>Selected Employee</span>

                  <strong>
                    {selectedEmployee.name}
                  </strong>

                  <small>
                    {selectedEmployee.employeeId} ·{" "}
                    {selectedEmployee.designation}
                  </small>

                </div>

                <div className="map-selected-employee-status">
                  <span>
                    {selectedEmployee.status}
                  </span>
                </div>

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
                  Review the employee context before assigning
                  financial responsibilities.
                </p>
              </div>

            </div>

            <div className="map-employee-profile-grid">

              <div>
                <span>Employee ID</span>
                <strong>
                  {selectedEmployee.employeeId}
                </strong>
              </div>

              <div>
                <span>Department</span>
                <strong>
                  {selectedEmployee.department}
                </strong>
              </div>

              <div>
                <span>Designation</span>
                <strong>
                  {selectedEmployee.designation}
                </strong>
              </div>

              <div>
                <span>System Access</span>
                <strong>
                  {selectedEmployee.systemAccessRole}
                </strong>
              </div>

            </div>

          </section>
        )}

        {/* ====================================================
            WORK RESPONSIBILITIES
            ==================================================== */}

        <section className="map-employee-section">

          <div className="map-employee-section-header">

            <div className="map-employee-section-number">
              03
            </div>

            <div>
              <h2>Financial Work Responsibilities</h2>

              <p>
                Define which financial work the employee can
                handle and which work they are authorized to
                approve or authorize.
              </p>
            </div>

          </div>

          {!selectedEmployee ? (
            <div className="map-employee-empty-state">

              <div className="map-employee-empty-icon">
                <UserRound size={22} />
              </div>

              <h3>Select an employee first</h3>

              <p>
                Choose an employee above to configure their
                financial work responsibilities.
              </p>

            </div>
          ) : (
            <>
              <div className="map-work-legend">

                <div>
                  <span className="map-legend-dot map-legend-responsible" />
                  <span>
                    <strong>Assigned Responsibility</strong>
                    — handles and processes the assigned financial work
                  </span>
                </div>

                <div>
                  <span className="map-legend-dot map-legend-authorized" />
                  <span>
                    <strong>Authorization</strong>
                    — can authorize or approve actions within the work area
                  </span>
                </div>

              </div>

              <div className="map-work-grid">

                {WORK_AREAS.map((workArea) => (
                  <WorkResponsibilityCard
                    key={workArea.id}
                    workArea={workArea}
                    mapping={mapping[workArea.id]}
                    onChange={handleResponsibilityChange}
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
                <span>Mapping Summary</span>

                <strong>
                  {selectedEmployee.name}
                </strong>
              </div>

              <ShieldCheck size={21} />

            </div>

            <div className="map-employee-summary-stats">

              <div>
                <strong>{summary.mapped}</strong>
                <span>Financial Work Areas Mapped</span>
              </div>

              <div>
                <strong>{summary.responsible}</strong>
                <span>Assigned Responsibility</span>
              </div>

              <div>
                <strong>{summary.authorized}</strong>
                <span>Authorization</span>
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
            Reset Mapping
          </button>

          <button
            type="submit"
            className="map-employee-primary-button"
            disabled={!selectedEmployee}
          >
            <Save size={17} />
            Save Responsibility Mapping
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
                Responsibility mapping saved
              </strong>

              <p>
                The frontend mapping has been prepared
                successfully. Backend persistence will be
                connected in the next implementation phase.
              </p>
            </div>

          </div>
        )}

      </form>

    </div>
  );
}

export default MapEmployeePage;


