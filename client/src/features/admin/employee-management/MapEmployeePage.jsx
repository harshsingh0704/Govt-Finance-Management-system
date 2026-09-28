import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronDown,
  Search,
  ShieldCheck,
  Users,
  UserRound,
} from "lucide-react";

import "./MapEmployeePage.css";

/*
 * Temporary frontend data.
 *
 * This will later be replaced by the backend employee API.
 * The structure intentionally follows EmployeeManagementPage.jsx.
 */
const EMPLOYEES = [
  {
    employeeId: "EMP-001",
    name: "Employee 001",
    gender: "Male",
    designation: "Administrative Officer",
    departmentName: "Administration",
    payband: "Level 10",
    functionalRole: "Controlling Officer / HoD",
    systemAccessRole: "Employee",
    status: "Active",

    supervisorType: "Head of the Office",
    supervisor: "Head of the Office",
    supervisorPosition: "Head of the Office",
    ddoFinancialAuthority: "EMP-002",

    parentLab: "Yes",
    deputation: "No",
    parentResearchInstitute: "",
    accountsOfficer: "",
  },

  {
    employeeId: "EMP-002",
    name: "Employee 002",
    gender: "Female",
    designation: "Accounts Officer",
    departmentName: "Finance & Accounts",
    payband: "Level 9",
    functionalRole: "Bill Clerk / Accounts Staff",
    systemAccessRole: "Employee",
    status: "Active",

    supervisorType: "Drawing Dispersing Officer",
    supervisor: "Drawing Dispersing Officer",
    supervisorPosition: "Drawing & Disbursing Officer",
    ddoFinancialAuthority: "EMP-001",

    parentLab: "No",
    deputation: "No",
    parentResearchInstitute: "",
    accountsOfficer: "",
  },

  {
    employeeId: "EMP-003",
    name: "Employee 003",
    gender: "Male",
    designation: "Research Officer",
    departmentName: "Research",
    payband: "Level 8",
    functionalRole: "Medical Officer",
    systemAccessRole: "Employee",
    status: "Active",

    supervisorType: "Group Coordinator Research",
    supervisor: "Group Coordinator Research",
    supervisorPosition: "Head of the Office",
    ddoFinancialAuthority: "EMP-002",

    parentLab: "Yes",
    deputation: "No",
    parentResearchInstitute: "",
    accountsOfficer: "",
  },
];

const FUNCTIONAL_ROLES = [
  "Bill Clerk / Accounts Staff",
  "Controlling Officer / HoD",
  "Medical Officer",
  "DDO / Competent Authority",
];

const SUPERVISOR_TYPES = [
  "Director",
  "Group Coordinator Research",
  "Head of the Department",
  "Head of the Office",
  "Drawing Dispersing Officer",
  "Accounts Clerk 2",
  "Accounts Clerk 1",
  "Establishment Section Head",
  "Est Incharge 1",
  "Est Incharge 2",
  "Facility & Services Head",
  "Extension Dvision Head",
  "Wood Properties and Processing Division (WPPD) Head",
  "Silviculture & Forest Management Divison Head",
  "Forest Protection Division Head",
  "Plywood & Panel Products Technology Division Head",
  "IWST Gottipura Field Research Station Incharge 3",
  "IWST Gottipura Field Research Station Incharge 2",
  "IWST Gottipura Field Research Station Incharge 1",
  "IWST Gottipura Field Research Station Incharge 0",
];

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
}) {
  return (
    <label className="map-employee-field">
      <span className="map-employee-field-label">{label}</span>

      <div className="map-employee-select-wrap">
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        >
          <option value="">Select {label}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown size={17} />
      </div>
    </label>
  );
}

