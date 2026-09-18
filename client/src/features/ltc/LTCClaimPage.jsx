import React, { useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Home,
  RotateCcw,
  Save,
  UserRound,
} from "lucide-react";
import "./LTCClaimPage.css";

const INITIAL_FORM = {
  slNo: "",
  employeeNumber: "",
  employeeName: "",
  designation: "",
  gradePay: "",
  ltc: "",
  blockPeriod: "",
  homeTown: "",
  graceYear: "",
  publicTransportation: "",
};

function LTCClaimPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [records, setRecords] = useState([]);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
  };

  const validate = () => {
    const nextErrors = {};

    const requiredFields = {
      slNo: "Sl No",
      employeeNumber: "Employee Number",
      employeeName: "Employee Name",
      designation: "Designation",
      gradePay: "Grade Pay",
      ltc: "LTC",
      blockPeriod: "Block Period",
      homeTown: "Home Town",
      graceYear: "Grace Year of Block Period",
      publicTransportation: "Public Transportation",
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!String(form[field]).trim()) {
        nextErrors[field] = `${label} is required`;
      }
    });

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newRecord = {
      ...form,
      id: `${Date.now()}`,
    };

    setRecords((previous) => [newRecord, ...previous]);

    setForm({
      ...INITIAL_FORM,
      slNo: String(records.length + 2),
    });

    setErrors({});
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
  };

  return (
    <div className="ltc-page">
      <div className="ltc-page-header">
        <div>
          <div className="ltc-breadcrumb">
            Admin <span>/</span> Services <span>/</span> LTC <span>/</span>{" "}
            LTC Claim
          </div>

          <div className="ltc-title-row">
            <div className="ltc-title-icon">
              <FileText size={22} />
            </div>

            <div>
              <h1>LTC Claim</h1>
              <p>
                Record and manage employee Leave Travel Concession claims.
              </p>
            </div>
          </div>
        </div>

        <div className="ltc-date-indicator">
          <CalendarDays size={17} />
          <div>
            <span>Current Date</span>
            <strong>
              {new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>
      </div>

      <form className="ltc-form" onSubmit={handleSubmit}>
        <section className="ltc-card">
          <div className="ltc-section-heading">
            <div className="ltc-section-icon">
              <UserRound size={18} />
            </div>

            <div>
              <h2>Employee Details</h2>
              <p>
                Enter the employee information associated with this claim.
              </p>
            </div>
          </div>

          <div className="ltc-form-grid">
            <Field
              label="Sl No"
              value={form.slNo}
              onChange={(value) => handleChange("slNo", value)}
              error={errors.slNo}
              placeholder="Enter serial number"
            />

            <Field
              label="Employee Number"
              value={form.employeeNumber}
              onChange={(value) => handleChange("employeeNumber", value)}
              error={errors.employeeNumber}
              placeholder="Enter employee number"
            />

            <Field
              label="Employee Name"
              value={form.employeeName}
              onChange={(value) => handleChange("employeeName", value)}
              error={errors.employeeName}
              placeholder="Enter employee name"
            />

            <Field
              label="Designation"
              value={form.designation}
              onChange={(value) => handleChange("designation", value)}
              error={errors.designation}
              placeholder="Enter designation"
            />

            <Field
              label="Grade Pay"
              value={form.gradePay}
              onChange={(value) => handleChange("gradePay", value)}
              error={errors.gradePay}
              placeholder="Enter grade pay"
            />
          </div>
        </section>

        <section className="ltc-card">
          <div className="ltc-section-heading">
            <div className="ltc-section-icon">
              <Home size={18} />
            </div>

            <div>
              <h2>LTC Details</h2>
              <p>
                Enter the Leave Travel Concession and block period information.
              </p>
            </div>
          </div>

          <div className="ltc-form-grid">
            <Field
              label="LTC"
              value={form.ltc}
              onChange={(value) => handleChange("ltc", value)}
              error={errors.ltc}
              placeholder="Enter LTC details"
            />

            <Field
              label="Block Period"
              value={form.blockPeriod}
              onChange={(value) => handleChange("blockPeriod", value)}
              error={errors.blockPeriod}
              placeholder="Enter block period"
            />

            <Field
              label="Home Town"
              value={form.homeTown}
              onChange={(value) => handleChange("homeTown", value)}
              error={errors.homeTown}
              placeholder="Enter home town"
            />

            <Field
              label="Grace Year of Block Period"
              value={form.graceYear}
              onChange={(value) => handleChange("graceYear", value)}
              error={errors.graceYear}
              placeholder="Enter grace year"
            />

            <SelectField
              label="Public Transportation"
              value={form.publicTransportation}
              onChange={(value) =>
                handleChange("publicTransportation", value)
              }
              error={errors.publicTransportation}
              options={["Bus", "Train", "Air"]}
            />
          </div>
        </section>

        <div className="ltc-form-actions">
          <button
            type="button"
            className="ltc-secondary-button"
            onClick={handleReset}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button type="submit" className="ltc-primary-button">
            <Save size={17} />
            Save LTC Claim
          </button>
        </div>
      </form>

      <section className="ltc-card ltc-records-card">
        <div className="ltc-records-header">
          <div>
            <h2>LTC Claim Records</h2>
            <p>
              Claims created during this frontend session.
            </p>
          </div>

          <div className="ltc-record-count">
            {records.length} {records.length === 1 ? "Record" : "Records"}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="ltc-empty-state">
            <FileText size={30} />

            <h3>No LTC claims recorded yet</h3>

            <p>
              Complete the form above and save the claim to see it here.
            </p>
          </div>
        ) : (
          <div className="ltc-table-wrapper">
            <table className="ltc-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>LTC</th>
                  <th>Block Period</th>
                  <th>Home Town</th>
                  <th>Grace Year</th>
                  <th>Public Transport</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.slNo}</td>

                    <td>
                      <div className="ltc-employee-cell">
                        <strong>{record.employeeName}</strong>
                        <span>{record.employeeNumber}</span>
                      </div>
                    </td>

                    <td>{record.designation}</td>
                    <td>{record.ltc}</td>
                    <td>{record.blockPeriod}</td>
                    <td>{record.homeTown}</td>
                    <td>{record.graceYear}</td>
                    <td>{record.publicTransportation}</td>

                    <td>
                      <span className="ltc-status-badge">
                        <CheckCircle2 size={14} />
                        Recorded
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="ltc-field">
      <label>
        {label}
        <span>*</span>
      </label>

      <div className={`ltc-input-wrapper ${error ? "has-error" : ""}`}>
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>

      {error && <small className="ltc-error">{error}</small>}
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  error,
  options,
}) {
  return (
    <div className="ltc-field">
      <label>
        {label}
        <span>*</span>
      </label>

      <div className={`ltc-input-wrapper ${error ? "has-error" : ""}`}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select transportation</option>

          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {error && <small className="ltc-error">{error}</small>}
    </div>
  );
}

export default LTCClaimPage;
