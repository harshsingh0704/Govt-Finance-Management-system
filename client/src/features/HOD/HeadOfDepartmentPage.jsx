
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  Building2,
  CalendarDays,
  ChartColumnIncreasing,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { logout } from "../auth/authSlice";
import "../admin/AdminPage.css";
import "./HeadOfDepartmentPage.css";

const monthlyBudget = [
  { month: "Apr", budget: 55, expenditure: 38 },
  { month: "May", budget: 72, expenditure: 42 },
  { month: "Jun", budget: 80, expenditure: 48 },
  { month: "Jul", budget: 84, expenditure: 56 },
  { month: "Aug", budget: 92, expenditure: 62 },
  { month: "Sep", budget: 97, expenditure: 65 },
  { month: "Oct", budget: 106, expenditure: 74 },
];

const requests = [
  { id: "LV-1068", employee: "Priya Sharma", type: "Earned Leave", date: "14 Oct 2026", status: "Pending", section: "Leave & Requests" },
  { id: "CL-2081", employee: "Rahul Mehta", type: "Medical Claim", date: "13 Oct 2026", status: "Pending", section: "Claims Approval" },
  { id: "LV-1067", employee: "Ankit Verma", type: "Casual Leave", date: "12 Oct 2026", status: "Forwarded", section: "Leave & Requests" },
  { id: "CL-2080", employee: "Neha Singh", type: "TA Claim", date: "11 Oct 2026", status: "Pending", section: "Claims Approval" },
  { id: "LV-1066", employee: "Vikram Patel", type: "On Duty", date: "10 Oct 2026", status: "Approved", section: "Leave & Requests" },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Department Management", icon: Building2 },
  { label: "Budget & Financial Oversight", icon: ChartColumnIncreasing },
  { label: "Claims Approval", icon: FileCheck2, count: "12" },
  { label: "Leave & Requests", icon: CalendarDays, count: "8" },
  { label: "Reports", icon: Activity },
  { label: "Notifications", icon: Bell, count: "5" },
  { label: "My Settings", icon: Settings },
];

const approvalItems = [
  { label: "Leave Requests", detail: "06 requests pending approval", count: "06", section: "Leave & Requests", icon: CalendarDays, tone: "amber" },
  { label: "Claims for Approval", detail: "12 claims pending review", count: "12", section: "Claims Approval", icon: FileCheck2, tone: "green" },
  { label: "Forwarded Requests", detail: "03 requests from offices", count: "03", section: "Leave & Requests", icon: Users, tone: "blue" },
  { label: "Documents for Review", detail: "04 documents pending", count: "04", section: "Department Management", icon: FileText, tone: "amber" },
];

