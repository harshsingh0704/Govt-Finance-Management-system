import React from "react";
import "./MedicalClaimPage.css";

const INITIAL_FORM = {
  employeeNumber: "",
  employeeName: "",
  designation: "",
  gradePay: "",
  department: "",
  employeeType: "",

  patientName: "",
  relationship: "",
  dateOfBirth: "",
  gender: "",
  patientType: "",

  treatmentType: "",
  hospitalName: "",
  hospitalLocation: "",
  admissionDate: "",
  dischargeDate: "",
  diagnosis: "",
  treatmentDescription: "",






  consultationAmount: "",
  medicineAmount: "",
  testAmount: "",
  hospitalAmount: "",
  surgeryAmount: "",
  otherAmount: "",


  remarks: "",
};

function MedicalClaimPage() {
  const [form, setForm] = React.useState(INITIAL_FORM);
  const [errors, setErrors] = React.useState({});
  const [records, setRecords] = React.useState([]);

  const [documents, setDocuments] = React.useState({
    medicalTest: null,
    medicalPrescription: null,
    surgeryProcedure: null,
    medicalCertificate: null,
  });

  const [consentAccepted, setConsentAccepted] = React.useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const handleDocumentChange = (documentType, file) => {
    setDocuments((current) => ({
      ...current,
      [documentType]: file || null,
    }));
  };

  const validate = () => {
    const nextErrors = {};

    const requiredFields = [
      ["employeeNumber", "Employee number"],
      ["employeeName", "Employee name"],
      ["designation", "Designation"],
      ["department", "Department"],
      ["patientName", "Patient name"],
      ["relationship", "Relationship"],
      ["treatmentType", "Treatment type"],
      ["hospitalName", "Hospital / medical institution"],
      ["diagnosis", "Diagnosis / illness"],
    ];

    requiredFields.forEach(([field, label]) => {
      if (!form[field].trim()) {
        nextErrors[field] = `${label} is required`;
      }
    });

    if (!consentAccepted) {
      nextErrors.consentAccepted =
        "Please confirm that the information and uploaded documents are true and genuine.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const totalAmount = [
      form.consultationAmount,
      form.medicineAmount,
      form.testAmount,
      form.hospitalAmount,
      form.surgeryAmount,
      form.otherAmount,
    ].reduce((total, value) => total + (Number(value) || 0), 0);

    const record = {
      ...form,
      id: Date.now(),
      totalAmount,
      status: "Recorded",
    };

    setRecords((current) => [...current, record]);
    setForm(INITIAL_FORM);
    setErrors({});
    setDocuments({
      medicalTest: null,
      medicalPrescription: null,
      surgeryProcedure: null,
      medicalCertificate: null,
    });
    setConsentAccepted(false);
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setErrors({});
    setDocuments({
      medicalTest: null,
      medicalPrescription: null,
      surgeryProcedure: null,
      medicalCertificate: null,
    });
    setConsentAccepted(false);
  };

  const totalAmount = [
    form.consultationAmount,
    form.medicineAmount,
    form.testAmount,
    form.hospitalAmount,
    form.surgeryAmount,
    form.otherAmount,
  ].reduce((total, value) => total + (Number(value) || 0), 0);

  return (
    <div className="medical-page">
      <div className="medical-page-header">
        <div>
          <div className="medical-breadcrumb">
            Admin / Services / Medical / Medical Claim
          </div>

          <h1>Medical Claim</h1>

          <p>
            Record and manage employee medical reimbursement claims.
          </p>
        </div>

        <div className="medical-date-indicator">
          <span>Claim Form</span>
          <strong>Medical</strong>
        </div>
      </div>

      <form className="medical-form" onSubmit={handleSubmit}>
        <SectionHeading
          title="Employee Details"
          description="Enter the employee information associated with the claim."
        />

        <div className="medical-form-grid">
          <Field
            label="Employee Number"
            name="employeeNumber"
            value={form.employeeNumber}
            onChange={handleChange}
            error={errors.employeeNumber}
            placeholder="Enter employee number"
          />

          <Field
            label="Employee Name"
            name="employeeName"
            value={form.employeeName}
            onChange={handleChange}
            error={errors.employeeName}
            placeholder="Enter employee name"
          />

          <Field
            label="Designation"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            error={errors.designation}
            placeholder="Enter designation"
          />

          <Field
            label="Grade Pay"
            name="gradePay"
            value={form.gradePay}
            onChange={handleChange}
            error={errors.gradePay}
            placeholder="Enter grade pay"
          />

          <Field
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            error={errors.department}
            placeholder="Enter department"
          />

          <SelectField
            label="Employee Type"
            name="employeeType"
            value={form.employeeType}
            onChange={handleChange}
            error={errors.employeeType}
            options={[
              "Permanent",
              "Contract",
              "Temporary",
              "Other",
            ]}
          />
        </div>

        <SectionHeading
          title="Patient Details"
          description="Provide the details of the person who received medical treatment."
        />

        <div className="medical-form-grid">
          <Field
            label="Patient Name"
            name="patientName"
            value={form.patientName}
            onChange={handleChange}
            error={errors.patientName}
            placeholder="Enter patient name"
          />

          <SelectField
            label="Relationship with Employee"
            name="relationship"
            value={form.relationship}
            onChange={handleChange}
            error={errors.relationship}
            options={[
              "Self",
              "Spouse",
              "Child",
              "Parent",
              "Dependent",
              "Other",
            ]}
          />

          <Field
            label="Date of Birth"
            name="dateOfBirth"
            type="date"
            value={form.dateOfBirth}
            onChange={handleChange}
            error={errors.dateOfBirth}
          />

          <SelectField
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            error={errors.gender}
            options={["Male", "Female", "Other"]}
          />

          <SelectField
            label="Patient Type"
            name="patientType"
            value={form.patientType}
            onChange={handleChange}
            error={errors.patientType}
            options={["Employee", "Dependent"]}
          />
        </div>

        <SectionHeading
          title="Medical Treatment Details"
          description="Capture the hospital, treatment and diagnosis information."
        />

        <div className="medical-form-grid">
          <SelectField
            label="Treatment Type"
            name="treatmentType"
            value={form.treatmentType}
            onChange={handleChange}
            error={errors.treatmentType}
            options={[
              "Outpatient",
              "Inpatient",
              "Emergency",
              "Surgery",
              "Diagnostic",
              "Other",
            ]}
          />

          <Field
            label="Hospital / Medical Institution"
            name="hospitalName"
            value={form.hospitalName}
            onChange={handleChange}
            error={errors.hospitalName}
            placeholder="Enter hospital name"
          />

          <Field
            label="Hospital Location"
            name="hospitalLocation"
            value={form.hospitalLocation}
            onChange={handleChange}
            error={errors.hospitalLocation}
            placeholder="Enter location"
          />

          <Field
            label="Admission Date"
            name="admissionDate"
            type="date"
            value={form.admissionDate}
            onChange={handleChange}
            error={errors.admissionDate}
          />

          <Field
            label="Discharge Date"
            name="dischargeDate"
            type="date"
            value={form.dischargeDate}
            onChange={handleChange}
            error={errors.dischargeDate}
          />

          <Field
            label="Diagnosis / Illness"
            name="diagnosis"
            value={form.diagnosis}
            onChange={handleChange}
            error={errors.diagnosis}
            placeholder="Enter diagnosis / illness"
          />

          <TextAreaField
            label="Treatment Description"
            name="treatmentDescription"
            value={form.treatmentDescription}
            onChange={handleChange}
            error={errors.treatmentDescription}
            placeholder="Describe the treatment received"
          />
        </div>

        <SectionHeading
          title="Tests, Medicines & Procedures"
          description="Provide supporting treatment information."
        />

        <div className="medical-form-grid">

          <DocumentUploadField
            label="Medical Test Document"
            documentType="medicalTest"
            file={documents.medicalTest}
            onChange={handleDocumentChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />

          <DocumentUploadField
            label="Medical Prescription Document"
            documentType="medicalPrescription"
            file={documents.medicalPrescription}
            onChange={handleDocumentChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />

          <DocumentUploadField
            label="Surgery / Procedure Document"
            documentType="surgeryProcedure"
            file={documents.surgeryProcedure}
            onChange={handleDocumentChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        <SectionHeading
          title="Expense Details"
          description="Enter the amount claimed under each expense category."
        />

        <div className="medical-form-grid">
          <AmountField
            label="Consultation"
            name="consultationAmount"
            value={form.consultationAmount}
            onChange={handleChange}
            error={errors.consultationAmount}
          />

          <AmountField
            label="Medicines"
            name="medicineAmount"
            value={form.medicineAmount}
            onChange={handleChange}
            error={errors.medicineAmount}
          />

          <AmountField
            label="Medical Tests"
            name="testAmount"
            value={form.testAmount}
            onChange={handleChange}
            error={errors.testAmount}
          />

          <AmountField
            label="Hospital Charges"
            name="hospitalAmount"
            value={form.hospitalAmount}
            onChange={handleChange}
            error={errors.hospitalAmount}
          />

          <AmountField
            label="Surgery / Procedures"
            name="surgeryAmount"
            value={form.surgeryAmount}
            onChange={handleChange}
            error={errors.surgeryAmount}
          />

          <AmountField
            label="Other Expenses"
            name="otherAmount"
            value={form.otherAmount}
            onChange={handleChange}
            error={errors.otherAmount}
          />
        </div>

        <div className="medical-claim-summary">
          <div>
            <span>Total Claim Amount</span>
            <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>
          </div>
        </div>

        <SectionHeading
          title="Certificates & Supporting Information"
          description="Record the supporting certificates and additional remarks."
        />

        <div className="medical-form-grid">

          <TextAreaField
            label="Remarks"
            name="remarks"
            value={form.remarks}
            onChange={handleChange}
            error={errors.remarks}
            placeholder="Enter any additional remarks"
          />

          <DocumentUploadField
            label="Medical Certificate"
            documentType="medicalCertificate"
            file={documents.medicalCertificate}
            onChange={handleDocumentChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
        </div>

        <section className="medical-consent-section">
          <div className="medical-consent-heading">
            <span>Declaration & Consent</span>
            <h3>Document & Information Declaration</h3>
          </div>

          <label className="medical-consent-checkbox">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(event) => {
                setConsentAccepted(event.target.checked);

                if (event.target.checked && errors.consentAccepted) {
                  setErrors((current) => ({
                    ...current,
                    consentAccepted: "",
                  }));
                }
              }}
            />

            <span>
              I hereby declare that the information provided in this medical
              claim and the documents uploaded by me are true and genuine to
              the best of my knowledge. I understand that providing false or
              misleading information may result in rejection of the claim and
              action according to applicable rules.
            </span>
          </label>

          {errors.consentAccepted && (
            <small className="medical-error">
              {errors.consentAccepted}
            </small>
          )}
        </section>

        <div className="medical-form-actions">
          <button
            type="button"
            className="medical-secondary-button"
            onClick={handleReset}
          >
            Reset
          </button>

          <button type="submit" className="medical-primary-button">
            Save Medical Claim
          </button>
        </div>
      </form>

      <section className="medical-records-section">
        <div className="medical-section-heading">
          <div>
            <span>Claim Records</span>
            <h2>Recorded Medical Claims</h2>
          </div>

          <div className="medical-record-count">
            {records.length} {records.length === 1 ? "Record" : "Records"}
          </div>
        </div>

        {records.length === 0 ? (
          <div className="medical-empty-state">
            <h3>No medical claims recorded yet</h3>
            <p>
              Complete the form above and save the claim to see it here.
            </p>
          </div>
        ) : (
          <div className="medical-table-wrapper">
            <table className="medical-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Employee</th>
                  <th>Patient</th>
                  <th>Hospital</th>
                  <th>Treatment</th>
                  <th>Claim Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record, index) => (
                  <tr key={record.id}>
                    <td>{index + 1}</td>
                    <td>
                      <div className="medical-employee-cell">
                        <strong>{record.employeeName}</strong>
                        <span>{record.employeeNumber}</span>
                      </div>
                    </td>
                    <td>{record.patientName}</td>
                    <td>{record.hospitalName}</td>
                    <td>{record.treatmentType}</td>
                    <td>
                      ₹{record.totalAmount.toLocaleString("en-IN")}
                    </td>
                    <td>
                      <span className="medical-status-badge">
                        {record.status}
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

function SectionHeading({ title, description }) {
  return (
    <div className="medical-section-heading">
      <div>
        <span>Medical Claim</span>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  type = "text",
}) {
  return (
    <div className="medical-field">
      <label htmlFor={name}>
        {label}
        <span>*</span>
      </label>

      <div className={`medical-input-wrapper ${error ? "has-error" : ""}`}>
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </div>

      {error && <small className="medical-error">{error}</small>}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  error,
  options,
}) {
  return (
    <div className="medical-field">
      <label htmlFor={name}>
        {label}
        <span>*</span>
      </label>

      <div className={`medical-input-wrapper ${error ? "has-error" : ""}`}>
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
        >
          <option value="">Select {label.toLowerCase()}</option>

          {options.map((option) => (
            <option value={option} key={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {error && <small className="medical-error">{error}</small>}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
}) {
  return (
    <div className="medical-field medical-field-wide">
      <label htmlFor={name}>
        {label}
      </label>

      <div className={`medical-input-wrapper ${error ? "has-error" : ""}`}>
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={4}
        />
      </div>

      {error && <small className="medical-error">{error}</small>}
    </div>
  );
}

function DocumentUploadField({
  label,
  documentType,
  file,
  onChange,
  accept,
}) {
  return (
    <div className="medical-field">
      <label htmlFor={documentType}>{label}</label>

      <div className="medical-document-upload">
        <div className={`medical-document-upload-row ${file ? "has-file" : ""}`}>
          <label
            htmlFor={documentType}
            className="medical-document-upload-button"
          >
            {file ? "Change Document" : "Choose Document"}
          </label>

          <input
            id={documentType}
            type="file"
            accept={accept}
            onChange={(event) =>
              onChange(documentType, event.target.files?.[0] || null)
            }
          />

          {file ? (
            <>
              <span className="medical-document-file-name">
                {file.name}
              </span>

              <button
                type="button"
                className="medical-document-remove"
                onClick={() => onChange(documentType, null)}
              >
                Remove
              </button>
            </>
          ) : (
            <span className="medical-document-empty">
              No document selected
            </span>
          )}
        </div>

        <small className="medical-document-hint">
          Optional. Upload PDF, JPG, JPEG or PNG.
        </small>
      </div>
    </div>
  );
}

function AmountField({
  label,
  name,
  value,
  onChange,
  error,
}) {
  return (
    <div className="medical-field">
      <label htmlFor={name}>{label}</label>

      <div className={`medical-input-wrapper medical-amount-input ${error ? "has-error" : ""}`}>
        <span>₹</span>
        <input
          id={name}
          name={name}
          type="number"
          min="0"
          step="0.01"
          value={value}
          onChange={onChange}
          placeholder="0"
        />
      </div>

      {error && <small className="medical-error">{error}</small>}
    </div>
  );
}

export default MedicalClaimPage;
