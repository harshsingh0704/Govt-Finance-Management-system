
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Activity, Bell, CalendarDays, Check, CheckCircle2, ChevronLeft,
  ChevronRight, ClipboardCheck, FileCheck2, FileText, FolderOpen,
  LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck,
  Users, X, XCircle, BarChart3, RefreshCw, Clock, ExternalLink, Wallet,
} from "lucide-react";
import { logout } from "../auth/authSlice";
import "../admin/AdminPage.css";
import "./HeadOfOfficePage.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Employee Management", icon: Users },
  { label: "Leave & Requests", icon: CalendarDays },
  { label: "Claims Approval", icon: ClipboardCheck },
  { label: "Documents", icon: FolderOpen },
  { label: "Reports", icon: BarChart3 },
  { label: "Notifications", icon: Bell },
  { label: "My Settings", icon: Settings },
];

const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem("fms_auth") || "{}").token ||
      localStorage.getItem("token") || localStorage.getItem("authToken") || "";
  } catch {
    return localStorage.getItem("token") || localStorage.getItem("authToken") || "";
  }
};
const pick = (...values) => values.find((v) => v !== undefined && v !== null && v !== "");
const idOf = (claim) => String(claim?._id || claim?.id || "");
const employee = (claim) => claim?.employeeId && typeof claim.employeeId === "object" ? claim.employeeId : claim?.employee && typeof claim.employee === "object" ? claim.employee : claim?.employeeDetails || {};
const employeeName = (claim) => pick(claim?.employeeName, employee(claim)?.fullName, employee(claim)?.name, employee(claim)?.employeeName, "Employee details unavailable");
const employeeCode = (claim) => pick(claim?.employeeCode, claim?.employeeNumber, employee(claim)?.employeeCode, employee(claim)?.employeeId, "Not available");
const amountOf = (claim) => pick(claim?.totalClaim, claim?.totalAmount, claim?.claimAmount, claim?.amount, claim?.netAmount, null);
const amount = (value) => {
  if (value === null || value === undefined || value === "") return "Not available";
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }) : "Not available";
};
const date = (value) => {
  if (!value) return "Not available";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Not available" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const initials = (value) => String(value || "NA").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
const routeOf = (claim) => {
  const from = pick(claim?.fromPlace, claim?.from, claim?.fromLocation, claim?.journeyFrom);
  const to = pick(claim?.toPlace, claim?.to, claim?.toLocation, claim?.journeyTo);
  return pick(claim?.journey, from && to ? `${from} → ${to}` : null, from, to, "Not provided");
};
const docsOf = (claim) => {
  const docs = pick(claim?.documents, claim?.supportingDocuments, claim?.attachments, claim?.uploadedDocuments, []);
  return Array.isArray(docs) ? docs : [];
};
const historyOf = (claim) => {
  const h = pick(claim?.approvalHistory, claim?.approvalStages, claim?.history, []);
  return Array.isArray(h) ? h : [];
};
const statusLabel = (s) => String(s || "UNKNOWN").replaceAll("_", " ");

function DetailField({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return <div className="hoo-review-field"><span>{label}</span><strong>{String(value)}</strong></div>;
}

export default function HeadOfOfficePage() {
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
  const [tab, setTab] = useState("claim");
  const [remarks, setRemarks] = useState({});
  const [busyId, setBusyId] = useState("");

  const name = pick(user?.name, user?.fullName, user?.employeeName, "Head of Office");
  const employeeId = pick(user?.employeeId, user?.employee_id, user?.empId, "Not available");

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const response = await axios.get("http://localhost:5000/api/ta/claims/pending", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.claims) ? data.claims : Array.isArray(data?.data) ? data.data : [];
      setClaims(list.filter((claim) => String(claim.status || "").toUpperCase() === "PENDING_HOA"));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load HOA claims. Check your login and backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "Claims Approval") fetchClaims();
  }, [activeSection, fetchClaims]);

  const filteredClaims = claims.filter((claim) =>
    [idOf(claim), employeeName(claim), employeeCode(claim), routeOf(claim), claim.claimType, claim.category, claim.purpose]
      .join(" ").toLowerCase().includes(search.trim().toLowerCase())
  );
  const selectedClaim = claims.find((claim) => idOf(claim) === selectedId) || null;

  
