import React, { useMemo, useState } from "react";
import {
  X,
  Plane,
  ShieldCheck,
  User,
  CalendarDays,
  FileText,
  IndianRupee,
  Upload,
  RotateCcw,
  Send,
  ChevronRight,
} from "lucide-react";
import "./TAAdvanceModal.css";

const employees = [
  {
    id: "EMP-001",
    name: "Employee 001",
    designation: "Accounts Officer",
    department: "Finance",
    office: "Finance Department",
  },
  {
    id: "EMP-002",
    name: "Employee 002",
    designation: "Senior Accountant",
    department: "Accounts",
    office: "Accounts Department",
  },
  {
    id: "EMP-003",
    name: "Employee 003",
    designation: "Finance Assistant",
    department: "Finance",
    office: "Finance Department",
  },
];

const steps = [
  "Employee Information",
  "TA Advance Details",
  "Financial Details",
  "Documents",
  "Review",
];

const travelModes = [
  "Air",
  "Train",
  "Bus",
  "Official Vehicle",
  "Taxi / Cab",
  "Other",
];

function TAAdvanceModal({ isOpen, onClose }) {
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [formData, setFormData] = useState({
    purpose: "",
    destination: "",
    travelMode: "",
    fromDate: "",
    toDate: "",
    estimatedTravelExpense: "",
    dailyAllowance: "",
    otherExpenses: "",
    advanceRequested: "",
    supportingDocument: null,
    declaration: false,
  });

  const selectedEmployee = useMemo(
    () =>
      employees.find(
        (employee) => employee.id === selectedEmployeeId
      ) || null,
    [selectedEmployeeId]
  );

  const totalAmount = useMemo(() => {
    const values = [
      formData.estimatedTravelExpense,
      formData.dailyAllowance,
      formData.otherExpenses,
    ];

    return values.reduce((total, value) => {
      const amount = Number(value);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [
    formData.estimatedTravelExpense,
    formData.dailyAllowance,
    formData.otherExpenses,
  ]);

  if (!isOpen) {
    return null;
  }

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleEmployeeChange = (event) => {
    setSelectedEmployeeId(event.target.value);
  };

  const handleDocumentChange = (event) => {
    const file = event.target.files?.[0] || null;

    setFormData((previous) => ({
      ...previous,
      supportingDocument: file,
    }));
  };

  const handleReset = () => {
    setSelectedEmployeeId("");

    setFormData({
      purpose: "",
      destination: "",
      travelMode: "",
      fromDate: "",
      toDate: "",
      estimatedTravelExpense: "",
      dailyAllowance: "",
      otherExpenses: "",
      advanceRequested: "",
      supportingDocument: null,
      declaration: false,
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!selectedEmployee) {
      window.alert("Please select an employee.");
      return;
    }

    if (!formData.declaration) {
      window.alert(
        "Please confirm the declaration before submitting the application."
      );
      return;
    }

    console.log("TA Advance Application:", {
      employee: selectedEmployee,
      ...formData,
      totalAmount,
    });

    window.alert("TA Advance application submitted successfully.");
    onClose();
  };

  return (
    <div className="ta-advance-overlay" onMouseDown={onClose}>
      <div
        className="ta-advance-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}
        <div className="ta-advance-header">
          <div className="ta-advance-header-left">
            <div className="ta-advance-header-icon">
              <Plane size={21} strokeWidth={2.2} />
            </div>

            <div>
              <div className="ta-advance-eyebrow">
                TA &amp; TRAVEL
              </div>

              <h2>TA Advance Application</h2>
            </div>
          </div>

          <button
            type="button"
            className="ta-advance-close"
            onClick={onClose}
            aria-label="Close TA Advance form"
          >
            <X size={21} />
          </button>
        </div>

        {/* =====================================================
            STEPPER
        ====================================================== */}
        <div className="ta-advance-stepper">
          {steps.map((step, index) => {
            const stepNumber = index + 1;

            return (
              <React.Fragment key={step}>
                <div
                  className={`ta-advance-step ${
                    index === 0 ? "active" : ""
                  }`}
                >
                  <span className="ta-advance-step-number">
                    {stepNumber}
                  </span>

                  <span className="ta-advance-step-label">
                    {step}
                  </span>
                </div>

                {index < steps.length - 1 && (
                  <div className="ta-advance-step-line" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* =====================================================
            FORM
        ====================================================== */}
        <form
          className="ta-advance-form"
          onSubmit={handleSubmit}
        >
          <div className="ta-advance-form-content">
            {/* =================================================
                FORM TITLE
            ================================================== */}
            <div className="ta-advance-intro">
              <div className="ta-advance-step-caption">
                TA ADVANCE
              </div>

              <h1>Apply for advance related to official travel</h1>

              <p>
                Provide the employee, travel and financial details
                required for the TA advance request.
              </p>
            </div>

            {/* =================================================
                EMPLOYEE INFORMATION
            ================================================== */}
            <section className="ta-form-section">
              <div className="ta-form-section-heading">
                <div className="ta-form-section-number">01</div>

                <div>
                  <h3>Employee Information</h3>
                  <p>
                    Select the employee and verify the official
                    information for this application.
                  </p>
                </div>
              </div>

              <div className="ta-info-banner">
                <div className="ta-info-banner-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <strong>Organization-managed information</strong>
                  <span>
                    Employee details are populated from the official
                    employee record.
                  </span>
                </div>
              </div>

              <div className="ta-form-grid ta-form-grid-two">
                <div className="ta-field">
                  <label htmlFor="ta-employee">
                    Employee <span>*</span>
                  </label>

                  <div className="ta-input-with-icon">
                    <User size={18} />

                    <select
                      id="ta-employee"
                      value={selectedEmployeeId}
                      onChange={handleEmployeeChange}
                      required
                    >
                      <option value="">Select Employee</option>

                      {employees.map((employee) => (
                        <option
                          key={employee.id}
                          value={employee.id}
                        >
                          {employee.id} — {employee.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="ta-field">
                  <label htmlFor="ta-designation">
                    Designation
                  </label>

                  <input
                    id="ta-designation"
                    type="text"
                    value={selectedEmployee?.designation || ""}
                    placeholder="Auto populated"
                    readOnly
                  />
                </div>

                <div className="ta-field ta-field-full">
                  <label htmlFor="ta-department">
                    Department / Office
                  </label>

                  <input
                    id="ta-department"
                    type="text"
                    value={
                      selectedEmployee
                        ? `${selectedEmployee.department} / ${selectedEmployee.office}`
                        : ""
                    }
                    placeholder="Auto populated"
                    readOnly
                  />
                </div>
              </div>
            </section>

            {/* =================================================
                TA ADVANCE DETAILS
            ================================================== */}
            <section className="ta-form-section">
              <div className="ta-form-section-heading">
                <div className="ta-form-section-number">02</div>

                <div>
                  <h3>TA Advance Details</h3>
                  <p>
                    Provide the purpose, destination and official
                    travel schedule.
                  </p>
                </div>
              </div>

              <div className="ta-form-grid">
                <div className="ta-field ta-field-full">
                  <label htmlFor="ta-purpose">
                    Purpose / Reason <span>*</span>
                  </label>

                  <textarea
                    id="ta-purpose"
                    name="purpose"
                    value={formData.purpose}
                    onChange={handleChange}
                    placeholder="Enter the purpose or reason for official travel"
                    rows={3}
                    required
                  />
                </div>

                <div className="ta-field">
                  <label htmlFor="ta-destination">
                    Destination <span>*</span>
                  </label>

                  <input
                    id="ta-destination"
                    name="destination"
                    type="text"
                    value={formData.destination}
                    onChange={handleChange}
                    placeholder="Enter travel destination"
                    required
                  />
                </div>

                <div className="ta-field">
                  <label htmlFor="ta-travel-mode">
                    Travel Mode <span>*</span>
                  </label>

                  <select
                    id="ta-travel-mode"
                    name="travelMode"
                    value={formData.travelMode}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Travel Mode</option>

                    {travelModes.map((mode) => (
                      <option key={mode} value={mode}>
                        {mode}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="ta-field">
                  <label htmlFor="ta-from-date">
                    From Date <span>*</span>
                  </label>

                  <div className="ta-input-with-icon">
                    <CalendarDays size={18} />

                    <input
                      id="ta-from-date"
                      name="fromDate"
                      type="date"
                      value={formData.fromDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="ta-field">
                  <label htmlFor="ta-to-date">
                    To Date <span>*</span>
                  </label>

                  <div className="ta-input-with-icon">
                    <CalendarDays size={18} />

                    <input
                      id="ta-to-date"
                      name="toDate"
                      type="date"
                      value={formData.toDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* =================================================
                FINANCIAL DETAILS
            ================================================== */}
            <section className="ta-form-section">
              <div className="ta-form-section-heading">
                <div className="ta-form-section-number">03</div>

                <div>
                  <h3>Financial Details</h3>
                  <p>
                    Enter the estimated travel expenses and
                    advance amount requested.
                  </p>
                </div>
              </div>

              <div className="ta-financial-grid">
                <div className="ta-field">
                  <label htmlFor="ta-travel-expense">
                    Estimated Travel Expense
                  </label>

                  <div className="ta-money-input">
                    <span>₹</span>

                    <input
                      id="ta-travel-expense"
                      name="estimatedTravelExpense"
                      type="number"
                      min="0"
                      value={formData.estimatedTravelExpense}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="ta-field">
                  <label htmlFor="ta-daily-allowance">
                    Daily Allowance
                  </label>

                  <div className="ta-money-input">
                    <span>₹</span>

                    <input
                      id="ta-daily-allowance"
                      name="dailyAllowance"
                      type="number"
                      min="0"
                      value={formData.dailyAllowance}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="ta-field">
                  <label htmlFor="ta-other-expenses">
                    Other Expenses
                  </label>

                  <div className="ta-money-input">
                    <span>₹</span>

                    <input
                      id="ta-other-expenses"
                      name="otherExpenses"
                      type="number"
                      min="0"
                      value={formData.otherExpenses}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="ta-field">
                  <label htmlFor="ta-advance-requested">
                    Advance Requested
                  </label>

                  <div className="ta-money-input">
                    <span>₹</span>

                    <input
                      id="ta-advance-requested"
                      name="advanceRequested"
                      type="number"
                      min="0"
                      value={formData.advanceRequested}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>

              <div className="ta-total-card">
                <div>
                  <span className="ta-total-label">Total</span>
                  <span className="ta-total-description">
                    Estimated total travel-related expense
                  </span>
                </div>

                <strong>
                  <IndianRupee size={22} />
                  {totalAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </strong>
              </div>
            </section>

            {/* =================================================
                SUPPORTING DOCUMENTS
            ================================================== */}
            <section className="ta-form-section">
              <div className="ta-form-section-heading">
                <div className="ta-form-section-number">04</div>

                <div>
                  <h3>Supporting Documents</h3>
                  <p>
                    Attach the supporting document related to the
                    official travel request.
                  </p>
                </div>
              </div>

              <div className="ta-upload-area">
                <div className="ta-upload-icon">
                  <Upload size={20} />
                </div>

                <div className="ta-upload-content">
                  <strong>Supporting Document</strong>

                  <span>
                    Upload a relevant travel document, approval
                    or supporting record.
                  </span>

                  {formData.supportingDocument && (
                    <small>
                      Selected:{" "}
                      {formData.supportingDocument.name}
                    </small>
                  )}
                </div>

                <label
                  htmlFor="ta-supporting-document"
                  className="ta-upload-button"
                >
                  Choose Document
                </label>

                <input
                  id="ta-supporting-document"
                  type="file"
                  onChange={handleDocumentChange}
                  hidden
                />
              </div>
            </section>

            {/* =================================================
                DECLARATION
            ================================================== */}
            <section className="ta-form-section ta-declaration-section">
              <div className="ta-form-section-heading">
                <div className="ta-form-section-number">05</div>

                <div>
                  <h3>Declaration &amp; Consent</h3>
                  <p>
                    Confirm that the information provided is true
                    and correct.
                  </p>
                </div>
              </div>

              <label className="ta-declaration">
                <input
                  type="checkbox"
                  name="declaration"
                  checked={formData.declaration}
                  onChange={handleChange}
                />

                <span className="ta-custom-checkbox">
                  {formData.declaration ? "✓" : ""}
                </span>

                <span className="ta-declaration-text">
                  I confirm that the information provided is true
                  and correct and that the requested advance is
                  related to official travel.
                </span>
              </label>
            </section>
          </div>

          {/* ===================================================
              FOOTER
          ==================================================== */}
          <div className="ta-advance-footer">
            <button
              type="button"
              className="ta-secondary-button"
              onClick={handleReset}
            >
              <RotateCcw size={17} />
              Reset
            </button>

            <div className="ta-footer-right">
              <button
                type="button"
                className="ta-cancel-button"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="ta-primary-button"
              >
                <Send size={17} />
                Submit Application
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TAAdvanceModal;