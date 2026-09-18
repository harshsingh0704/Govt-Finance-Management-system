import React, { useMemo, useState } from "react";
import {
  BusFront,
  CalendarDays,
  CheckCircle2,
  FileText,
  RotateCcw,
  Save,
  TrainFront,
  UserRound,
} from "lucide-react";
import "./TAClaimPage.css";

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const INITIAL_FORM = {
  slNo: "",
  employeeNumber: "",
  employeeName: "",
  designation: "",
  gradePay: "",
  projectName: "",
  travelAllowance: "",
  travelType: "",
  officeTransportation: "",
  publicTransportation: "",
};

function TAClaimPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [records, setRecords] = useState([]);
  const [errors, setErrors] = useState({});
  const today = useMemo(() => getToday(), []);

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
      projectName: "Project Name",
      travelAllowance: "Travel Allowance",
      travelType: "Local / Out-of-station",
      officeTransportation: "Office Transportation",
      publicTransportation: "Public Transportation",
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!String(form[field]).trim()) {
        nextErrors[field] = `${label} is required`;
      }
    });

    if (
      form.travelAllowance &&
      Number.isNaN(Number(form.travelAllowance))
    ) {
      nextErrors.travelAllowance = "Enter a valid amount";
    }

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
      createdDate: today,
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
    <div className="ta-page">
      <div className="ta-page-header">
        <div>
          <div className="ta-breadcrumb">
            Admin <span>/</span> Services <span>/</span> TA <span>/</span>{" "}
            TA Claim
          </div>

          <div className="ta-title-row">
            <div className="ta-title-icon">
              <FileText size={22} />
            </div>

            <div>
              <h1>TA Claim</h1>
              <p>
                Record and manage employee travel allowance claims.
              </p>
            </div>
          </div>
        </div>

        <div className="ta-date-indicator">
          <CalendarDays size={17} />
          <div>
            <span>Current Date</span>
            <strong>
              {new Date(today + "T00:00:00").toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>
      </div>

      <form className="ta-form" onSubmit={handleSubmit}>
        <section className="ta-card">
          <div className="ta-section-heading">
            <div className="ta-section-icon">
              <UserRound size={18} />
            </div>
            <div>
              <h2>Employee Details</h2>
              <p>Enter the employee information associated with this claim.</p>
            </div>
          </div>

          <div className="ta-form-grid">
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

        <section className="ta-card">
          <div className="ta-section-heading">
            <div className="ta-section-icon">
              <FileText size={18} />
            </div>
            <div>
              <h2>Travel Details</h2>
              <p>Provide the project and travel information for the claim.</p>
            </div>
          </div>

          <div className="ta-form-grid">
            <Field
              label="Project Name"
              value={form.projectName}
              onChange={(value) => handleChange("projectName", value)}
              error={errors.projectName}
              placeholder="Enter project name"
            />

            <Field
              label="Travel Allowance"
              value={form.travelAllowance}
              onChange={(value) => handleChange("travelAllowance", value)}
              error={errors.travelAllowance}
              placeholder="Enter allowance amount"
              type="number"
            />

            <SelectField
              label="Local / Out-of-station"
              value={form.travelType}
              onChange={(value) => handleChange("travelType", value)}
              error={errors.travelType}
              options={["Local", "Out-of-station"]}
            />
          </div>
        </section>

        <section className="ta-card">
          <div className="ta-section-heading">
            <div className="ta-section-icon">
              <BusFront size={18} />
            </div>
            <div>
              <h2>Transportation Details</h2>
              <p>
                Enter the actual transportation mode used for the journey.
              </p>
            </div>
          </div>

          <div className="ta-form-grid">
            <Field
              label="Office Transportation"
              value={form.officeTransportation}
              onChange={(value) =>
                handleChange("officeTransportation", value)
              }
              error={errors.officeTransportation}
              placeholder="Example: Office Bus"
              helper="Type the transportation used."
              icon={<BusFront size={16} />}
            />

            <Field
              label="Public Transportation"
              value={form.publicTransportation}
              onChange={(value) =>
                handleChange("publicTransportation", value)
              }
              error={errors.publicTransportation}
              placeholder="Example: Bus / Train"
              helper="Type the public transport used."
              icon={<TrainFront size={16} />}
            />
          </div>
        </section>

        <div className="ta-form-actions">
          <button
            type="button"
            className="ta-secondary-button"
            onClick={handleReset}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button type="submit" className="ta-primary-button">
            <Save size={17} />
            Save TA Claim
          </button>
        </div>
      </form>

      <section className="ta-card ta-records-card">
        <div className="ta-records-header">
          <div>
            <h2>TA Claim Records</h2>
            <p>
              Claims created during this frontend session.
            </p>
          </div>

          <div className="ta-record-count">
            {records.length} {records.length === 1 ? "Record" : "Records"}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="ta-empty-state">
            <FileText size={30} />
            <h3>No TA claims recorded yet</h3>
            <p>
              Complete the form above and save the claim to see it here.
            </p>
          </div>
        ) : (
          <div className="ta-table-wrapper">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Employee</th>
                  <th>Designation</th>
                  <th>Project</th>
                  <th>TA Amount</th>
                  <th>Travel Type</th>
                  <th>Office Transport</th>
                  <th>Public Transport</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.slNo}</td>

                    <td>
                      <div className="ta-employee-cell">
                        <strong>{record.employeeName}</strong>
                        <span>{record.employeeNumber}</span>
                      </div>
                    </td>

                    <td>{record.designation}</td>
                    <td>{record.projectName}</td>
                    <td>₹ {Number(record.travelAllowance).toLocaleString("en-IN")}</td>
                    <td>{record.travelType}</td>
                    <td>{record.officeTransportation}</td>
                    <td>{record.publicTransportation}</td>

                    <td>
                      <span className="ta-status-badge">
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
  type = "text",
  helper,
  icon,
}) {
  return (
    <div className="ta-field">
      <label>
        {label}
        <span>*</span>
      </label>

      <div className={`ta-input-wrapper ${error ? "has-error" : ""}`}>
        {icon}
        <input
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
        />
      </div>

      {helper && !error && <small>{helper}</small>}
      {error && <small className="ta-error">{error}</small>}
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
    <div className="ta-field">
      <label>
        {label}
        <span>*</span>
      </label>

      <div className={`ta-input-wrapper ${error ? "has-error" : ""}`}>
        <select
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">Select travel type</option>

          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {error && <small className="ta-error">{error}</small>}
    </div>
  );
}

export default TAClaimPage;
