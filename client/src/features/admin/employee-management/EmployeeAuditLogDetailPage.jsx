import PageHeader from "../../../components/auth/common/PageHeader";
import { useMemo } from "react";

import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  AUDIT_EVENTS,
} from "./EmployeeAuditLogPage";

import "./EmployeeAuditLogDetailPage.css";

function EmployeeAuditLogDetailPage() {
  const navigate = useNavigate();
  const { auditId } = useParams();

  const event = useMemo(
    () => AUDIT_EVENTS.find((item) => item.id === auditId),
    [auditId]
  );

  if (!event) {
    return (
      <div className="employee-audit-detail-page">
        <div className="employee-audit-detail-not-found">
          <ClipboardList size={42} />

          <h1>Audit Event Not Found</h1>

          <p>
            The requested audit event does not exist or is no longer
            available.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate("/admin/employee-management/audit-log")
            }
          >
            <ArrowLeft size={17} />
            Back to Audit Log
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="employee-audit-detail-page">
        <h1 style={{ color: "red" }}>TEST - DETAIL PAGE UPDATED</h1>
      <div className="employee-audit-detail-topbar">
        <button
          type="button"
          className="employee-audit-detail-back"
          onClick={() =>
            navigate("/admin/employee-management/audit-log")
          }
        >
          <ArrowLeft size={18} />
          Back to Audit Log
        </button>

        <div className="employee-audit-detail-readonly">
          <ShieldCheck size={17} />
          Read only
        </div>
      </div>
     <p style={{ color: "red", fontSize: 20 }}>
  PAGE HEADER TEST
</p>
   <PageHeader
  icon={<ClipboardList size={25} />}
  title={event.action}
  description={`Audit Event Details • Audit ID: ${event.id}`}
  showBack={true}
/>
      <section className="employee-audit-detail-card">
        <div className="employee-audit-detail-card-header">
          <div>
            <h2>Event Summary</h2>
            <p>Recorded information for this administrative event.</p>
          </div>

          <div className="employee-audit-detail-success">
            <CheckCircle2 size={17} />
            {event.status}
          </div>
        </div>

        <div className="employee-audit-detail-info-grid">
          <div className="employee-audit-detail-info-item">
            <span>Employee</span>

            <strong>
              {event.employeeId} — {event.employeeName}
            </strong>
          </div>

          <div className="employee-audit-detail-info-item">
            <span>Module</span>
            <strong>{event.module}</strong>
          </div>

          <div className="employee-audit-detail-info-item">
            <span>Performed By</span>

            <strong className="employee-audit-detail-with-icon">
              <UserRound size={17} />
              {event.performedBy}
            </strong>
          </div>

          <div className="employee-audit-detail-info-item">
            <span>Date</span>

            <strong className="employee-audit-detail-with-icon">
              <CalendarDays size={17} />
              {event.date}
            </strong>
          </div>

          <div className="employee-audit-detail-info-item">
            <span>Time</span>
            <strong>{event.time}</strong>
          </div>

          <div className="employee-audit-detail-info-item">
            <span>Action</span>
            <strong>{event.action}</strong>
          </div>
        </div>
      </section>

      <section className="employee-audit-detail-card">
        <div className="employee-audit-detail-card-header">
          <div>
            <h2>Recorded Changes</h2>
            <p>
              Previous and updated values recorded for this audit event.
            </p>
          </div>
        </div>

        <div className="employee-audit-change-table-wrapper">
          <table className="employee-audit-change-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Previous Value</th>
                <th>Updated Value</th>
              </tr>
            </thead>

            <tbody>
              {event.changes.map((change) => (
                <tr key={change.field}>
                  <td>
                    <strong>{change.field}</strong>
                  </td>

                  <td>
                    <span className="employee-audit-change-before">
                      {change.before}
                    </span>
                  </td>

                  <td>
                    <span className="employee-audit-change-after">
                      {change.after}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="employee-audit-detail-notice">
        <ShieldCheck size={20} />

        <div>
          <strong>Audit Record Protection</strong>
          <p>
            This audit record is read only. Historical audit information
            cannot be edited or deleted from the employee management
            interface.
          </p>
        </div>
      </div>
    </div>
  );
}

export default EmployeeAuditLogDetailPage;
