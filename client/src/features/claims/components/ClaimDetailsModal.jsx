import {
  X,
  CalendarDays,
  MapPin,
  IndianRupee,
  FileText,
  TrainFront,
  MessageSquare,
} from "lucide-react";
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

function DetailItem({ label, value, icon: Icon }) {
  return (
    <div className="claim-detail-item">
      <div className="claim-detail-item-label">
        {Icon && <Icon size={15} strokeWidth={1.8} />}
        <span>{label}</span>
      </div>

      <strong className="claim-detail-item-value">
        {value || "-"}
      </strong>
    </div>
  );
}

function ClaimDetailsModal({ claim, onClose }) {
  if (!claim) {
    return null;
  }

  const documents = Array.isArray(claim.documents)
    ? claim.documents
    : [];

  return (
    <div
      className="claim-details-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <div
        className="claim-details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-details-title"
      >
        <header className="claim-details-header">
          <div>
            <div className="claim-details-eyebrow">
              TA Claim
            </div>

            <h2 id="claim-details-title">
              Claim Details
            </h2>

            <p className="claim-details-id">
              {claim.id || "-"}
            </p>
          </div>

          <button
            type="button"
            className="claim-details-close"
            onClick={onClose}
            aria-label="Close claim details"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </header>

        <div className="claim-details-body">
          <div className="claim-details-status-row">
            <span className="claim-details-status-label">
              Current status
            </span>

            <ClaimStatusBadge status={claim.status} />
          </div>

          <section className="claim-details-section">
            <div className="claim-details-section-heading">
              <MapPin size={18} strokeWidth={1.8} />
              <h3>Journey Information</h3>
            </div>

            <div className="claim-details-grid">
              <DetailItem
                label="From"
                value={claim.fromPlace}
              />

              <DetailItem
                label="To"
                value={claim.toPlace}
              />

              <DetailItem
                label="From Date"
                value={formatDate(claim.fromDate)}
                icon={CalendarDays}
              />

              <DetailItem
                label="To Date"
                value={formatDate(claim.toDate)}
                icon={CalendarDays}
              />

              <DetailItem
                label="Mode of Travel"
                value={claim.modeOfTravel}
                icon={TrainFront}
              />
            </div>
          </section>

          <section className="claim-details-section">
            <div className="claim-details-section-heading">
              <IndianRupee size={18} strokeWidth={1.8} />
              <h3>Amount Breakdown</h3>
            </div>

            <div className="claim-details-amount-grid">
              <DetailItem
                label="Fare"
                value={formatAmount(claim.fare)}
              />

              <DetailItem
                label="Road Mileage"
                value={formatAmount(claim.roadMileage)}
              />

              <DetailItem
                label="Daily Allowance"
                value={formatAmount(claim.dailyAllowance)}
              />

              <DetailItem
                label="Accommodation"
                value={formatAmount(claim.accommodationCharges)}
              />

              <DetailItem
                label="Gross Amount"
                value={formatAmount(claim.grossAmount)}
              />

              <DetailItem
                label="Advance Adjusted"
                value={formatAmount(claim.advanceAdjusted)}
              />
            </div>

            <div className="claim-details-net-amount">
              <span>Net Claim Amount</span>

              <strong>
                {formatAmount(claim.netAmount)}
              </strong>
            </div>
          </section>

          <section className="claim-details-section">
            <div className="claim-details-section-heading">
              <MessageSquare size={18} strokeWidth={1.8} />
              <h3>Remarks</h3>
            </div>

            <p className="claim-details-remarks">
              {claim.remarks || "No remarks have been added."}
            </p>
          </section>

          <section className="claim-details-section">
            <div className="claim-details-section-heading">
              <FileText size={18} strokeWidth={1.8} />
              <h3>Documents</h3>
            </div>

            {documents.length > 0 ? (
              <div className="claim-details-documents">
                {documents.map((document, index) => (
                  <div
                    className="claim-details-document"
                    key={`${document}-${index}`}
                  >
                    <FileText
                      size={16}
                      strokeWidth={1.8}
                    />

                    <span>{document}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="claim-details-remarks">
                No documents attached to this claim.
              </p>
            )}
          </section>
        </div>

        <footer className="claim-details-footer">
          <button
            type="button"
            className="claim-details-close-button"
            onClick={onClose}
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}

export default ClaimDetailsModal;