function EmployeeSelectField({
  label,
  value,
  employees,
  onChange,
  excludeEmployeeId = "",
}) {
  const availableEmployees = employees.filter(
    (employee) => employee.employeeId !== excludeEmployeeId
  );

  return (
    <label className="map-employee-field">
      <span className="map-employee-field-label">{label}</span>

      <div className="map-employee-select-wrap">
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select {label}</option>

          {availableEmployees.map((employee) => (
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
function TextField({
  label,
  value,
  onChange,
  disabled = false,
  placeholder = "",
}) {
  return (
    <label className="map-employee-field">
      <span className="map-employee-field-label">{label}</span>

      <input
        type="text"
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        placeholder={placeholder}
      />
    </label>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="map-employee-section-header">
      <div className="map-employee-section-icon">
        <Icon size={20} />
      </div>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function MapEmployeePage() {
  const [search, setSearch] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");

  const [mapping, setMapping] = useState({
    departmentName: "",
    designation: "",
    payband: "",
    functionalRole: "",

    supervisorType: "",
    supervisor: "",
    supervisorPosition: "",
    ddoFinancialAuthority: "",
    accountsOfficer: "",

    parentLab: "",
    deputation: "",
    parentResearchInstitute: "",
  });

  const [saved, setSaved] = useState(false);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return EMPLOYEES;
    }

    return EMPLOYEES.filter((employee) => {
      return (
        employee.employeeId.toLowerCase().includes(query) ||
        employee.name.toLowerCase().includes(query) ||
        employee.departmentName.toLowerCase().includes(query) ||
        employee.designation.toLowerCase().includes(query)
      );
    });
  }, [search]);

  const selectedEmployee = useMemo(() => {
    return EMPLOYEES.find(
      (employee) => employee.employeeId === selectedEmployeeId
    );
  }, [selectedEmployeeId]);

  const selectEmployee = (employee) => {
    setSelectedEmployeeId(employee.employeeId);

    setMapping({
      departmentName: employee.departmentName,
      designation: employee.designation,
      payband: employee.payband,
      functionalRole: employee.functionalRole,

      supervisorType: employee.supervisorType,
      supervisor: employee.supervisor,
      supervisorPosition: employee.supervisorPosition,
      ddoFinancialAuthority: employee.ddoFinancialAuthority || "",
      accountsOfficer: employee.accountsOfficer,

      parentLab: employee.parentLab,
      deputation: employee.deputation,
      parentResearchInstitute: employee.parentResearchInstitute,
    });

    setSaved(false);
  };

  const updateMapping = (field, value) => {
    setMapping((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleParentLabChange = (value) => {
    setMapping((current) => ({
      ...current,
      parentLab: value,

      // Existing project behavior:
      // Parent Lab = Yes means Deputation remains No.
      deputation: value === "Yes" ? "No" : current.deputation,
    }));

    setSaved(false);
  };

  const handleSave = (event) => {
    event.preventDefault();

    if (!selectedEmployee) {
      return;
    }

    /*
     * Backend integration will replace this.
     *
     * For now this only confirms the frontend mapping flow.
     */
    console.log("Employee mapping saved:", {
      employeeId: selectedEmployee.employeeId,
      ...mapping,
    });

    setSaved(true);
  };

  const handleReset = () => {
    if (!selectedEmployee) {
      return;
    }

    selectEmployee(selectedEmployee);
  };

  return (
    <div className="map-employee-page">
      <div className="map-employee-container">

        {/* PAGE HEADER */}
        <header className="map-employee-header">
          <div>
            <div className="map-employee-breadcrumb">
              Employee Management / Map Employee
            </div>

            <h1>Map Employee</h1>

            <p>
              Assign an employee to the appropriate organizational,
              reporting and financial structure.
            </p>
          </div>
        </header>

        {/* EMPLOYEE SELECTION */}
        <section className="map-employee-section">
          <SectionHeader
            icon={Users}
            title="1. Employee Selection"
            description="Search and select an existing employee to manage their organizational mapping."
          />

          <div className="map-employee-search">
            <Search size={19} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by Employee ID, name, department or designation..."
            />
          </div>

          <div className="map-employee-list">
            {filteredEmployees.length === 0 ? (
              <div className="map-employee-empty">
                No employees found.
              </div>
            ) : (
              filteredEmployees.map((employee) => {
                const isSelected =
                  employee.employeeId === selectedEmployeeId;

                return (
                  <button
                    key={employee.employeeId}
                    type="button"
                    className={`map-employee-list-item ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => selectEmployee(employee)}
                  >
                    <div className="map-employee-avatar">
                      <UserRound size={20} />
                    </div>

                    <div className="map-employee-list-info">
                      <strong>{employee.name}</strong>

                      <span>
                        {employee.employeeId} ·{" "}
                        {employee.designation}
                      </span>

                      <small>{employee.departmentName}</small>
                    </div>

                    {isSelected && (
                      <CheckCircle2
                        className="map-employee-selected-icon"
                        size={21}
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </section>

        {!selectedEmployee ? (
          <div className="map-employee-selection-message">
            <Users size={28} />

            <div>
              <strong>Select an employee to continue</strong>
              <p>
                Choose an employee above to view and update their
                organizational mapping.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave}>

            {/* SELECTED EMPLOYEE */}
            <section className="map-employee-section">
              <SectionHeader
                icon={UserRound}
                title="2. Employee & Organizational Information"
                description="Identity details are protected, while employment and organizational details can be updated."
              />

              <div className="map-employee-grid">

                {/* Protected identity fields */}
                <TextField
                  label="Employee Name"
                  value={selectedEmployee.name}
                  disabled
                />

                <TextField
                  label="Employee ID"
                  value={selectedEmployee.employeeId}
                  disabled
                />

                <TextField
                  label="Gender"
                  value={selectedEmployee.gender}
                  disabled
                />

                {/* Editable employment / organizational fields */}
                <TextField
                  label="Designation"
                  value={mapping.designation}
                  onChange={(value) =>
                    updateMapping("designation", value)
                  }
                />

                <TextField
                  label="Pay Grade"
                  value={mapping.payband}
                  onChange={(value) =>
                    updateMapping("payband", value)
                  }
                />

                <TextField
                  label="Department"
                  value={mapping.departmentName}
                  onChange={(value) =>
                    updateMapping("departmentName", value)
                  }
                />

                <SelectField
                  label="Functional Role"
                  value={mapping.functionalRole}
                  options={FUNCTIONAL_ROLES}
                  onChange={(value) =>
                    updateMapping("functionalRole", value)
                  }
                />

              </div>
            </section>
            {/* REPORTING & FINANCIAL STRUCTURE */}
            <section className="map-employee-section">
              <SectionHeader
                icon={Users}
                title="3. Reporting & Financial Structure"
                description="Define administrative reporting and financial processing relationships."
              />

              {/* ADMINISTRATIVE REPORTING */}
              <div className="map-employee-subsection">
                <div className="map-employee-subsection-header">
                  <h3>Administrative Reporting</h3>
                  <p>
                    Define who the employee reports to and the relevant
                    reporting responsibility.
                  </p>
                </div>

                <div className="map-employee-grid">
                  <SelectField
                    label="Supervisor Type"
                    value={mapping.supervisorType}
                    options={SUPERVISOR_TYPES}
                    onChange={(value) =>
                      updateMapping("supervisorType", value)
                    }
                  />

                  <EmployeeSelectField
                    label="Reporting Officer / Supervisor"
                    value={mapping.supervisor}
                    employees={EMPLOYEES}
                    excludeEmployeeId={selectedEmployee.employeeId}
                    onChange={(value) =>
                      updateMapping("supervisor", value)
                    }
                  />

                  <TextField
                    label="Position / Incharge"
                    value={mapping.supervisorPosition}
                    onChange={(value) =>
                      updateMapping("supervisorPosition", value)
                    }
                    placeholder="Enter position / incharge"
                  />
                </div>
              </div>

              {/* FINANCIAL RESPONSIBILITY */}
              <div className="map-employee-subsection">
                <div className="map-employee-subsection-header">
                  <h3>Financial Responsibility</h3>
                  <p>
                    Identify the financial authorities associated with the
                    employee.
                  </p>
                </div>

                <div className="map-employee-grid">
                  <EmployeeSelectField
                    label="DDO / Financial Authority"
                    value={mapping.ddoFinancialAuthority}
                    employees={EMPLOYEES}
                    excludeEmployeeId={selectedEmployee.employeeId}
                    onChange={(value) =>
                      updateMapping("ddoFinancialAuthority", value)
                    }
                  />

                  <EmployeeSelectField
                    label="Accounts Officer"
                    value={mapping.accountsOfficer}
                    employees={EMPLOYEES}
                    excludeEmployeeId={selectedEmployee.employeeId}
                    onChange={(value) =>
                      updateMapping("accountsOfficer", value)
                    }
                  />
                </div>
              </div>
            </section>
            {/* LAB & DEPUTATION */}
            <section className="map-employee-section">
              <SectionHeader
                icon={Building2}
                title="4. Lab & Deputation"
                description="Maintain parent lab and deputation assignment."
              />

              <div className="map-employee-grid">
                <SelectField
                  label="Parent Lab"
                  value={mapping.parentLab}
                  options={["Yes", "No"]}
                  onChange={handleParentLabChange}
                />

                <SelectField
                  label="Deputation"
                  value={mapping.deputation}
                  options={
                    mapping.parentLab === "Yes"
                      ? ["No"]
                      : ["Yes", "No"]
                  }
                  onChange={(value) =>
                    updateMapping("deputation", value)
                  }
                />

                <TextField
                  label="Parent Research Institute"
                  value={mapping.parentResearchInstitute}
                  onChange={(value) =>
                    updateMapping(
                      "parentResearchInstitute",
                      value
                    )
                  }
                  placeholder="Enter parent research institute"
                />
              </div>
            </section>

            {/* SYSTEM ACCESS */}
            <section className="map-employee-section">
              <SectionHeader
                icon={ShieldCheck}
                title="6. System Access"
                description="System access is controlled separately from organizational mapping."
              />

              <div className="map-employee-access">
                <ShieldCheck size={21} />

                <div className="map-employee-access-details">
                  <div className="map-employee-access-grid">

                    <div className="map-employee-access-item">
                      <span>System Role</span>
                      <strong>
                        {selectedEmployee.systemAccessRole || "Not assigned"}
                      </strong>
                      <small>Read only</small>
                    </div>

                    <div className="map-employee-access-item">
                      <span>Access Status</span>
                      <strong>
                        {selectedEmployee.status || "Not available"}
                      </strong>
                      <small>Read only</small>
                    </div>

                  </div>

                  <div className="map-employee-access-notice">
                    <ShieldCheck size={18} />

                    <div>
                      <strong>Access Control Notice</strong>
                      <p>
                        System access permissions are managed through the
                        authorized access-control workflow and cannot be
                        modified from employee mapping.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
            {/* ACTIONS */}
            <div className="map-employee-actions">
              <button
                type="button"
                className="map-employee-secondary-button"
                onClick={handleReset}
              >
                Reset Changes
              </button>

              <button
                type="submit"
                className="map-employee-primary-button"
              >
                Save Mapping
              </button>
            </div>

            {saved && (
              <div className="map-employee-success">
                <CheckCircle2 size={20} />

                <div>
                  <strong>Mapping saved successfully</strong>

                  <p>
                    The frontend mapping flow completed successfully.
                    Backend persistence will be connected later.
                  </p>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default MapEmployeePage;






