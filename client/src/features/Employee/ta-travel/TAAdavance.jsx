
import React, { useMemo, useState } from "react";
import {
  Plane,
  ShieldCheck,
  User,
  CalendarDays,
  IndianRupee,
  Upload,
  RotateCcw,
  Send,
  X,
  ChevronRight,
} from "lucide-react";
import "./TAAdavance.css";
import { taTravelService } from "./services/taTravelService.js";

const INITIAL_FORM = {
  employeeId: "",
  employeeName: "",
  designation: "",
  department: "",
  purpose: "",
  destination: "",
  travelMode: "",
  fromDate: "",
  toDate: "",
  estimatedTravelExpense: "",
  dailyAllowance: "",
  otherExpenses: "",
  advanceRequested: "",
  declaration: false,
};

const TRAVEL_MODES = [
  "Air",
  "Train",
  "Bus",
  "Official Vehicle",
  "Taxi / Cab",
  "Other",
];

function TAAdvance({ onClose = () => {} }) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [document, setDocument] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionReferenceId, setSubmissionReferenceId] = useState("");

  const totalAmount = useMemo(() => {
    return [
      form.estimatedTravelExpense,
      form.dailyAllowance,
      form.otherExpenses,
    ].reduce((total, value) => {
      const amount = Number(value);
      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [
    form.estimatedTravelExpense,
    form.dailyAllowance,
    form.otherExpenses,
  ]);

  const updateField = (event) => {
    const { name, value, checked, type } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: "",
    }));
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setDocument(null);
    setErrors({});
    setSubmitted(false);
    setSubmissionReferenceId("");
    setIsSubmitting(false);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!form.employeeId.trim()) {
      nextErrors.employeeId = "Employee ID is required.";
    }

    if (!form.employeeName.trim()) {
      nextErrors.employeeName = "Employee name is required.";
    }

    if (!form.purpose.trim()) {
      nextErrors.purpose = "Purpose of travel is required.";
    }

    if (!form.destination.trim()) {
      nextErrors.destination = "Destination is required.";
    }

    if (!form.travelMode) {
      nextErrors.travelMode = "Select a travel mode.";
    }

    if (!form.fromDate) {
      nextErrors.fromDate = "Select the travel start date.";
    }

    if (!form.toDate) {
      nextErrors.toDate = "Select the travel end date.";
    }

    if (
      form.fromDate &&
      form.toDate &&
      form.toDate < form.fromDate
    ) {
      nextErrors.toDate = "End date cannot be before start date.";
    }

    if (
      form.advanceRequested !== "" &&
      Number(form.advanceRequested) < 0
    ) {
      nextErrors.advanceRequested = "Amount cannot be negative.";
    }

    if (!form.declaration) {
      nextErrors.declaration =
        "Please accept the declaration before submitting.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting || !validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        purposeOfJourney: form.purpose.trim(),
        toPlace: form.destination.trim(),
        fromDate: form.fromDate,
        toDate: form.toDate,
        modeOfTravel: form.travelMode,
        advanceAmountRequested: Number(form.advanceRequested),
        status: "submitted",
      };

      const result = await taTravelService.submitAdvance(payload);
      const advance = result?.advance;

      if (result?.success !== true || !advance?._id) {
        throw new Error(
          result?.message || "The server did not return a saved TA Advance reference ID."
        );
      }

      setSubmissionReferenceId(advance._id);
      setSubmitted(true);
    } catch (error) {
      console.error("TA Advance submission failed:", error);
      window.alert(
        `TA Advance could not be saved: ${error.message || "Unexpected error"}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employee-ta-advance-page">
      <div className="ta-advance-modal">
        <header className="ta-advance-header">
          <div className="ta-advance-header-left">
            <div className="ta-advance-header-icon">
              <Plane size={22} />
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
            aria-label="Close form"
          >
            <X size={20} />
          </button>
        </header>

        <div className="ta-advance-stepper">
          {[
            "Employee Information",
            "TA Advance Details",
            "Financial Details",
            "Documents",
            "Review",
          ].map((step, index) => (
            <React.Fragment key={step}>
              <div
                className={`ta-advance-step ${
                  index === 0 ? "active" : ""
                }`}
              >
                <span className="ta-advance-step-number">
                  {index + 1}
                </span>
                <span className="ta-advance-step-label">
                  {step}
                </span>
              </div>

              {index < 4 && (
                <div className="ta-advance-step-line" />
              )}
            </React.Fragment>
          ))}
        </div>

        {submitted ? (
          <div className="ta-advance-success">
            <div className="ta-success-icon">
              <ShieldCheck size={34} />
            </div>

            <h2>Application Ready</h2>
            <p>
              Your TA Advance application has been saved successfully.
            </p>
            <p className="ta-success-note">
              MongoDB Reference ID: <strong>{submissionReferenceId}</strong>
            </p>

            <button
              type="button"
              className="ta-primary-button"
              onClick={handleReset}
            >
              Submit Another Application
            </button>
          </div>
        ) : (
          <form
            className="ta-advance-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="ta-advance-form-content">
              <div className="ta-advance-intro">
                <div className="ta-advance-step-caption">
                  TA ADVANCE
                </div>

                <h1>Apply for advance related to official travel</h1>

                <p>
                  Provide your employee, travel and financial
                  details for the TA advance request.
                </p>
              </div>

              <section className="ta-form-section">
                <div className="ta-form-section-heading">
                  <div className="ta-form-section-number">01</div>
                  <div>
                    <h3>Employee Information</h3>
                    <p>
                      Enter your official employee information.
                    </p>
                  </div>
                </div>

                <div className="ta-info-banner">
                  <ShieldCheck size={20} />
                  <div>
                    <strong>Employee information</strong>
                    <span>
                      Enter the details associated with your
                      official employee record.
                    </span>
                  </div>
                </div>

                <div className="ta-form-grid">
                  <div className="ta-field">
                    <label htmlFor="ta-employee-id">
                      Employee ID <span>*</span>
                    </label>
                    <div className="ta-input-with-icon">
                      <User size={18} />
                      <input
                        id="ta-employee-id"
                        name="employeeId"
                        value={form.employeeId}
                        onChange={updateField}
                        placeholder="Enter employee ID"
                      />
                    </div>
                    {errors.employeeId && (
                      <small className="ta-error">
                        {errors.employeeId}
                      </small>
                    )}
                  </div>

                  <div className="ta-field">
                    <label htmlFor="ta-employee-name">
                      Employee Name <span>*</span>
                    </label>
                    <input
                      id="ta-employee-name"
                      name="employeeName"
                      value={form.employeeName}
                      onChange={updateField}
                      placeholder="Enter full name"
                    />
                    {errors.employeeName && (
                      <small className="ta-error">
                        {errors.employeeName}
                      </small>
                    )}
                  </div>

                  <div className="ta-field">
                    <label htmlFor="ta-designation">
                      Designation
                    </label>
                    <input
                      id="ta-designation"
                      name="designation"
                      value={form.designation}
                      onChange={updateField}
                      placeholder="Enter designation"
                    />
                  </div>

                  <div className="ta-field">
                    <label htmlFor="ta-department">
                      Department / Office
                    </label>
                    <input
                      id="ta-department"
                      name="department"
                      value={form.department}
                      onChange={updateField}
                      placeholder="Enter department or office"
                    />
                  </div>
                </div>
              </section>

              <section className="ta-form-section">
                <div className="ta-form-section-heading">
                  <div className="ta-form-section-number">02</div>
                  <div>
                    <h3>TA Advance Details</h3>
                    <p>
                      Provide the purpose and official travel
                      schedule.
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
                      value={form.purpose}
                      onChange={updateField}
                      placeholder="Enter the purpose of official travel"
                      rows={3}
                    />
                    {errors.purpose && (
                      <small className="ta-error">
                        {errors.purpose}
                      </small>
                    )}
                  </div>

                  <div className="ta-field">
                    <label htmlFor="ta-destination">
                      Destination <span>*</span>
                    </label>
                    <input
                      id="ta-destination"
                      name="destination"
                      value={form.destination}
                      onChange={updateField}
                      placeholder="Enter destination"
                    />
                    {errors.destination && (
                      <small className="ta-error">
                        {errors.destination}
                      </small>
                    )}
                  </div>

                  <div className="ta-field">
                    <label htmlFor="ta-travel-mode">
                      Travel Mode <span>*</span>
                    </label>
                    <select
                      id="ta-travel-mode"
                      name="travelMode"
                      value={form.travelMode}
                      onChange={updateField}
                    >
                      <option value="">Select travel mode</option>
                      {TRAVEL_MODES.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                    {errors.travelMode && (
                      <small className="ta-error">
                        {errors.travelMode}
                      </small>
                    )}
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
                        value={form.fromDate}
                        onChange={updateField}
                      />
                    </div>
                    {errors.fromDate && (
                      <small className="ta-error">
                        {errors.fromDate}
                      </small>
                    )}
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
                        value={form.toDate}
                        onChange={updateField}
                      />
                    </div>
                    {errors.toDate && (
                      <small className="ta-error">
                        {errors.toDate}
                      </small>
                    )}
                  </div>
                </div>
              </section>

              <section className="ta-form-section">
                <div className="ta-form-section-heading">
                  <div className="ta-form-section-number">03</div>
                  <div>
                    <h3>Financial Details</h3>
                    <p>
                      Enter estimated expenses and the advance
                      amount requested.
                    </p>
                  </div>
                </div>

                <div className="ta-financial-grid">
                  {[
                    {
                      label: "Estimated Travel Expense",
                      name: "estimatedTravelExpense",
                    },
                    {
                      label: "Daily Allowance",
                      name: "dailyAllowance",
                    },
                    {
                      label: "Other Expenses",
                      name: "otherExpenses",
                    },
                    {
                      label: "Advance Requested",
                      name: "advanceRequested",
                    },
                  ].map((field) => (
                    <div className="ta-field" key={field.name}>
                      <label htmlFor={`ta-${field.name}`}>
                        {field.label}
                      </label>
                      <div className="ta-money-input">
                        <span>₹</span>
                        <input
                          id={`ta-${field.name}`}
                          name={field.name}
                          type="number"
                          min="0"
                          step="0.01"
                          value={form[field.name]}
                          onChange={updateField}
                          placeholder="0.00"
                        />
                      </div>
                      {errors[field.name] && (
                        <small className="ta-error">
                          {errors[field.name]}
                        </small>
                      )}
                    </div>
                  ))}
                </div>

                <div className="ta-total-card">
                  <div>
                    <span className="ta-total-label">
                      Total Estimated Expense
                    </span>
                    <span className="ta-total-description">
                      Travel expense + daily allowance + other
                      expenses
                    </span>
                  </div>
                  <strong>
                    <IndianRupee size={21} />
                    {totalAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </strong>
                </div>
              </section>

              <section className="ta-form-section">
                <div className="ta-form-section-heading">
                  <div className="ta-form-section-number">04</div>
                  <div>
                    <h3>Supporting Documents</h3>
                    <p>
                      Attach a relevant approval or travel document.
                    </p>
                  </div>
                </div>

                <div className="ta-upload-area">
                  <div className="ta-upload-icon">
                    <Upload size={21} />
                  </div>

                  <div className="ta-upload-content">
                    <strong>Supporting Document</strong>
                    <span>
                      Choose a supporting document from your device.
                    </span>
                    {document && (
                      <small>Selected: {document.name}</small>
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
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(event) =>
                      setDocument(event.target.files?.[0] || null)
                    }
                    hidden
                  />
                </div>
              </section>

              <section className="ta-form-section ta-declaration-section">
                <div className="ta-form-section-heading">
                  <div className="ta-form-section-number">05</div>
                  <div>
                    <h3>Declaration &amp; Consent</h3>
                    <p>
                      Review and confirm the information provided.
                    </p>
                  </div>
                </div>

                <label className="ta-declaration">
                  <input
                    type="checkbox"
                    name="declaration"
                    checked={form.declaration}
                    onChange={updateField}
                  />
                  <span className="ta-custom-checkbox">
                    {form.declaration ? "✓" : ""}
                  </span>
                  <span className="ta-declaration-text">
                    I confirm that the information provided is true
                    and correct and that the requested advance is
                    related to official travel.
                  </span>
                </label>

                {errors.declaration && (
                  <small className="ta-error">
                    {errors.declaration}
                  </small>
                )}
              </section>
            </div>

            <footer className="ta-advance-footer">
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
                  disabled={isSubmitting}
                >
                  <Send size={17} />
                  {isSubmitting ? "Submitting..." : "Submit Application"}
                  {!isSubmitting && <ChevronRight size={17} />}
                </button>
              </div>
            </footer>
          </form>
        )}
      </div>
    </div>
  );
}

export default TAAdvance;
