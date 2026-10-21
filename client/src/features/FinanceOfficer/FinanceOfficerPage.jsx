
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Activity, Bell, BarChart3, Check, CheckCircle2, ChevronLeft,
  ChevronRight, Clock, ClipboardCheck, Download, ExternalLink,
  FileCheck2, FileText, FolderOpen, LayoutDashboard, LogOut, Menu,
  RefreshCw, Search, Settings, ShieldCheck, Users, Wallet, X, XCircle,
} from "lucide-react";
import { logout } from "../auth/authSlice";
import "../admin/AdminPage.css";
import "./FinanceOfficerPage.css";

const API_BASE = "http://localhost:5000/api/ta";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Claims Approval", icon: ClipboardCheck },
  { label: "Financial Verification", icon: Wallet },
  { label: "Employees", icon: Users },
  { label: "Reports", icon: BarChart3 },
  { label: "Notifications", icon: Bell },
  { label: "My Settings", icon: Settings },
];

const getToken = () => {
  try {
    return (
      JSON.parse(localStorage.getItem("fms_auth") || "{}").token ||
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      ""
    );
  } catch {
    return localStorage.getItem("token") || localStorage.getItem("authToken") || "";
  }
};

const pick = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== "");

const idOf = (claim) => String(claim?._id || claim?.id || "");

const employeeOf = (claim) =>
  claim?.employeeId && typeof claim.employeeId === "object"
    ? claim.employeeId
    : claim?.employee && typeof claim.employee === "object"
      ? claim.employee
      : claim?.employeeDetails || {};

const employeeName = (claim) =>
  pick(
    claim?.employeeName,
    employeeOf(claim)?.fullName,
    employeeOf(claim)?.name,
    employeeOf(claim)?.employeeName,
    "Employee details unavailable"
  );

const employeeCode = (claim) =>
  pick(
    claim?.employeeCode,
    claim?.employeeNumber,
    employeeOf(claim)?.employeeCode,
    employeeOf(claim)?.employeeId,
    "Not available"
  );

const amountOf = (claim) =>
  pick(
    claim?.netAmount,
    claim?.totalClaim,
    claim?.totalAmount,
    claim?.claimAmount,
    claim?.grossAmount,
    claim?.amount,
    null
  );

const formatAmount = (value) => {
  if (value === undefined || value === null || value === "") {
    return "Not available";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      })
    : "Not available";
};

