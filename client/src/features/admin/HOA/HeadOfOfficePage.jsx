import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  CalendarDays,
  CheckCircle2,
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
  X,
  BarChart3,
} from "lucide-react";

import { logout } from "../../auth/authSlice";
import "../AdminPage.css";
import "./HeadOfOfficePage.css";

const stats = [
  { label: "Office Employees", value: "48", detail: "Office overview", icon: Users, tone: "blue" },
  { label: "Pending Leave Requests", value: "06", detail: "Require review", icon: CalendarDays, tone: "amber" },
  { label: "Pending Claims", value: "12", detail: "Awaiting approval", icon: FileCheck2, tone: "green" },
  { label: "Pending Approvals", value: "18", detail: "Across office workflows", icon: ClipboardCheck, tone: "purple" },
];

const leaves = [
  { id: "LV-1042", employee: "Ankit Sharma", type: "Casual Leave", dates: "12–14 Oct 2026", status: "Pending" },
  { id: "LV-1043", employee: "Priya Patel", type: "Earned Leave", dates: "15–17 Oct 2026", status: "Pending" },
  { id: "LV-1044", employee: "Rahul Kumar", type: "On Duty", dates: "18 Oct 2026", status: "Review" },
];

const claims = [
  { id: "CL-2041", employee: "Rahul Kumar", type: "TA Claim", amount: "₹12,450", status: "Pending" },
  { id: "CL-2042", employee: "Priya Patel", type: "LTC Claim", amount: "₹18,300", status: "Pending" },
  { id: "CL-2043", employee: "Ankit Sharma", type: "Medical Claim", amount: "₹8,900", status: "Review" },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Employee Management", icon: Users },
  { label: "Leave & Requests", icon: CalendarDays, count: "6" },
  { label: "Claims Approval", icon: ClipboardCheck, count: "12" },
  { label: "Documents", icon: FolderOpen },
  { label: "Reports", icon: BarChart3 },
  { label: "Notifications", icon: Bell, count: "5" },
  { label: "My Settings", icon: Settings },
];

