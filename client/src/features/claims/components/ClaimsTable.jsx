import { ArrowRight, CalendarDays, Eye, FileText } from "lucide-react";
import ClaimStatusBadge from "./ClaimStatusBadge";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatAmount(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "INR 0.00";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function shortenClaimId(id) {
  if (!id) return "-";

  const value = String(id);

  if (value.length <= 14) {
    return value;
  }

  return `${value.slice(0, 6)}...${value.slice(-5)}`;
}

function ClaimsTable({ claims = [], onViewClaim }) {
  if (claims.length === 0) {
    return (
      <div className="claims-empty-state">
        <div className="claims-empty-icon">
          <FileText size={24} strokeWidth={1.8} />
        </div>

        <h3>No claims found</h3>

        <p>
          There are no claims matching the current filters.
        </p>
      </div>
    );
  }

  return (
    <div className="claims-table-wrapper">
      <div className="claims-table-scroll">
        <table className="claims-table">
          <thead>
            <tr>
              <th>Claim ID</th>
              <th>Type</th>
              <th>Journey</th>
              <th>Travel Dates</th>
              <th>Net Amount</th>
              <th>Status</th>
              <th className="claims-table-action-column">Action</th>
            </tr>
          </thead>

          <tbody>
            {claims.map((claim) => (
              <tr key={claim.id}>
                <td>
                  <div className="claims-id-cell">
                    <span className="claims-id-icon">
                      <FileText size={15} strokeWidth={1.8} />
                    </span>

                    <span
                      className="claims-id-value"
                      title={claim.id}
                    >
                      {shortenClaimId(claim.id)}
                    </span>
                  </div>
                </td>

                <td>
                  <span className="claims-type-badge">
                    TA
                  </span>
                </td>

                <td>
                  <div className="claims-journey">
                    <span>{claim.fromPlace || "-"}</span>

                    {claim.fromPlace && claim.toPlace && (
                      <ArrowRight
                        size={14}
                        strokeWidth={1.8}
                      />
                    )}

                    <span>{claim.toPlace || "-"}</span>
                  </div>
                </td>

                <td>
                  <div className="claims-date-cell">
                    <CalendarDays
                      size={15}
                      strokeWidth={1.8}
                    />

                    <span>
                      {formatDate(claim.fromDate)}
                      {" - "}
                      {formatDate(claim.toDate)}
                    </span>
                  </div>
                </td>

                <td>
                  <strong className="claims-amount">
                    {formatAmount(claim.netAmount)}
                  </strong>
                </td>

                <td>
                  <ClaimStatusBadge status={claim.status} />
                </td>

                <td className="claims-table-action-column">
                  <button
                    type="button"
                    className="claims-view-button"
                    onClick={() => onViewClaim?.(claim)}
                    aria-label={`View claim ${claim.id}`}
                  >
                    <Eye size={16} strokeWidth={1.9} />
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="claims-table-footer">
        <span>
          Showing {claims.length}{" "}
          {claims.length === 1 ? "claim" : "claims"}
        </span>
      </div>
    </div>
  );
}

export default ClaimsTable;