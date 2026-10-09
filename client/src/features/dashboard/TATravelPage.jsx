import React, { useState } from "react";
import { Plus, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import CreateClaimModal from "./CreateClaimModal";

export default function TATravelPage({ currentUser }) {
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claims, setClaims] = useState([]);

  // Get MongoDB Employee _id safely
  const employeeId =
    currentUser?.employee?._id ||
    currentUser?.employeeId?._id ||
    currentUser?.employeeId ||
    currentUser?._id ||
    null;

  const handleSuccess = (claim) => {
    setClaims((prev) => [claim, ...prev]);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
      case "paid":
        return <CheckCircle size={16} />;
      case "rejected":
        return <XCircle size={16} />;
      default:
        return <Clock size={16} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "approved":
        return "ta-status approved";
      case "paid":
        return "ta-status paid";
      case "rejected":
        return "ta-status rejected";
      case "submitted":
        return "ta-status submitted";
      default:
        return "ta-status draft";
    }
  };

  return (
    <div className="ta-page">

      {/* Header */}
      <div className="ta-header">
        <div>
          <div className="ta-breadcrumb">
            Workspace <span>›</span> TA & Travel
          </div>

          <h1>TA & Travel</h1>

          <p>
            Manage and review your travel allowance claims.
          </p>
        </div>

        <button
          className="ta-new-button"
          onClick={() => setShowClaimModal(true)}
        >
          <Plus size={18} />
          New TA Claim
        </button>
      </div>

      {/* Employee information */}
      <div className="ta-info-card">
        <div className="ta-info-item">
          <span>Employee</span>
          <strong>
            {currentUser?.name ||
              currentUser?.fullName ||
              currentUser?.employee?.name ||
              "Employee"}
          </strong>
        </div>

        <div className="ta-info-item">
          <span>Employee ID</span>
          <strong>
            {currentUser?.employee?.employeeId ||
              currentUser?.employeeId ||
              "—"}
          </strong>
        </div>

        <div className="ta-info-item">
          <span>Designation</span>
          <strong>
            {currentUser?.employee?.designation ||
              currentUser?.designation ||
              "—"}
          </strong>
        </div>

        <div className="ta-info-item">
          <span>Department</span>
          <strong>
            {currentUser?.employee?.department ||
              currentUser?.department ||
              "—"}
          </strong>
        </div>
      </div>

      {/* Actions */}
      <div className="ta-actions">
        <div className="ta-action-card">
          <FileText size={22} />
          <div>
            <strong>New Travel Claim</strong>
            <p>Submit expenses for an official journey.</p>
          </div>

          <button onClick={() => setShowClaimModal(true)}>
            Create
          </button>
        </div>
      </div>

      {/* Claims */}
      <div className="ta-claims-card">

        <div className="ta-section-header">
          <div>
            <h2>My TA Claims</h2>
            <p>Track your submitted travel claims.</p>
          </div>

          <span className="ta-count">
            {claims.length}
          </span>
        </div>

        {claims.length === 0 ? (
          <div className="ta-empty">
            <FileText size={42} />

            <h3>No TA claims yet</h3>

            <p>
              You haven't submitted any travel claims.
            </p>

            <button
              onClick={() => setShowClaimModal(true)}
              className="ta-empty-button"
            >
              <Plus size={17} />
              Submit your first claim
            </button>
          </div>
        ) : (
          <div className="ta-table-wrapper">
            <table className="ta-table">
              <thead>
                <tr>
                  <th>Journey</th>
                  <th>Purpose</th>
                  <th>Gross Amount</th>
                  <th>Net Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {claims.map((claim) => (
                  <tr key={claim._id}>
                    <td>
                      <strong>
                        {claim.departurePlace || claim.fromPlace || "—"}
                      </strong>

                      <span className="journey-arrow"> → </span>

                      <strong>
                        {claim.arrivalPlace || claim.toPlace || "—"}
                      </strong>
                    </td>

                    <td>
                      {claim.purposeOfJourney || "Official Travel"}
                    </td>

                    <td>
                      ₹{Number(claim.grossAmount || 0).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <strong>
                        ₹{Number(claim.netAmount || 0).toLocaleString("en-IN")}
                      </strong>
                    </td>

                    <td>
                      <span className={getStatusClass(claim.status)}>
                        {getStatusIcon(claim.status)}
                        {claim.status || "draft"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      <CreateClaimModal
        isOpen={showClaimModal}
        onClose={() => setShowClaimModal(false)}
        employeeId={employeeId}
        onSuccess={handleSuccess}
      />

      {/* Page styles */}
      <style>{`
        .ta-page {
          padding: 28px 38px;
          background: #f7f9fc;
          min-height: calc(100vh - 80px);
        }

        .ta-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 24px;
        }

        .ta-breadcrumb {
          font-size: 13px;
          color: #8993a4;
          margin-bottom: 12px;
        }

        .ta-breadcrumb span {
          margin: 0 8px;
        }

        .ta-header h1 {
          margin: 0;
          color: #182230;
          font-size: 32px;
          font-weight: 700;
        }

        .ta-header p {
          margin: 8px 0 0;
          color: #8993a4;
          font-size: 14px;
        }

        .ta-new-button {
          border: none;
          background: #1769aa;
          color: white;
          border-radius: 8px;
          padding: 11px 17px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          font-weight: 600;
        }

        .ta-new-button:hover {
          opacity: 0.92;
        }

        .ta-info-card {
          background: white;
          border: 1px solid #e5eaf0;
          border-radius: 12px;
          padding: 20px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 20px;
        }

        .ta-info-item {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .ta-info-item span {
          color: #8b95a5;
          font-size: 12px;
        }

        .ta-info-item strong {
          color: #202b38;
          font-size: 14px;
        }

        .ta-actions {
          margin-bottom: 20px;
        }

        .ta-action-card {
          background: white;
          border: 1px solid #e5eaf0;
          border-radius: 12px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 14px;
          color: #1769aa;
        }

        .ta-action-card div {
          flex: 1;
        }

        .ta-action-card strong {
          display: block;
          color: #202b38;
          margin-bottom: 4px;
        }

        .ta-action-card p {
          margin: 0;
          color: #8b95a5;
          font-size: 13px;
        }

        .ta-action-card button {
          border: 1px solid #1769aa;
          background: white;
          color: #1769aa;
          padding: 8px 15px;
          border-radius: 7px;
          cursor: pointer;
          font-weight: 600;
        }

        .ta-claims-card {
          background: white;
          border: 1px solid #e5eaf0;
          border-radius: 12px;
          overflow: hidden;
        }

        .ta-section-header {
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #edf0f3;
        }

        .ta-section-header h2 {
          margin: 0;
          font-size: 18px;
          color: #202b38;
        }

        .ta-section-header p {
          margin: 5px 0 0;
          color: #8b95a5;
          font-size: 13px;
        }

        .ta-count {
          background: #eef5fc;
          color: #1769aa;
          border-radius: 20px;
          padding: 5px 11px;
          font-size: 12px;
          font-weight: 600;
        }

        .ta-empty {
          text-align: center;
          padding: 60px 20px;
          color: #9aa4b2;
        }

        .ta-empty h3 {
          color: #263241;
          margin: 14px 0 5px;
        }

        .ta-empty p {
          margin: 0 0 18px;
          font-size: 14px;
        }

        .ta-empty-button {
          border: none;
          background: #1769aa;
          color: white;
          border-radius: 7px;
          padding: 9px 15px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .ta-table-wrapper {
          overflow-x: auto;
        }

        .ta-table {
          width: 100%;
          border-collapse: collapse;
        }

        .ta-table th {
          text-align: left;
          padding: 13px 18px;
          background: #fafbfc;
          color: #7b8695;
          font-size: 12px;
          font-weight: 600;
        }

        .ta-table td {
          padding: 16px 18px;
          border-top: 1px solid #edf0f3;
          color: #384454;
          font-size: 13px;
        }

        .journey-arrow {
          color: #9ba5b1;
          margin: 0 4px;
        }

        .ta-status {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: capitalize;
        }

        .ta-status.draft {
          background: #f1f3f5;
          color: #697586;
        }

        .ta-status.submitted {
          background: #fff7df;
          color: #996c00;
        }

        .ta-status.approved {
          background: #e8f7ee;
          color: #198754;
        }

        .ta-status.paid {
          background: #e8f1ff;
          color: #1769aa;
        }

        .ta-status.rejected {
          background: #fdecec;
          color: #c0392b;
        }

        @media (max-width: 900px) {
          .ta-info-card {
            grid-template-columns: repeat(2, 1fr);
          }

          .ta-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 15px;
          }
        }
      `}</style>
    </div>
  );
}