async function submitDecision(claim, decision) {
  const id = idOf(claim);
  const note = (remarks[id] || "").trim();

  if ((decision === "send_back" || decision === "reject") && !note) {
    setError("Enter remarks before sending back or rejecting a claim.");
    return;
  }

  // Convert frontend decisions to the exact backend values
  const actionMap = {
    approve: "APPROVED",
    reject: "REJECTED",
    send_back: "SENT_BACK",
  };

  const action = actionMap[decision];

  if (!action) {
    setError("Invalid claim action.");
    return;
  }

  const verb =
    decision === "approve"
      ? "approve"
      : decision === "send_back"
        ? "send back"
        : "reject";

  if (!window.confirm(`Are you sure you want to ${verb} this claim?`)) {
    return;
  }

  setBusyId(id);
  setError("");
  setNotice("");

  try {
    const token = getToken();

    await axios.patch(
      `http://localhost:5000/api/ta/claim/${id}/status`,
      {
        action: action,
        remarks: note,
      },
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );

    setNotice("Claim decision submitted successfully.");
    setSelectedId("");

    setRemarks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    await fetchClaims();
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to save the decision. Check the backend route and request format."
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
    <div className="ad-shell hoo-shell">
      {sidebarOpen && <button className="ad-mobile-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ad-brand"><div className="ad-brand-mark">FMS</div><div><strong>Government Finance</strong><span>Management System</span></div></div>
        <nav className="ad-nav">
          <span className="ad-nav-label">Office Workspace</span>
          {navigation.map(({ label, icon: Icon }) => <button key={label} className={`ad-nav-item ${activeSection === label ? "active" : ""}`} onClick={() => { setActiveSection(label); setSelectedId(""); setSidebarOpen(false); }}><Icon size={17} /><span>{label}</span>{label === "Claims Approval" && claims.length > 0 && <small>{claims.length}</small>}</button>)}
        </nav>
        <div className="ad-sidebar-footer">
          <div className="ad-user-mini"><div className="ad-avatar">{initials(name)}</div><div><strong>{name}</strong><span>Head of Office</span><span>Emp ID: {employeeId}</span></div></div>
          <button className="ad-logout-button" onClick={signOut}><LogOut size={15} /> Sign out</button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <label className="ad-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees, claims, requests..." />{search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}</label>
          </div>
          <div className="ad-topbar-right"><span className="hoo-top-role"><ShieldCheck size={16} /> HOA Workspace</span><div className="ad-avatar">{initials(name)}</div></div>
        </header>

        <div className="ad-content hoo-content">
          <section className="ad-page-header hoo-page-heading">
            <div><span className="ad-eyebrow">Office Operations / {selectedClaim ? "Claim Review" : activeSection}</span><h1>{selectedClaim ? "Review Claim" : activeSection === "Dashboard" ? "Office Overview" : activeSection}</h1><p className="hoo-subtitle">{selectedClaim ? `Reference ${idOf(selectedClaim)}` : "Review office activity and claims assigned to the Head of Office approval stage."}</p></div>
            <div className="hoo-header-meta"><span>Employee ID <strong>{employeeId}</strong></span><span>Financial Year <strong>2026–2027</strong></span></div>
          </section>

          {error && <div className="hoo-message error" role="alert"><XCircle size={17} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
          {notice && <div className="hoo-message success" role="status"><CheckCircle2 size={17} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}

          {selectedClaim ? (
            <section className="hoo-review-page">
              <button className="hoo-back" onClick={() => { setSelectedId(""); setError(""); }}><ChevronLeft size={17} /> Back to claims</button>
              <div className="hoo-review-hero">
                <div className="hoo-review-avatar">{initials(employeeName(selectedClaim))}</div>
                <div className="hoo-review-title"><span className="hoo-kicker">OFFICE FINANCIAL CONTROL</span><h2>{employeeName(selectedClaim)}</h2><p>{idOf(selectedClaim)} · {pick(selectedClaim.claimType, selectedClaim.type, selectedClaim.category, "Claim")}</p></div>
                <span className="hoo-status pending"><i /> {statusLabel(selectedClaim.status)}</span>
              </div>
              <div className="hoo-review-metrics">
                <div><span>Claim amount</span><strong>{amount(amountOf(selectedClaim))}</strong></div>
                <div><span>Submitted on</span><strong>{date(pick(selectedClaim.submittedAt, selectedClaim.createdAt))}</strong></div>
                <div><span>Current stage</span><strong>{pick(selectedClaim.currentStage, "HOA")}</strong></div>
              </div>
              <div className="hoo-review-tabs" role="tablist" aria-label="Claim details">
                {[["claim", "Claim details"], ["employee", "Employee"], ["documents", "Documents"], ["history", "Approval history"]].map(([value, label]) => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{label}</button>)}
              </div>
              <div className="hoo-review-content">
                {tab === "claim" && <>
                  <h3><FileText size={18} /> Claim information</h3>
                  <div className="hoo-review-grid">
                    <DetailField label="Claim reference" value={idOf(selectedClaim)} />
                    <DetailField label="Claim type" value={pick(selectedClaim.claimType, selectedClaim.type)} />
                    <DetailField label="Category" value={selectedClaim.category} />
                    <DetailField label="Purpose" value={pick(selectedClaim.purpose, selectedClaim.purposeOfJourney, selectedClaim.travelPurpose)} />
                    <DetailField label="Travel route" value={routeOf(selectedClaim)} />
                    <DetailField label="From date" value={date(pick(selectedClaim.fromDate, selectedClaim.travelStartDate))} />
                    <DetailField label="To date" value={date(pick(selectedClaim.toDate, selectedClaim.travelEndDate))} />
                    <DetailField label="Financial year" value={selectedClaim.financialYear} />
                    <DetailField label="Claim amount" value={amount(amountOf(selectedClaim))} />
                    <DetailField label="Employee remarks" value={pick(selectedClaim.employeeRemarks, selectedClaim.remarks, selectedClaim.justification)} />
                  </div>
                  <h3 className="hoo-review-subtitle"><Wallet size={18} /> Financial breakdown</h3>
                  <div className="hoo-review-grid">
                    <DetailField label="Travel expenses" value={amount(selectedClaim.travelExpenses)} />
                    <DetailField label="Daily allowance" value={amount(selectedClaim.dailyAllowance)} />
                    <DetailField label="Accommodation" value={amount(selectedClaim.accommodation)} />
                    <DetailField label="Other expenses" value={amount(selectedClaim.otherExpenses)} />
                    <DetailField label="Deductions" value={amount(selectedClaim.deductions)} />
                  </div>
                </>}
                {tab === "employee" && <><h3><Users size={18} /> Employee information</h3><div className="hoo-review-grid">
                  <DetailField label="Employee name" value={employeeName(selectedClaim)} />
                  <DetailField label="Employee ID" value={employeeCode(selectedClaim)} />
                  <DetailField label="Designation" value={pick(employee(selectedClaim).designation, selectedClaim.designation)} />
                  <DetailField label="Department" value={pick(employee(selectedClaim).department, selectedClaim.departmentName, selectedClaim.department)} />
                  <DetailField label="Office" value={pick(employee(selectedClaim).office, selectedClaim.officeName, selectedClaim.office)} />
                  <DetailField label="Email" value={pick(employee(selectedClaim).email, selectedClaim.email)} />
                  <DetailField label="Contact" value={pick(employee(selectedClaim).phone, employee(selectedClaim).mobile, selectedClaim.phone)} />
                </div></>}
                {tab === "documents" && <><h3><FolderOpen size={18} /> Supporting documents</h3>
                  {docsOf(selectedClaim).length ? <div className="hoo-doc-list">{docsOf(selectedClaim).map((doc, index) => {
                    const url = typeof doc === "string" ? doc : pick(doc.url, doc.fileUrl, doc.path, doc.downloadUrl);
                    const title = typeof doc === "string" ? doc.split("/").pop() : pick(doc.name, doc.fileName, doc.originalName, `Document ${index + 1}`);
                    return <div className="hoo-document" key={`${title}-${index}`}><FileText size={21} /><div><strong>{title}</strong><span>{typeof doc === "object" ? pick(doc.type, doc.mimeType, "Supporting document") : "Supporting document"}{typeof doc === "object" && doc.uploadedAt ? ` · ${date(doc.uploadedAt)}` : ""}</span></div>{url && <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${title}`}><ExternalLink size={16} /></a>}</div>;
                  })}</div> : <div className="hoo-empty"><FolderOpen size={28} /><strong>No supporting documents</strong><span>No documents were returned with this claim.</span></div>}
                </>}
                {tab === "history" && <><h3><Clock size={18} /> Approval history</h3>
                  {historyOf(selectedClaim).length ? <div className="hoo-history-list">{historyOf(selectedClaim).map((entry, index) => <div className="hoo-history-item" key={index}><span className="hoo-history-dot" /><div><strong>{pick(entry.role, entry.stage, entry.approverRole, "Workflow action")}</strong><span>{pick(entry.action, entry.decision, entry.status, "Update")}</span><p>{pick(entry.remarks, entry.comments, entry.note, "")}</p><small>{pick(entry.reviewerName, entry.approverName, entry.name, "")} · {date(pick(entry.timestamp, entry.createdAt, entry.date))}</small></div></div>)}</div> : <div className="hoo-empty"><Clock size={28} /><strong>No approval history available</strong><span>The API did not return history entries for this claim.</span></div>}
                </>}
              </div>
              <div className="hoo-decision">
                <label htmlFor="hoo-review-remarks">Review remarks <span>Required for send back or rejection</span></label>
                <textarea id="hoo-review-remarks" rows={3} value={remarks[idOf(selectedClaim)] || ""} onChange={(e) => setRemarks((prev) => ({ ...prev, [idOf(selectedClaim)]: e.target.value }))} placeholder="Add review notes or explain required corrections..." />
                <div className="hoo-decision-buttons">
                  <button className="hoo-approve" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "approve")}><Check size={16} /> {busyId ? "Saving..." : "Approve claim"}</button>
                  <button className="hoo-return" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "send_back")}>Send back for correction</button>
                  <button className="hoo-reject" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "reject")}><XCircle size={16} /> Reject claim</button>
                </div>
              </div>
            </section>
          ) : activeSection === "Claims Approval" ? (
            <section className="hoo-claims-page">
              <div className="hoo-claims-heading"><div><span className="hoo-kicker">OFFICE FINANCIAL CONTROL</span><h2>Claims requiring your attention</h2><p>Open a claim to inspect its submitted details and approval history.</p></div><button className="hoo-refresh" onClick={fetchClaims} disabled={loading}><RefreshCw size={16} /> {loading ? "Refreshing..." : "Refresh"}</button></div>
              <button className="hoo-clickable-summary" onClick={() => setSearch("")}><span className="hoo-summary-icon"><ClipboardCheck size={23} /></span><span><small>Claims awaiting your review</small><strong>{loading ? "…" : claims.length}</strong></span><span className="hoo-queue-pill"><i /> HOA approval queue</span></button>
              <div className="hoo-list-toolbar"><label><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee, code, route or claim reference" /></label><span>{filteredClaims.length} claims shown · PENDING_HOA</span></div>
              {loading ? <div className="hoo-empty"><span className="hoo-spinner" /><strong>Loading claims</strong><span>Fetching claims assigned to HOA.</span></div> :
                filteredClaims.length === 0 ? <div className="hoo-empty"><ClipboardCheck size={29} /><strong>{error ? "Unable to load claims" : "You're all caught up"}</strong><span>{error || "No claims are currently awaiting HOA approval."}</span>{error && <button className="hoo-refresh" onClick={fetchClaims}>Try again</button>}</div> :
                <div className="hoo-claim-list">{filteredClaims.map((claim) => <button className="hoo-claim-row" key={idOf(claim)} onClick={() => { setSelectedId(idOf(claim)); setTab("claim"); setError(""); }}>
                  <span className="hoo-person-avatar">{initials(employeeName(claim))}</span>
                  <span className="hoo-claim-main"><strong>{employeeName(claim)}</strong><small>{employeeCode(claim)} · Claim #{idOf(claim).slice(-8)}</small><span>{routeOf(claim)}</span></span>
                  <span className="hoo-claim-type"><small>CLAIM TYPE</small><strong>{pick(claim.claimType, claim.type, claim.category, "Claim")}</strong><small>Submitted {date(pick(claim.submittedAt, claim.createdAt))}</small></span>
                  <span className="hoo-claim-money"><small>CLAIM AMOUNT</small><strong>{amount(amountOf(claim))}</strong><span className="hoo-status pending">{statusLabel(claim.status)}</span></span><ChevronRight size={18} />
                </button>)}</div>}
            </section>
          ) : <section className="hoo-other-section"><ShieldCheck size={26} /><h2>{activeSection}</h2><p>Use the existing office workspace for this section. Claims awaiting approval are managed in the HOA claims queue.</p><button className="hoo-refresh" onClick={() => setActiveSection("Claims Approval")}>Open claim approvals <ChevronRight size={16} /></button></section>}
          <footer className="hoo-footer"><span>Government Finance Management System</span><span>Head of Office Workspace</span></footer>
        </div>
      </main>
    </div>
  );
}
