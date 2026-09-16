const STATUS_CONFIG = {
  draft: {
    label: "Draft",
    className: "claim-status-draft",
  },
  submitted: {
    label: "Submitted",
    className: "claim-status-submitted",
  },
  verified: {
    label: "Verified",
    className: "claim-status-verified",
  },
  approved: {
    label: "Approved",
    className: "claim-status-approved",
  },
  rejected: {
    label: "Rejected",
    className: "claim-status-rejected",
  },
  paid: {
    label: "Paid",
    className: "claim-status-paid",
  },
};

function ClaimStatusBadge({ status }) {
  const normalizedStatus = String(status || "").toLowerCase();

  const config = STATUS_CONFIG[normalizedStatus] || {
    label: status || "Unknown",
    className: "claim-status-unknown",
  };

  return (
    <span className={`claim-status-badge ${config.className}`}>
      <span className="claim-status-dot" />
      {config.label}
    </span>
  );
}

export default ClaimStatusBadge;