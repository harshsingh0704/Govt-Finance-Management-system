
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileCheck2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  Wallet,
  X,
  XCircle,
  ClipboardList,
  Send,
} from "lucide-react";

import { logout } from "../auth/authSlice";
import "../admin/AdminPage.css";
import "./FinanceClerkPage.css";

const API = "http://localhost:5000/api";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Claims Processing", icon: FileText },
  { label: "Pending Sanction", icon: ShieldCheck },
  { label: "Document Management", icon: FolderOpen },
  { label: "Notifications", icon: Bell },
  { label: "My Settings", icon: ClipboardList },
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
    return (
      localStorage.getItem("token") ||
      localStorage.getItem("authToken") ||
      ""
    );
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

const claimAmount = (claim) =>
  pick(
    claim?.totalClaim,
    claim?.totalAmount,
    claim?.claimAmount,
    claim?.amount,
    claim?.netAmount,
    null
  );

const money = (value) => {
  if (value === null || value === undefined || value === "") {
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
  String(value || "FC")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const statusOf = (claim) =>
  String(claim?.status || claim?.currentStage || "UNKNOWN").toUpperCase();

const routeOf = (claim) => {
  const from = pick(
    claim?.fromPlace,
    claim?.from,
    claim?.fromLocation,
    claim?.journeyFrom
  );

  const to = pick(
    claim?.toPlace,
    claim?.to,
    claim?.toLocation,
    claim?.journeyTo
  );

  return pick(
    claim?.journey,
    from && to ? `${from} → ${to}` : null,
    from,
    to,
    "Not provided"
  );
};

const documentsOf = (claim) => {
  const documents = pick(
    claim?.documents,
    claim?.supportingDocuments,
    claim?.attachments,
    claim?.uploadedDocuments,
    []
  );

  return Array.isArray(documents) ? documents : [];
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

const pendingClerkStatuses = [
  "PENDING_FINANCE_CLERK",
  "PENDING_FC",
  "FINANCE_CLERK_PENDING",
  "PENDING_CLERK",
];

const pendingSanctionStatuses = [
  "PENDING_SANCTION",
  "PENDING_FINANCE_OFFICER_SANCTION",
  "PENDING_FO_SANCTION",
  "PENDING_FINAL_SANCTION",
];

function DetailField({ label, value }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="hoo-review-field">
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}

export default function FinanceClerkPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("claim");

  const name = pick(
    user?.fullName,
    user?.name,
    user?.employeeName,
    user?.email?.split("@")[0],
    "Finance Clerk"
  );

  const employeeId = pick(
    user?.employeeId,
    user?.employee_id,
    user?.empId,
    user?.employee?.employeeId,
    "Not available"
  );

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const response = await axios.get(`${API}/ta/claims/pending`, {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      });

      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.claims)
          ? data.claims
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data?.data?.claims)
              ? data.data.claims
              : [];

      setClaims(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load TA claims. Check your backend connection and permissions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const clerkClaims = useMemo(
    () =>
      claims.filter((claim) =>
        pendingClerkStatuses.includes(statusOf(claim))
      ),
    [claims]
  );

  const sanctionClaims = useMemo(
    () =>
      claims.filter((claim) =>
        pendingSanctionStatuses.includes(statusOf(claim))
      ),
    [claims]
  );

  const selectedClaim = claims.find(
    (claim) => idOf(claim) === selectedId
  );

  const activeClaims =
    activeSection === "Pending Sanction"
      ? sanctionClaims
      : clerkClaims;

  const filteredClaims = activeClaims.filter((claim) =>
    [
      idOf(claim),
      employeeName(claim),
      employeeCode(claim),
      routeOf(claim),
      claim.claimType,
      claim.category,
      claim.purpose,
      statusOf(claim),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  function openSection(section) {
    setActiveSection(section);
    setSelectedId("");
    setError("");
    setNotice("");
    setSidebarOpen(false);
  }

  function signOut() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  async function submitClerkApproval(claim) {
    const id = idOf(claim);

    if (!id) {
      setError("This claim has no valid ID.");
      return;
    }

    const confirmed = window.confirm(
      "Confirm that you have processed this TA claim and want to forward it to the Finance Officer for final sanction?"
    );

    if (!confirmed) return;

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const token = getToken();

      await axios.patch(
        `${API}/ta/claim/${id}/status`,
        {
          action: "APPROVED",
          remarks: (remarks[id] || "").trim(),
          stage: "FINANCE_CLERK",
          nextStage: "FINANCE_OFFICER_SANCTION",
        },
        {
          headers: token
            ? { Authorization: `Bearer ${token}` }
            : {},
        }
      );

      setNotice(
        "Claim processing submitted. It should now appear in the Finance Officer's Pending Sanction queue."
      );

      setSelectedId("");

      setRemarks((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });

      await fetchClaims();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process this claim. Check the backend workflow and status endpoint."
      );
    } finally {
      setBusyId("");
    }
  }

  const filteredDashboardClaims = clerkClaims.filter((claim) =>
    [
      idOf(claim),
      employeeName(claim),
      employeeCode(claim),
      routeOf(claim),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <div className="ad-shell fc-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="ad-mobile-overlay fc-overlay"
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

        <nav className="ad-nav" aria-label="Finance Clerk navigation">
          <span className="ad-nav-label">Finance Clerk Workspace</span>

          {navigation.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`ad-nav-item ${
                activeSection === label ? "active" : ""
              }`}
              onClick={() => openSection(label)}
            >
              <Icon size={17} />
              <span>{label}</span>

              {label === "Claims Processing" && clerkClaims.length > 0 && (
                <small>{clerkClaims.length}</small>
              )}

              {label === "Pending Sanction" &&
                sanctionClaims.length > 0 && (
                  <small>{sanctionClaims.length}</small>
                )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user-mini">
            <div className="ad-avatar">{initials(name)}</div>
            <div>
              <strong>{name}</strong>
              <span>Finance Clerk</span>
              <span>Emp ID: {employeeId}</span>
            </div>
          </div>

          <button
            type="button"
            className="ad-logout-button"
            onClick={signOut}
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button
              type="button"
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
                placeholder="Search TA claims, employees or references..."
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
            <span>
              <ShieldCheck size={16} /> Finance Clerk Workspace
            </span>
            <div className="ad-avatar">{initials(name)}</div>
          </div>
        </header>

        <div className="ad-content fc-content">
          <section className="ad-page-header fc-page-header">
            <div>
              <span className="ad-eyebrow">
                Finance / {selectedClaim ? "Claim Review" : activeSection}
              </span>

              <h1>
                {selectedClaim
                  ? "Review TA Claim"
                  : activeSection === "Dashboard"
                    ? "Finance Clerk Dashboard"
                    : activeSection}
              </h1>

              <p className="fc-subtitle">
                {selectedClaim
                  ? `Claim reference: ${idOf(selectedClaim)}`
                  : activeSection === "Pending Sanction"
                    ? "Claims awaiting final sanction belong to the Finance Officer."
                    : "Process TA claims received after Finance Officer approval."}
              </p>
            </div>
          </section>

          {error && (
            <div className="hoo-message error" role="alert">
              <XCircle size={17} />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {notice && (
            <div className="hoo-message success" role="status">
              <CheckCircle2 size={17} />
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {selectedClaim ? (
            <section className="hoo-review-page">
              <button
                type="button"
                className="hoo-back"
                onClick={() => setSelectedId("")}
              >
                <ChevronLeft size={17} />
                Back to claims
              </button>

              <div className="hoo-review-hero">
                <div className="hoo-review-avatar">
                  {initials(employeeName(selectedClaim))}
                </div>

                <div className="hoo-review-title">
                  <span className="hoo-kicker">
                    FINANCE CLERK · TA PROCESSING
                  </span>
                  <h2>{employeeName(selectedClaim)}</h2>
                  <p>
                    {idOf(selectedClaim)} ·{" "}
                    {pick(
                      selectedClaim.claimType,
                      selectedClaim.type,
                      selectedClaim.category,
                      "TA Claim"
                    )}
                  </p>
                </div>

                <span className="hoo-status pending">
                  <i />
                  {statusOf(selectedClaim).replaceAll("_", " ")}
                </span>
              </div>

              <div className="hoo-review-metrics">
                <div>
                  <span>Claim amount</span>
                  <strong>{money(claimAmount(selectedClaim))}</strong>
                </div>
                <div>
                  <span>Submitted on</span>
                  <strong>
                    {formatDate(
                      pick(
                        selectedClaim.submittedAt,
                        selectedClaim.createdAt
                      )
                    )}
                  </strong>
                </div>
                <div>
                  <span>Current stage</span>
                  <strong>
                    {pick(
                      selectedClaim.currentStage,
                      selectedClaim.status,
                      "Finance Clerk"
                    )}
                  </strong>
                </div>
              </div>

              <div className="hoo-review-tabs" role="tablist">
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
                    aria-selected={tab === value}
                    className={tab === value ? "active" : ""}
                    onClick={() => setTab(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="hoo-review-content">
                {tab === "claim" && (
                  <>
                    <h3>
                      <FileText size={18} /> Claim information
                    </h3>

                    <div className="hoo-review-grid">
                      <DetailField
                        label="Claim reference"
                        value={idOf(selectedClaim)}
                      />
                      <DetailField
                        label="Claim type"
                        value={pick(
                          selectedClaim.claimType,
                          selectedClaim.type
                        )}
                      />
                      <DetailField
                        label="Category"
                        value={selectedClaim.category}
                      />
                      <DetailField
                        label="Purpose"
                        value={pick(
                          selectedClaim.purpose,
                          selectedClaim.purposeOfJourney,
                          selectedClaim.travelPurpose
                        )}
                      />
                      <DetailField
                        label="Travel route"
                        value={routeOf(selectedClaim)}
                      />
                      <DetailField
                        label="From date"
                        value={formatDate(
                          pick(
                            selectedClaim.fromDate,
                            selectedClaim.travelStartDate
                          )
                        )}
                      />
                      <DetailField
                        label="To date"
                        value={formatDate(
                          pick(
                            selectedClaim.toDate,
                            selectedClaim.travelEndDate
                          )
                        )}
                      />
                      <DetailField
                        label="Financial year"
                        value={selectedClaim.financialYear}
                      />
                      <DetailField
                        label="Claim amount"
                        value={money(claimAmount(selectedClaim))}
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

                    <h3 className="hoo-review-subtitle">
                      <Wallet size={18} /> Financial breakdown
                    </h3>

                    <div className="hoo-review-grid">
                      <DetailField
                        label="Travel expenses"
                        value={money(selectedClaim.travelExpenses)}
                      />
                      <DetailField
                        label="Daily allowance"
                        value={money(selectedClaim.dailyAllowance)}
                      />
                      <DetailField
                        label="Accommodation"
                        value={money(selectedClaim.accommodation)}
                      />
                      <DetailField
                        label="Other expenses"
                        value={money(selectedClaim.otherExpenses)}
                      />
                      <DetailField
                        label="Deductions"
                        value={money(selectedClaim.deductions)}
                      />
                    </div>
                  </>
                )}

                {tab === "employee" && (
                  <>
                    <h3>
                      <Users size={18} /> Employee information
                    </h3>

                    <div className="hoo-review-grid">
                      <DetailField
                        label="Employee name"
                        value={employeeName(selectedClaim)}
                      />
                      <DetailField
                        label="Employee ID"
                        value={employeeCode(selectedClaim)}
                      />
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

                {tab === "documents" && (
                  <>
                    <h3>
                      <FolderOpen size={18} /> Supporting documents
                    </h3>

                    {documentsOf(selectedClaim).length ? (
                      <div className="hoo-doc-list">
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
                            <div
                              className="hoo-document"
                              key={`${title}-${index}`}
                            >
                              <FileText size={21} />
                              <div>
                                <strong>{title}</strong>
                                <span>
                                  {typeof doc === "object"
                                    ? pick(
                                        doc.type,
                                        doc.mimeType,
                                        "Supporting document"
                                      )
                                    : "Supporting document"}
                                </span>
                              </div>

                              {url && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  Open <ChevronRight size={16} />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="hoo-empty">
                        <FolderOpen size={28} />
                        <strong>No supporting documents</strong>
                        <span>
                          No documents were returned with this claim.
                        </span>
                      </div>
                    )}
                  </>
                )}

                {tab === "history" && (
                  <>
                    <h3>
                      <Clock3 size={18} /> Approval history
                    </h3>

                    {historyOf(selectedClaim).length ? (
                      <div className="hoo-history-list">
                        {historyOf(selectedClaim).map((entry, index) => (
                          <div className="hoo-history-item" key={index}>
                            <span className="hoo-history-dot" />
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
                      <div className="hoo-empty">
                        <Clock3 size={28} />
                        <strong>No approval history available</strong>
                      </div>
                    )}
                  </>
                )}
              </div>

              {activeSection !== "Pending Sanction" && (
                <div className="hoo-decision">
                  <label htmlFor="fc-review-remarks">
                    Processing remarks
                    <span>Optional notes for the Finance Officer</span>
                  </label>

                  <textarea
                    id="fc-review-remarks"
                    rows={3}
                    value={remarks[idOf(selectedClaim)] || ""}
                    onChange={(event) =>
                      setRemarks((previous) => ({
                        ...previous,
                        [idOf(selectedClaim)]: event.target.value,
                      }))
                    }
                    placeholder="Record document verification or processing notes..."
                  />

                  <div className="hoo-decision-buttons">
                    <button
                      type="button"
                      className="hoo-approve"
                      disabled={Boolean(busyId)}
                      onClick={() => submitClerkApproval(selectedClaim)}
                    >
                      <CheckCircle2 size={16} />
                      {busyId === idOf(selectedClaim)
                        ? "Submitting..."
                        : "Complete processing & forward"}
                    </button>
                  </div>

                  <p>
                    This action is intended to forward the claim to the
                    Finance Officer for final sanction, not to mark it as
                    finally sanctioned.
                  </p>
                </div>
              )}
            </section>
          ) : activeSection === "Dashboard" ? (
            <>
              <section className="fc-kpi-grid">
                <article className="fc-kpi-card">
                  <div className="fc-kpi-icon blue">
                    <FileText size={23} />
                  </div>
                  <div className="fc-kpi-copy">
                    <span>TA claims to process</span>
                    <strong>{clerkClaims.length}</strong>
                    <small>Awaiting Finance Clerk action</small>
                  </div>
                </article>

                <article className="fc-kpi-card">
                  <div className="fc-kpi-icon purple">
                    <Clock3 size={23} />
                  </div>
                  <div className="fc-kpi-copy">
                    <span>Pending sanction</span>
                    <strong>{sanctionClaims.length}</strong>
                    <small>Finance Officer stage</small>
                  </div>
                </article>

                <article className="fc-kpi-card">
                  <div className="fc-kpi-icon green">
                    <CheckCircle2 size={23} />
                  </div>
                  <div className="fc-kpi-copy">
                    <span>Live claim records</span>
                    <strong>{claims.length}</strong>
                    <small>Returned by the API</small>
                  </div>
                </article>
              </section>

              <section className="ad-card fc-card">
                <div className="ad-card-header">
                  <div>
                    <span className="ad-card-eyebrow">Live Work Queue</span>
                    <h2>TA claims awaiting processing</h2>
                  </div>

                  <button
                    type="button"
                    className="fc-link-button"
                    onClick={fetchClaims}
                    disabled={loading}
                  >
                    <RefreshCw size={15} />
                    {loading ? "Refreshing..." : "Refresh"}
                  </button>
                </div>

                <div className="fc-table-wrap">
                  <table className="fc-table">
                    <thead>
                      <tr>
                        <th>Claim reference</th>
                        <th>Employee</th>
                        <th>Travel route</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredDashboardClaims.map((claim) => (
                        <tr key={idOf(claim)}>
                          <td>{idOf(claim)}</td>
                          <td>
                            {employeeName(claim)}
                            <br />
                            <small>{employeeCode(claim)}</small>
                          </td>
                          <td>{routeOf(claim)}</td>
                          <td>{money(claimAmount(claim))}</td>
                          <td>
                            <span className="fc-status in-progress">
                              {statusOf(claim).replaceAll("_", " ")}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="fc-open-button"
                              onClick={() => {
                                setSelectedId(idOf(claim));
                                setTab("claim");
                              }}
                            >
                              Review
                            </button>
                          </td>
                        </tr>
                      ))}

                      {!loading && filteredDashboardClaims.length === 0 && (
                        <tr>
                          <td colSpan={6} className="fc-empty">
                            {error
                              ? "Claims could not be loaded. Check the error above."
                              : "No claims awaiting Finance Clerk processing."}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          ) : activeSection === "Claims Processing" ||
            activeSection === "Pending Sanction" ? (
            <section className="ad-card fc-card">
              <div className="ad-card-header">
                <div>
                  <span className="ad-card-eyebrow">
                    {activeSection === "Pending Sanction"
                      ? "Final Approval Queue"
                      : "Finance Clerk Queue"}
                  </span>
                  <h2>
                    {activeSection === "Pending Sanction"
                      ? "Claims pending final sanction"
                      : "Claims awaiting processing"}
                  </h2>
                </div>

                <button
                  type="button"
                  className="fc-link-button"
                  onClick={fetchClaims}
                  disabled={loading}
                >
                  <RefreshCw size={15} />
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="hoo-empty">
                  <Clock3 size={26} />
                  <strong>Loading claims...</strong>
                </div>
              ) : (
                <div className="fc-table-wrap">
                  <table className="fc-table">
                    <thead>
                      <tr>
                        <th>Reference</th>
                        <th>Employee</th>
                        <th>Claim type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((claim) => (
                        <tr key={idOf(claim)}>
                          <td>{idOf(claim)}</td>
                          <td>{employeeName(claim)}</td>
                          <td>
                            {pick(
                              claim.claimType,
                              claim.type,
                              claim.category,
                              "TA Claim"
                            )}
                          </td>
                          <td>{money(claimAmount(claim))}</td>
                          <td>
                            {statusOf(claim).replaceAll("_", " ")}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="fc-open-button"
                              onClick={() => {
                                setSelectedId(idOf(claim));
                                setTab("claim");
                              }}
                            >
                              Open <ChevronRight size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}

                      {filteredClaims.length === 0 && (
                        <tr>
                          <td colSpan={6} className="fc-empty">
                            No matching claims found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ) : (
            <section className="ad-card fc-card fc-placeholder">
              <div className="fc-placeholder-icon">
                <FolderOpen size={26} />
              </div>
              <h2>{activeSection}</h2>
              <p>
                This section is separate from the TA claim approval
                workflow.
              </p>
              <button
                type="button"
                className="fc-back-button"
                onClick={() => openSection("Dashboard")}
              >
                Back to dashboard
              </button>
            </section>
          )}

          <footer className="fc-footer">
            <span>Government Finance Management System</span>
            <span>Finance Clerk Workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