const formatDate = (value) => {
  if (!value) return "Not available";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Not available"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const initials = (value) =>
  String(value || "NA")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const routeOf = (claim) => {
  const from = pick(
    claim?.fromPlace,
    claim?.fromLocation,
    claim?.from,
    claim?.journeyFrom
  );

  const to = pick(
    claim?.toPlace,
    claim?.toLocation,
    claim?.to,
    claim?.journeyTo
  );

  return pick(claim?.journey, from && to ? `${from} → ${to}` : null, "Not provided");
};

const documentsOf = (claim) => {
  const docs = pick(
    claim?.documents,
    claim?.supportingDocuments,
    claim?.attachments,
    claim?.uploadedDocuments,
    []
  );

  return Array.isArray(docs) ? docs : [];
};

const historyOf = (claim) => {
  const history = pick(
    claim?.approvalHistory,
    claim?.approvalStages,
    claim?.history,
    []
  );

  return Array.isArray(history) ? history : [];
};

const statusLabel = (value) =>
  String(value || "UNKNOWN").replaceAll("_", " ");

function DetailField({ label, value }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="fo-detail-field">
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}

export default function FinanceOfficerPage() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState("claim");
  const [remarks, setRemarks] = useState("");
  const [busyId, setBusyId] = useState("");

  const displayName = pick(
    user?.fullName,
    user?.name,
    user?.employeeName,
    "Finance Officer"
  );

  const employeeId = pick(
    user?.employeeId,
    user?.employee_id,
    user?.empId,
    "Not available"
  );

  /*
   * IMPORTANT:
   * This uses the existing pending-claims endpoint as a starting point.
   * It filters for PENDING_FINANCE_OFFICER, which must match your backend's
   * actual Finance Officer stage status.
   */
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      const response = await axios.get(`${API_BASE}/claims/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = response.data;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.claims)
          ? payload.claims
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      setClaims(
        list.filter(
          (claim) =>
            String(claim?.status || "").toUpperCase() ===
            "PENDING_FINANCE_OFFICER"
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load Finance Officer claims."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "Claims Approval") {
      fetchClaims();
    }
  }, [activeSection, fetchClaims]);

  const filteredClaims = claims.filter((claim) => {
    const text = [
      idOf(claim),
      employeeName(claim),
      employeeCode(claim),
      routeOf(claim),
      claim?.claimType,
      claim?.category,
      claim?.purpose,
      claim?.status,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.trim().toLowerCase());
  });

  const selectedClaim =
    claims.find((claim) => idOf(claim) === selectedId) || null;

  function openClaims() {
    setActiveSection("Claims Approval");
    setSelectedId("");
    setActiveTab("claim");
    setSidebarOpen(false);
  }

  async function submitDecision(claim, decision) {
    const id = idOf(claim);
    const reason = remarks.trim();

    if ((decision === "send_back" || decision === "reject") && !reason) {
      setError("Please enter remarks before sending back or rejecting this claim.");
      return;
    }

    const actionText =
      decision === "approve"
        ? "approve"
        : decision === "send_back"
          ? "send back"
          : "reject";

    if (!window.confirm(`Are you sure you want to ${actionText} this claim?`)) {
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      /*
       * Verify this request contract against the Finance Officer backend.
       * Do not use this payload until the controller supports decision/remarks.
       */
      await axios.patch(
        `${API_BASE}/claim/${id}/status`,
        {
          decision,
          remarks: reason,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotice("Claim decision submitted successfully.");
      setSelectedId("");
      setRemarks("");
      await fetchClaims();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit the decision. Check the Finance Officer endpoint and request format."
      );
    } finally {
      setBusyId("");
    }
  }

  function signOut() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  return (
    <div className="ad-shell fo-shell">
      {sidebarOpen && (
        <button
          className="ad-mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ad-brand">
          <div className="ad-brand-mark">FMS</div>
          <div>
            <strong>Government Finance</strong>
            <span>Management System</span>
          </div>
        </div>

        <nav className="ad-nav">
          <span className="ad-nav-label">Finance Workspace</span>

          {navigation.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`ad-nav-item ${activeSection === label ? "active" : ""}`}
              onClick={() => {
                setActiveSection(label);
                setSelectedId("");
                setSidebarOpen(false);
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === "Claims Approval" && claims.length > 0 && (
                <small>{claims.length}</small>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user-mini">
            <div className="ad-avatar">{initials(displayName)}</div>
            <div>
              <strong>{displayName}</strong>
              <span>Finance Officer</span>
              <span>Emp ID: {employeeId}</span>
            </div>
          </div>

          <button className="ad-logout-button" onClick={signOut}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button
              className="ad-menu-button"
              aria-label="Open navigation"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            <label className="ad-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search claims, employees or references..."
              />
              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </div>

          <div className="ad-topbar-right">
            <span className="fo-top-role">
              <ShieldCheck size={16} /> Finance Officer Workspace
            </span>
            <div className="ad-avatar">{initials(displayName)}</div>
          </div>
        </header>

        <div className="ad-content fo-content">
          <section className="ad-page-header fo-page-header">
            <div>
              <span className="ad-eyebrow">
                Finance Operations / {selectedClaim ? "Claim Review" : activeSection}
              </span>

              <h1>
                {selectedClaim
                  ? "Review Claim"
                  : activeSection === "Dashboard"
                    ? "Finance Overview"
                    : activeSection}
              </h1>

              <p className="fo-subtitle">
                {selectedClaim
                  ? `Claim reference ${idOf(selectedClaim)}`
                  : "Verify financial claims forwarded for Finance Officer review."}
              </p>
            </div>

            <div className="fo-header-meta">
              <span>
                Employee ID <strong>{employeeId}</strong>
              </span>
              <span>
                Financial Year <strong>2026–2027</strong>
              </span>
            </div>
          </section>

          {error && (
            <div className="fo-message error" role="alert">
              <XCircle size={17} />
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={15} />
              </button>
            </div>
          )}

          {notice && (
            <div className="fo-message success" role="status">
              <CheckCircle2 size={17} />
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss message">
                <X size={15} />
              </button>
            </div>
          )}

          {selectedClaim ? (
            <section className="fo-review-page">
              <button
                className="fo-back"
                onClick={() => {
                  setSelectedId("");
                  setRemarks("");
                }}
              >
                <ChevronLeft size={17} /> Back to pending claims
              </button>

              <div className="fo-review-hero">
                <div className="fo-person-avatar">
                  {initials(employeeName(selectedClaim))}
                </div>

                <div className="fo-review-title">
                  <span className="fo-kicker">FINANCIAL VERIFICATION</span>
                  <h2>{employeeName(selectedClaim)}</h2>
                  <p>
                    {idOf(selectedClaim)} ·{" "}
                    {pick(
                      selectedClaim.claimType,
                      selectedClaim.type,
                      selectedClaim.category,
                      "Claim"
                    )}
                  </p>
                </div>

                <span className="fo-status pending">
                  <i /> {statusLabel(selectedClaim.status)}
                </span>
              </div>

              <div className="fo-metrics">
                <div>
                  <span>Claim amount</span>
                  <strong>{formatAmount(amountOf(selectedClaim))}</strong>
                </div>
                <div>
                  <span>Submitted on</span>
                  <strong>
                    {formatDate(
                      pick(selectedClaim.submittedAt, selectedClaim.createdAt)
                    )}
                  </strong>
                </div>
                <div>
                  <span>Current stage</span>
                  <strong>{pick(selectedClaim.currentStage, "Finance Officer")}</strong>
                </div>
              </div>

              <div className="fo-tabs" role="tablist" aria-label="Claim details">
                {[
                  ["claim", "Claim details"],
                  ["employee", "Employee"],
                  ["documents", "Documents"],
                  ["history", "Approval history"],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    role="tab"
                    aria-selected={activeTab === value}
                    className={activeTab === value ? "active" : ""}
                    onClick={() => setActiveTab(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="fo-detail-content">
                {activeTab === "claim" && (
                  <>
                    <h3>
                      <FileText size={18} /> Claim information
                    </h3>

                    <div className="fo-detail-grid">
                      <DetailField label="Claim reference" value={idOf(selectedClaim)} />
                      <DetailField
                        label="Claim type"
                        value={pick(selectedClaim.claimType, selectedClaim.type)}
                      />
                      <DetailField label="Category" value={selectedClaim.category} />
                      <DetailField
                        label="Purpose"
                        value={pick(
                          selectedClaim.purpose,
                          selectedClaim.purposeOfJourney,
                          selectedClaim.travelPurpose,
                          selectedClaim.justification
                        )}
                      />
                      <DetailField label="Journey" value={routeOf(selectedClaim)} />
                      <DetailField
                        label="From date"
                        value={formatDate(
                          pick(
                            selectedClaim.fromDate,
                            selectedClaim.travelStartDate,
                            selectedClaim.startDate
                          )
                        )}
                      />
                      <DetailField
                        label="To date"
                        value={formatDate(
                          pick(
                            selectedClaim.toDate,
                            selectedClaim.travelEndDate,
                            selectedClaim.endDate
                          )
                        )}
                      />
                      <DetailField
                        label="Financial year"
                        value={selectedClaim.financialYear}
                      />
                      <DetailField
                        label="Claimed amount"
                        value={formatAmount(amountOf(selectedClaim))}
                      />
                      <DetailField
                        label="Employee remarks"
                        value={pick(
                          selectedClaim.employeeRemarks,
                          selectedClaim.remarks,
                          selectedClaim.justification
                        )}
                      />
                    </div>

                    <h3 className="fo-subsection-title">
                      <Wallet size={18} /> Financial breakdown
                    </h3>

                    <div className="fo-detail-grid">
                      <DetailField
                        label="Travel expenses"
                        value={formatAmount(selectedClaim.travelExpenses)}
                      />
                      <DetailField
                        label="Daily allowance"
                        value={formatAmount(selectedClaim.dailyAllowance)}
                      />
                      <DetailField
                        label="Accommodation"
                        value={formatAmount(selectedClaim.accommodation)}
                      />
                      <DetailField
                        label="Other expenses"
                        value={formatAmount(selectedClaim.otherExpenses)}
                      />
                      <DetailField
                        label="Deductions"
                        value={formatAmount(selectedClaim.deductions)}
                      />
                    </div>
                  </>
                )}

                {activeTab === "employee" && (
                  <>
                    <h3>
                      <Users size={18} /> Employee information
                    </h3>

                    <div className="fo-detail-grid">
                      <DetailField label="Employee name" value={employeeName(selectedClaim)} />
                      <DetailField label="Employee ID" value={employeeCode(selectedClaim)} />
                      <DetailField
                        label="Designation"
                        value={pick(
                          employeeOf(selectedClaim).designation,
                          selectedClaim.designation
                        )}
                      />
                      <DetailField
                        label="Department"
                        value={pick(
                          employeeOf(selectedClaim).department,
                          selectedClaim.departmentName,
                          selectedClaim.department
                        )}
                      />
                      <DetailField
                        label="Office"
                        value={pick(
                          employeeOf(selectedClaim).office,
                          selectedClaim.officeName,
                          selectedClaim.office
                        )}
                      />
                      <DetailField
                        label="Email"
                        value={pick(
                          employeeOf(selectedClaim).email,
                          selectedClaim.email
                        )}
                      />
                      <DetailField
                        label="Contact"
                        value={pick(
                          employeeOf(selectedClaim).phone,
                          employeeOf(selectedClaim).mobile,
                          selectedClaim.phone
                        )}
                      />
                    </div>
                  </>
                )}

                {activeTab === "documents" && (
                  <>
                    <h3>
                      <FolderOpen size={18} /> Supporting documents
                    </h3>

                    {documentsOf(selectedClaim).length ? (
                      <div className="fo-document-list">
                        {documentsOf(selectedClaim).map((doc, index) => {
                          const url =
                            typeof doc === "string"
                              ? doc
                              : pick(
                                  doc.url,
                                  doc.fileUrl,
                                  doc.path,
                                  doc.downloadUrl
                                );

                          const title =
                            typeof doc === "string"
                              ? doc.split("/").pop()
                              : pick(
                                  doc.name,
                                  doc.fileName,
                                  doc.originalName,
                                  `Document ${index + 1}`
                                );

                          return (
                            <div className="fo-document" key={`${title}-${index}`}>
                              <FileText size={21} />
                              <div>
                                <strong>{title}</strong>
                                <span>
                                  {typeof doc === "object"
                                    ? pick(doc.type, doc.mimeType, "Supporting document")
                                    : "Supporting document"}
                                  {typeof doc === "object" && doc.uploadedAt
                                    ? ` · ${formatDate(doc.uploadedAt)}`
                                    : ""}
                                </span>
                              </div>
                              {url && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Open ${title}`}
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="fo-empty">
                        <FolderOpen size={28} />
                        <strong>No supporting documents</strong>
                        <span>No documents were returned by the claim API.</span>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "history" && (
                  <>
                    <h3>
                      <Clock size={18} /> Approval history
                    </h3>

                    {historyOf(selectedClaim).length ? (
                      <div className="fo-history-list">
                        {historyOf(selectedClaim).map((entry, index) => (
                          <div className="fo-history-item" key={index}>
                            <span className="fo-history-dot" />
                            <div>
                              <strong>
                                {pick(
                                  entry.role,
                                  entry.stage,
                                  entry.approverRole,
                                  "Workflow action"
                                )}
                              </strong>
                              <span>
                                {pick(
                                  entry.action,
                                  entry.decision,
                                  entry.status,
                                  "Update"
                                )}
                              </span>
                              <p>
                                {pick(
                                  entry.remarks,
                                  entry.comments,
                                  entry.note,
                                  ""
                                )}
                              </p>
                              <small>
                                {pick(
                                  entry.reviewerName,
                                  entry.approverName,
                                  entry.name,
                                  ""
                                )}{" "}
                                ·{" "}
                                {formatDate(
                                  pick(
                                    entry.timestamp,
                                    entry.createdAt,
                                    entry.date
                                  )
                                )}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="fo-empty">
                        <Clock size={28} />
                        <strong>No approval history available</strong>
                        <span>The claim API did not return approval history.</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="fo-decision-panel">
                <label htmlFor="fo-remarks">
                  Finance review remarks
                  <span>Required for send back or rejection</span>
                </label>

                <textarea
                  id="fo-remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={3}
                  placeholder="Enter financial verification notes or the reason for returning the claim..."
                />

                <div className="fo-decision-actions">
                  <button
                    className="fo-approve"
                    disabled={Boolean(busyId)}
                    onClick={() => submitDecision(selectedClaim, "approve")}
                  >
                    <Check size={16} /> Approve claim
                  </button>

                  <button
                    className="fo-return"
                    disabled={Boolean(busyId)}
                    onClick={() => submitDecision(selectedClaim, "send_back")}
                  >
                    Send back for correction
                  </button>

                  <button
                    className="fo-reject"
                    disabled={Boolean(busyId)}
                    onClick={() => submitDecision(selectedClaim, "reject")}
                  >
                    <XCircle size={16} /> Reject claim
                  </button>
                </div>
              </div>
            </section>
          ) : activeSection === "Claims Approval" ? (
            <section className="fo-claims-page">
              <div className="fo-claims-heading">
                <div>
                  <span className="fo-kicker">FINANCIAL CONTROL</span>
                  <h2>Claims awaiting financial review</h2>
                  <p>
                    Inspect claims forwarded to Finance Officer before recording
                    your decision.
                  </p>
                </div>

                <button
                  className="fo-refresh"
                  onClick={fetchClaims}
                  disabled={loading}
                >
                  <RefreshCw size={16} /> {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <button
                className="fo-summary-card"
                onClick={() => setSearch("")}
                aria-label={`Show all ${claims.length} pending Finance Officer claims`}
              >
                <span className="fo-summary-icon">
                  <ClipboardCheck size={23} />
                </span>
                <span className="fo-summary-copy">
                  <small>Claims awaiting your review</small>
                  <strong>{loading ? "…" : claims.length}</strong>
                </span>
                <span className="fo-queue-badge">
                  <i /> Finance Officer queue
                </span>
              </button>

              <div className="fo-toolbar">
                <label>
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search employee, claim reference or journey..."
                  />
                </label>
                <span>{filteredClaims.length} claims shown</span>
              </div>

              {loading ? (
                <div className="fo-empty">
                  <span className="fo-spinner" />
                  <strong>Loading financial claims</strong>
                  <span>Retrieving claims assigned to your stage.</span>
                </div>
              ) : filteredClaims.length === 0 ? (
                <div className="fo-empty">
                  <ClipboardCheck size={30} />
                  <strong>{error ? "Unable to load claims" : "No claims awaiting review"}</strong>
                  <span>
                    {error ||
                      "No claims currently match the Finance Officer queue."}
                  </span>
                  {error && (
                    <button className="fo-refresh" onClick={fetchClaims}>
                      Try again
                    </button>
                  )}
                </div>
              ) : (
                <div className="fo-claim-list">
                  {filteredClaims.map((claim) => (
                    <button
                      type="button"
                      className="fo-claim-row"
                      key={idOf(claim)}
                      onClick={() => {
                        setSelectedId(idOf(claim));
                        setActiveTab("claim");
                        setRemarks("");
                        setError("");
                      }}
                    >
                      <span className="fo-person-avatar">
                        {initials(employeeName(claim))}
                      </span>

                      <span className="fo-claim-main">
                        <strong>{employeeName(claim)}</strong>
                        <small>
                          {employeeCode(claim)} · Ref {idOf(claim)}
                        </small>
                        <span>{routeOf(claim)}</span>
                      </span>

                      <span className="fo-claim-type">
                        <small>CLAIM TYPE</small>
                        <strong>
                          {pick(
                            claim.claimType,
                            claim.type,
                            claim.category,
                            "Claim"
                          )}
                        </strong>
                        <small>
                          Submitted{" "}
                          {formatDate(
                            pick(claim.submittedAt, claim.createdAt)
                          )}
                        </small>
                      </span>

                      <span className="fo-claim-money">
                        <small>CLAIM AMOUNT</small>
                        <strong>{formatAmount(amountOf(claim))}</strong>
                        <span className="fo-status pending">
                          {statusLabel(claim.status)}
                        </span>
                      </span>

                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section className="fo-other-section">
              <div className="fo-summary-icon">
                <ShieldCheck size={25} />
              </div>
              <h2>{activeSection}</h2>
              <p>
                This section is part of the Finance Officer workspace. Claim
                approvals are managed in the dedicated financial review queue.
              </p>
              <button className="fo-refresh" onClick={openClaims}>
                Open claim approvals <ChevronRight size={16} />
              </button>
            </section>
          )}

          <footer className="fo-footer">
            <span>Government Finance Management System</span>
            <span>Finance Officer Workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
