import React, { useMemo, useState } from "react";
import {
  X,
  Plane,
  ShieldCheck,
  CalendarDays,
  Users,
  Upload,
  Trash2,
  Plus,
  RotateCcw,
  Send,
  ChevronRight,
  FileText,
  WalletCards,
} from "lucide-react";

import "./LTCAdvanceModal.css";

const initialFamily = [
  {
    name: "Rahul",
    relationship: "Son",
    age: "12",
    travelling: true,
  },
  {
    name: "Priya",
    relationship: "Spouse",
    age: "34",
    travelling: true,
  },
];

const initialForm = () => ({
  employeeNumber: "",
  employeeName: "",
  designation: "",
  headquarters: "",
  department: "",
  payGrade: "",
  requestDate: new Date().toISOString().slice(0, 10),

  ltcType: "Home Town LTC",
  blockPeriod: "",
  graceYear: "",
  destination: "",

  leaveFrom: "",
  leaveTo: "",
  journeyStart: "",
  journeyEnd: "",
  placeOfVisit: "",

  transport: "Bus",
  trainClass: "Air Class",
  from: "",
  to: "",
  estimatedFare: "",
  advanceRequested: "",

  declaration1: false,
  declaration2: false,
});

const steps = [
  "Employee Information",
  "LTC Details",
  "Journey Details",
  "Travel & Calculation",
  "Documents",
  "Review",
];

