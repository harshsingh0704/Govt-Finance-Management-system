import React, { useMemo, useState } from "react";
import "./MedicalAdvancePage.css";

const initialForm = {
  // Employee Details
  employeeNumber: "",
  employeeName: "",
  designation: "",
  department: "",
  headquarters: "",

  // Patient Details
  patientName: "",
  relationship: "",
  patientType: "",

  // Treatment Details
  treatmentNature: "",
  treatmentType: "",
  hospitalName: "",
  hospitalLocation: "",
  hospitalStatus: "",
  proposedTreatment: "",
  proposedAdmissionDate: "",
  diagnosis: "",

  // Medical Advance Requirement
  estimatedTreatmentExpense: "",
  estimatedMedicineInvestigationExpense: "",
  estimatedOtherExpense: "",
  advanceAmountRequested: "",

  // Supporting Documents
  medicalOfficerCertificate: null,
  medicalHospitalEstimate: null,
  otherSupportingDocuments: null,

  // Remarks
  remarks: "",
};

const initialErrors = {};

function MedicalAdvancePage() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState(initialErrors);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const totalEstimatedExpense = useMemo(() => {
    const treatment = Number(form.estimatedTreatmentExpense) || 0;
    const medicineInvestigation =
      Number(form.estimatedMedicineInvestigationExpense) || 0;
    const other = Number(form.estimatedOtherExpense) || 0;

    return treatment + medicineInvestigation + other;
  }, [
    form.estimatedTreatmentExpense,
    form.estimatedMedicineInvestigationExpense,
    form.estimatedOtherExpense,
  ]);

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

  const handleFileChange = (event) => {
    const { name, files } = event.target;

    setForm((current) => ({
      ...current,
      [name]: files?.[0] || null,
    }));

    if (errors[name]) {
      setErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const nextErrors = {};

    const requiredFields = [
      ["employeeNumber", "Employee number is required."],
      ["employeeName", "Employee name is required."],
      ["designation", "Designation is required."],
      ["department", "Department / office is required."],
      ["headquarters", "Headquarters is required."],

      ["patientName", "Patient name is required."],
      ["relationship", "Relationship is required."],
      ["patientType", "Patient type is required."],

      ["treatmentNature", "Nature / type of treatment is required."],
      ["treatmentType", "Treatment type is required."],
      ["hospitalName", "Hospital / medical institution is required."],
      ["hospitalLocation", "Hospital location is required."],
      ["hospitalStatus", "Hospital status is required."],
      ["proposedTreatment", "Proposed treatment / procedure is required."],
      ["proposedAdmissionDate", "Proposed admission date is required."],
      ["diagnosis", "Diagnosis / illness is required."],

      [
        "estimatedTreatmentExpense",
        "Estimated treatment / hospital expense is required.",
      ],
      [
        "estimatedMedicineInvestigationExpense",
        "Estimated medicine / investigation expense is required.",
      ],
      ["advanceAmountRequested", "Advance amount requested is required."],
    ];

    requiredFields.forEach(([field, message]) => {
      if (!String(form[field] ?? "").trim()) {
        nextErrors[field] = message;
      }
    });

    if (!form.medicalOfficerCertificate) {
      nextErrors.medicalOfficerCertificate =
        "Medical Officer / Specialist Certificate is required.";
    }

    if (!form.medicalHospitalEstimate) {
      nextErrors.medicalHospitalEstimate =
        "Medical / Hospital Cost Estimate is required.";
    }

    const requestedAmount = Number(form.advanceAmountRequested) || 0;

    if (
      form.advanceAmountRequested &&
      requestedAmount > totalEstimatedExpense
    ) {
      nextErrors.advanceAmountRequested =
        "Advance amount cannot exceed the total estimated expense.";
    }

    if (!consentAccepted) {
      nextErrors.consentAccepted =
        "Please confirm that the information and uploaded documents are true and genuine.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Backend/API integration will be added later.
    console.log("Medical Advance form submitted:", {
      ...form,
      totalEstimatedExpense,
      consentAccepted,
    });
  };

  const handleReset = () => {
    setForm(initialForm);
    setErrors({});
    setConsentAccepted(false);
  };

  const renderError = (field) => {
    if (!errors[field]) {
      return null;
    }

    return <small className="medical-error">{errors[field]}</small>;
  };

  return (
    <div className="medical-advance-page">
      <div className="medical-advance-header">
        <div>
          <h1>Medical Advance</h1>
          <p>
            Apply for an advance towards eligible medical treatment expenses.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ============================================================
            1. EMPLOYEE DETAILS
        ============================================================ */}
        <section className="medical-advance-section">
          <div className="medical-advance-section-header">
            <h2>1. Employee Details</h2>
            <p>Enter the employee information for this request.</p>
          </div>

          <div className="medical-advance-grid">
            <div className="medical-form-field">
              <label htmlFor="employeeNumber">
                Employee Number <span>*</span>
              </label>
              <input
                id="employeeNumber"
                name="employeeNumber"
                type="text"
                value={form.employeeNumber}
                onChange={handleChange}
                placeholder="Enter employee number"
              />
              {renderError("employeeNumber")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="employeeName">
                Employee Name <span>*</span>
              </label>
              <input
                id="employeeName"
                name="employeeName"
                type="text"
                value={form.employeeName}
                onChange={handleChange}
                placeholder="Enter employee name"
              />
              {renderError("employeeName")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="designation">
                Designation <span>*</span>
              </label>
              <input
                id="designation"
                name="designation"
                type="text"
                value={form.designation}
                onChange={handleChange}
                placeholder="Enter designation"
              />
              {renderError("designation")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="department">
                Department / Office <span>*</span>
              </label>
              <input
                id="department"
                name="department"
                type="text"
                value={form.department}
                onChange={handleChange}
                placeholder="Enter department / office"
              />
              {renderError("department")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="headquarters">
                Headquarters <span>*</span>
              </label>
              <input
                id="headquarters"
                name="headquarters"
                type="text"
                value={form.headquarters}
                onChange={handleChange}
                placeholder="Enter headquarters"
              />
              {renderError("headquarters")}
            </div>
          </div>
        </section>

        {/* ============================================================
            2. PATIENT DETAILS
        ============================================================ */}
        <section className="medical-advance-section">
          <div className="medical-advance-section-header">
            <h2>2. Patient Details</h2>
            <p>Provide details of the person receiving the treatment.</p>
          </div>

          <div className="medical-advance-grid">
            <div className="medical-form-field">
              <label htmlFor="patientName">
                Patient Name <span>*</span>
              </label>
              <input
                id="patientName"
                name="patientName"
                type="text"
                value={form.patientName}
                onChange={handleChange}
                placeholder="Enter patient name"
              />
              {renderError("patientName")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="relationship">
                Relationship with Employee <span>*</span>
              </label>
              <select
                id="relationship"
                name="relationship"
                value={form.relationship}
                onChange={handleChange}
              >
                <option value="">Select relationship</option>
                <option value="Self">Self</option>
                <option value="Spouse">Spouse</option>
                <option value="Child">Child</option>
                <option value="Parent">Parent</option>
                <option value="Dependent">Dependent</option>
                <option value="Other">Other</option>
              </select>
              {renderError("relationship")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="patientType">
                Patient Type <span>*</span>
              </label>
              <select
                id="patientType"
                name="patientType"
                value={form.patientType}
                onChange={handleChange}
              >
                <option value="">Select patient type</option>
                <option value="Employee">Employee</option>
                <option value="Dependent">Eligible Dependent</option>
              </select>
              {renderError("patientType")}
            </div>
          </div>
        </section>

        {/* ============================================================
            3. TREATMENT DETAILS
        ============================================================ */}
        <section className="medical-advance-section">
          <div className="medical-advance-section-header">
            <h2>3. Treatment Details</h2>
            <p>Provide information about the proposed medical treatment.</p>
          </div>

          <div className="medical-advance-grid">
            <div className="medical-form-field medical-form-field-full">
              <label htmlFor="treatmentNature">
                Nature / Type of Treatment <span>*</span>
              </label>
              <input
                id="treatmentNature"
                name="treatmentNature"
                type="text"
                value={form.treatmentNature}
                onChange={handleChange}
                placeholder="e.g. Surgery, medical treatment, diagnostic procedure"
              />
              {renderError("treatmentNature")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="treatmentType">
                Treatment Type <span>*</span>
              </label>

              <select
                id="treatmentType"
                name="treatmentType"
                value={form.treatmentType}
                onChange={handleChange}
              >
                <option value="">Select treatment type</option>
                <option value="IPD">In-Patient (IPD)</option>
                <option value="OPD">Out-Patient (OPD)</option>
              </select>

              {renderError("treatmentType")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="hospitalName">
                Hospital / Medical Institution <span>*</span>
              </label>
              <input
                id="hospitalName"
                name="hospitalName"
                type="text"
                value={form.hospitalName}
                onChange={handleChange}
                placeholder="Enter hospital / medical institution"
              />
              {renderError("hospitalName")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="hospitalLocation">
                Hospital Location <span>*</span>
              </label>
              <input
                id="hospitalLocation"
                name="hospitalLocation"
                type="text"
                value={form.hospitalLocation}
                onChange={handleChange}
                placeholder="Enter hospital location"
              />
              {renderError("hospitalLocation")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="hospitalStatus">
                Hospital Status <span>*</span>
              </label>

              <select
                id="hospitalStatus"
                name="hospitalStatus"
                value={form.hospitalStatus}
                onChange={handleChange}
              >
                <option value="">Select hospital status</option>
                <option value="Government">Government Hospital</option>
                <option value="Recognized">
                  Recognized / Empanelled Hospital
                </option>
                <option value="Other">Other</option>
              </select>

              {renderError("hospitalStatus")}
            </div>

            <div className="medical-form-field medical-form-field-full">
              <label htmlFor="proposedTreatment">
                Proposed Treatment / Procedure <span>*</span>
              </label>

              <textarea
                id="proposedTreatment"
                name="proposedTreatment"
                value={form.proposedTreatment}
                onChange={handleChange}
                rows="3"
                placeholder="Describe the proposed treatment or procedure"
              />

              {renderError("proposedTreatment")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="proposedAdmissionDate">
                Proposed Admission Date <span>*</span>
              </label>

              <input
                id="proposedAdmissionDate"
                name="proposedAdmissionDate"
                type="date"
                value={form.proposedAdmissionDate}
                onChange={handleChange}
              />

              {renderError("proposedAdmissionDate")}
            </div>

            <div className="medical-form-field medical-form-field-full">
              <label htmlFor="diagnosis">
                Diagnosis / Illness <span>*</span>
              </label>

              <textarea
                id="diagnosis"
                name="diagnosis"
                value={form.diagnosis}
                onChange={handleChange}
                rows="3"
                placeholder="Enter diagnosis / illness"
              />

              {renderError("diagnosis")}
            </div>
          </div>
        </section>

        {/* ============================================================
            4. MEDICAL ADVANCE REQUIREMENT
        ============================================================ */}
        <section className="medical-advance-section">
          <div className="medical-advance-section-header">
            <h2>4. Medical Advance Requirement</h2>
            <p>
              Enter the estimated eligible expenses and the advance required.
            </p>
          </div>

          <div className="medical-advance-grid">
            <div className="medical-form-field">
              <label htmlFor="estimatedTreatmentExpense">
                Estimated Treatment / Hospital Expense <span>*</span>
              </label>

              <div className="medical-amount-input">
                <span>₹</span>
                <input
                  id="estimatedTreatmentExpense"
                  name="estimatedTreatmentExpense"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.estimatedTreatmentExpense}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              {renderError("estimatedTreatmentExpense")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="estimatedMedicineInvestigationExpense">
                Estimated Medicine / Investigation Expense <span>*</span>
              </label>

              <div className="medical-amount-input">
                <span>₹</span>
                <input
                  id="estimatedMedicineInvestigationExpense"
                  name="estimatedMedicineInvestigationExpense"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.estimatedMedicineInvestigationExpense}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              {renderError("estimatedMedicineInvestigationExpense")}
            </div>

            <div className="medical-form-field">
              <label htmlFor="estimatedOtherExpense">
                Estimated Other Eligible Expense
              </label>

              <div className="medical-amount-input">
                <span>₹</span>
                <input
                  id="estimatedOtherExpense"
                  name="estimatedOtherExpense"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.estimatedOtherExpense}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div className="medical-advance-summary">
            <div>
              <span>Total Estimated Expense</span>
              <strong>₹ {totalEstimatedExpense.toFixed(2)}</strong>
            </div>

            <div className="medical-form-field">
              <label htmlFor="advanceAmountRequested">
                Medical Advance Amount Requested <span>*</span>
              </label>

              <div className="medical-amount-input">
                <span>₹</span>
                <input
                  id="advanceAmountRequested"
                  name="advanceAmountRequested"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.advanceAmountRequested}
                  onChange={handleChange}
                  placeholder="0.00"
                />
              </div>

              {renderError("advanceAmountRequested")}
            </div>
          </div>
        </section>

        {/* ============================================================
            5. SUPPORTING DOCUMENTS
        ============================================================ */}
        <section className="medical-advance-section">
          <div className="medical-advance-section-header">
            <h2>5. Supporting Documents</h2>
            <p>Upload documents supporting the medical advance request.</p>
          </div>

          <div className="medical-document-grid">
            <div className="medical-document-field">
              <label htmlFor="medicalOfficerCertificate">
                Medical Officer / Specialist Certificate <span>*</span>
              </label>

              <input
                id="medicalOfficerCertificate"
                name="medicalOfficerCertificate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />

              <small>Accepted formats: PDF, JPG, JPEG, PNG</small>

              {form.medicalOfficerCertificate && (
                <span className="medical-selected-file">
                  {form.medicalOfficerCertificate.name}
                </span>
              )}

              {renderError("medicalOfficerCertificate")}
            </div>

            <div className="medical-document-field">
              <label htmlFor="medicalHospitalEstimate">
                Medical / Hospital Cost Estimate <span>*</span>
              </label>

              <input
                id="medicalHospitalEstimate"
                name="medicalHospitalEstimate"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />

              <small>Accepted formats: PDF, JPG, JPEG, PNG</small>

              {form.medicalHospitalEstimate && (
                <span className="medical-selected-file">
                  {form.medicalHospitalEstimate.name}
                </span>
              )}

              {renderError("medicalHospitalEstimate")}
            </div>

            <div className="medical-document-field">
              <label htmlFor="otherSupportingDocuments">
                Other Supporting Documents
              </label>

              <input
                id="otherSupportingDocuments"
                name="otherSupportingDocuments"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />

              <small>Optional • PDF, JPG, JPEG, PNG</small>

              {form.otherSupportingDocuments && (
                <span className="medical-selected-file">
                  {form.otherSupportingDocuments.name}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ============================================================
            6. REMARKS
        ============================================================ */}
        <section className="medical-advance-section">
          <div className="medical-advance-section-header">
            <h2>6. Remarks</h2>
            <p>Add any additional information if required.</p>
          </div>

          <div className="medical-form-field medical-form-field-full">
            <textarea
              id="remarks"
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows="4"
              placeholder="Enter any additional remarks"
            />
          </div>
        </section>

        {/* ============================================================
            7. DECLARATION
        ============================================================ */}
        <section className="medical-advance-section">
          <div className="medical-advance-section-header">
            <h2>7. Declaration</h2>
          </div>

          <label className="medical-consent">
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
              I hereby declare that the information provided and the documents
              uploaded by me are true and genuine.
            </span>
          </label>

          {renderError("consentAccepted")}
        </section>

        {/* ============================================================
            8. ACTIONS
        ============================================================ */}
        <div className="medical-advance-actions">
          <button
            type="button"
            className="medical-secondary-button"
            onClick={handleReset}
          >
            Reset
          </button>

          <button
            type="button"
            className="medical-secondary-button"
            onClick={() => {
              console.log("Medical Advance draft:", form);
            }}
          >
            Save Draft
          </button>

          <button type="submit" className="medical-primary-button">
            Submit Medical Advance
          </button>
        </div>
      </form>
    </div>
  );
}

export default MedicalAdvancePage;