import React, { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileCheck2,
  FileText,
  Home,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  UserRound,
  Users,
} from "lucide-react";

import "./LTCClaimPage.css";

const INITIAL_FORM = {
  employeeNumber: "",
  employeeName: "",
  designation: "",
  pay: "",
  headquarter: "",

  ltcType: "",
  homeTownDestination: "",
  leaveFrom: "",
  leaveTo: "",
  blockPeriod: "",

  familyMembers: [
    {
      id: Date.now(),
      name: "",
      age: "",
      relationship: "",
    },
  ],

  journeyFrom: "",
  journeyTo: "",
  departureDate: "",
  arrivalDate: "",
  departureTime: "",
  arrivalTime: "",
  modeOfTravel: "",
  travelClass: "",
  distance: "",
  fare: "",
  farePaid: "",

  advanceDrawn: "No",
  advanceAmount: "",
  advanceReference: "",

  higherClassTravel: "No",
  higherClassDetails: "",

  roadJourney: "No",
  roadJourneyDetails: "",

  totalFare: "",
  eligibleAmount: "",
  advanceAdjustment: "",
  netClaimAmount: "",

  approvalDocument: null,
  ticketDocument: null,
  otherDocuments: [],

  declarationAccepted: false,
};

const MODE_OPTIONS = [
  "Train",
  "Bus",
  "Air",
  "Road",
  "Other",
];

const CLASS_OPTIONS = [
  "Economy",
  "AC Chair Car",
  "AC 3 Tier",
  "AC 2 Tier",
  "First Class",
  "Other",
];

