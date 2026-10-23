
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Plus,
  Search,
  IndianRupee,
  Plane,
  CalendarDays,
  X,
} from "lucide-react";
import { useSelector } from "react-redux";


import { getTAClaims } from "../../claims/claims.api";
import apiClient from "../../../services/api/axios";
import "./EmployeeClaimsPage.css";

function readStoredUser() {
  if (typeof window === "undefined") return {};

  for (const key of ["fms_auth", "user", "authUser", "currentUser"]) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;

      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return parsed.user || parsed.employee || parsed;
      }
    } catch {
      // Try the next storage key.
    }
  }

  return {};
}

function getId(value) {
  if (!value) return "";
  if (typeof value === "object") {
    return String(value._id || value.id || value.employeeId || "");
  }
  return String(value).trim();
}

function getEmployeeId(user) {
  if (!user) return "";

  const candidates = [
    user.employeeId,
    user.employee?._id,
    user.employee?.id,
    user.employee?.employeeId,
    user.employeeProfile?._id,
    user.employeeProfile?.id,
    user.employeeProfile?.employeeId,
    user.profile?.employeeId,
    user.profile?._id,
  ];

  for (const value of candidates) {
    const id = getId(value);
    if (id) return id;
  }

  return "";
}

function unwrapClaims(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.claims)) return data.claims;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  if (Array.isArray(data?.items)) return data.items;

  return [];
}

function getStatus(claim) {
  return String(
    claim?.status ||
      claim?.claimStatus ||
      claim?.approvalStatus ||
      claim?.workflowStatus ||
      "Pending"
  )
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

function isApproved(claim) {
  return [
    "approved",
    "sanctioned",
    "paid",
    "completed",
    "processed",
    "payment_completed",
    "payment_done",
  ].includes(getStatus(claim));
}

function isRejected(claim) {
  return ["rejected", "declined", "cancelled", "canceled"].includes(
    getStatus(claim)
  );
}

function getType(claim, fallback = "TA") {
  return String(
    claim?.claimType ||
      claim?.type ||
      claim?.claimCategory ||
      claim?.category ||
      fallback
  ).toUpperCase();
}

function getAmount(claim) {
  const values = [
    claim?.netAmount,
    claim?.amount,
    claim?.claimAmount,
    claim?.fareClaimed,
    claim?.grossAmount,
    claim?.totalAmount,
    claim?.fare,
  ];

  for (const value of values) {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      Number.isFinite(Number(value))
    ) {
      return Number(value);
    }
  }

  return 0;
}

function getDate(claim) {
  const value =
    claim?.createdAt ||
    claim?.submittedAt ||
    claim?.claimDate ||
    claim?.fromDate ||
    claim?.date;

  if (!value) return "Date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getReference(claim) {
  return (
    claim?.claimNumber ||
    claim?.referenceNumber ||
    claim?.claimId ||
    claim?._id ||
    claim?.id ||
    "Claim"
  );
}

function getTitle(claim, type) {
  return (
    claim?.projectName ||
    claim?.destination ||
    claim?.toPlace ||
    claim?.homeTown ||
    claim?.purpose ||
    `${type} Travel Claim`
  );
}

function StatusBadge({ claim }) {
  const approved = isApproved(claim);
  const rejected = isRejected(claim);
  const status = getStatus(claim);

  const className = approved
    ? "ec-status ec-status-approved"
    : rejected
      ? "ec-status ec-status-rejected"
      : "ec-status ec-status-pending";

  const label = status
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());

  return (
    <span className={className}>
      {approved ? (
        <CheckCircle2 size={14} />
      ) : (
        <Clock3 size={14} />
      )}
      {label}
    </span>
  );
}