function LTCAdvanceModal({ isOpen, onClose }) {
  const [form, setForm] = useState(initialForm);
  const [family, setFamily] = useState(initialFamily);
  const [documents, setDocuments] = useState([]);

  const eligibleAmount = useMemo(() => {
    const fare = Number(form.estimatedFare || 0);

    if (!Number.isFinite(fare) || fare <= 0) {
      return 0;
    }

    return fare;
  }, [form.estimatedFare]);

  const update = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateFamily = (index, field, value) => {
    setFamily((previous) =>
      previous.map((member, currentIndex) =>
        currentIndex === index
          ? { ...member, [field]: value }
          : member
      )
    );
  };

  const toggleTravelling = (index) => {
    setFamily((previous) =>
      previous.map((member, currentIndex) =>
        currentIndex === index
          ? {
              ...member,
              travelling: !member.travelling,
            }
          : member
      )
    );
  };

  const addFamilyMember = () => {
    setFamily((previous) => [
      ...previous,
      {
        name: "",
        relationship: "",
        age: "",
        travelling: false,
      },
    ]);
  };

  const removeFamilyMember = (index) => {
    setFamily((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const handleDocuments = (event) => {
    const files = Array.from(event.target.files || []);

    setDocuments((previous) => [
      ...previous,
      ...files,
    ]);

    event.target.value = "";
  };

  const removeDocument = (index) => {
    setDocuments((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const resetForm = () => {
    setForm(initialForm());
    setFamily(initialFamily);
    setDocuments([]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!form.employeeNumber || !form.employeeName) {
      window.alert("Please enter the employee number and employee name.");
      return;
    }

    if (!form.destination) {
      window.alert("Please enter the Home Town / Destination.");
      return;
    }

    if (!form.leaveFrom || !form.leaveTo) {
      window.alert("Please enter the leave dates.");
      return;
    }

    if (!form.journeyStart || !form.journeyEnd) {
      window.alert("Please enter the journey dates.");
      return;
    }

    if (!form.declaration1 || !form.declaration2) {
      window.alert("Please accept both declarations before submitting.");
      return;
    }

    console.log("LTC Advance Application:", {
      ...form,
      family,
      documents,
      eligibleAmount,
    });

    window.alert("LTC Advance application submitted successfully.");
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="ltc-advance-overlay"
      onMouseDown={onClose}
    >
      <div
        className="ltc-advance-modal"
        onMouseDown={(event) => event.stopPropagation()}
      >
        {/* =====================================================
            HEADER
        ====================================================== */}

        <header className="ltc-advance-header">
          <div className="ltc-advance-header-left">
            <div className="ltc-advance-header-icon">
              <Plane size={21} strokeWidth={2.2} />
            </div>

            <div>
              <div className="ltc-advance-eyebrow">
                LTC &amp; TRAVEL
              </div>

              <h2>LTC Advance Application</h2>
            </div>
          </div>

          <button
            type="button"
            className="ltc-advance-close"
            onClick={onClose}
            aria-label="Close LTC Advance"
          >
            <X size={22} />
          </button>
        </header>

        {/* =====================================================
            STEPPER
        ====================================================== */}

        <div className="ltc-advance-stepper">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div
                className={`ltc-advance-step ${
                  index === 0
                    ? "ltc-advance-step-active"
                    : ""
                }`}
              >
                <span className="ltc-advance-step-number">
                  {index + 1}
                </span>

                <span className="ltc-advance-step-label">
                  {step}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div className="ltc-advance-step-line" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* =====================================================
            FORM BODY
        ====================================================== */}

        <form
          className="ltc-advance-form"
          onSubmit={handleSubmit}
        >
          <div className="ltc-advance-form-content">

            {/* =================================================
                INTRO
            ================================================== */}

            <section className="ltc-advance-intro">
              <div className="ltc-advance-intro-eyebrow">
                LTC ADVANCE
              </div>

              <h1>
                Apply for advance related to
                Leave Travel Concession
              </h1>

              <p>
                Provide the employee, entitlement,
                journey and financial details required
                for the LTC advance request.
              </p>
            </section>

            {/* =================================================
                SECTION 1
            ================================================== */}

            <section className="ltc-form-section">
              <SectionHeading
                number="01"
                title="Employee Information"
                description="Provide the official employee information for this application."
              />

              <div className="ltc-info-banner">
                <div className="ltc-info-icon">
                  <ShieldCheck size={19} />
                </div>

                <div>
                  <strong>
                    Organization-managed information
                  </strong>

                  <span>
                    Employee details are maintained as
                    part of the official government record.
                  </span>
                </div>
              </div>

              <div className="ltc-form-grid four">
                <Field
                  label="Employee Number"
                  value={form.employeeNumber}
                  onChange={(value) =>
                    update("employeeNumber", value)
                  }
                  required
                />

                <Field
                  label="Employee Name"
                  value={form.employeeName}
                  onChange={(value) =>
                    update("employeeName", value)
                  }
                  required
                />

                <Field
                  label="Designation"
                  value={form.designation}
                  onChange={(value) =>
                    update("designation", value)
                  }
                />

                <Field
                  label="Headquarters"
                  value={form.headquarters}
                  onChange={(value) =>
                    update("headquarters", value)
                  }
                />

                <Field
                  label="Department / Office"
                  value={form.department}
                  onChange={(value) =>
                    update("department", value)
                  }
                />

                <Field
                  label="Pay / Grade"
                  value={form.payGrade}
                  onChange={(value) =>
                    update("payGrade", value)
                  }
                />

                <Field
                  label="Request Date"
                  type="date"
                  value={form.requestDate}
                  onChange={(value) =>
                    update("requestDate", value)
                  }
                />
              </div>
            </section>

            {/* =================================================
                SECTION 2
            ================================================== */}

            <section className="ltc-form-section">
              <SectionHeading
                number="02"
                title="LTC / Entitlement Details"
                description="Specify the applicable LTC entitlement and destination."
              />

              <div className="ltc-form-grid four">
                <SelectField
                  label="LTC Type"
                  value={form.ltcType}
                  onChange={(value) =>
                    update("ltcType", value)
                  }
                  options={[
                    "Home Town LTC",
                    "Other eligible LTC",
                    "Any other approved type as per configured rules",
                  ]}
                />

                <Field
                  label="Block Period"
                  value={form.blockPeriod}
                  onChange={(value) =>
                    update("blockPeriod", value)
                  }
                />

                <Field
                  label="Grace Year of Block Period"
                  value={form.graceYear}
                  onChange={(value) =>
                    update("graceYear", value)
                  }
                />

                <Field
                  label="Home Town / Destination"
                  value={form.destination}
                  onChange={(value) =>
                    update("destination", value)
                  }
                  required
                />
              </div>
            </section>

            {/* =================================================
                SECTION 3 + 4
            ================================================== */}

            <div className="ltc-two-column">

              <section className="ltc-form-section">
                <SectionHeading
                  number="03"
                  title="Leave & Journey Details"
                  description="Enter the leave period and journey schedule."
                />

                <div className="ltc-form-grid two">
                  <Field
                    label="Leave From"
                    type="date"
                    value={form.leaveFrom}
                    onChange={(value) =>
                      update("leaveFrom", value)
                    }
                  />

                  <Field
                    label="Leave To"
                    type="date"
                    value={form.leaveTo}
                    onChange={(value) =>
                      update("leaveTo", value)
                    }
                  />

                  <Field
                    label="Journey Start Date"
                    type="date"
                    value={form.journeyStart}
                    onChange={(value) =>
                      update("journeyStart", value)
                    }
                  />

                  <Field
                    label="Journey End Date"
                    type="date"
                    value={form.journeyEnd}
                    onChange={(value) =>
                      update("journeyEnd", value)
                    }
                  />

                  <div className="ltc-field ltc-field-full">
                    <label>
                      Place of Visit / Destination
                    </label>

                    <input
                      value={form.placeOfVisit}
                      onChange={(event) =>
                        update(
                          "placeOfVisit",
                          event.target.value
                        )
                      }
                    />
                  </div>
                </div>
              </section>

              <section className="ltc-form-section">
                <SectionHeading
                  number="04"
                  title="Family Members Travelling"
                  description="Select the family members travelling under this LTC request."
                />

                <div className="ltc-family-table">
                  <div className="ltc-family-header">
                    <span>Name</span>
                    <span>Relationship</span>
                    <span>Age</span>
                    <span>Travelling?</span>
                    <span />
                  </div>

                  {family.map((member, index) => (
                    <div
                      className="ltc-family-row"
                      key={`${index}-${member.name}`}
                    >
                      <input
                        value={member.name}
                        onChange={(event) =>
                          updateFamily(
                            index,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="Name"
                      />

                      <input
                        value={member.relationship}
                        onChange={(event) =>
                          updateFamily(
                            index,
                            "relationship",
                            event.target.value
                          )
                        }
                        placeholder="Relationship"
                      />

                      <input
                        type="number"
                        value={member.age}
                        onChange={(event) =>
                          updateFamily(
                            index,
                            "age",
                            event.target.value
                          )
                        }
                        placeholder="Age"
                      />

                      <label className="ltc-travelling">
                        <input
                          type="checkbox"
                          checked={member.travelling}
                          onChange={() =>
                            toggleTravelling(index)
                          }
                        />

                        <span>Travelling</span>
                      </label>

                      <button
                        type="button"
                        className="ltc-delete-family"
                        onClick={() =>
                          removeFamilyMember(index)
                        }
                        aria-label="Remove family member"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="ltc-add-family"
                    onClick={addFamilyMember}
                  >
                    <Plus size={16} />
                    Add Family Member
                  </button>
                </div>
              </section>
            </div>

            {/* =================================================
                SECTION 5 + 6
            ================================================== */}

            <div className="ltc-two-column">

              <section className="ltc-form-section">
                <SectionHeading
                  number="05"
                  title="Travel Details"
                  description="Provide the travel mode and estimated fare."
                />

                <div className="ltc-form-grid two">
                  <SelectField
                    label="Mode of Transport"
                    value={form.transport}
                    onChange={(value) =>
                      update("transport", value)
                    }
                    options={[
                      "Bus",
                      "Train",
                      "Air",
                    ]}
                  />

                  <SelectField
                    label="Train Class"
                    value={form.trainClass}
                    onChange={(value) =>
                      update("trainClass", value)
                    }
                    options={[
                      "Air Class",
                      "AC First",
                      "AC 2 Tier",
                      "AC 3 Tier",
                    ]}
                  />

                  <Field
                    label="From"
                    value={form.from}
                    onChange={(value) =>
                      update("from", value)
                    }
                  />

                  <Field
                    label="To"
                    value={form.to}
                    onChange={(value) =>
                      update("to", value)
                    }
                  />

                  <Field
                    label="Estimated Fare"
                    type="number"
                    value={form.estimatedFare}
                    onChange={(value) =>
                      update("estimatedFare", value)
                    }
                    prefix="₹"
                  />

                  <Field
                    label="Advance Requested"
                    type="number"
                    value={form.advanceRequested}
                    onChange={(value) =>
                      update("advanceRequested", value)
                    }
                    prefix="₹"
                  />
                </div>
              </section>

              <section className="ltc-form-section">
                <SectionHeading
                  number="06"
                  title="Advance Calculation"
                  description="Calculated values based on the travel information provided."
                />

                <div className="ltc-calculation-card">
                  <CalculationRow
                    icon={<Plane size={17} />}
                    label="Estimated Travel Fare"
                    value={`₹ ${Number(
                      form.estimatedFare || 0
                    ).toLocaleString("en-IN")}`}
                  />

                  <CalculationRow
                    icon={<WalletCards size={17} />}
                    label="Eligible LTC Amount"
                    value={`₹ ${eligibleAmount.toLocaleString(
                      "en-IN"
                    )}`}
                  />

                  <CalculationRow
                    icon={<FileText size={17} />}
                    label="Estimated Eligible Amount"
                    value={`₹ ${eligibleAmount.toLocaleString(
                      "en-IN"
                    )}`}
                  />

                  <CalculationRow
                    icon={<WalletCards size={17} />}
                    label="Advance Requested"
                    value={`₹ ${Number(
                      form.advanceRequested || 0
                    ).toLocaleString("en-IN")}`}
                    highlight
                  />
                </div>
              </section>
            </div>

            {/* =================================================
                SECTION 7
            ================================================== */}

            <section className="ltc-form-section">
              <SectionHeading
                number="07"
                title="Supporting Documents"
                description="Upload supporting documents for the LTC advance request."
              />

              <div className="ltc-upload-area">
                <div className="ltc-upload-icon">
                  <Upload size={20} />
                </div>

                <div className="ltc-upload-content">
                  <strong>
                    Supporting documents
                  </strong>

                  <span>
                    Upload PDF, JPG, JPEG or PNG documents.
                  </span>
                </div>

                <label className="ltc-upload-button">
                  <Upload size={16} />
                  Choose Document

                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleDocuments}
                  />
                </label>
              </div>

              <div className="ltc-document-list">
                {documents.length === 0 ? (
                  <div className="ltc-no-document">
                    No document selected
                  </div>
                ) : (
                  documents.map((file, index) => (
                    <div
                      className="ltc-document-item"
                      key={`${file.name}-${index}`}
                    >
                      <div>
                        <FileText size={16} />

                        <span>
                          {file.name}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          removeDocument(index)
                        }
                      >
                        <X size={15} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <small className="ltc-document-help">
                Allowed formats: PDF, JPG, JPEG, PNG
              </small>
            </section>

            {/* =================================================
                SECTION 8
            ================================================== */}

            <section className="ltc-form-section">
              <SectionHeading
                number="08"
                title="Declaration & Consent"
                description="Please confirm both declarations before submitting."
              />

              <div className="ltc-declaration-box">
                <label className="ltc-declaration-row">
                  <input
                    type="checkbox"
                    checked={form.declaration1}
                    onChange={(event) =>
                      update(
                        "declaration1",
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    I confirm that the information provided
                    in this LTC Advance request is true and
                    correct and that the advance will be used
                    for the stated LTC journey.
                  </span>
                </label>

                <label className="ltc-declaration-row">
                  <input
                    type="checkbox"
                    checked={form.declaration2}
                    onChange={(event) =>
                      update(
                        "declaration2",
                        event.target.checked
                      )
                    }
                  />

                  <span>
                    I understand that the advance will be
                    subject to applicable rules and subsequent
                    adjustment/settlement.
                  </span>
                </label>
              </div>
            </section>
          </div>

          {/* ===================================================
              FOOTER
          ==================================================== */}

          <footer className="ltc-advance-footer">
            <button
              type="button"
              className="ltc-footer-reset"
              onClick={resetForm}
            >
              <RotateCcw size={16} />
              Reset
            </button>

            <div className="ltc-footer-right">
              <button
                type="button"
                className="ltc-footer-cancel"
                onClick={onClose}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="ltc-footer-primary"
              >
                <Send size={17} />
                Submit Application
                <ChevronRight size={18} />
              </button>
            </div>
          </footer>
        </form>
      </div>
    </div>
  );
}

/* ============================================================
   COMPONENTS
============================================================ */

function SectionHeading({
  number,
  title,
  description,
}) {
  return (
    <div className="ltc-section-heading">
      <div className="ltc-section-number">
        {number}
      </div>

      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  prefix,
}) {
  return (
    <div className="ltc-field">
      <label>
        {label}

        {required && (
          <span className="ltc-required">*</span>
        )}
      </label>

      <div className="ltc-input-wrap">
        {prefix && (
          <span className="ltc-input-prefix">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        />

        {type === "date" && (
          <CalendarDays
            className="ltc-input-icon"
            size={17}
          />
        )}
      </div>
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <div className="ltc-field">
      <label>{label}</label>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

function CalculationRow({
  icon,
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      className={`ltc-calculation-row ${
        highlight
          ? "ltc-calculation-highlight"
          : ""
      }`}
    >
      <div className="ltc-calculation-label">
        <span className="ltc-calculation-icon">
          {icon}
        </span>

        <span>{label}</span>
      </div>

      <strong>{value}</strong>
    </div>
  );
}

export default LTCAdvanceModal;
