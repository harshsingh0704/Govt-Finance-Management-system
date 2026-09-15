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

const FUNCTIONAL_ROLES = [
  {
    id: "bill_clerk",
    title: "Bill Clerk / Accounts Staff",
    description: "Handles claim preparation and accounts-related operations.",
  },
  {
    id: "controlling_officer",
    title: "Controlling Officer / HoD",
    description: "Reviews and supervises departmental financial activity.",
  },
  {
    id: "medical_officer",
    title: "Medical Officer",
    description: "Handles medical verification and related claim responsibilities.",
  },
  {
    id: "ddo",
    title: "DDO / Competent Authority",
    description: "Performs designated financial approval and sanction responsibilities.",
  },
];

const INITIAL_FORM = {
  employeeId: "",
  name: "",
  officialEmail: "",
  departmentName: "",
  designation: "",
  payband: "",
  functionalRole: "",
  supervisor: "",
  supervisorType: "",
};

const SUPERVISOR_TYPES = [
  "Controlling Officer / HoD",
  "DDO / Competent Authority",
  "Senior Officer",
  "Other",
];

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
    { number: 4, label: "Review" },
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
              {currentStep > step.number ? <Check size={15} /> : step.number}
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
        nextErrors.officialEmail = "Enter a valid official email address.";
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

      if (!form.supervisorType) {
        nextErrors.supervisorType = "Select a supervisor type.";
      }
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleNext = () => {
    if (!validateStep()) {
      return;
    }

    setCurrentStep((step) => Math.min(step + 1, 4));
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
              <h2 id="create-employee-title">Create Employee Account</h2>
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
                      <strong>Organization-managed information</strong>
                      <p>
                        These details are entered by the administrator and
                        become part of the employee's official record.
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
                  </div>
                </div>
              )}

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
                        const selected = form.functionalRole === role.id;

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

              {currentStep === 3 && (
                <div className="ce-step-content">
                  <SectionHeading
                    eyebrow="Step 3"
                    title="Reporting Structure"
                    description="Define who the employee reports to within the organization."
                  />

                  <div className="ce-reporting-banner">
                    <div className="ce-reporting-icon">
                      <Users size={19} />
                    </div>

                    <div>
                      <strong>Supervisor is an organizational relationship</strong>
                      <p>
                        The supervisor can be another employee with a different
                        functional role. It does not have to be the FMS Admin.
                      </p>
                    </div>
                  </div>

                  <div className="ce-form-grid">
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
                          className={errors.supervisor ? "error" : ""}
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
                          onChange={updateField}
                          className={errors.supervisorType ? "error" : ""}
                        >
                          <option value="">Select supervisor type</option>

                          {SUPERVISOR_TYPES.map((type) => (
                            <option value={type} key={type}>
                              {type}
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
                  </div>

                  <div className="ce-account-note">
                    <Mail size={18} />

                    <div>
                      <strong>Account credentials</strong>
                      <p>
                        The official email will be used as the employee's
                        organizational login identity. Secure credential setup
                        will be connected to the backend account-creation API.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="ce-step-content">
                  <SectionHeading
                    eyebrow="Step 4"
                    title="Review Employee"
                    description="Review the information before creating the employee account."
                  />

                  <div className="ce-review-grid">
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
                      </div>
                    </section>

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

                        <span>System Role: Employee</span>
                      </div>
                    </section>

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
                          <strong>{form.supervisor}</strong>
                        </div>

                        <div>
                          <span>Supervisor Type</span>
                          <strong>{form.supervisorType}</strong>
                        </div>
                      </div>
                    </section>
                  </div>

                  <div className="ce-review-notice">
                    <ShieldCheck size={18} />

                    <div>
                      <strong>Employee account</strong>
                      <p>
                        This workflow creates an employee-level account.
                        Personal information such as date of birth, gender,
                        address, nationality, religion, caste, category,
                        phone and personal email will be completed by the
                        employee from My Profile.
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
                onClick={currentStep === 1 ? handleClose : handleBack}
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

              {currentStep < 4 ? (
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

            <span className="ce-success-eyebrow">Employee Management</span>

            <h2>Employee details are ready</h2>

            <p>
              The employee creation workflow has been completed in the
              frontend. The final account creation request will be connected
              once the secured Admin → Employee backend API is available.
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