import { useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Edit3,
  Mail,  Search,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import "./EmployeeManagementPage.css";

const INITIAL_EMPLOYEES = [
  {
    employeeId: "EMP-001",
    name: "Employee 001",
    officialEmail: "employee001@organization.gov.in",
    joiningDate: "2022-06-15",
    departmentName: "Administration",
    designation: "Administrative Officer",
    payband: "Level 10",
    functionalRole: "Controlling Officer / HoD",
    systemAccessRole: "Employee",
    status: "Active",

    dateOfBirth: "1990-04-12",
    gender: "Male",
    nationality: "Indian",
    religion: "",
    caste: "",
    subCaste: "",
    correspondingAddress: "",
    permanentAddress: "",
    bloodGroup: "B+",
    maritalStatus: "Married",
    fatherName: "",
    motherName: "",
    spouseName: "",

    supervisor: "Head of the Office",
    supervisorType: "Head of the Office",
    supervisorPosition: "",
    parentLab: "Yes",
    deputation: "No",
    parentResearchInstitute: "",
    accountsOfficer: "",

    accommodation: {
      officeAccommodation: "Yes",
      officeAccommodationDate: "2023-01-10",
      quartersType: "Type III",
    },
  },
  {
    employeeId: "EMP-002",
    name: "Employee 002",
    officialEmail: "employee002@organization.gov.in",
    joiningDate: "2023-08-21",
    departmentName: "Finance & Accounts",
    designation: "Accounts Officer",
    payband: "Level 9",
    functionalRole: "Bill Clerk / Accounts Staff",
    systemAccessRole: "Employee",
    status: "Active",

    dateOfBirth: "1992-09-24",
    gender: "Female",
    nationality: "Indian",
    religion: "",
    caste: "",
    subCaste: "",
    correspondingAddress: "",
    permanentAddress: "",
    bloodGroup: "O+",
    maritalStatus: "Married",
    fatherName: "",
    motherName: "",
    spouseName: "",

    supervisor: "Drawing Dispersing Officer",
    supervisorType: "Drawing Dispersing Officer",
    supervisorPosition: "",
    parentLab: "No",
    deputation: "No",
    parentResearchInstitute: "",
    accountsOfficer: "",

    accommodation: {
      officeAccommodation: "No",
      officeAccommodationDate: "",
      quartersType: "",
    },
  },
  {
    employeeId: "EMP-003",
    name: "Employee 003",
    officialEmail: "employee003@organization.gov.in",
    joiningDate: "2024-02-05",
    departmentName: "Research",
    designation: "Research Officer",
    payband: "Level 8",
    functionalRole: "Medical Officer",
    systemAccessRole: "Employee",
    status: "Active",

    dateOfBirth: "1991-11-08",
    gender: "Male",
    nationality: "Indian",
    religion: "",
    caste: "",
    subCaste: "",
    correspondingAddress: "",
    permanentAddress: "",
    bloodGroup: "A+",
    maritalStatus: "Single",
    fatherName: "",
    motherName: "",
    spouseName: "",

    supervisor: "Group Coordinator Research",
    supervisorType: "Group Coordinator Research",
    supervisorPosition: "",
    parentLab: "Yes",
    deputation: "No",
    parentResearchInstitute: "",
    accountsOfficer: "",

    accommodation: {
      officeAccommodation: "No",
      officeAccommodationDate: "",
      quartersType: "",
    },
  },
];

const EMPTY_EMPLOYEE = {
  employeeId: "",
  name: "",
  officialEmail: "",
  joiningDate: "",
  departmentName: "",
  designation: "",
  payband: "",
  functionalRole: "",
  systemAccessRole: "Employee",
  status: "Active",

  dateOfBirth: "",
  gender: "",
  nationality: "Indian",
  religion: "",
  caste: "",
  subCaste: "",
  correspondingAddress: "",
  permanentAddress: "",
  bloodGroup: "",
  maritalStatus: "",
  fatherName: "",
  motherName: "",
  spouseName: "",

  supervisor: "",
  supervisorType: "",
  supervisorPosition: "",
  parentLab: "",
  deputation: "",
  parentResearchInstitute: "",
  accountsOfficer: "",

  accommodation: {
    officeAccommodation: "",
    officeAccommodationDate: "",
    quartersType: "",
  },
};

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

const QUARTERS_TYPES = [
  "Type I",
  "Type II",
  "Type III",
  "Type IV",
  "Type V",
  "Other",
];

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  disabled = false,
}) {
  return (
    <label className="employee-field">
      <span className="employee-field-label">{label}</span>
      <input
        type={type}
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  disabled = false,
}) {
  return (
    <label className="employee-field">
      <span className="employee-field-label">{label}</span>

      <span className="employee-select-wrap">
        <select
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <ChevronDown size={16} />
      </span>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  placeholder = "",
}) {
  return (
    <label className="employee-field employee-field-full">
      <span className="employee-field-label">{label}</span>
      <textarea
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
      />
    </label>
  );
}

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="employee-section-header">
      <div className="employee-section-icon">
        <Icon size={19} />
      </div>

      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
    </div>
  );
}

