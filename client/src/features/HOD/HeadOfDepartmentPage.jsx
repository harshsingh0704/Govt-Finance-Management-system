
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity, Bell, Building2, CalendarDays, Check, CheckCircle2,
  ChevronLeft, ChevronRight, ClipboardCheck, FileCheck2, FileText,
  FolderOpen, LayoutDashboard, LogOut, Menu, Search, Settings,
  ShieldCheck, Users, Wallet, X, XCircle, RefreshCw, Clock,
  Download, ExternalLink,
} from "lucide-react";
import { logout } from "../auth/authSlice";
import "../admin/AdminPage.css";
import "./HeadOfDepartmentPage.css";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Department Management", icon: Building2 },
  { label: "Budget & Financial Oversight", icon: Activity },
  { label: "Claims Approval", icon: FileCheck2 },
  { label: "Leave & Requests", icon: CalendarDays },
  { label: "Reports", icon: FileText },
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

const getEmployee = (claim) =>
  claim?.employeeId && typeof claim.employeeId === "object"
    ? claim.employeeId
    : claim?.employee && typeof claim.employee === "object"
      ? claim.employee
      : claim?.employeeDetails || {};

const employeeName = (claim) =>
  pick(
    claim?.employeeName,
    getEmployee(claim)?.fullName,
    getEmployee(claim)?.name,
    getEmployee(claim)?.employeeName,
    "Employee details unavailable"
  );

const employeeCode = (claim) =>
  pick(
    claim?.employeeCode,
    claim?.employeeNumber,
    getEmployee(claim)?.employeeCode,
    getEmployee(claim)?.employeeId,
    "Not available"
  );

const claimId = (claim) => String(claim?._id || claim?.id || "");

const amountValue = (claim) =>
  pick(
    claim?.netAmount,
    claim?.totalClaim,
    claim?.totalAmount,
    claim?.claimAmount,
    claim?.grossAmount,
    claim?.totalFare,
    claim?.amount,
    null
  );

