import {
  ClipboardList,
  Clock3,
  CircleCheck,
  Banknote,
} from "lucide-react";

function ClaimsSummary({ claims = [] }) {
  const totalClaims = claims.length;

  const pendingClaims = claims.filter((claim) =>
    ["submitted", "verified"].includes(
      String(claim.status || "").toLowerCase(),
    ),
  ).length;

  const approvedClaims = claims.filter(
    (claim) => String(claim.status || "").toLowerCase() === "approved",
  ).length;

  const paidClaims = claims.filter(
    (claim) => String(claim.status || "").toLowerCase() === "paid",
  ).length;

  const summaryItems = [
    {
      label: "Total Claims",
      value: totalClaims,
      icon: ClipboardList,
      tone: "blue",
    },
    {
      label: "Pending",
      value: pendingClaims,
      icon: Clock3,
      tone: "amber",
    },
    {
      label: "Approved",
      value: approvedClaims,
      icon: CircleCheck,
      tone: "green",
    },
    {
      label: "Paid",
      value: paidClaims,
      icon: Banknote,
      tone: "navy",
    },
  ];

  return (
    <section className="claims-summary" aria-label="Claims summary">
      {summaryItems.map((item) => {
        const Icon = item.icon;

        return (
          <article
            key={item.label}
            className={`claims-summary-card claims-summary-${item.tone}`}
          >
            <div className="claims-summary-icon">
              <Icon size={20} strokeWidth={2} />
            </div>

            <div className="claims-summary-content">
              <span className="claims-summary-label">{item.label}</span>
              <strong className="claims-summary-value">{item.value}</strong>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default ClaimsSummary;