function EmployeeManagementPage() {
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(
    INITIAL_EMPLOYEES[0]?.employeeId ?? "",
  );
  const [searchValue, setSearchValue] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => employee.employeeId === selectedEmployeeId,
      ) ?? null,
    [employees, selectedEmployeeId],
  );

  const filteredEmployees = useMemo(() => {
    const query = searchValue.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee.employeeId,
        employee.name,
        employee.officialEmail,
        employee.departmentName,
        employee.designation,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [employees, searchValue]);

  const updateEmployee = (field, value) => {
    setEmployees((currentEmployees) =>
      currentEmployees.map((employee) =>
        employee.employeeId === selectedEmployeeId
          ? {
              ...employee,
              [field]: value,
            }
          : employee,
      ),
    );

    setSavedMessage("");
  };

  const updateAccommodation = (field, value) => {
    setEmployees((currentEmployees) =>
      currentEmployees.map((employee) =>
        employee.employeeId === selectedEmployeeId
          ? {
              ...employee,
              accommodation: {
                ...employee.accommodation,
                [field]: value,
              },
            }
          : employee,
      ),
    );

    setSavedMessage("");
  };

  const handleSelectEmployee = (employeeId) => {
    setSelectedEmployeeId(employeeId);
    setIsEditing(false);
    setSavedMessage("");
  };

  const handleSave = () => {
    setIsEditing(false);
    setSavedMessage(
      "Employee information has been updated in the current session.",
    );

    window.setTimeout(() => {
      setSavedMessage("");
    }, 3500);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSavedMessage("");
  };

  const handleAccommodationChange = (value) => {
    updateAccommodation("officeAccommodation", value);

    if (value === "No") {
      updateAccommodation("officeAccommodationDate", "");
      updateAccommodation("quartersType", "");
    }
  };

  return (
    <div className="employee-management-page">
      <div className="employee-management-header">
        <div>
          <div className="employee-breadcrumb">
            Admin Dashboard <span>/</span> Employee Management
          </div>

          <h1>Manage Employee</h1>

          <p>
            Maintain employee information, organizational details, reporting
            structure and accommodation records.
          </p>
        </div>

        <div className="employee-header-status">
          <CheckCircle2 size={17} />
          <span>{employees.length} employees</span>
        </div>
      </div>

      {savedMessage && (
        <div className="employee-save-message">
          <CheckCircle2 size={18} />
          <span>{savedMessage}</span>
          <button
            type="button"
            aria-label="Close message"
            onClick={() => setSavedMessage("")}
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="employee-management-layout">
        <aside className="employee-list-panel">
          <div className="employee-list-header">
            <div>
              <h2>Employees</h2>
              <span>{employees.length} records</span>
            </div>

            <Users size={20} />
          </div>

          <div className="employee-search">
            <Search size={17} />
            <input
              type="search"
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search employee..."
            />

            {searchValue && (
              <button
                type="button"
                onClick={() => setSearchValue("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="employee-list">
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => {
                const isSelected =
                  employee.employeeId === selectedEmployeeId;

                return (
                  <button
                    type="button"
                    key={employee.employeeId}
                    className={`employee-list-item ${
                      isSelected ? "selected" : ""
                    }`}
                    onClick={() => handleSelectEmployee(employee.employeeId)}
                  >
                    <div className="employee-avatar">
                      {employee.name
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <div className="employee-list-info">
                      <strong>{employee.name}</strong>
                      <span>{employee.employeeId}</span>
                      <small>{employee.departmentName}</small>
                    </div>

                    <span className="employee-list-arrow">›</span>
                  </button>
                );
              })
            ) : (
              <div className="employee-empty-list">
                <Search size={24} />
                <strong>No employees found</strong>
                <span>Try another name, ID or department.</span>
              </div>
            )}
          </div>
        </aside>

        <main className="employee-details-panel">
          {selectedEmployee ? (
            <>
              <div className="employee-profile-header">
                <div className="employee-profile-main">
                  <div className="employee-large-avatar">
                    {selectedEmployee.name
                      .split(" ")
                      .map((part) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>

                  <div>
                    <div className="employee-profile-name-row">
                      <h2>{selectedEmployee.name}</h2>

                      <span className="employee-active-badge">
                        <span />
                        {selectedEmployee.status}
                      </span>
                    </div>

                    <p>{selectedEmployee.designation}</p>

                    <div className="employee-profile-meta">
                      <span>
                        <UserRound size={15} />
                        {selectedEmployee.employeeId}
                      </span>

                      <span>
                        <Building2 size={15} />
                        {selectedEmployee.departmentName}
                      </span>

                      <span>
                        <Mail size={15} />
                        {selectedEmployee.officialEmail}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="employee-profile-actions">
                  {isEditing ? (
                    <>
                      <button
                        type="button"
                        className="employee-secondary-button"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        className="employee-primary-button"
                        onClick={handleSave}
                      >
                        <CheckCircle2 size={17} />
                        Save Changes
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="employee-primary-button"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit3 size={17} />
                      Edit Employee
                    </button>
                  )}
                </div>
              </div>

              <div className="employee-readonly-notice">
                <ShieldCheck size={18} />
                <div>
                  <strong>Organization-controlled employee record</strong>
                  <span>
                    Employee ID and System Access Role are controlled by the
                    organization and cannot be changed from this screen.
                  </span>
                </div>
              </div>

              <section className="employee-section">
                <SectionHeader
                  icon={UserRound}
                  title="Personal Information"
                  description="Employee identity and personal information."
                />

                <div className="employee-form-grid">
                  <Field
                    label="Employee ID"
                    value={selectedEmployee.employeeId}
                    disabled
                  />

                  <Field
                    label="Full Name"
                    value={selectedEmployee.name}
                    disabled={!isEditing}
                    onChange={(value) => updateEmployee("name", value)}
                  />

                  <Field
                    label="Official Email ID"
                    value={selectedEmployee.officialEmail}
                    type="email"
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("officialEmail", value)
                    }
                  />

                  <Field
                    label="Date of Birth"
                    value={selectedEmployee.dateOfBirth}
                    type="date"
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("dateOfBirth", value)
                    }
                  />

                  <SelectField
                    label="Gender"
                    value={selectedEmployee.gender}
                    options={["Male", "Female", "Other"]}
                    disabled={!isEditing}
                    onChange={(value) => updateEmployee("gender", value)}
                  />

                  <Field
                    label="Nationality"
                    value={selectedEmployee.nationality}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("nationality", value)
                    }
                  />

                  <Field
                    label="Religion"
                    value={selectedEmployee.religion}
                    disabled={!isEditing}
                    onChange={(value) => updateEmployee("religion", value)}
                  />

                  <Field
                    label="Caste"
                    value={selectedEmployee.caste}
                    disabled={!isEditing}
                    onChange={(value) => updateEmployee("caste", value)}
                  />

                  <Field
                    label="Sub-Caste"
                    value={selectedEmployee.subCaste}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("subCaste", value)
                    }
                  />

                  <SelectField
                    label="Blood Group"
                    value={selectedEmployee.bloodGroup}
                    options={[
                      "A+",
                      "A-",
                      "B+",
                      "B-",
                      "AB+",
                      "AB-",
                      "O+",
                      "O-",
                    ]}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("bloodGroup", value)
                    }
                  />

                  <SelectField
                    label="Marital Status"
                    value={selectedEmployee.maritalStatus}
                    options={["Single", "Married", "Divorced", "Widowed"]}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("maritalStatus", value)
                    }
                  />

                  {selectedEmployee.maritalStatus === "Married" && (
                    <Field
                      label="Spouse Name"
                      value={selectedEmployee.spouseName}
                      disabled={!isEditing}
                      onChange={(value) =>
                        updateEmployee("spouseName", value)
                      }
                    />
                  )}

                  <Field
                    label="Father's Name"
                    value={selectedEmployee.fatherName}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("fatherName", value)
                    }
                  />

                  <Field
                    label="Mother's Name"
                    value={selectedEmployee.motherName}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("motherName", value)
                    }
                  />

                  <TextAreaField
                    label="Corresponding Address"
                    value={selectedEmployee.correspondingAddress}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("correspondingAddress", value)
                    }
                  />

                  <TextAreaField
                    label="Permanent Address"
                    value={selectedEmployee.permanentAddress}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("permanentAddress", value)
                    }
                  />
                </div>
              </section>

              <section className="employee-section">
                <SectionHeader
                  icon={Building2}
                  title="Organization Information"
                  description="Official employment and access information."
                />

                <div className="employee-form-grid">
                  <Field
                    label="Department Name"
                    value={selectedEmployee.departmentName}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("departmentName", value)
                    }
                  />

                  <Field
                    label="Designation"
                    value={selectedEmployee.designation}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("designation", value)
                    }
                  />

                  <Field
                    label="Payband"
                    value={selectedEmployee.payband}
                    disabled={!isEditing}
                    onChange={(value) => updateEmployee("payband", value)}
                  />

                  <SelectField
                    label="Functional Role"
                    value={selectedEmployee.functionalRole}
                    options={FUNCTIONAL_ROLES}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("functionalRole", value)
                    }
                  />

                  <Field
                    label="System Access Role"
                    value={selectedEmployee.systemAccessRole}
                    disabled
                  />

                  <Field
                    label="Institute Joining Date"
                    value={selectedEmployee.joiningDate}
                    type="date"
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("joiningDate", value)
                    }
                  />
                </div>
              </section>

              <section className="employee-section">
                <SectionHeader
                  icon={Users}
                  title="Reporting Details"
                  description="Supervisor hierarchy and reporting assignment."
                />

                <div className="employee-form-grid">
                  <SelectField
                    label="Supervisor Type"
                    value={selectedEmployee.supervisorType}
                    options={SUPERVISOR_TYPES}
                    disabled={!isEditing}
                    onChange={(value) => {
                      updateEmployee("supervisorType", value);
                      updateEmployee("supervisor", value);
                    }}
                  />

                  <Field
                    label="Supervisor"
                    value={selectedEmployee.supervisor}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("supervisor", value)
                    }
                  />

                  <Field
                    label="Position / Incharge"
                    value={selectedEmployee.supervisorPosition}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("supervisorPosition", value)
                    }
                  />
                </div>
              </section>

              <section className="employee-section">
                <SectionHeader
                  icon={Building2}
                  title="Lab & Deputation"
                  description="Parent lab and deputation information."
                />

                <div className="employee-form-grid">
                  <SelectField
                    label="Parent Lab"
                    value={selectedEmployee.parentLab}
                    options={["Yes", "No"]}
                    disabled={!isEditing}
                    onChange={(value) => updateEmployee("parentLab", value)}
                  />

                  <SelectField
                    label="Deputation"
                    value={selectedEmployee.deputation}
                    options={
                      selectedEmployee.parentLab === "Yes"
                        ? ["No"]
                        : ["Yes", "No"]
                    }
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("deputation", value)
                    }
                  />

                  <Field
                    label="Parent Research Institute"
                    value={selectedEmployee.parentResearchInstitute}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("parentResearchInstitute", value)
                    }
                  />

                  <Field
                    label="Accounts Officer"
                    value={selectedEmployee.accountsOfficer}
                    disabled={!isEditing}
                    onChange={(value) =>
                      updateEmployee("accountsOfficer", value)
                    }
                  />
                </div>
              </section>

              <div className="employee-page-footer">
                <div>
                  <span className="footer-label">Last record status</span>
                  <strong>Ready for backend synchronization</strong>
                </div>

                <div className="footer-note">
                  <CalendarDays size={16} />
                  <span>
                    Organization-managed records are maintained by authorized
                    administrators.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="employee-no-selection">
              <UserRound size={42} />
              <h2>Select an employee</h2>
              <p>
                Choose an employee from the list to view and manage their
                information.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default EmployeeManagementPage;
