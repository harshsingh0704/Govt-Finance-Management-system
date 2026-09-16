import { useEffect, useMemo, useState } from "react";
import "../claims.css";
import { AlertCircle, FileText, Plus, RefreshCw } from "lucide-react";
import { useSelector } from "react-redux";

import { getTAClaims } from "../claims.api";
import ClaimsSummary from "../components/ClaimsSummary";
import ClaimFilters from "../components/ClaimFilters";
import ClaimsTable from "../components/ClaimsTable";
import ClaimDetailsModal from "../components/ClaimDetailsModal";

function normalizeTAClaim(claim) {
  return {
    id: claim?._id,
    type: "TA",
    submittedAt: claim?.createdAt,
    amount: Number(claim?.netAmount) || 0,
    status: claim?.status || "draft",
    fromPlace: claim?.fromPlace || "",
    toPlace: claim?.toPlace || "",
    fromDate: claim?.fromDate || null,
    toDate: claim?.toDate || null,
    modeOfTravel: claim?.modeOfTravel || "",
    fare: Number(claim?.fare) || 0,
    roadMileage: Number(claim?.roadMileage) || 0,
    dailyAllowance: Number(claim?.dailyAllowance) || 0,
    accommodationCharges:
      Number(claim?.accommodationCharges) || 0,
    grossAmount: Number(claim?.grossAmount) || 0,
    advanceAdjusted: Number(claim?.advanceAdjusted) || 0,
    remarks: claim?.remarks || "",
    documents: Array.isArray(claim?.documents)
      ? claim.documents
      : [],
    raw: claim,
  };
}

function getEmployeeId(user) {
  if (!user) {
    return null;
  }

  return (
    user.employeeId ||
    user.employee?._id ||
    user.employee?._id?.toString?.() ||
    null
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

  const employeeId = getEmployeeId(user);

  const loadClaims = async ({ showRefreshState = false } = {}) => {
    if (!employeeId) {
      setClaims([]);
      setLoading(false);
      setRefreshing(false);
      setError(
        "Your employee profile identifier is not available. Please contact the administrator.",
      );
      return;
    }

    try {
      setError("");

      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getTAClaims(employeeId);

      const rawClaims = Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data?.claims)
            ? data.claims
            : [];

      const normalizedClaims = rawClaims.map(normalizeTAClaim);

      setClaims(normalizedClaims);
    } catch (requestError) {
      setClaims([]);

      setError(
        requestError?.response?.data?.message ||
          requestError?.response?.data?.error ||
          requestError?.message ||
          "Unable to load your claims right now.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadClaims();
  }, [employeeId]);

  const filteredClaims = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();

    return claims.filter((claim) => {
      const matchesStatus =
        status === "all" ||
        String(claim.status).toLowerCase() === status;

      if (!matchesStatus) {
        return false;
      }

      if (!searchTerm) {
        return true;
      }

      const searchableText = [
        claim.id,
        claim.fromPlace,
        claim.toPlace,
        claim.modeOfTravel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchTerm);
    });
  }, [claims, search, status]);

  const handleClearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  const handleSubmitClaim = () => {
    // The existing CreateClaimModal will be connected here
    // after the Claims page foundation is verified.
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
              strokeWidth={1.9}
              className={refreshing ? "claims-refresh-spinning" : ""}
            />

            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

          <button
            type="button"
            className="claims-submit-button"
            onClick={handleSubmitClaim}
          >
            <Plus size={17} strokeWidth={2} />
            Submit New Claim
          </button>
        </div>
      </div>

      {error && (
        <div className="claims-error-state" role="alert">
          <AlertCircle size={19} strokeWidth={1.9} />

          <div>
            <strong>Unable to load claims</strong>
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={() => loadClaims()}
          >
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
                <h2>Claim History</h2>

                <p>
                  Your travel allowance claim submissions and current
                  processing status.
                </p>
              </div>

              <span className="claims-count">
                {filteredClaims.length}{" "}
                {filteredClaims.length === 1
                  ? "claim"
                  : "claims"}
              </span>
            </div>

            <ClaimFilters
              search={search}
              status={status}
              onSearchChange={setSearch}
              onStatusChange={setStatus}
              onClear={handleClearFilters}
            />

            {loading ? (
              <div className="claims-loading-state">
                <div className="claims-loading-spinner" />

                <h3>Loading your claims</h3>

                <p>
                  Fetching the latest claim information.
                </p>
              </div>
            ) : (
              <ClaimsTable
                claims={filteredClaims}
                onViewClaim={setSelectedClaim}
              />
            )}
          </section>
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