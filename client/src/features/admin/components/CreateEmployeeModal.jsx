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

        {!created ? (
          <>
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