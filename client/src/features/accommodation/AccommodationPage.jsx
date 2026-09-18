import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Home, RotateCcw, Save } from "lucide-react";
import "./AccommodationPage.css";

const INITIAL_FORM = {
  employeeNumber: "",
  employeeName: "",
  instituteJoiningDate: "",
  officeAccommodation: "",
  requestDate: "",
  approvalDate: "",
  occupancyDate: "",
  quartersType: "",
};

function getToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "—";

  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

export default function AccommodationPage() {
  const today = useMemo(() => getToday(), []);
  const [form, setForm] = useState(INITIAL_FORM);
  const [records, setRecords] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSubmitted(false);

    setForm((current) => {
      const next = {
        ...current,
        [name]: value,
      };

      // Approval cannot remain before a newly selected request date.
      if (name === "requestDate") {
        if (next.approvalDate && next.approvalDate < value) {
          next.approvalDate = "";
          next.occupancyDate = "";
        }

        if (next.occupancyDate && next.occupancyDate < value) {
          next.occupancyDate = "";
        }
      }

      // Occupancy cannot remain before a newly selected approval date.
      if (name === "approvalDate") {
        if (next.occupancyDate && next.occupancyDate < value) {
          next.occupancyDate = "";
        }
      }

      return next;
    });
  };

  const resetForm = () => {
    setForm(INITIAL_FORM);
    setSubmitted(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (form.requestDate < today) {
      return;
    }

    if (form.approvalDate < form.requestDate) {
      return;
    }

    if (form.occupancyDate < form.approvalDate) {
      return;
    }

    const newRecord = {
      id: `${Date.now()}`,
      slNo: records.length + 1,
      ...form,
    };

    setRecords((current) => [...current, newRecord]);
    setForm(INITIAL_FORM);
    setSubmitted(true);
  };

  return (
    <div className="accommodation-page">
      <section className="accommodation-header">
        <div>
          <div className="accommodation-breadcrumb">
            Services <span>/</span> Accommodation
          </div>

          <div className="accommodation-title-row">
            <div className="accommodation-title-icon">
              <Home size={22} />
            </div>

            <div>
              <h1>Accommodation</h1>
              <p>
                Manage employee office accommodation requests, approvals and
                occupancy details.
              </p>
            </div>
          </div>
        </div>

        <div className="accommodation-date-indicator">
          <CalendarDays size={17} />
          <span>Current date</span>
          <strong>{formatDate(today)}</strong>
        </div>
      </section>

      {submitted && (
        <div className="accommodation-success" role="status">
          <CheckCircle2 size={19} />
          <div>
            <strong>Accommodation record saved</strong>
            <span>
              The record has been added to the current frontend session.
            </span>
          </div>
        </div>
      )}

      <section className="accommodation-card">
        <div className="accommodation-card-header">
          <div>
            <span className="accommodation-eyebrow">Accommodation request</span>
            <h2>Employee Accommodation Details</h2>
            <p>
              Enter the employee and accommodation information below. Dates
              follow the required approval sequence.
            </p>
          </div>

          <span className="accommodation-required-note">
            <span>*</span> Required fields
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="accommodation-section">
            <div className="accommodation-section-heading">
              <span>01</span>
              <div>
                <h3>Employee Information</h3>
                <p>Identify the employee requesting accommodation.</p>
              </div>
            </div>

            <div className="accommodation-form-grid">
              <div className="accommodation-field">
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
                  required
                />
              </div>

              <div className="accommodation-field">
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
                  required
                />
              </div>

              <div className="accommodation-field">
                <label htmlFor="instituteJoiningDate">
                  Institute Joining Date <span>*</span>
                </label>
                <input
                  id="instituteJoiningDate"
                  name="instituteJoiningDate"
                  type="date"
                  value={form.instituteJoiningDate}
                  onChange={handleChange}
                  required
                />
                <small>
                  Historical employee information; no current-date restriction.
                </small>
              </div>
            </div>
          </div>

          <div className="accommodation-section">
            <div className="accommodation-section-heading">
              <span>02</span>
              <div>
                <h3>Accommodation Requirement</h3>
                <p>Record whether office accommodation is being requested.</p>
              </div>
            </div>

            <div className="accommodation-form-grid">
              <div className="accommodation-field">
                <label htmlFor="officeAccommodation">
                  Office Accommodation <span>*</span>
                </label>
                <select
                  id="officeAccommodation"
                  name="officeAccommodation"
                  value={form.officeAccommodation}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select option</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>

              <div className="accommodation-field">
                <label htmlFor="quartersType">
                  Quarters Type <span>*</span>
                </label>
                <select
                  id="quartersType"
                  name="quartersType"
                  value={form.quartersType}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select quarters type</option>
                  <option value="Type 1">Type 1</option>
                  <option value="Type 2">Type 2</option>
                  <option value="Type 3">Type 3</option>
                  <option value="Type 4">Type 4</option>
                </select>
              </div>
            </div>
          </div>

          <div className="accommodation-section">
            <div className="accommodation-section-heading">
              <span>03</span>
              <div>
                <h3>Accommodation Timeline</h3>
                <p>
                  Dates must follow the sequence Request → Approval →
                  Occupancy.
                </p>
              </div>
            </div>

            <div className="accommodation-date-grid">
              <div className="accommodation-field">
                <label htmlFor="requestDate">
                  Request Date <span>*</span>
                </label>
                <input
                  id="requestDate"
                  name="requestDate"
                  type="date"
                  value={form.requestDate}
                  min={today}
                  onChange={handleChange}
                  required
                />
                <small>Today or a future date only.</small>
              </div>

              <div className="accommodation-field">
                <label htmlFor="approvalDate">
                  Approval Date <span>*</span>
                </label>
                <input
                  id="approvalDate"
                  name="approvalDate"
                  type="date"
                  value={form.approvalDate}
                  min={form.requestDate || today}
                  onChange={handleChange}
                  disabled={!form.requestDate}
                  required
                />
                <small>
                  Cannot be earlier than the Request Date.
                </small>
              </div>

              <div className="accommodation-field">
                <label htmlFor="occupancyDate">
                  Occupancy Date <span>*</span>
                </label>
                <input
                  id="occupancyDate"
                  name="occupancyDate"
                  type="date"
                  value={form.occupancyDate}
                  min={form.approvalDate || form.requestDate || today}
                  onChange={handleChange}
                  disabled={!form.approvalDate}
                  required
                />
                <small>
                  Cannot be earlier than the Approval Date.
                </small>
              </div>
            </div>
          </div>

          <div className="accommodation-form-footer">
            <div className="accommodation-form-note">
              <span>!</span>
              <p>
                Request Date starts from today. Approval and Occupancy dates
                automatically follow the selected timeline.
              </p>
            </div>

            <div className="accommodation-actions">
              <button
                type="button"
                className="accommodation-secondary-button"
                onClick={resetForm}
              >
                <RotateCcw size={17} />
                Reset
              </button>

              <button
                type="submit"
                className="accommodation-primary-button"
              >
                <Save size={17} />
                Save Accommodation Record
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="accommodation-card accommodation-records-card">
        <div className="accommodation-card-header compact">
          <div>
            <span className="accommodation-eyebrow">Records</span>
            <h2>Accommodation Records</h2>
            <p>
              Records created during the current frontend session appear here.
            </p>
          </div>

          <span className="accommodation-record-count">
            {records.length} {records.length === 1 ? "Record" : "Records"}
          </span>
        </div>

        {records.length === 0 ? (
          <div className="accommodation-empty-state">
            <Home size={25} />
            <strong>No accommodation records yet</strong>
            <span>
              Complete the form above to add the first accommodation record.
            </span>
          </div>
        ) : (
          <div className="accommodation-table-wrapper">
            <table className="accommodation-table">
              <thead>
                <tr>
                  <th>Sl No</th>
                  <th>Employee Number</th>
                  <th>Employee Name</th>
                  <th>Joining Date</th>
                  <th>Accommodation</th>
                  <th>Request Date</th>
                  <th>Approval Date</th>
                  <th>Occupancy Date</th>
                  <th>Quarters Type</th>
                </tr>
              </thead>

              <tbody>
                {records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.slNo}</td>
                    <td>
                      <strong>{record.employeeNumber}</strong>
                    </td>
                    <td>{record.employeeName}</td>
                    <td>{formatDate(record.instituteJoiningDate)}</td>
                    <td>
                      <span
                        className={`accommodation-status ${
                          record.officeAccommodation === "Yes"
                            ? "yes"
                            : "no"
                        }`}
                      >
                        {record.officeAccommodation}
                      </span>
                    </td>
                    <td>{formatDate(record.requestDate)}</td>
                    <td>{formatDate(record.approvalDate)}</td>
                    <td>{formatDate(record.occupancyDate)}</td>
                    <td>{record.quartersType}</td>
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