const formatAmount = (value) => {
  if (value === null || value === undefined || value === "") return "Not available";
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

const initials = (name) =>
  String(name || "NA")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const journey = (claim) => {
  const from = pick(claim?.fromPlace, claim?.fromLocation, claim?.from, claim?.journeyFrom);
  const to = pick(claim?.toPlace, claim?.toLocation, claim?.to, claim?.journeyTo);
  return pick(claim?.journey, from && to ? `${from} → ${to}` : null, from, to, "Not provided");
};

const statusLabel = (status) =>
  String(status || "UNKNOWN").replaceAll("_", " ");

function getDocuments(claim) {
  const documents = pick(
    claim?.documents,
    claim?.supportingDocuments,
    claim?.attachments,
    claim?.uploadedDocuments,
    []
  );
  return Array.isArray(documents) ? documents : [];
}

function getHistory(claim) {
  const history = pick(
    claim?.approvalHistory,
    claim?.approvalStages,
    claim?.history,
    []
  );
  return Array.isArray(history) ? history : [];
}

function DetailField({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="hod-detail-field">
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}

export default function HeadOfDepartmentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedId, setSelectedId] = useState("");
  const [tab, setTab] = useState("claim");
  const [remarks, setRemarks] = useState("");
  const [busyId, setBusyId] = useState("");

  const name = pick(user?.fullName, user?.name, user?.employeeName, user?.email?.split("@")[0], "Head of Department");
  const employeeId = pick(user?.employeeId, user?.employee_id, user?.empId, "Not available");

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      if (!token) throw new Error("Your session is missing. Please log in again.");

      const response = await fetch("http://localhost:5000/api/ta/claims/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to load claims.");

      const received = Array.isArray(data)
        ? data
        : Array.isArray(data?.claims)
          ? data.claims
          : Array.isArray(data?.data)
            ? data.data
            : [];

      setClaims(received.filter((claim) => String(claim.status || "").toUpperCase() === "PENDING_HOD"));
    } catch (err) {
      setError(err.message || "Unable to load HOD claims.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "Claims Approval") fetchClaims();
  }, [activeSection, fetchClaims]);

  const filteredClaims = claims.filter((claim) => {
    const text = [
      claimId(claim),
      employeeName(claim),
      employeeCode(claim),
      journey(claim),
      claim?.claimType,
      claim?.category,
      claim?.purpose,
      claim?.status,
    ].join(" ").toLowerCase();

    const matchesSearch = text.includes(search.trim().toLowerCase());
    const matchesStatus = statusFilter === "ALL" ||
      String(claim.status || "").toUpperCase() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedClaim = claims.find((claim) => claimId(claim) === selectedId) || null;

  function openClaims() {
    setActiveSection("Claims Approval");
    setSelectedId("");
    setTab("claim");
    setSidebarOpen(false);
  }

  async function submitDecision(claim, action) {
    const id = claimId(claim);
    const reason = remarks.trim();

    if ((action === "SENT_BACK" || action === "REJECTED") && !reason) {
      setError("Enter review remarks before sending back or rejecting a claim.");
      return;
    }

    const verb = action === "APPROVED" ? "approve" : action === "SENT_BACK" ? "send back" : "reject";
    if (!window.confirm(`Are you sure you want to ${verb} this claim?`)) return;

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const token = getToken();
      if (!token) throw new Error("Your session is missing. Please log in again.");

      const response = await fetch(`http://localhost:5000/api/ta/claim/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ action, comments: reason }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.message || "Unable to save this decision.");

      setNotice(data?.message || "Claim decision recorded successfully.");
      setSelectedId("");
      setRemarks("");
      await fetchClaims();
    } catch (err) {
      setError(err.message || "Unable to submit the decision.");
    } finally {
      setBusyId("");
    }
  }

  function signOut() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  return (
    <div className="ad-shell hod-shell">
      {sidebarOpen && (
        <button className="ad-mobile-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ad-brand">
          <div className="ad-brand-mark">FMS</div>
          <div><strong>Government Finance</strong><span>Management System</span></div>
        </div>

        <nav className="ad-nav">
          <span className="ad-nav-label">Department Workspace</span>
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`ad-nav-item ${activeSection === label ? "active" : ""}`}
              onClick={() => {
                setActiveSection(label);
                setSelectedId("");
                setSidebarOpen(false);
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === "Claims Approval" && claims.length > 0 && <small>{claims.length}</small>}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user-mini">
            <div className="ad-avatar">{initials(name)}</div>
            <div><strong>{name}</strong><span>Head of Department</span><span>Emp ID: {employeeId}</span></div>
          </div>
          <button className="ad-logout-button" onClick={signOut}><LogOut size={15} /> Sign out</button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <label className="ad-search">
              <Search size={16} />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search employees, claims, references..." />
              {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}
            </label>
          </div>
          <div className="ad-topbar-right">
            <span className="hod-top-role"><ShieldCheck size={16} /> HOD Workspace</span>
            <div className="ad-avatar">{initials(name)}</div>
          </div>
        </header>

        <div className="ad-content hod-content">
          <section className="ad-page-header hod-page-header">
            <div>
              <span className="ad-eyebrow">Department Operations / {selectedClaim ? "Claim Review" : activeSection}</span>
              <h1>{selectedClaim ? "Review Claim" : activeSection === "Dashboard" ? "Department Overview" : activeSection}</h1>
              <p className="hod-subtitle">
                {selectedClaim ? `Reference ${claimId(selectedClaim)}` : "Review department activity and manage claims assigned to your approval stage."}
              </p>
            </div>
            <label className="hod-year-select"><span>Financial Year</span><select defaultValue="2026–2027"><option>2026–2027</option><option>2025–2026</option></select></label>
          </section>

          {error && <div className="hod-alert" role="alert"><XCircle size={17} /> <span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
          {notice && <div className="hod-success" role="status"><CheckCircle2 size={17} /> <span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}

          {selectedClaim ? (
            <section className="hod-review-page">
              <button className="hod-back" onClick={() => { setSelectedId(""); setRemarks(""); }}><ChevronLeft size={17} /> Back to pending claims</button>

              <div className="hod-review-hero">
                <div className="hod-person-avatar">{initials(employeeName(selectedClaim))}</div>
                <div className="hod-review-title">
                  <span className="hod-kicker">HOD CLAIM REVIEW</span>
                  <h2>{employeeName(selectedClaim)}</h2>
                  <p>{claimId(selectedClaim)} · {pick(selectedClaim.claimType, selectedClaim.type, selectedClaim.category, "Travel claim")}</p>
                </div>
                <span className="hod-status pending"><i /> {statusLabel(selectedClaim.status)}</span>
              </div>

              <div className="hod-detail-metrics">
                <div><span>Claim amount</span><strong>{formatAmount(amountValue(selectedClaim))}</strong></div>
                <div><span>Submitted on</span><strong>{formatDate(pick(selectedClaim.submittedAt, selectedClaim.createdAt))}</strong></div>
                <div><span>Approval stage</span><strong>{pick(selectedClaim.currentStage, "HOD")}</strong></div>
              </div>

              <div className="hod-tabs" role="tablist" aria-label="Claim information">
                {[["claim", "Claim details"], ["employee", "Employee"], ["documents", "Documents"], ["history", "Approval history"]].map(([value, label]) => (
                  <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{label}</button>
                ))}
              </div>

              <div className="hod-detail-panel">
                {tab === "claim" && <>
                  <h3><FileText size={18} /> Claim information</h3>
                  <div className="hod-detail-grid">
                    <DetailField label="Claim reference" value={claimId(selectedClaim)} />
                    <DetailField label="Claim type" value={pick(selectedClaim.claimType, selectedClaim.type)} />
                    <DetailField label="Category" value={selectedClaim.category} />
                    <DetailField label="Purpose" value={pick(selectedClaim.purpose, selectedClaim.purposeOfJourney, selectedClaim.travelPurpose, selectedClaim.projectName)} />
                    <DetailField label="Journey" value={journey(selectedClaim)} />
                    <DetailField label="From date" value={formatDate(pick(selectedClaim.fromDate, selectedClaim.travelStartDate, selectedClaim.startDate))} />
                    <DetailField label="To date" value={formatDate(pick(selectedClaim.toDate, selectedClaim.travelEndDate, selectedClaim.endDate))} />
                    <DetailField label="Financial year" value={selectedClaim.financialYear} />
                    <DetailField label="Claimed amount" value={formatAmount(amountValue(selectedClaim))} />
                    <DetailField label="Employee remarks" value={pick(selectedClaim.employeeRemarks, selectedClaim.remarks, selectedClaim.justification)} />
                  </div>

                  <h3 className="hod-subsection-title"><Wallet size={18} /> Financial breakdown</h3>
                  <div className="hod-detail-grid">
                    <DetailField label="Travel expenses" value={formatAmount(selectedClaim.travelExpenses)} />
                    <DetailField label="Daily allowance" value={formatAmount(selectedClaim.dailyAllowance)} />
                    <DetailField label="Accommodation" value={formatAmount(selectedClaim.accommodation)} />
                    <DetailField label="Other expenses" value={formatAmount(selectedClaim.otherExpenses)} />
                    <DetailField label="Deductions" value={formatAmount(selectedClaim.deductions)} />
                  </div>
                </>}

                {tab === "employee" && <>
                  <h3><Users size={18} /> Employee information</h3>
                  <div className="hod-detail-grid">
                    <DetailField label="Employee name" value={employeeName(selectedClaim)} />
                    <DetailField label="Employee ID / code" value={employeeCode(selectedClaim)} />
                    <DetailField label="Designation" value={pick(getEmployee(selectedClaim).designation, selectedClaim.designation)} />
                    <DetailField label="Department" value={pick(getEmployee(selectedClaim).department, selectedClaim.departmentName, selectedClaim.department)} />
                    <DetailField label="Office" value={pick(getEmployee(selectedClaim).office, selectedClaim.officeName, selectedClaim.office)} />
                    <DetailField label="Email" value={pick(getEmployee(selectedClaim).email, selectedClaim.email)} />
                    <DetailField label="Phone" value={pick(getEmployee(selectedClaim).phone, getEmployee(selectedClaim).mobile, selectedClaim.phone)} />
                  </div>
                </>}

                {tab === "documents" && <>
                  <h3><FolderOpen size={18} /> Supporting documents</h3>
                  {getDocuments(selectedClaim).length ? (
                    <div className="hod-document-list">
                      {getDocuments(selectedClaim).map((doc, index) => {
                        const url = typeof doc === "string" ? doc : pick(doc.url, doc.fileUrl, doc.path, doc.downloadUrl);
                        const title = typeof doc === "string" ? doc.split("/").pop() : pick(doc.name, doc.fileName, doc.originalName, `Document ${index + 1}`);
                        return <div className="hod-document" key={`${title}-${index}`}>
                          <FileText size={21} />
                          <div><strong>{title}</strong><span>{typeof doc === "object" ? pick(doc.type, doc.mimeType, "Supporting document") : "Supporting document"}{typeof doc === "object" && doc.uploadedAt ? ` · ${formatDate(doc.uploadedAt)}` : ""}</span></div>
                          {url && <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${title}`}><ExternalLink size={16} /></a>}
                        </div>;
                      })}
                    </div>
                  ) : <div className="hod-empty"><FolderOpen size={27} /><strong>No supporting documents</strong><span>No documents were returned with this claim.</span></div>}
                </>}

                {tab === "history" && <>
                  <h3><Clock size={18} /> Approval history</h3>
                  {getHistory(selectedClaim).length ? <div className="hod-history-list">
                    {getHistory(selectedClaim).map((entry, index) => <div className="hod-history-item" key={index}>
                      <span className="hod-history-marker" />
                      <div><strong>{pick(entry.role, entry.stage, entry.approverRole, "Workflow action")}</strong><span>{pick(entry.action, entry.decision, entry.status, "Update")}</span><p>{pick(entry.remarks, entry.comments, entry.note, "")}</p><small>{pick(entry.reviewerName, entry.approverName, entry.name, "")} {formatDate(pick(entry.timestamp, entry.createdAt, entry.date))}</small></div>
                    </div>)}
                  </div> : <div className="hod-empty"><Clock size={27} /><strong>No approval history available</strong><span>The API did not return history entries for this claim.</span></div>}
                </>}
              </div>

              <div className="hod-decision-panel">
                <label htmlFor="hod-review-remarks">Review remarks <span>Required for send back or rejection</span></label>
                <textarea id="hod-review-remarks" value={remarks} onChange={(event) => setRemarks(event.target.value)} placeholder="Enter your review notes or reason for returning the claim..." rows={3} />
                <div className="hod-decision-actions">
                  <button className="hod-approve" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "APPROVED")}><Check size={16} /> {busyId ? "Saving..." : "Approve claim"}</button>
                  <button className="hod-return" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "SENT_BACK")}>Send back for correction</button>
                  <button className="hod-reject" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "REJECTED")}><XCircle size={16} /> Reject claim</button>
                </div>
              </div>
            </section>
          ) : activeSection === "Claims Approval" ? (
            <section className="hod-claims-page">
              <div className="hod-claims-heading">
                <div><span className="hod-kicker">DEPARTMENT FINANCIAL CONTROL</span><h2>Claims requiring your attention</h2><p>Open a claim to inspect the submitted information and record your decision.</p></div>
                <button className="hod-refresh" onClick={fetchClaims} disabled={loading}><RefreshCw size={16} /> {loading ? "Refreshing..." : "Refresh"}</button>
              </div>

              <button className="hod-clickable-summary" onClick={() => { setStatusFilter("ALL"); setSearch(""); }}>
                <span className="hod-summary-icon"><ClipboardCheck size={23} /></span>
                <span><small>Claims awaiting your review</small><strong>{loading ? "…" : claims.length}</strong></span>
                <span className="hod-queue-pill"><i /> HOD approval queue</span>
              </button>

              <div className="hod-list-toolbar">
                <label><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by employee, code, route or claim reference" /></label>
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Filter claim status"><option value="ALL">All statuses</option><option value="PENDING_HOD">Pending HOD</option></select>
              </div>

              {loading ? <div className="hod-empty"><span className="hod-spinner" /><strong>Loading claims</strong><span>Retrieving claims from the HOD queue…</span></div> :
                filteredClaims.length === 0 ? <div className="hod-empty"><ClipboardCheck size={29} /><strong>{error ? "Unable to load claims" : "No pending claims found"}</strong><span>{error || "There are no claims matching your search in the HOD queue."}</span>{error && <button className="hod-refresh" onClick={fetchClaims}>Try again</button>}</div> :
                <div className="hod-claim-list">{filteredClaims.map((claim) => <button className="hod-claim-row" key={claimId(claim)} onClick={() => { setSelectedId(claimId(claim)); setTab("claim"); setRemarks(""); setError(""); }}>
                  <span className="hod-person-avatar">{initials(employeeName(claim))}</span>
                  <span className="hod-claim-main"><strong>{employeeName(claim)}</strong><small>{employeeCode(claim)} · {claimId(claim)}</small><span>{journey(claim)}</span></span>
                  <span className="hod-claim-route"><small>CLAIM TYPE</small><strong>{pick(claim.claimType, claim.type, claim.category, "Travel claim")}</strong><small>Submitted {formatDate(pick(claim.submittedAt, claim.createdAt))}</small></span>
                  <span className="hod-claim-money"><small>CLAIM AMOUNT</small><strong>{formatAmount(amountValue(claim))}</strong><span className="hod-status pending">{statusLabel(claim.status)}</span></span>
                  <ChevronRight size={18} />
                </button>)}</div>
              }
            </section>
          ) : (
            <section className="hod-dashboard-placeholder">
              <div className="hod-summary-icon"><ShieldCheck size={25} /></div>
              <h2>{activeSection}</h2>
              <p>This workspace remains available in your existing application. Claim approval is managed in the dedicated HOD queue.</p>
              <button className="hod-refresh" onClick={openClaims}>Open claim approvals <ChevronRight size={16} /></button>
            </section>
          )}

          <footer className="hod-footer"><span>Government Finance Management System</span><span>Head of Department Workspace</span></footer>
        </div>
      </main>
    </div>
  );
}