function LTCClaimPage() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [records, setRecords] = useState([]);

  const totalFare = useMemo(() => {
    const fare = Number(form.fare) || 0;
    const farePaid = Number(form.farePaid) || 0;

    return farePaid || fare;
  }, [form.fare, form.farePaid]);

  const calculatedNetClaim = useMemo(() => {
    const eligible = Number(form.eligibleAmount) || 0;
    const advance = Number(form.advanceAdjustment) || 0;

    return Math.max(eligible - advance, 0);
  }, [form.eligibleAmount, form.advanceAdjustment]);

  const handleChange = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const addFamilyMember = () => {
    setForm((current) => ({
      ...current,
      familyMembers: [
        ...current.familyMembers,
        {
          id: Date.now(),
          name: "",
          age: "",
          relationship: "",
        },
      ],
    }));
  };

  const removeFamilyMember = (id) => {
    setForm((current) => {
      if (current.familyMembers.length === 1) {
        return current;
      }

      return {
        ...current,
        familyMembers: current.familyMembers.filter(
          (member) => member.id !== id
        ),
      };
    });
  };

  const updateFamilyMember = (id, field, value) => {
    setForm((current) => ({
      ...current,
      familyMembers: current.familyMembers.map((member) =>
        member.id === id
          ? {
              ...member,
              [field]: value,
            }
          : member
      ),
    }));

    setErrors((current) => ({
      ...current,
      [`family_${id}_${field}`]: "",
    }));
  };

  const handleFileChange = (field, event) => {
    const file = event.target.files?.[0] || null;

    setForm((current) => ({
      ...current,
      [field]: file,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  const handleOtherDocuments = (event) => {
    const files = Array.from(event.target.files || []);

    setForm((current) => ({
      ...current,
      otherDocuments: [
        ...current.otherDocuments,
        ...files,
      ],
    }));

    event.target.value = "";
  };

  const removeOtherDocument = (index) => {
    setForm((current) => ({
      ...current,
      otherDocuments: current.otherDocuments.filter(
        (_, fileIndex) => fileIndex !== index
      ),
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

      ltcType: "Nature / Type of LTC",
      homeTownDestination: "Home Town / Destination",
      leaveFrom: "Leave From",
      leaveTo: "Leave To",
      blockPeriod: "Block Period",

      journeyFrom: "Journey From",
      journeyTo: "Journey To",
      departureDate: "Departure Date",
      arrivalDate: "Arrival Date",
      departureTime: "Departure Time",
      arrivalTime: "Arrival Time",
      modeOfTravel: "Mode of Travel",
      travelClass: "Class",
      distance: "Distance",
      fare: "Fare",

      advanceDrawn: "Advance status",

      higherClassTravel: "Higher Class Travel",
      roadJourney: "Road Journey",

      eligibleAmount: "Eligible Amount",
    };

    Object.entries(requiredFields).forEach(([field, label]) => {
      if (!String(form[field] ?? "").trim()) {
        nextErrors[field] = `${label} is required`;
      }
    });

    form.familyMembers.forEach((member) => {
      if (!member.name.trim()) {
        nextErrors[`family_${member.id}_name`] =
          "Family member name is required";
      }

      if (!member.age.trim()) {
        nextErrors[`family_${member.id}_age`] =
          "Age is required";
      }

      if (!member.relationship.trim()) {
        nextErrors[`family_${member.id}_relationship`] =
          "Relationship is required";
      }
    });

    if (form.advanceDrawn === "Yes") {
      if (!String(form.advanceAmount).trim()) {
        nextErrors.advanceAmount = "Advance amount is required";
      }

      if (!String(form.advanceReference).trim()) {
        nextErrors.advanceReference =
          "Advance reference is required";
      }
    }

    if (form.higherClassTravel === "Yes") {
      if (!form.higherClassDetails.trim()) {
        nextErrors.higherClassDetails =
          "Please provide higher class travel details";
      }
    }

    if (form.roadJourney === "Yes") {
      if (!form.roadJourneyDetails.trim()) {
        nextErrors.roadJourneyDetails =
          "Please provide road journey details";
      }
    }

    if (!form.ticketDocument) {
      nextErrors.ticketDocument =
        "Travel ticket / ticket proof is required";
    }

    if (!form.declarationAccepted) {
      nextErrors.declarationAccepted =
        "Please accept the declaration";
    }

    return nextErrors;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    const newRecord = {
      ...form,
      totalFare: totalFare.toFixed(2),
      netClaimAmount: calculatedNetClaim.toFixed(2),
      id: `${Date.now()}`,
    };

    setRecords((current) => [
      newRecord,
      ...current,
    ]);

    setForm({
      ...INITIAL_FORM,
      familyMembers: [
        {
          id: Date.now(),
          name: "",
          age: "",
          relationship: "",
        },
      ],
    });

    setErrors({});

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleReset = () => {
    setForm({
      ...INITIAL_FORM,
      familyMembers: [
        {
          id: Date.now(),
          name: "",
          age: "",
          relationship: "",
        },
      ],
    });

    setErrors({});
  };

  return (
    <div className="ltc-page">

      {/* =========================================================
          PAGE HEADER
      ========================================================== */}

      <div className="ltc-page-header">
        <div>
          <div className="ltc-breadcrumb">
            Admin
            <span>/</span>
            Services
            <span>/</span>
            LTC
            <span>/</span>
            LTC Claim
          </div>

          <div className="ltc-title-row">
            <div className="ltc-title-icon">
              <FileText size={22} />
            </div>

            <div>
              <h1>LTC Claim</h1>

              <p>
                Submit and manage Leave Travel Concession
                claims.
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

      <form
        className="ltc-form"
        onSubmit={handleSubmit}
      >

        {/* =========================================================
            1. EMPLOYEE DETAILS
        ========================================================== */}

        <Section
          icon={<UserRound size={18} />}
          title="Employee Details"
          description="Basic employee information associated with this claim."
        >
          <div className="ltc-form-grid">

            <Field
              label="Employee Number"
              value={form.employeeNumber}
              onChange={(value) =>
                handleChange("employeeNumber", value)
              }
              error={errors.employeeNumber}
              placeholder="Enter employee number"
            />

            <Field
              label="Employee Name"
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

            <Field
              label="Pay"
              value={form.pay}
              onChange={(value) =>
                handleChange("pay", value)
              }
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
            />

          </div>
        </Section>

        {/* =========================================================
            2. LTC / LEAVE DETAILS
        ========================================================== */}

        <Section
          icon={<Home size={18} />}
          title="LTC / Leave Details"
          description="Provide the LTC and leave period information."
        >
          <div className="ltc-form-grid">

            <SelectField
              label="Nature / Type of LTC"
              value={form.ltcType}
              onChange={(value) =>
                handleChange("ltcType", value)
              }
              error={errors.ltcType}
              options={[
                "Home Town LTC",
                "Anywhere in India LTC",
                "Other",
              ]}
              placeholder="Select LTC type"
            />

            <Field
              label="Home Town / Destination"
              value={form.homeTownDestination}
              onChange={(value) =>
                handleChange(
                  "homeTownDestination",
                  value
                )
              }
              error={errors.homeTownDestination}
              placeholder="Enter home town / destination"
            />

            <Field
              label="Leave From"
              type="date"
              value={form.leaveFrom}
              onChange={(value) =>
                handleChange("leaveFrom", value)
              }
              error={errors.leaveFrom}
            />

            <Field
              label="Leave To"
              type="date"
              value={form.leaveTo}
              onChange={(value) =>
                handleChange("leaveTo", value)
              }
              error={errors.leaveTo}
            />

            <Field
              label="Block Period"
              value={form.blockPeriod}
              onChange={(value) =>
                handleChange("blockPeriod", value)
              }
              error={errors.blockPeriod}
              placeholder="e.g. 2026–2027"
            />

          </div>
        </Section>

        {/* =========================================================
            3. FAMILY MEMBERS
        ========================================================== */}

        <Section
          icon={<Users size={18} />}
          title="Family Members"
          description="Add the family members covered under the LTC claim."
        >

          <div className="ltc-family-list">

            {form.familyMembers.map(
              (member, index) => (
                <div
                  className="ltc-family-row"
                  key={member.id}
                >

                  <div className="ltc-family-number">
                    {index + 1}
                  </div>

                  <Field
                    label="Family Member Name"
                    value={member.name}
                    onChange={(value) =>
                      updateFamilyMember(
                        member.id,
                        "name",
                        value
                      )
                    }
                    error={
                      errors[
                        `family_${member.id}_name`
                      ]
                    }
                    placeholder="Enter name"
                  />

                  <Field
                    label="Age"
                    type="number"
                    value={member.age}
                    onChange={(value) =>
                      updateFamilyMember(
                        member.id,
                        "age",
                        value
                      )
                    }
                    error={
                      errors[
                        `family_${member.id}_age`
                      ]
                    }
                    placeholder="Age"
                  />

                  <Field
                    label="Relationship"
                    value={member.relationship}
                    onChange={(value) =>
                      updateFamilyMember(
                        member.id,
                        "relationship",
                        value
                      )
                    }
                    error={
                      errors[
                        `family_${member.id}_relationship`
                      ]
                    }
                    placeholder="e.g. Spouse"
                  />

                  <button
                    type="button"
                    className="ltc-icon-button danger"
                    onClick={() =>
                      removeFamilyMember(member.id)
                    }
                    disabled={
                      form.familyMembers.length === 1
                    }
                    title="Remove family member"
                  >
                    <Trash2 size={17} />
                  </button>

                </div>
              )
            )}

          </div>

          <button
            type="button"
            className="ltc-add-button"
            onClick={addFamilyMember}
          >
            <Plus size={17} />
            Add Family Member
          </button>

        </Section>

        {/* =========================================================
            4. JOURNEY DETAILS
        ========================================================== */}

        <Section
          icon={<CalendarDays size={18} />}
          title="Journey Details"
          description="Provide the actual journey information for the LTC claim."
        >
          <div className="ltc-form-grid">

            <Field
              label="From"
              value={form.journeyFrom}
              onChange={(value) =>
                handleChange("journeyFrom", value)
              }
              error={errors.journeyFrom}
              placeholder="Starting location"
            />

            <Field
              label="To"
              value={form.journeyTo}
              onChange={(value) =>
                handleChange("journeyTo", value)
              }
              error={errors.journeyTo}
              placeholder="Destination"
            />

            <Field
              label="Departure Date"
              type="date"
              value={form.departureDate}
              onChange={(value) =>
                handleChange("departureDate", value)
              }
              error={errors.departureDate}
            />

            <Field
              label="Arrival Date"
              type="date"
              value={form.arrivalDate}
              onChange={(value) =>
                handleChange("arrivalDate", value)
              }
              error={errors.arrivalDate}
            />

            <Field
              label="Departure Time"
              type="time"
              value={form.departureTime}
              onChange={(value) =>
                handleChange("departureTime", value)
              }
              error={errors.departureTime}
            />

            <Field
              label="Arrival Time"
              type="time"
              value={form.arrivalTime}
              onChange={(value) =>
                handleChange("arrivalTime", value)
              }
              error={errors.arrivalTime}
            />

            <SelectField
              label="Mode of Travel"
              value={form.modeOfTravel}
              onChange={(value) =>
                handleChange("modeOfTravel", value)
              }
              error={errors.modeOfTravel}
              options={MODE_OPTIONS}
              placeholder="Select mode"
            />

            <SelectField
              label="Class"
              value={form.travelClass}
              onChange={(value) =>
                handleChange("travelClass", value)
              }
              error={errors.travelClass}
              options={CLASS_OPTIONS}
              placeholder="Select class"
            />

            <Field
              label="Distance"
              value={form.distance}
              onChange={(value) =>
                handleChange("distance", value)
              }
              error={errors.distance}
              placeholder="Distance in km"
            />

            <Field
              label="Fare"
              type="number"
              value={form.fare}
              onChange={(value) =>
                handleChange("fare", value)
              }
              error={errors.fare}
              placeholder="Enter fare"
            />

            <Field
              label="Fare Paid"
              type="number"
              value={form.farePaid}
              onChange={(value) =>
                handleChange("farePaid", value)
              }
              error={errors.farePaid}
              placeholder="Actual amount paid"
            />

          </div>
        </Section>

        {/* =========================================================
            5. ADVANCE ALREADY DRAWN
        ========================================================== */}

        <Section
          icon={<FileCheck2 size={18} />}
          title="Advance Already Drawn"
          description="Provide details if an LTC advance was already received."
        >

          <div className="ltc-choice-group">

            <Choice
              label="No"
              checked={form.advanceDrawn === "No"}
              onChange={() =>
                handleChange("advanceDrawn", "No")
              }
            />

            <Choice
              label="Yes"
              checked={form.advanceDrawn === "Yes"}
              onChange={() =>
                handleChange("advanceDrawn", "Yes")
              }
            />

          </div>

          {form.advanceDrawn === "Yes" && (
            <div className="ltc-form-grid ltc-conditional-block">

              <Field
                label="Advance Amount"
                type="number"
                value={form.advanceAmount}
                onChange={(value) =>
                  handleChange(
                    "advanceAmount",
                    value
                  )
                }
                error={errors.advanceAmount}
                placeholder="Enter advance amount"
              />

              <Field
                label="Advance Reference"
                value={form.advanceReference}
                onChange={(value) =>
                  handleChange(
                    "advanceReference",
                    value
                  )
                }
                error={errors.advanceReference}
                placeholder="Reference / sanction number"
              />

            </div>
          )}

        </Section>

        {/* =========================================================
            6. SPECIAL / CONDITIONAL TRAVEL
        ========================================================== */}

        <Section
          icon={<FileText size={18} />}
          title="Special / Conditional Travel"
          description="Provide additional details only when applicable."
        >

          <div className="ltc-conditional-question">

            <div>
              <strong>
                Higher Class Travel
              </strong>

              <span>
                Was travel undertaken in a higher class?
              </span>
            </div>

            <div className="ltc-choice-group compact">

              <Choice
                label="No"
                checked={
                  form.higherClassTravel === "No"
                }
                onChange={() =>
                  handleChange(
                    "higherClassTravel",
                    "No"
                  )
                }
              />

              <Choice
                label="Yes"
                checked={
                  form.higherClassTravel === "Yes"
                }
                onChange={() =>
                  handleChange(
                    "higherClassTravel",
                    "Yes"
                  )
                }
              />

            </div>

          </div>

          {form.higherClassTravel === "Yes" && (
            <TextAreaField
              label="Higher Class Travel Details"
              value={form.higherClassDetails}
              onChange={(value) =>
                handleChange(
                  "higherClassDetails",
                  value
                )
              }
              error={errors.higherClassDetails}
              placeholder="Provide details and reason"
            />
          )}

          <div className="ltc-conditional-question">

            <div>
              <strong>
                Road Journey
              </strong>

              <span>
                Was any part of the journey undertaken by road?
              </span>
            </div>

            <div className="ltc-choice-group compact">

              <Choice
                label="No"
                checked={
                  form.roadJourney === "No"
                }
                onChange={() =>
                  handleChange(
                    "roadJourney",
                    "No"
                  )
                }
              />

              <Choice
                label="Yes"
                checked={
                  form.roadJourney === "Yes"
                }
                onChange={() =>
                  handleChange(
                    "roadJourney",
                    "Yes"
                  )
                }
              />

            </div>

          </div>

          {form.roadJourney === "Yes" && (
            <TextAreaField
              label="Road Journey Details"
              value={form.roadJourneyDetails}
              onChange={(value) =>
                handleChange(
                  "roadJourneyDetails",
                  value
                )
              }
              error={errors.roadJourneyDetails}
              placeholder="Provide road journey details"
            />
          )}

        </Section>

        {/* =========================================================
            7. CLAIM SUMMARY
        ========================================================== */}

        <Section
          icon={<FileCheck2 size={18} />}
          title="Claim Summary"
          description="Review the financial details of the LTC claim."
        >

          <div className="ltc-summary-grid">

            <SummaryItem
              label="Total Fare"
              value={`₹${totalFare.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}`}
            />

            <Field
              label="Eligible Amount"
              type="number"
              value={form.eligibleAmount}
              onChange={(value) =>
                handleChange(
                  "eligibleAmount",
                  value
                )
              }
              error={errors.eligibleAmount}
              placeholder="Enter eligible amount"
            />

            <Field
              label="Advance Adjustment"
              type="number"
              value={form.advanceAdjustment}
              onChange={(value) =>
                handleChange(
                  "advanceAdjustment",
                  value
                )
              }
              error={errors.advanceAdjustment}
              placeholder="Advance to adjust"
            />

            <SummaryItem
              label="Net Claim Amount"
              value={`₹${calculatedNetClaim.toLocaleString(
                "en-IN",
                {
                  minimumFractionDigits: 2,
                }
              )}`}
              highlight
            />

          </div>

        </Section>

        {/* =========================================================
            8. SUPPORTING DOCUMENTS
        ========================================================== */}

        <Section
          icon={<Upload size={18} />}
          title="Supporting Documents"
          description="Upload the documents required to support the LTC claim."
        >

          <div className="ltc-document-grid">

            <DocumentUpload
              title="LTC Approval / Sanction Document"
              description="Required when applicable"
              required={false}
              file={form.approvalDocument}
              onChange={(event) =>
                handleFileChange(
                  "approvalDocument",
                  event
                )
              }
              error={errors.approvalDocument}
            />

            <DocumentUpload
              title="Travel Ticket / Ticket Proof"
              description="Required"
              required
              file={form.ticketDocument}
              onChange={(event) =>
                handleFileChange(
                  "ticketDocument",
                  event
                )
              }
              error={errors.ticketDocument}
            />

            <div className="ltc-document-card">

              <div className="ltc-document-icon">
                <FileText size={20} />
              </div>

              <div className="ltc-document-content">

                <div className="ltc-document-title">
                  <strong>
                    Other Supporting Documents
                  </strong>

                  <span>
                    Optional
                  </span>
                </div>

                <p>
                  Upload any additional supporting
                  documents if required.
                </p>

                <label className="ltc-upload-button">
                  <Upload size={16} />
                  Upload Documents

                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleOtherDocuments}
                  />
                </label>

                {form.otherDocuments.length > 0 && (
                  <div className="ltc-file-list">

                    {form.otherDocuments.map(
                      (file, index) => (
                        <div
                          className="ltc-file-item"
                          key={`${file.name}-${index}`}
                        >
                          <span>
                            {file.name}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeOtherDocument(index)
                            }
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

            </div>

          </div>

        </Section>

        {/* =========================================================
            9. DECLARATION
        ========================================================== */}

        <section className="ltc-declaration">

          <div className="ltc-declaration-heading">
            <span>
              Declaration
            </span>

            <h2>
              Declaration & Confirmation
            </h2>
          </div>

          <label className="ltc-declaration-checkbox">

            <input
              type="checkbox"
              checked={form.declarationAccepted}
              onChange={(event) => {
                handleChange(
                  "declarationAccepted",
                  event.target.checked
                );
              }}
            />

            <span>
              I hereby declare that the information
              provided in this LTC claim and the
              documents uploaded by me are true and
              genuine to the best of my knowledge. I
              understand that incorrect or misleading
              information may result in rejection of
              the claim and action under applicable
              rules.
            </span>

          </label>

          {errors.declarationAccepted && (
            <small className="ltc-error">
              {errors.declarationAccepted}
            </small>
          )}

        </section>

        {/* =========================================================
            ACTIONS
        ========================================================== */}

        <div className="ltc-form-actions">

          <button
            type="button"
            className="ltc-secondary-button"
            onClick={handleReset}
          >
            <RotateCcw size={17} />
            Reset
          </button>

          <button
            type="submit"
            className="ltc-primary-button"
          >
            <Save size={17} />
            Submit LTC Claim
          </button>

        </div>

      </form>

      {/* =========================================================
          CLAIM RECORDS
      ========================================================== */}

      <section className="ltc-card ltc-records-card">

        <div className="ltc-records-header">

          <div>
            <span className="ltc-eyebrow">
              Claim Records
            </span>

            <h2>
              Submitted LTC Claims
            </h2>

            <p>
              Claims created during this frontend
              session.
            </p>
          </div>

          <div className="ltc-record-count">
            {records.length}{" "}
            {records.length === 1
              ? "Record"
              : "Records"}
          </div>

        </div>

        {records.length === 0 ? (
          <div className="ltc-empty-state">

            <FileText size={30} />

            <h3>
              No LTC claims recorded yet
            </h3>

            <p>
              Complete the form above and submit
              the claim to see it here.
            </p>

          </div>
        ) : (
          <div className="ltc-table-wrapper">

            <table className="ltc-table">

              <thead>
                <tr>
                  <th>Employee</th>
                  <th>LTC Type</th>
                  <th>Destination</th>
                  <th>Leave Period</th>
                  <th>Net Claim</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>

                {records.map((record) => (
                  <tr key={record.id}>

                    <td>
                      <div className="ltc-employee-cell">
                        <strong>
                          {record.employeeName}
                        </strong>

                        <span>
                          {record.employeeNumber}
                        </span>
                      </div>
                    </td>

                    <td>
                      {record.ltcType}
                    </td>

                    <td>
                      {record.homeTownDestination}
                    </td>

                    <td>
                      {record.leaveFrom}
                      {" → "}
                      {record.leaveTo}
                    </td>

                    <td>
                      ₹
                      {Number(
                        record.netClaimAmount
                      ).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    <td>
                      <span className="ltc-status-badge">
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

/* ===============================================================
   REUSABLE COMPONENTS
================================================================ */

function Section({
  icon,
  title,
  description,
  children,
}) {
  return (
    <section className="ltc-card">

      <div className="ltc-section-heading">

        <div className="ltc-section-icon">
          {icon}
        </div>

        <div>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

      </div>

      {children}

    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}) {
  return (
    <div className="ltc-field">

      <label>
        {label}
        <span>*</span>
      </label>

      <input
        className={
          error
            ? "ltc-input ltc-input-error"
            : "ltc-input"
        }
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
      />

      {error && (
        <small className="ltc-error">
          {error}
        </small>
      )}

    </div>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="ltc-field ltc-full-width">

      <label>
        {label}
        <span>*</span>
      </label>

      <textarea
        className={
          error
            ? "ltc-input ltc-textarea ltc-input-error"
            : "ltc-input ltc-textarea"
        }
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={4}
      />

      {error && (
        <small className="ltc-error">
          {error}
        </small>
      )}

    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  error,
  options,
  placeholder = "Select",
}) {
  return (
    <div className="ltc-field">

      <label>
        {label}
        <span>*</span>
      </label>

      <select
        className={
          error
            ? "ltc-input ltc-input-error"
            : "ltc-input"
        }
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        <option value="">
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            value={option}
            key={option}
          >
            {option}
          </option>
        ))}
      </select>

      {error && (
        <small className="ltc-error">
          {error}
        </small>
      )}

    </div>
  );
}

function Choice({
  label,
  checked,
  onChange,
}) {
  return (
    <label className="ltc-choice">

      <input
        type="radio"
        checked={checked}
        onChange={onChange}
      />

      <span>
        {label}
      </span>

    </label>
  );
}

function SummaryItem({
  label,
  value,
  highlight = false,
}) {
  return (
    <div
      className={
        highlight
          ? "ltc-summary-item highlight"
          : "ltc-summary-item"
      }
    >
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DocumentUpload({
  title,
  description,
  required = false,
  file,
  onChange,
  error,
}) {
  return (
    <div className="ltc-document-card">

      <div className="ltc-document-icon">
        <FileText size={20} />
      </div>

      <div className="ltc-document-content">

        <div className="ltc-document-title">

          <strong>
            {title}
          </strong>

          <span>
            {required
              ? "Required"
              : "Required when applicable"}
          </span>

        </div>

        <p>
          {description}
        </p>

        <label className="ltc-upload-button">

          <Upload size={16} />

          {file
            ? "Replace Document"
            : "Upload Document"}

          <input
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            onChange={onChange}
          />

        </label>

        {file && (
          <div className="ltc-file-item">
            <span>
              {file.name}
            </span>
          </div>
        )}

        {error && (
          <small className="ltc-error">
            {error}
          </small>
        )}

      </div>

    </div>
  );
}

export default LTCClaimPage;