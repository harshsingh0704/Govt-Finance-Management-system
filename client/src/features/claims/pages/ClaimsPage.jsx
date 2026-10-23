
import { useCallback, useEffect, useMemo, useState } from "react";
import "../claims.css";
import {
  AlertCircle,
  FileText,
  Plus,
  RefreshCw,
  Clock3,
  CheckCircle2,
} from "lucide-react";
import { useSelector } from "react-redux";


import { getTAClaims } from "../claims.api";
import ClaimsSummary from "../components/ClaimsSummary";
import ClaimFilters from "../components/ClaimFilters";
import ClaimsTable from "../components/ClaimsTable";
import ClaimDetailsModal from "../components/ClaimDetailsModal";

function normalizeTAClaim(claim) {
  return {
    id: claim?._id || claim?.id,
    type: "TA",
    submittedAt: claim?.createdAt,
    amount: Number(claim?.netAmount ?? claim?.grossAmount) || 0,
    status: String(claim?.status || "pending").toLowerCase(),
    fromPlace: claim?.fromPlace || "",
    toPlace: claim?.toPlace || "",
    fromDate: claim?.fromDate || null,
    toDate: claim?.toDate || null,
    modeOfTravel:
      claim?.modeOfTravel || claim?.publicTransportation || "",
    fare: Number(claim?.fare) || 0,
    roadMileage: Number(claim?.roadMileage) || 0,
    dailyAllowance: Number(claim?.dailyAllowance) || 0,
    accommodationCharges: Number(claim?.accommodationCharges) || 0,
    grossAmount: Number(claim?.grossAmount) || 0,
    advanceAdjusted: Number(claim?.advanceAdjusted) || 0,
    remarks: claim?.remarks || "",
    documents: Array.isArray(claim?.documents) ? claim.documents : [],
    raw: claim,
  };
}

function getId(value) {
  if (!value) return null;

  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);

  if (typeof value === "object") {
    const id = value._id ?? value.id ?? value.employeeId;
    if (typeof id === "string" || typeof id === "number") {
      return String(id);
    }
  }

  return null;
}

function getEmployeeId(user) {
  if (!user) return null;

  // Prefer the actual employee profile ID, not the login user's ID.
  const candidates = [
    user.employeeId,
    user.employee?._id,
    user.employee?.id,
    user.employee,
    user.employeeProfileId,
    user.employeeProfile?._id,
    user.employeeProfile?.id,
    user.profile?.employeeId,
  ];

  for (const candidate of candidates) {
    const id = getId(candidate);
    if (id) return id;
  }

  return null;
}

function getClaimCategory(claim) {
  const status = String(claim?.status || "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");

  const approvedStatuses = [
    "approved",
    "sanctioned",
    "paid",
    "payment_completed",
    "completed",
  ];

  const rejectedStatuses = [
    "rejected",
    "declined",
    "cancelled",
    "canceled",
  ];

  if (approvedStatuses.includes(status)) return "approved";
  if (rejectedStatuses.includes(status)) return "other";

  // Submitted, pending, draft, and under-review claims remain pending.
  return "pending";
}

function ClaimSection({
  title,
  description,
  icon: Icon,
  claims,
  onViewClaim,
  loading,
  variant,
}) {
  return (
    <section className="claims-content-card">
      <div className="claims-content-header">
        <div>
          <h2
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
            }}
          >
            <Icon
              size={21}
              color={variant === "approved" ? "#15803d" : "#b7791f"}
            />
            {title}
          </h2>
          <p>{description}</p>
        </div>

        <span className="claims-count">{claims.length} claims</span>
      </div>

      {loading ? (
        <div className="claims-loading-state">
          <div className="claims-loading-spinner" />
          <h3>Loading claims</h3>
          <p>Please wait while we fetch your claim information.</p>
        </div>
      ) : (
        <ClaimsTable claims={claims} onViewClaim={onViewClaim} />
      )}
    </section>
  );
}

function ClaimsPage() {
  const user = useSelector((state) => state.auth?.user);

  const [claims, setClaims] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedClaim, setSelectedClaim] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");



const loadClaims = useCallback(
  async ({ showRefreshState = false } = {}) => {
    try {
      setError("");

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await getTAClaims();

      const rawClaims = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.claims)
            ? response.data.claims
            : Array.isArray(response?.claims)
              ? response.claims
              : [];

      setClaims(rawClaims.map(normalizeTAClaim));
    } catch (requestError) {
      console.error("Failed to load claims:", requestError);

      setClaims([]);
      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load your claims. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  },
  []
);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  const filteredClaims = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return claims.filter((claim) => {
      const matchesStatus =
        status === "all" || claim.status === status;

      const searchableText = [
        claim.id,
        claim.fromPlace,
        claim.toPlace,
        claim.modeOfTravel,
        claim.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return (
        matchesStatus &&
        (!searchTerm || searchableText.includes(searchTerm))
      );
    });
  }, [claims, search, status]);

  const pendingClaims = useMemo(
    () =>
      filteredClaims.filter(
        (claim) => getClaimCategory(claim) === "pending",
      ),
    [filteredClaims],
  );

  const approvedClaims = useMemo(
    () =>
      filteredClaims.filter(
        (claim) => getClaimCategory(claim) === "approved",
      ),
    [filteredClaims],
  );

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  const handleSubmitClaim = () => {
    // Connect your existing CreateClaimModal here.
    // Keep the existing submission workflow intact.
  };

  return (
    <main className="claims-page">
      <div className="claims-page-header">
        <div className="claims-page-heading">
          <div className="claims-breadcrumb">
            Workspace / My Claims
          </div>

          <div className="claims-title-row">
            <div className="claims-title-icon">
              <FileText size={22} strokeWidth={1.9} />
            </div>

            <div>
              <h1>My Claims</h1>
              <p>
                View and track your submitted travel allowance claims.
              </p>
            </div>
          </div>
        </div>

        <div className="claims-header-actions">
          <button
            type="button"
            className="claims-refresh-button"
            onClick={() => loadClaims({ showRefreshState: true })}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={16}
              className={
                refreshing ? "claims-refresh-spinning" : ""
              }
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="claims-submit-button"
            onClick={handleSubmitClaim}
          >
            <Plus size={17} />
            Submit New Claim
          </button>
        </div>
      </div>

      {error && (
        <div className="claims-error-state" role="alert">
          <AlertCircle size={19} />

          <div>
            <strong>Unable to load claims</strong>
            <p>{error}</p>
          </div>

          <button type="button" onClick={() => loadClaims()}>
            Try again
          </button>
        </div>
      )}

      {!error && (
        <>
          <ClaimsSummary claims={claims} />

          <section className="claims-content-card">
            <div className="claims-content-header">
              <div>
                <h2>Search & Filter</h2>
                <p>Find your claims by destination or status.</p>
              </div>
            </div>

            <ClaimFilters
              search={search}
              status={status}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onClear={handleClearFilters}
            />
          </section>

          <ClaimSection
            title="Pending Claims"
            description="Claims awaiting approval or further processing."
            icon={Clock3}
            claims={pendingClaims}
            onViewClaim={setSelectedClaim}
            loading={loading}
            variant="pending"
          />

          <ClaimSection
            title="Approved Claims"
            description="Claims approved, sanctioned, or marked as paid."
            icon={CheckCircle2}
            claims={approvedClaims}
            onViewClaim={setSelectedClaim}
            loading={loading}
            variant="approved"
          />
        </>
      )}

      <ClaimDetailsModal
        claim={selectedClaim}
        onClose={() => setSelectedClaim(null)}
      />
    </main>
  );
}

export default ClaimsPage;