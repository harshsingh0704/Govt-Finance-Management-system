import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  IndianRupee,
  MapPin,
  Plane,
  Receipt,
  RotateCcw,
  Save,
  Trash2,
  Upload,
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
  employeeNumber: "",
  employeeName: "",
  designation: "",
  pay: "",
  headquarter: "",

  claimType: "",

  purposeOfJourney: "",
  projectName: "",
  fromDate: "",
  toDate: "",
  departureTime: "",
  arrivalTime: "",
  modeOfTravel: "",

  taAdvanceApproved: "",

  travelFare: "",
  dailyAllowance: "",
  accommodation: "",
  otherExpenses: "",
  advanceAmountRequested: "",
  remarks: "",
};

const INITIAL_DOCUMENTS = {
  approvalDocument: null,
  ticket: null,
  hotelReceipt: null,
  otherDocuments: null,
};

function TAClaimPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [documents, setDocuments] = useState(INITIAL_DOCUMENTS);
  const [errors, setErrors] = useState({});
  const [records, setRecords] = useState([]);

  const today = useMemo(() => getToday(), []);

  const totalClaimAmount = useMemo(() => {
    return [
      form.travelFare,
      form.dailyAllowance,
      form.accommodation,
      form.otherExpenses,
    ].reduce((total, value) => {
      const amount = Number(value);

      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [
    form.travelFare,
    form.dailyAllowance,
    form.accommodation,
    form.otherExpenses,
  ]);

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

  const handleDocumentChange = (documentType, event) => {
    const file = event.target.files?.[0] || null;

    setDocuments((previous) => ({
      ...previous,
      [documentType]: file,
    }));

    setErrors((previous) => ({
      ...previous,
      [documentType]: "",
    }));

    event.target.value = "";
  };

  const removeDocument = (documentType) => {
    setDocuments((previous) => ({
      ...previous,
      [documentType]: null,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    const requiredFields = {
      employeeNumber: "Employee Number",
      employeeName: "Employee Name",
      designation: "Designation",
      pay: "Pay",
      headquarter: "Headquarter",

      claimType: "Claim Type",

      purposeOfJourney: "Purpose of Journey",
      projectName: "Project Name",
      fromDate: "From Date",
      toDate: "To Date",
      departureTime: "Departure Time",
      arrivalTime: "Arrival Time",
      modeOfTravel: "Mode of Travel",

      taAdvanceApproved: "TA Advance Approval",

      travelFare: "Travel Fare",
      dailyAllowance: "Daily Allowance",
      accommodation: "Accommodation",
      otherExpenses: "Other Expenses",
      advanceAmountRequested: "Advance Amount Requested",

      remarks: "Remarks",
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!String(form[field]).trim()) {
        nextErrors[field] = `${label} is required`;
      }
    });

    const amountFields = [
      "pay",
      "travelFare",
      "dailyAllowance",
      "accommodation",
      "otherExpenses",
      "advanceAmountRequested",
    ];

    amountFields.forEach((field) => {
      if (
        form[field] !== "" &&
        form[field] !== null &&
        Number.isNaN(Number(form[field]))
      ) {
        nextErrors[field] = "Enter a valid amount";
      }
    });

    if (
      form.fromDate &&
      form.toDate &&
      form.toDate < form.fromDate
    ) {
      nextErrors.toDate = "To Date cannot be before From Date";
    }

    if (
      form.taAdvanceApproved === "Yes" &&
      !documents.approvalDocument
    ) {
      nextErrors.approvalDocument =
        "Approval Document is required when TA Advance is approved";
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
      totalClaimAmount,
      documents: {
        approvalDocument: documents.approvalDocument?.name || "",
        ticket: documents.ticket?.name || "",
        hotelReceipt: documents.hotelReceipt?.name || "",
        otherDocuments: documents.otherDocuments?.name || "",
      },
    };

    setRecords((previous) => [newRecord, ...previous]);

    setForm(INITIAL_FORM);
    setDocuments(INITIAL_DOCUMENTS);
    setErrors({});
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setDocuments(INITIAL_DOCUMENTS);
    setErrors({});
  };

  return (
    <div className="ta-page">
      {/* PAGE HEADER */}
      <div className="ta-page-header">
        <div>
          <div className="ta-breadcrumb">
            Admin <span>/</span> Services <span>/</span> TA{" "}
            <span>/</span> TA Advance
          </div>

          <div className="ta-title-row">
            <div className="ta-title-icon">
              <FileText size={22} />
            </div>

            <div>
              <h1>TA Advance</h1>
              <p>
                Submit and manage employee travel allowance advance
                requests.
              </p>
            </div>
          </div>
        </div>

        <div className="ta-date-indicator">
          <CalendarDays size={17} />

          <div>
            <span>Current Date</span>

            <strong>
              {new Date(
                `${today}T00:00:00`
              ).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </strong>
          </div>
        </div>
      </div>

      <form className="ta-form" onSubmit={handleSubmit}>
        {/* =====================================================
            1. EMPLOYEE DETAILS
        ====================================================== */}
        <section className="ta-card">
          <SectionHeading
            icon={<UserRound size={18} />}
            title="Employee Details"
            description="Enter the employee information associated with this TA Advance request."
          />

          <div className="ta-form-grid">
            <Field
              label="Employee No."
              value={form.employeeNumber}
              onChange={(value) =>
                handleChange("employeeNumber", value)
              }
              error={errors.employeeNumber}
              placeholder="Enter employee number"
            />

            <Field
              label="Name"
              value={form.employeeName}
              onChange={(value) =>
                handleChange("employeeName", value)
              }
              error={errors.employeeName}
              placeholder="Enter employee name"
            />

            <Field
              label="Designation"
              value={form.designation}
              onChange={(value) =>
                handleChange("designation", value)
              }
              error={errors.designation}
              placeholder="Enter designation"
            />

            <AmountField
              label="Pay"
              value={form.pay}
              onChange={(value) => handleChange("pay", value)}
              error={errors.pay}
              placeholder="Enter pay"
            />

            <Field
              label="Headquarter"
              value={form.headquarter}
              onChange={(value) =>
                handleChange("headquarter", value)
              }
              error={errors.headquarter}
              placeholder="Enter headquarter"
              icon={<MapPin size={16} />}
            />
          </div>
        </section>

        {/* =====================================================
            2. CLAIM TYPE
        ====================================================== */}
        <section className="ta-card">
          <SectionHeading
            icon={<FileText size={18} />}
            title="Claim Type"
            description="Select the type of travel for which the TA Advance is being requested."
          />

          <div className="ta-form-grid ta-form-grid-single">
            <RadioGroup
              label="Travel Type"
              value={form.claimType}
              onChange={(value) =>
                handleChange("claimType", value)
              }
              error={errors.claimType}
              options={[
                {
                  value: "Local",
                  label: "Local",
                  description: "Travel within the local area.",
                },
                {
                  value: "Outstation",
                  label: "Outstation",
                  description: "Travel outside the headquarters.",
                },
              ]}
            />
          </div>
        </section>

        {/* =====================================================
            3. JOURNEY DETAILS
        ====================================================== */}
        <section className="ta-card">
          <SectionHeading
            icon={<Plane size={18} />}
            title="Journey Details"
            description="Provide the official travel details for the requested advance."
          />

          <div className="ta-form-grid">
            <Field
              label="Purpose of Journey"
              value={form.purposeOfJourney}
              onChange={(value) =>
                handleChange("purposeOfJourney", value)
              }
              error={errors.purposeOfJourney}
              placeholder="Enter purpose of official journey"
              wide
            />

            <Field
              label="Project Name"
              value={form.projectName}
              onChange={(value) =>
                handleChange("projectName", value)
              }
              error={errors.projectName}
              placeholder="Enter project name"
            />

            <Field
              label="From Date"
              type="date"
              value={form.fromDate}
              onChange={(value) =>
                handleChange("fromDate", value)
              }
              error={errors.fromDate}
            />

            <Field
              label="To Date"
              type="date"
              value={form.toDate}
              onChange={(value) =>
                handleChange("toDate", value)
              }
              error={errors.toDate}
            />

            <Field
              label="Departure Time"
              type="time"
              value={form.departureTime}
              onChange={(value) =>
                handleChange("departureTime", value)
              }
              error={errors.departureTime}
              icon={<Clock3 size={16} />}
            />

            <Field
              label="Arrival Time"
              type="time"
              value={form.arrivalTime}
              onChange={(value) =>
                handleChange("arrivalTime", value)
              }
              error={errors.arrivalTime}
              icon={<Clock3 size={16} />}
            />

            <SelectField
              label="Mode of Travel"
              value={form.modeOfTravel}
              onChange={(value) =>
                handleChange("modeOfTravel", value)
              }
              error={errors.modeOfTravel}
              options={[
                "Bus",
                "Train",
                "Flight",
                "Taxi / Cab",
                "Personal Vehicle",
                "Office Vehicle",
                "Other",
              ]}
            />
          </div>
        </section>

        {/* =====================================================
            4. TA ADVANCE APPROVAL
        ====================================================== */}
        <section className="ta-card ta-approval-card">
          <SectionHeading
            icon={<CheckCircle2 size={18} />}
            title="TA Advance Approval"
            description="Confirm whether the TA Advance has already been approved."
          />

          <div className="ta-approval-content">
            <div className="ta-question">
              <span className="ta-question-label">
                Has the TA Advance been approved?
                <b>*</b>
              </span>

              <div className="ta-radio-row">
                <label
                  className={`ta-radio-option ${
                    form.taAdvanceApproved === "Yes"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="taAdvanceApproved"
                    value="Yes"
                    checked={
                      form.taAdvanceApproved === "Yes"
                    }
                    onChange={(event) =>
                      handleChange(
                        "taAdvanceApproved",
                        event.target.value
                      )
                    }
                  />

                  <span>
                    <strong>Yes</strong>
                    <small>TA Advance has been approved.</small>
                  </span>
                </label>

                <label
                  className={`ta-radio-option ${
                    form.taAdvanceApproved === "No"
                      ? "selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="taAdvanceApproved"
                    value="No"
                    checked={
                      form.taAdvanceApproved === "No"
                    }
                    onChange={(event) =>
                      handleChange(
                        "taAdvanceApproved",
                        event.target.value
                      )
                    }
                  />

                  <span>
                    <strong>No</strong>
                    <small>Approval is not available yet.</small>
                  </span>
                </label>
              </div>

              {errors.taAdvanceApproved && (
                <small className="ta-error">
                  {errors.taAdvanceApproved}
                </small>
              )}
            </div>
          </div>
        </section>

        {/* =====================================================
            5. SUPPORTING DOCUMENTS
        ====================================================== */}
        <section className="ta-card">
          <SectionHeading
            icon={<Receipt size={18} />}
            title="Supporting Documents"
            description="Upload the documents supporting this TA Advance request."
          />

          <div className="ta-documents">
            <DocumentUpload
              label="Approval Document"
              documentType="approvalDocument"
              file={documents.approvalDocument}
              onChange={handleDocumentChange}
              onRemove={removeDocument}
              error={errors.approvalDocument}
            />

            <DocumentUpload
              label="Ticket"
              documentType="ticket"
              file={documents.ticket}
              onChange={handleDocumentChange}
              onRemove={removeDocument}
              error={errors.ticket}
            />

            <DocumentUpload
              label="Hotel Receipt"
              documentType="hotelReceipt"
              file={documents.hotelReceipt}
              onChange={handleDocumentChange}
              onRemove={removeDocument}
              error={errors.hotelReceipt}
            />

            <DocumentUpload
              label="Other Documents"
              documentType="otherDocuments"
              file={documents.otherDocuments}
              onChange={handleDocumentChange}
              onRemove={removeDocument}
              error={errors.otherDocuments}
            />
          </div>
        </section>

        {/* =====================================================
            6. CLAIM SUMMARY
        ====================================================== */}
        <section className="ta-card">
          <SectionHeading
            icon={<IndianRupee size={18} />}
            title="Claim Summary"
            description="Enter the estimated expenses and advance amount required for the journey."
          />

          <div className="ta-form-grid">
            <AmountField
              label="Travel Fare"
              value={form.travelFare}
              onChange={(value) =>
                handleChange("travelFare", value)
              }
              error={errors.travelFare}
              placeholder="Enter travel fare"
            />

            <AmountField
              label="Daily Allowance"
              value={form.dailyAllowance}
              onChange={(value) =>
                handleChange("dailyAllowance", value)
              }
              error={errors.dailyAllowance}
              placeholder="Enter daily allowance"
            />

            <AmountField
              label="Accommodation"
              value={form.accommodation}
              onChange={(value) =>
                handleChange("accommodation", value)
              }
              error={errors.accommodation}
              placeholder="Enter accommodation amount"
            />

            <AmountField
              label="Other Expenses"
              value={form.otherExpenses}
              onChange={(value) =>
                handleChange("otherExpenses", value)
              }
              error={errors.otherExpenses}
              placeholder="Enter other expenses"
            />

            <div className="ta-summary-total">
              <span>Total Claim Amount</span>

              <strong>
                ₹{totalClaimAmount.toLocaleString("en-IN")}
              </strong>
            </div>

            <AmountField
              label="Advance Amount Requested"
              value={form.advanceAmountRequested}
              onChange={(value) =>
                handleChange(
                  "advanceAmountRequested",
                  value
                )
              }
              error={errors.advanceAmountRequested}
              placeholder="Enter advance amount"
            />

            <Field
              label="Remarks"
              value={form.remarks}
              onChange={(value) =>
                handleChange("remarks", value)
              }
              error={errors.remarks}
              placeholder="Enter any additional remarks"
              wide
            />
          </div>
        </section>

        {/* =====================================================
            7. DECLARATION
        ====================================================== */}
        <section className="ta-card">
          <SectionHeading
            icon={<CheckCircle2 size={18} />}
            title="Declaration"
            description="Confirm the accuracy and authenticity of the information submitted."
          />

          <div className="ta-declaration-content">
            <label className="ta-declaration">
              <input
                type="checkbox"
                checked={form.declaration || false}
                onChange={(event) =>
                  handleChange(
                    "declaration",
                    event.target.checked
                  )
                }
              />

              <span>
                I hereby declare that the information provided
                in this TA Advance request and the documents
                submitted by me are true and genuine to the
                best of my knowledge. I understand that
                providing false or misleading information may
                result in rejection of the request and action
                according to applicable rules.
              </span>
            </label>

            {errors.declaration && (
              <small className="ta-error ta-declaration-error">
                {errors.declaration}
              </small>
            )}
          </div>
        </section>

        {/* =====================================================
            ACTIONS
        ====================================================== */}
        <div className="ta-form-actions">
          <button
            type="button"
            className="ta-secondary-button"
            onClick={handleReset}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button
            type="submit"
            className="ta-primary-button"
          >
            <Save size={17} />
            Submit TA Advance
          </button>
        </div>
      </form>

      {/* =====================================================
          RECORDS
      ====================================================== */}
      <section className="ta-card ta-records-card">
        <div className="ta-records-header">
          <div>
            <h2>TA Advance Records</h2>
            <p>
              Requests created during this frontend session.
            </p>
          </div>

          <div className="ta-record-count">
            {records.length}{" "}
            {records.length === 1 ? "Record" : "Records"}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="ta-empty-state">
            <FileText size={30} />

            <h3>No TA Advance requests recorded yet</h3>

            <p>
              Complete the form above and submit the request
              to see it here.
            </p>
          </div>
        ) : (
          <div className="ta-table-wrapper">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Project</th>
                  <th>Travel Type</th>
                  <th>Journey</th>
                  <th>TA Approval</th>
                  <th>Total Claim</th>
                  <th>Advance Requested</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="ta-employee-cell">
                        <strong>
                          {record.employeeName}
                        </strong>
                        <span>
                          {record.employeeNumber}
                        </span>
                      </div>
                    </td>

                    <td>{record.projectName}</td>

                    <td>{record.claimType}</td>

                    <td>
                      <div className="ta-journey-cell">
                        <span>
                          {record.fromDate}
                        </span>
                        <span>
                          →
                        </span>
                        <span>
                          {record.toDate}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`ta-approval-badge ${
                          record.taAdvanceApproved ===
                          "Yes"
                            ? "approved"
                            : "pending"
                        }`}
                      >
                        {record.taAdvanceApproved}
                      </span>
                    </td>

                    <td>
                      ₹
                      {record.totalClaimAmount.toLocaleString(
                        "en-IN"
                      )}
                    </td>

                    <td>
                      ₹
                      {Number(
                        record.advanceAmountRequested
                      ).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span className="ta-status-badge">
                        <CheckCircle2 size={14} />
                        Submitted
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

/* ============================================================
   SECTION HEADING
============================================================ */

function SectionHeading({
  icon,
  title,
  description,
}) {
  return (
    <div className="ta-section-heading">
      <div className="ta-section-icon">{icon}</div>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

/* ============================================================
   TEXT / DATE / TIME FIELD
============================================================ */

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
  icon,
  wide = false,
}) {
  return (
    <div className={`ta-field ${wide ? "ta-field-wide" : ""}`}>
      <label>
        {label}
        <span>*</span>
      </label>

      <div
        className={`ta-input-wrapper ${
          error ? "has-error" : ""
        }`}
      >
        {icon}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
        />
      </div>

      {error && (
        <small className="ta-error">{error}</small>
      )}
    </div>
  );
}

/* ============================================================
   AMOUNT FIELD
============================================================ */

function AmountField({
  label,
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="ta-field">
      <label>
        {label}
        <span>*</span>
      </label>

      <div
        className={`ta-input-wrapper ${
          error ? "has-error" : ""
        }`}
      >
        <span className="ta-currency-symbol">₹</span>

        <input
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder={placeholder}
        />
      </div>

      {error && (
        <small className="ta-error">{error}</small>
      )}
    </div>
  );
}

/* ============================================================
   SELECT
============================================================ */

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

      <div
        className={`ta-input-wrapper ${
          error ? "has-error" : ""
        }`}
      >
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          <option value="">
            Select {label.toLowerCase()}
          </option>

          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <small className="ta-error">{error}</small>
      )}
    </div>
  );
}

/* ============================================================
   RADIO GROUP
============================================================ */

function RadioGroup({
  label,
  value,
  onChange,
  error,
  options,
}) {
  return (
    <div className="ta-field ta-radio-group">
      <label>
        {label}
        <span>*</span>
      </label>

      <div className="ta-radio-row">
        {options.map((option) => (
          <label
            key={option.value}
            className={`ta-radio-option ${
              value === option.value ? "selected" : ""
            }`}
          >
            <input
              type="radio"
              name={label}
              value={option.value}
              checked={value === option.value}
              onChange={(event) =>
                onChange(event.target.value)
              }
            />

            <span>
              <strong>{option.label}</strong>
              <small>{option.description}</small>
            </span>
          </label>
        ))}
      </div>

      {error && (
        <small className="ta-error">{error}</small>
      )}
    </div>
  );
}

/* ============================================================
   DOCUMENT UPLOAD
============================================================ */

function DocumentUpload({
  label,
  documentType,
  file,
  onChange,
  onRemove,
  error,
}) {
  return (
    <div className="ta-document-field">
      <div className="ta-document-header">
        <div>
          <label>
            {label}
            {label === "Approval Document" && (
              <span>*</span>
            )}
          </label>

          <small>
            PDF, JPG, JPEG or PNG
          </small>
        </div>
      </div>

      <div
        className={`ta-document-upload-row ${
          file ? "has-file" : ""
        } ${error ? "has-error" : ""}`}
      >
        <input
          id={`ta-${documentType}`}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(event) =>
            onChange(documentType, event)
          }
        />

        <label
          htmlFor={`ta-${documentType}`}
          className="ta-document-upload-button"
        >
          <Upload size={16} />

          {file ? "Change Document" : "Choose Document"}
        </label>

        {file ? (
          <>
            <span className="ta-document-file-name">
              {file.name}
            </span>

            <button
              type="button"
              className="ta-document-remove"
              onClick={() =>
                onRemove(documentType)
              }
              aria-label={`Remove ${label}`}
            >
              <Trash2 size={16} />
            </button>
          </>
        ) : (
          <span className="ta-document-empty">
            No document selected
          </span>
        )}
      </div>

      {error && (
        <small className="ta-error">
          {error}
        </small>
      )}
    </div>
  );
}

export default TAClaimPage;