function getInitials(name) {
  return (name || "User")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function HeadOfOfficePage() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const name = user?.name || user?.fullName || user?.employeeName || "Head of Office";
  const employeeId = user?.employeeId || user?.employee_id || user?.empId || "Not available";

  const visibleLeaves = leaves.filter((item) =>
    `${item.id} ${item.employee} ${item.type}`.toLowerCase().includes(search.toLowerCase())
  );
  const visibleClaims = claims.filter((item) =>
    `${item.id} ${item.employee} ${item.type}`.toLowerCase().includes(search.toLowerCase())
  );

  function signOut() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  return (
    <div className="ad-shell hoo-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="ad-mobile-overlay hoo-overlay"
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
          <nav className="ad-nav" aria-label="Head of Office navigation">
            <span className="ad-nav-label">Office Workspace</span>
            {navigation.map(({ label, icon: Icon, count }) => (
              <button
                type="button"
                key={label}
                className={`ad-nav-item ${activeSection === label ? "active" : ""}`}
                onClick={() => {
                  setActiveSection(label);
                  setSidebarOpen(false);
                }}
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
            <div className="hoo-user-details">
              <strong>{name}</strong>
              <span>Head of Office</span>
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
                placeholder="Search employees, claims, requests..."
                aria-label="Search dashboard records"
              />
              {search && (
                <button
                  type="button"
                  className="hoo-clear-search"
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
              aria-label="Open notifications"
              onClick={() => setActiveSection("Notifications")}
            >
              <Bell size={19} />
              <span className="hoo-notification-dot">5</span>
            </button>
            <div className="ad-profile-wrapper">
              <div className="ad-profile-button hoo-profile">
                <div className="ad-avatar">{getInitials(name)}</div>
                <div className="ad-profile-text">
                  <strong>{name}</strong>
                  <span>Head of Office</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="ad-content hoo-content">
          <section className="ad-page-header">
            <div>
              <span className="ad-eyebrow">Office Operations / {activeSection}</span>
              <h1>{activeSection}</h1>
              <p className="hoo-subtitle">
                {activeSection === "Dashboard"
                  ? "Office overview, pending approvals and recent activities."
                  : `Head of Office workspace for ${activeSection.toLowerCase()}.`}
              </p>
            </div>
            <div className="hoo-header-meta">
              <div className="hoo-meta-item">
                <span>Employee ID</span>
                <strong>{employeeId}</strong>
              </div>
              <div className="hoo-meta-item">
                <span>Financial Year</span>
                <strong>2026–2027</strong>
              </div>
            </div>
          </section>

          {activeSection === "Dashboard" ? (
            <>
              <section className="ad-stats-grid hoo-stats-grid">
                {stats.map(({ label, value, detail, icon: Icon, tone }) => (
                  <article className={`ad-stat-card hoo-stat-card ${tone}`} key={label}>
                    <div className="ad-stat-top">
                      <div className={`hoo-stat-icon ${tone}`}><Icon size={21} /></div>
                      <span className="hoo-stat-context">Office overview</span>
                    </div>
                    <div className="ad-stat-value">{value}</div>
                    <div className="ad-stat-label">{label}</div>
                    <div className="ad-stat-detail">{detail}</div>
                  </article>
                ))}
              </section>

              <section className="hoo-overview-grid">
                <article className="ad-card hoo-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Office operations</span>
                      <h2>Request &amp; Claim Overview</h2>
                    </div>
                    <Activity size={19} />
                  </div>
                  <div className="hoo-bars">
                    {[
                      { month: "May", leave: 46, claim: 30 },
                      { month: "Jun", leave: 65, claim: 40 },
                      { month: "Jul", leave: 53, claim: 35 },
                      { month: "Aug", leave: 72, claim: 48 },
                      { month: "Sep", leave: 60, claim: 55 },
                      { month: "Oct", leave: 82, claim: 63 },
                    ].map((item) => (
                      <div className="hoo-bar-group" key={item.month}>
                        <div className="hoo-bar-pair">
                          <span className="hoo-bar leave" style={{ height: `${item.leave}%` }} />
                          <span className="hoo-bar claim" style={{ height: `${item.claim}%` }} />
                        </div>
                        <span>{item.month}</span>
                      </div>
                    ))}
                  </div>
                  <div className="hoo-legend">
                    <span><i className="leave" /> Leave requests</span>
                    <span><i className="claim" /> Claims</span>
                  </div>
                  <p className="hoo-demo-note">Illustrative data. Live figures will come from the FMS API.</p>
                </article>

                <article className="ad-card hoo-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Action required</span>
                      <h2>Approval Summary</h2>
                    </div>
                    <ShieldCheck size={19} />
                  </div>
                  <div className="hoo-approval-summary">
                    <button type="button" onClick={() => setActiveSection("Leave & Requests")}>
                      <span className="hoo-summary-icon amber"><CalendarDays size={19} /></span>
                      <span><strong>06</strong><small>Leave requests</small></span>
                      <ChevronRight size={16} />
                    </button>
                    <button type="button" onClick={() => setActiveSection("Claims Approval")}>
                      <span className="hoo-summary-icon green"><FileCheck2 size={19} /></span>
                      <span><strong>12</strong><small>Claims to review</small></span>
                      <ChevronRight size={16} />
                    </button>
                    <button type="button" onClick={() => setActiveSection("Documents")}>
                      <span className="hoo-summary-icon blue"><FileText size={19} /></span>
                      <span><strong>04</strong><small>Documents awaiting review</small></span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                
                  <div className="hoo-review-action">
                    <button type="button" className="hoo-review-button" onClick={() => setActiveSection("Leave & Requests")}>Review</button>
                  </div>
                </article>
              </section>

              <section className="hoo-tables-grid">
                <article className="ad-card hoo-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Employee services</span>
                      <h2>Recent Leave Requests</h2>
                    </div>
                    <button type="button" className="ad-text-button" onClick={() => setActiveSection("Leave & Requests")}>View all →</button>
                  </div>
                  <div className="hoo-table-wrap">
                    <table className="hoo-table">
                      <thead><tr><th>Employee</th><th>Leave type</th><th>Dates</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {visibleLeaves.map((item) => (
                          <tr key={item.id}>
                            <td><strong>{item.employee}</strong><small>{item.id}</small></td>
                            <td>{item.type}</td>
                            <td>{item.dates}</td>
                            <td><span className={`hoo-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                            <td></td>
                          </tr>
                        ))}
                        {visibleLeaves.length === 0 && <tr><td colSpan="5" className="hoo-empty">No matching leave requests.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="ad-card hoo-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Financial services</span>
                      <h2>Recent Claims for Approval</h2>
                    </div>
                    <button type="button" className="ad-text-button" onClick={() => setActiveSection("Claims Approval")}>View all →</button>
                  </div>
                  <div className="hoo-table-wrap">
                    <table className="hoo-table">
                      <thead><tr><th>Employee</th><th>Claim type</th><th>Amount</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {visibleClaims.map((item) => (
                          <tr key={item.id}>
                            <td><strong>{item.employee}</strong><small>{item.id}</small></td>
                            <td>{item.type}</td>
                            <td className="hoo-amount">{item.amount}</td>
                            <td><span className={`hoo-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                            <td></td>
                          </tr>
                        ))}
                        {visibleClaims.length === 0 && <tr><td colSpan="5" className="hoo-empty">No matching claims.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </article>
              </section>
            </>
          ) : (
            <section className="ad-card hoo-section-placeholder">
              <div className="hoo-placeholder-icon">
                {activeSection === "Employee Management" ? <Users size={28} /> :
                  activeSection === "Leave & Requests" ? <CalendarDays size={28} /> :
                  activeSection === "Claims Approval" ? <ClipboardCheck size={28} /> :
                  activeSection === "Documents" ? <FolderOpen size={28} /> :
                  activeSection === "Reports" ? <BarChart3 size={28} /> :
                  activeSection === "Notifications" ? <Bell size={28} /> : <Settings size={28} />}
              </div>
              <h2>{activeSection}</h2>
              <p>This workspace is a UI placeholder. Live records, permissions, and workflow actions will be connected in the next implementation phase.</p>
              <button type="button" className="ad-primary-button" onClick={() => setActiveSection("Dashboard")}>Back to dashboard</button>
            </section>
          )}

          <footer className="hoo-footer">
            <span>Government Finance Management System</span>
            <span>Head of Office Workspace · UI preview</span>
          </footer>
        </div>
      </main>
    </div>
  );
}