function ClaimSection({ title, claims, type, emptyText }) {
  const approved = type === "approved";

  return (
    <section className="ec-section">
      <div className="ec-section-header">
        <h2 className="ec-section-title">
          <span
            className={`ec-section-icon ${
              approved ? "ec-icon-approved" : "ec-icon-pending"
            }`}
          >
            {approved ? (
              <CheckCircle2 size={19} />
            ) : (
              <Clock3 size={19} />
            )}
          </span>
          {title}
          <span className="ec-count">{claims.length}</span>
        </h2>
      </div>

      {claims.length === 0 ? (
        <div className="ec-empty">
          <div className="ec-empty-icon">
            <FileText size={25} />
          </div>
          <h3>No claims found</h3>
          <p>{emptyText}</p>
        </div>
      ) : (
        <div className="ec-claim-list">
          {claims.map((claim, index) => {
            const claimType = getType(claim);
            const amount = getAmount(claim);
            const key = String(
              claim?._id || claim?.id || `${claimType}-${index}`
            );

            return (
              <article className="ec-claim-row" key={key}>
                <div className="ec-claim-main">
                  <div className="ec-claim-type-icon">
                    {claimType === "LTC" ? (
                      <Plane size={21} />
                    ) : (
                      <FileText size={21} />
                    )}
                  </div>

                  <div className="ec-claim-info">
                    <h3>{getTitle(claim, claimType)}</h3>

                    <div className="ec-claim-meta">
                      <span>{claimType} Claim</span>
                      <span className="ec-meta-dot">•</span>
                      <span>
                        Ref: {String(getReference(claim)).slice(-12)}
                      </span>
                      <span className="ec-meta-dot">•</span>
                      <span className="ec-date">
                        <CalendarDays size={13} />
                        {getDate(claim)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="ec-claim-right">
                  <div className="ec-claim-amount">
                    <strong>
                      ₹
                      {amount.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })}
                    </strong>
                    <span>Claim amount</span>
                  </div>

                  <StatusBadge claim={claim} />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default function EmployeeClaimsPage() {
  const auth = useSelector((state) => state.auth || {});
  const reduxUser = useSelector(
    (state) =>
      state.auth?.user ||
      state.auth?.currentUser ||
      state.auth?.employee ||
      state.user?.user ||
      state.user?.currentUser ||
      null
  );

  const [storedUser] = useState(readStoredUser);

  const employeeId = useMemo(
    () =>
      getEmployeeId(reduxUser) ||
      getEmployeeId(storedUser) ||
      getEmployeeId(auth.user) ||
      getEmployeeId(auth.currentUser) ||
      getEmployeeId(auth.employee),
    [reduxUser, storedUser, auth]
  );

  const [taClaims, setTaClaims] = useState([]);
  const [ltcClaims, setLtcClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [warning, setWarning] = useState("");
  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadClaims = useCallback(
    async (showLoader = true) => {
      if (!employeeId) {
        setLoading(false);
        setRefreshing(false);
        setError(
          "Your employee profile identifier is not available. Sign in again or ask the administrator to link your login account to your employee profile."
        );
        return;
      }

      if (showLoader) setLoading(true);
      else setRefreshing(true);

      setError("");
      setWarning("");

      const results = await Promise.allSettled([
        getTAClaims(employeeId),
        apiClient.get(`/ltc/claims/${employeeId}`),
      ]);

      const errors = [];

      if (results[0].status === "fulfilled") {
        setTaClaims(unwrapClaims(results[0].value));
      } else {
        setTaClaims([]);
        errors.push(
          results[0].reason?.response?.data?.message ||
            results[0].reason?.message ||
            "TA claims could not be loaded."
        );
      }

      if (results[1].status === "fulfilled") {
        setLtcClaims(unwrapClaims(results[1].value));
      } else {
        setLtcClaims([]);
        errors.push(
          results[1].reason?.response?.data?.message ||
            results[1].reason?.message ||
            "LTC claims could not be loaded."
        );
      }

      if (errors.length === 2) {
        setError(
          "Claims could not be loaded. Check that the TA and LTC GET routes exist on the server and that your login session is valid."
        );
      } else if (errors.length === 1) {
        setWarning(errors[0]);
      }

      setLoading(false);
      setRefreshing(false);
    },
    [employeeId]
  );

  useEffect(() => {
    loadClaims(true);
  }, [loadClaims]);

  const allClaims = useMemo(() => {
    const ta = taClaims.map((claim) => ({
      ...claim,
      claimType: getType(claim, "TA"),
    }));

    const ltc = ltcClaims.map((claim) => ({
      ...claim,
      claimType: getType(claim, "LTC"),
    }));

    const seen = new Set();

    return [...ta, ...ltc].filter((claim) => {
      const key = String(claim._id || claim.id || getReference(claim));

      if (seen.has(key)) return false;

      seen.add(key);
      return true;
    });
  }, [taClaims, ltcClaims]);

  const searchedClaims = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allClaims;

    return allClaims.filter((claim) => {
      const searchable = [
        getReference(claim),
        getTitle(claim, getType(claim)),
        getType(claim),
        claim.status,
        claim.claimStatus,
        claim.destination,
        claim.toPlace,
        claim.projectName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [allClaims, search]);

  const pendingClaims = searchedClaims.filter(
    (claim) => !isApproved(claim) && !isRejected(claim)
  );

  const approvedClaims = searchedClaims.filter(isApproved);
  const rejectedClaims = searchedClaims.filter(isRejected);

  const totalAmount = allClaims.reduce(
    (sum, claim) => sum + getAmount(claim),
    0
  );

  const approvedAmount = allClaims
    .filter(isApproved)
    .reduce((sum, claim) => sum + getAmount(claim), 0);

  const handleClaimSubmitted = () => {
    setShowCreateModal(false);
    loadClaims(false);
  };

  return (
    <main className="ec-page">
      <div className="ec-container">
        <header className="ec-header">
          <div>
            <p className="ec-eyebrow">Employee Portal / Finance</p>
            <h1>My Claims</h1>
            <p className="ec-subtitle">
              Track your travel and leave travel concession claims in one place.
            </p>
          </div>

          <div className="ec-header-actions">
            <button
              className="ec-button ec-button-secondary"
              onClick={() => loadClaims(false)}
              disabled={loading || refreshing}
              type="button"
            >
              <RefreshCw
                size={16}
                className={refreshing ? "ec-spin" : ""}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>

            <button
              className="ec-button ec-button-primary"
              onClick={() => setShowCreateModal(true)}
              disabled={!employeeId}
              title={!employeeId ? "Employee profile ID is required" : ""}
              type="button"
            >
              <Plus size={17} />
              Submit New Claim
            </button>
          </div>
        </header>

        {error && (
          <div className="ec-alert ec-alert-error" role="alert">
            <AlertCircle size={19} />
            <div>
              <strong>Unable to load your claims</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        {warning && !error && (
          <div className="ec-alert ec-alert-warning" role="status">
            <AlertCircle size={19} />
            <div>
              <strong>Some claims may be missing</strong>
              <p>{warning}</p>
            </div>
          </div>
        )}

        <section className="ec-stats">
          <div className="ec-stat-card">
            <div className="ec-stat-top">
              <span>Total Claims</span>
              <div className="ec-stat-icon ec-blue">
                <FileText size={21} />
              </div>
            </div>
            <strong>{loading ? "—" : allClaims.length}</strong>
            <p>All submitted claims</p>
          </div>

          <div className="ec-stat-card">
            <div className="ec-stat-top">
              <span>Pending Review</span>
              <div className="ec-stat-icon ec-orange">
                <Clock3 size={21} />
              </div>
            </div>
            <strong>
              {loading
                ? "—"
                : allClaims.filter(
                    (claim) => !isApproved(claim) && !isRejected(claim)
                  ).length}
            </strong>
            <p>Awaiting a decision</p>
          </div>

          <div className="ec-stat-card">
            <div className="ec-stat-top">
              <span>Approved Claims</span>
              <div className="ec-stat-icon ec-green">
                <CheckCircle2 size={21} />
              </div>
            </div>
            <strong>
              {loading ? "—" : allClaims.filter(isApproved).length}
            </strong>
            <p>Approved, sanctioned or paid</p>
          </div>

          <div className="ec-stat-card">
            <div className="ec-stat-top">
              <span>Total Claim Value</span>
              <div className="ec-stat-icon ec-purple">
                <IndianRupee size={21} />
              </div>
            </div>
            <strong className="ec-stat-money">
              {loading
                ? "—"
                : `₹${totalAmount.toLocaleString("en-IN", {
                    maximumFractionDigits: 0,
                  })}`}
            </strong>
            <p>
              Approved value: ₹
              {approvedAmount.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </p>
          </div>
        </section>

        <div className="ec-overview-header">
          <div>
            <h2>Claim Overview</h2>
            <p>View the latest status of your submitted claims.</p>
          </div>

          <label className="ec-search">
            <Search size={17} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search claims..."
              aria-label="Search claims"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </label>
        </div>

        {loading ? (
          <div className="ec-loading">
            <RefreshCw size={24} className="ec-spin" />
            <p>Loading your claims...</p>
          </div>
        ) : (
          <>
            <ClaimSection
              title="Pending Claims"
              claims={pendingClaims}
              type="pending"
              emptyText="Claims awaiting review will appear here."
            />

            <ClaimSection
              title="Approved Claims"
              claims={approvedClaims}
              type="approved"
              emptyText="Once your claims are approved, they will appear here."
            />

            {rejectedClaims.length > 0 && (
              <ClaimSection
                title="Rejected Claims"
                claims={rejectedClaims}
                type="pending"
                emptyText="No rejected claims."
              />
            )}
          </>
        )}

        <footer className="ec-footer">
          <AlertCircle size={14} />
          Claim statuses reflect the information returned by the FMS server.
        </footer>
      </div>

     
    </main>
  );
}