function getInitials(value) {
  return String(value || "HOD")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function HeadOfDepartmentPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("Monthly");
  
  const [taClaims, setTaClaims] = useState([]);
  const [claimsLoading, setClaimsLoading] = useState(false);
  const [claimsError, setClaimsError] = useState("");
  const [processingClaimId, setProcessingClaimId] = useState("");
  const [claimActionError, setClaimActionError] = useState("");

  const getAuthToken = () => {
    const fmsAuth = JSON.parse(
      localStorage.getItem("fms_auth") || "{}"
    );

    return fmsAuth.token || localStorage.getItem("token");
  };

  async function fetchPendingTAClaims() {
    setClaimsLoading(true);
    setClaimsError("");

    try {
      const token = getAuthToken();

      if (!token) {
        throw new Error("Please log in again to view pending claims.");
      }

      const response = await fetch(
        "http://localhost:5000/api/ta/claims/pending",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load TA claims.");
      }

      setTaClaims(Array.isArray(data.claims) ? data.claims : []);
    } catch (error) {
      setClaimsError(error.message || "Unable to load TA claims.");
    } finally {
      setClaimsLoading(false);
    }
  }

  useEffect(() => {
    if (activeSection === "Claims Approval") {
      fetchPendingTAClaims();
    }
  }, [activeSection]);

  async function handleTAClaimAction(claim, action) {
    let comments = "";

    if (action === "REJECTED" || action === "SENT_BACK") {
      comments = window.prompt(
        action === "REJECTED"
          ? "Enter the reason for rejecting this claim:"
          : "Enter the correction required:"
      );

      if (comments === null) return;

      if (!comments.trim()) {
        setClaimActionError("A reason is required for this action.");
        return;
      }
    } else {
      const confirmed = window.confirm(
        "Approve this TA claim and forward it to the next stage?"
      );

      if (!confirmed) return;
    }

    setProcessingClaimId(claim._id);
    setClaimActionError("");

    try {
      const token = getAuthToken();

      const response = await fetch(
        `http://localhost:5000/api/ta/claim/${claim._id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ action, comments }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to process this claim.");
      }

      await fetchPendingTAClaims();

      window.alert(data.message || "Claim action recorded successfully.");
    } catch (error) {
      setClaimActionError(
        error.message || "Unable to process this claim."
      );
    } finally {
      setProcessingClaimId("");
    }
  }


  const name =
    user?.fullName ||
    user?.name ||
    user?.employeeName ||
    user?.email?.split("@")[0] ||
    "Department Head";

  const employeeId =
    user?.employeeId ||
    user?.employee_id ||
    user?.empId ||
    user?.employee?.employeeId ||
    "Not available";

  const filteredRequests = requests.filter((item) =>
    `${item.id} ${item.employee} ${item.type} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function signOut() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  function openSection(section) {
    setActiveSection(section);
    setSidebarOpen(false);
  }

  return (
    <div className="ad-shell hod-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="ad-mobile-overlay hod-overlay"
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

        <div className="ad-sidebar-scroll">
          <nav className="ad-nav" aria-label="Head of Department navigation">
            <span className="ad-nav-label">Department Workspace</span>
            {navigation.map(({ label, icon: Icon, count }) => (
              <button
                type="button"
                key={label}
                className={`ad-nav-item ${activeSection === label ? "active" : ""}`}
                onClick={() => openSection(label)}
              >
                <Icon size={17} />
                <span>{label}</span>
                {count && <small>{count}</small>}
              </button>
            ))}
          </nav>
        </div>

        <div className="ad-sidebar-footer">
          <div className="ad-user-mini">
            <div className="ad-avatar">{getInitials(name)}</div>
            <div className="hod-user-details">
              <strong>{name}</strong>
              <span>Head of Department</span>
              <span>Emp ID: {employeeId}</span>
            </div>
          </div>
          <button type="button" className="ad-logout-button" onClick={signOut}>
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
                placeholder="Search employees, claims, requests, documents..."
                aria-label="Search department records"
              />
              {search && (
                <button
                  type="button"
                  className="hod-clear-search"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </div>

          <div className="ad-topbar-right">
            <button
              type="button"
              className="ad-notification-button"
              aria-label="View notifications"
              onClick={() => openSection("Notifications")}
            >
              <Bell size={19} />
              <span className="hod-notification-dot">5</span>
            </button>
            <div className="ad-profile-wrapper">
              <div className="ad-profile-button hod-profile">
                <div className="ad-avatar">{getInitials(name)}</div>
                <div className="ad-profile-text">
                  <strong>{name}</strong>
                  <span>Head of Department</span>
                  <small>{employeeId}</small>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="ad-content hod-content">
          <section className="ad-page-header hod-page-header">
            <div>
              <span className="ad-eyebrow">
                Department Operations / {activeSection}
              </span>
              <h1>{activeSection === "Dashboard" ? "Department Overview" : activeSection}</h1>
              <p className="hod-subtitle">
                {activeSection === "Dashboard"
                  ? "Department performance, pending approvals and budget health."
                  : `Head of Department workspace for ${activeSection.toLowerCase()}.`}
              </p>
            </div>

            <label className="hod-year-select">
              <span>Financial Year</span>
              <select defaultValue="2026–2027" aria-label="Financial year">
                <option value="2026–2027">2026–2027</option>
                <option value="2025–2026">2025–2026</option>
                <option value="2024–2025">2024–2025</option>
              </select>
            </label>
          </section>

          {activeSection === "Dashboard" ? (
            <>
              <section className="hod-kpi-grid">
                <article className="hod-kpi-card">
                  <div className="hod-kpi-icon blue"><Users size={23} /></div>
                  <div className="hod-kpi-copy">
                    <span>Department Employees</span>
                    <strong>32</strong>
                    <small>Total employees in department</small>
                  </div>
                  <span className="hod-kpi-trend positive">↗ +6%</span>
                </article>

                <article className="hod-kpi-card">
                  <div className="hod-kpi-icon amber"><ClipboardCheck size={23} /></div>
                  <div className="hod-kpi-copy">
                    <span>Pending Approvals</span>
                    <strong>08</strong>
                    <small>Leave, claims and other requests</small>
                  </div>
                  <span className="hod-kpi-trend warning">↗ +2</span>
                </article>

                <article className="hod-kpi-card">
                  <div className="hod-kpi-icon green"><Wallet size={23} /></div>
                  <div className="hod-kpi-copy">
                    <span>Budget Utilization</span>
                    <strong>68%</strong>
                    <small>₹4.8 Cr of ₹7.0 Cr utilized</small>
                    <div className="hod-budget-track"><span /></div>
                  </div>
                  <span className="hod-budget-status"><i /> On track</span>
                </article>

                <article className="hod-kpi-card">
                  <div className="hod-kpi-icon purple"><FileText size={23} /></div>
                  <div className="hod-kpi-copy">
                    <span>Claims to Review</span>
                    <strong>12</strong>
                    <small>Department-level claims</small>
                  </div>
                  <span className="hod-kpi-trend danger">↗ +4</span>
                </article>
              </section>

              <section className="hod-main-grid">
                <article className="ad-card hod-card hod-budget-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Financial Overview</span>
                      <h2>Department Budget &amp; Expenditure</h2>
                    </div>
                    <select
                      value={period}
                      onChange={(event) => setPeriod(event.target.value)}
                      className="hod-period-select"
                      aria-label="Chart period"
                    >
                      <option>Monthly</option>
                      <option>Quarterly</option>
                      <option>Yearly</option>
                    </select>
                  </div>

                  <div className="hod-chart">
                    <div className="hod-chart-axis">
                      <span>120</span><span>90</span><span>60</span><span>30</span><span>0</span>
                    </div>
                    <div className="hod-chart-plot">
                      {[...monthlyBudget].map((item) => (
                        <div className="hod-chart-column" key={item.month}>
                          <div className="hod-chart-bars">
                            <span className="hod-chart-bar budget" style={{ height: `${item.budget / 120 * 100}%` }} />
                            <span className="hod-chart-bar expenditure" style={{ height: `${item.expenditure / 120 * 100}%` }} />
                          </div>
                          <span className="hod-chart-month">{item.month}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="hod-chart-legend">
                    <span><i className="budget" /> Budgeted Amount</span>
                    <span><i className="expenditure" /> Expenditure</span>
                  </div>
                  <p className="hod-demo-note">
                    Illustrative figures only. Actual budget and expenditure data will require API integration.
                  </p>
                </article>

                <article className="ad-card hod-card hod-approval-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Action Required</span>
                      <h2>Approval Summary</h2>
                    </div>
                    <ShieldCheck size={20} />
                  </div>

                  <div className="hod-approval-list">
                    {approvalItems.map(({ label, detail, count, section, icon: Icon, tone }) => (
                      <div className="hod-approval-row" key={label}>
                        <span className={`hod-approval-icon ${tone}`}><Icon size={20} /></span>
                        <div className="hod-approval-copy">
                          <strong>{label}</strong>
                          <small>{detail}</small>
                        </div>
                        <b>{count}</b>
                        <button type="button" onClick={() => openSection(section)}>Review</button>
                      </div>
                    ))}
                  </div>
                </article>
              </section>

              <section className="hod-lower-grid">
                <article className="ad-card hod-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Recent Department Requests</span>
                      <h2>Requests &amp; Claims</h2>
                    </div>
                    <button type="button" className="hod-link-button" onClick={() => openSection("Leave & Requests")}>
                      View all <ChevronRight size={15} />
                    </button>
                  </div>

                  <div className="hod-table-wrap">
                    <table className="hod-table">
                      <thead>
                        <tr>
                          <th>Request ID</th><th>Employee</th><th>Type</th><th>Date</th><th>Status</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredRequests.map((item) => (
                          <tr key={item.id}>
                            <td>{item.id}</td>
                            <td>{item.employee}</td>
                            <td>{item.type}</td>
                            <td>{item.date}</td>
                            <td><span className={`hod-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                            <td>
                              <button type="button" className="hod-table-action" onClick={() => openSection(item.section)}>
                                {item.status === "Approved" ? "View" : "Review"}
                              </button>
                            </td>
                          </tr>
                        ))}
                        {filteredRequests.length === 0 && (
                          <tr><td colSpan={6} className="hod-empty">No matching requests found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="ad-card hod-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Department Highlights</span>
                      <h2>At a Glance</h2>
                    </div>
                  </div>

                  <div className="hod-highlight-grid">
                    <button type="button" onClick={() => openSection("Department Management")}>
                      <span className="hod-highlight-icon amber"><Building2 size={22} /></span>
                      <span><strong>02</strong><small>Offices under department</small></span>
                      <ChevronRight size={16} />
                    </button>
                    <button type="button" onClick={() => openSection("Department Management")}>
                      <span className="hod-highlight-icon blue"><Users size={22} /></span>
                      <span><strong>32</strong><small>Total department employees</small></span>
                      <ChevronRight size={16} />
                    </button>
                    <button type="button" onClick={() => openSection("Budget & Financial Oversight")}>
                      <span className="hod-highlight-icon green"><ChartColumnIncreasing size={22} /></span>
                      <span><strong>₹4.8 Cr</strong><small>Total expenditure (YTD)</small></span>
                      <ChevronRight size={16} />
                    </button>
                    <button type="button" onClick={() => openSection("Reports")}>
                      <span className="hod-highlight-icon purple"><FileText size={22} /></span>
                      <span><strong>25</strong><small>Reports generated</small></span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </article>
              </section>
            </>
          
) : activeSection === "Claims Approval" ? (
  <section className="ad-card hod-card" style={{ padding: 24 }}>
    <div
      className="ad-card-header"
      style={{ marginBottom: 20, gap: 12, flexWrap: "wrap" }}
    >
      <div>
        <span className="ad-card-eyebrow">Employee Travel Claims</span>
        <h2>Pending TA Approvals</h2>
        <p>
          Review travel allowance claims submitted to the Head of Department.
        </p>
      </div>

      <button
        type="button"
        className="hod-back-button"
        onClick={fetchPendingTAClaims}
        disabled={claimsLoading}
      >
        {claimsLoading ? "Refreshing..." : "Refresh claims"}
      </button>
    </div>

    {claimsError && (
      <div role="alert" style={{ color: "#b42318", marginBottom: 16 }}>
        {claimsError}
      </div>
    )}

    {claimActionError && (
      <div role="alert" style={{ color: "#b42318", marginBottom: 16 }}>
        {claimActionError}
      </div>
    )}

    {claimsLoading ? (
      <p>Loading pending TA claims...</p>
    ) : claimsError ? (
      <p>Unable to load claims. Check the server and try again.</p>
    ) : taClaims.length === 0 ? (
      <div className="hod-placeholder">
        <div className="hod-placeholder-icon">
          <ClipboardCheck size={26} />
        </div>
        <h2>No pending TA claims</h2>
        <p>
          There are currently no claims awaiting HOD approval.
          Newly submitted claims will appear here when their status is
          PENDING_HOD.
        </p>
      </div>
    ) : (
      <div className="hod-table-wrap">
        <table className="hod-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Employee Code</th>
              <th>Journey</th>
              <th>Travel Dates</th>
              <th>Amount</th>
              <th>Submitted</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {taClaims.map((claim) => {
              const employee =
                claim.employeeId && typeof claim.employeeId === "object"
                  ? claim.employeeId
                  : {};

              const employeeName =
                claim.employeeName || employee.name || "Unknown employee";

              const total =
                claim.netAmount ?? claim.grossAmount ?? claim.fare ?? 0;

              return (
                <tr key={claim._id}>
                  <td>{employeeName}</td>
                  <td>
                    {claim.employeeCode ||
                      claim.employeeNumber ||
                      employee.employeeCode ||
                      "—"}
                  </td>
                  <td>
                    <strong>{claim.fromPlace || "—"}</strong>
                    {" → "}
                    <strong>{claim.toPlace || "—"}</strong>
                    <div>{claim.projectName || claim.purposeOfJourney || "TA Claim"}</div>
                  </td>
                  <td>
                    {claim.fromDate
                      ? new Date(claim.fromDate).toLocaleDateString()
                      : "—"}
                    {" – "}
                    {claim.toDate
                      ? new Date(claim.toDate).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    {Number(total).toLocaleString("en-IN", {
                      style: "currency",
                      currency: "INR",
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td>
                    {claim.submittedAt
                      ? new Date(claim.submittedAt).toLocaleDateString()
                      : "—"}
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="hod-table-action"
                        disabled={processingClaimId === claim._id}
                        onClick={() =>
                          handleTAClaimAction(claim, "APPROVED")
                        }
                      >
                        {processingClaimId === claim._id
                          ? "Processing..."
                          : "Approve"}
                      </button>

                      <button
                        type="button"
                        className="hod-table-action"
                        disabled={Boolean(processingClaimId)}
                        onClick={() =>
                          handleTAClaimAction(claim, "SENT_BACK")
                        }
                      >
                        Send back
                      </button>

                      <button
                        type="button"
                        className="hod-table-action"
                        disabled={Boolean(processingClaimId)}
                        onClick={() =>
                          handleTAClaimAction(claim, "REJECTED")
                        }
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
) : (
  <section className="ad-card hod-card hod-placeholder">
    <div className="hod-placeholder-icon">
      <FolderOpen size={26} />
    </div>
    <h2>{activeSection}</h2>
    <p>
      This workspace is prepared for the Head of Department role.
      Detailed workflows and live records will be connected in a later
      integration step.
    </p>
    <p className="hod-demo-note">
      Preview only — no financial records or approval decisions are changed by this screen.
    </p>
    <button
      type="button"
      className="hod-back-button"
      onClick={() => openSection("Dashboard")}
    >
      Back to dashboard
    </button>
  </section>
)}

            
          

          <footer className="hod-footer">
            <span>Government Finance Management System</span>
            <span>Head of Department Workspace · UI preview</span>
          </footer>
        </div>
      </main>
    </div>
  );
}