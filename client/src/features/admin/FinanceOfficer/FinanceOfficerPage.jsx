import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardCheck,
  FileCheck2,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ShieldCheck,
  Wallet,
  X,
  ChartNoAxesCombined,
  Users,
  Clock3,
  Landmark,
} from "lucide-react";

import { logout } from "../../auth/authSlice";
import "../AdminPage.css";
import "./FinanceOfficerPage.css";

const claims = [
  { id: "CL-3101", employee: "Rahul Kumar", department: "Administration", type: "Travel Allowance", amount: 12450, submitted: "15 Oct 2026", status: "Pending review", priority: "High" },
  { id: "CL-3102", employee: "Priya Sharma", department: "Public Works", type: "Medical Reimbursement", amount: 8900, submitted: "15 Oct 2026", status: "Documents required", priority: "Medium" },
  { id: "CL-3103", employee: "Ankit Verma", department: "Education", type: "Leave Travel Concession", amount: 18300, submitted: "14 Oct 2026", status: "Pending review", priority: "High" },
  { id: "CL-3104", employee: "Neha Singh", department: "Health", type: "Travel Allowance", amount: 6750, submitted: "13 Oct 2026", status: "Under verification", priority: "Low" },
  { id: "CL-3105", employee: "Amit Patel", department: "Finance", type: "Medical Reimbursement", amount: 15200, submitted: "12 Oct 2026", status: "Pending review", priority: "Medium" },
];

const activities = [
  { title: "Claim submitted for financial review", ref: "CL-3101", time: "10:24 AM", status: "Pending review" },
  { title: "Budget allocation report prepared", ref: "RPT-204", time: "09:45 AM", status: "Completed" },
  { title: "Payroll summary received", ref: "PAY-OCT-26", time: "09:10 AM", status: "Under review" },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Claims Verification", icon: ClipboardCheck, count: "12" },
  { label: "Financial Operations", icon: Wallet },
  { label: "Payroll", icon: Users },
  { label: "Reports", icon: ChartNoAxesCombined },
  { label: "Notifications", icon: Bell, count: "5" },
  { label: "My Settings", icon: Settings },
];

const money = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

function initials(value) {
  return String(value || "FO")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function statusClass(status) {
  if (status === "Approved" || status === "Completed") return "approved";
  if (status === "Documents required") return "documents";
  if (status === "Under verification" || status === "Under review") return "review";
  return "pending";
}

export default function FinanceOfficerPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [financialYear, setFinancialYear] = useState("2026–2027");

  const name =
    user?.fullName ||
    user?.name ||
    user?.employeeName ||
    user?.email?.split("@")[0] ||
    "Finance Officer";

  const employeeId =
    user?.employeeId ||
    user?.employee_id ||
    user?.empId ||
    user?.employee?.employeeId ||
    "Not available";

  const visibleClaims = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return claims;
    return claims.filter((claim) =>
      `${claim.id} ${claim.employee} ${claim.department} ${claim.type} ${claim.status} ${claim.priority}`
        .toLowerCase()
        .includes(query)
    );
  }, [search]);

  function openSection(section) {
    setActiveSection(section);
    setSidebarOpen(false);
  }

  function signOut() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  return (
    <div className="ad-shell fo-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="ad-mobile-overlay fo-overlay"
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
          <nav className="ad-nav" aria-label="Finance Officer navigation">
            <span className="ad-nav-label">Finance Officer Workspace</span>
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
            <div className="ad-avatar">{initials(name)}</div>
            <div className="fo-user-details">
              <strong>{name}</strong>
              <span>Finance Officer</span>
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
                placeholder="Search claims, employees, departments..."
                aria-label="Search Finance Officer records"
              />
              {search && (
                <button
                  type="button"
                  className="fo-clear-search"
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
              <span className="fo-notification-dot" />
            </button>
            <div className="ad-profile-wrapper">
              <div className="ad-profile-button fo-profile">
                <div className="ad-avatar">{initials(name)}</div>
                <div className="ad-profile-text">
                  <strong>{name}</strong>
                  <span>Finance Officer</span>
                  <small>{employeeId}</small>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="ad-content fo-content">
          <section className="ad-page-header fo-page-header">
            <div>
              <span className="ad-eyebrow">Finance Officer / {activeSection}</span>
              <h1>{activeSection === "Dashboard" ? "Finance Officer Dashboard" : activeSection}</h1>
              <p className="fo-subtitle">
                {activeSection === "Dashboard"
                  ? "Review claims, monitor budgets and oversee financial operations."
                  : `Finance Officer workspace for ${activeSection.toLowerCase()}.`}
              </p>
            </div>

            <label className="fo-year-select">
              <span>Financial Year</span>
              <select
                value={financialYear}
                onChange={(event) => setFinancialYear(event.target.value)}
                aria-label="Financial year"
              >
                <option value="2026–2027">2026–2027</option>
                <option value="2025–2026">2025–2026</option>
                <option value="2024–2025">2024–2025</option>
              </select>
            </label>
          </section>

          <div className="fo-preview-notice">
            <ShieldCheck size={16} />
            <span>UI preview — figures and claim records are illustrative, not live financial data.</span>
          </div>

          {activeSection === "Dashboard" ? (
            <>
              <section className="fo-kpi-grid">
                <article className="fo-kpi-card">
                  <div className="fo-kpi-icon blue"><ClipboardCheck size={22} /></div>
                  <div className="fo-kpi-copy">
                    <span>Pending Approvals</span>
                    <strong>12</strong>
                    <small>Claims awaiting review</small>
                  </div>
                  <span className="fo-kpi-change warning"><Clock3 size={13} /> Needs attention</span>
                </article>

                <article className="fo-kpi-card">
                  <div className="fo-kpi-icon purple"><CircleDollarSign size={22} /></div>
                  <div className="fo-kpi-copy">
                    <span>Claims Under Review</span>
                    <strong>₹2.84L</strong>
                    <small>Illustrative claim value</small>
                  </div>
                  <span className="fo-kpi-change neutral"><Activity size={13} /> In progress</span>
                </article>

                <article className="fo-kpi-card">
                  <div className="fo-kpi-icon green"><CheckCircle2 size={22} /></div>
                  <div className="fo-kpi-copy">
                    <span>Approved This Month</span>
                    <strong>46</strong>
                    <small>Illustrative monthly total</small>
                  </div>
                  <span className="fo-kpi-change positive"><ArrowUpRight size={13} /> +8 this month</span>
                </article>

                <article className="fo-kpi-card">
                  <div className="fo-kpi-icon amber"><Landmark size={22} /></div>
                  <div className="fo-kpi-copy">
                    <span>Budget Utilisation</span>
                    <strong>68%</strong>
                    <small>Illustrative allocation status</small>
                  </div>
                  <span className="fo-kpi-change neutral"><ArrowDownRight size={13} /> Within plan</span>
                </article>
              </section>

              <section className="fo-overview-grid">
                <article className="ad-card fo-card fo-budget-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Budget Status</span>
                      <h2>Financial Year Overview</h2>
                    </div>
                    <span className="fo-year-badge">{financialYear}</span>
                  </div>

                  <div className="fo-budget-total">
                    <div>
                      <span>Total illustrative allocation</span>
                      <strong>₹1.25 Cr</strong>
                    </div>
                    <div className="fo-budget-spent">
                      <span>Utilised</span>
                      <strong>₹85.00 L</strong>
                    </div>
                  </div>

                  <div className="fo-budget-track" role="progressbar" aria-label="Illustrative budget utilisation" aria-valuenow={68} aria-valuemin={0} aria-valuemax={100}>
                    <span />
                  </div>
                  <div className="fo-budget-legend">
                    <span><i className="used" /> 68% Utilised</span>
                    <span><i className="remaining" /> 32% Remaining</span>
                  </div>

                  <div className="fo-budget-breakdown">
                    <div>
                      <span className="fo-breakdown-icon blue"><Wallet size={17} /></span>
                      <span><strong>₹52.0 L</strong><small>Establishment</small></span>
                      <b>72%</b>
                    </div>
                    <div>
                      <span className="fo-breakdown-icon purple"><Users size={17} /></span>
                      <span><strong>₹21.5 L</strong><small>Employee benefits</small></span>
                      <b>61%</b>
                    </div>
                    <div>
                      <span className="fo-breakdown-icon amber"><FileText size={17} /></span>
                      <span><strong>₹11.5 L</strong><small>Other expenses</small></span>
                      <b>58%</b>
                    </div>
                  </div>
                </article>

                <article className="ad-card fo-card fo-approval-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Action Required</span>
                      <h2>Pending Approvals</h2>
                    </div>
                    <button type="button" className="fo-link-button" onClick={() => openSection("Claims Verification")}>
                      View queue <ChevronRight size={15} />
                    </button>
                  </div>

                  <button type="button" className="fo-approval-item" onClick={() => openSection("Claims Verification")}>
                    <span className="fo-approval-icon blue"><FileCheck2 size={19} /></span>
                    <span className="fo-approval-copy"><strong>Claims awaiting verification</strong><small>Review eligibility and supporting documents</small></span>
                    <b>12</b><ChevronRight size={16} />
                  </button>
                  <button type="button" className="fo-approval-item" onClick={() => openSection("Financial Operations")}>
                    <span className="fo-approval-icon purple"><Wallet size={19} /></span>
                    <span className="fo-approval-copy"><strong>Financial entries to review</strong><small>Check entries before processing</small></span>
                    <b>04</b><ChevronRight size={16} />
                  </button>
                  <button type="button" className="fo-approval-item" onClick={() => openSection("Payroll")}>
                    <span className="fo-approval-icon amber"><Users size={19} /></span>
                    <span className="fo-approval-copy"><strong>Payroll items for review</strong><small>Review monthly payroll summary</small></span>
                    <b>02</b><ChevronRight size={16} />
                  </button>

                  <div className="fo-approval-footnote">
                    <Clock3 size={14} />
                    <span>Illustrative queue counts. No approval action is executed here.</span>
                  </div>
                </article>
              </section>

              <section className="ad-card fo-card fo-claims-card">
                <div className="ad-card-header">
                  <div>
                    <span className="ad-card-eyebrow">Verification Queue</span>
                    <h2>Claims Requiring Attention</h2>
                    <p className="fo-card-description">Search and review sample claims assigned to the finance workflow.</p>
                  </div>
                  <button type="button" className="fo-link-button" onClick={() => openSection("Claims Verification")}>
                    Open claims workspace <ChevronRight size={15} />
                  </button>
                </div>

                <div className="fo-table-wrap">
                  <table className="fo-table">
                    <thead>
                      <tr>
                        <th>Claim ID</th><th>Employee</th><th>Department</th><th>Claim Type</th><th>Amount</th><th>Status</th><th>Priority</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleClaims.map((claim) => (
                        <tr key={claim.id}>
                          <td>{claim.id}</td>
                          <td>{claim.employee}</td>
                          <td>{claim.department}</td>
                          <td>{claim.type}</td>
                          <td>{money(claim.amount)}</td>
                          <td><span className={`fo-status ${statusClass(claim.status)}`}>{claim.status}</span></td>
                          <td><span className={`fo-priority ${claim.priority.toLowerCase()}`}>{claim.priority}</span></td>
                        </tr>
                      ))}
                      {visibleClaims.length === 0 && (
                        <tr><td colSpan={7} className="fo-empty">No matching claims found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="fo-table-footer">
                  <span>Showing {visibleClaims.length} of {claims.length} illustrative records</span>
                  <button type="button" className="fo-link-button" onClick={() => openSection("Claims Verification")}>
                    View all claims <ChevronRight size={15} />
                  </button>
                </div>
              </section>

              <section className="fo-lower-grid">
                <article className="ad-card fo-card">
                  <div className="ad-card-header">
                    <div><span className="ad-card-eyebrow">Recent Activity</span><h2>Latest Updates</h2></div>
                    <button type="button" className="fo-link-button" onClick={() => openSection("Reports")}>View reports <ChevronRight size={15} /></button>
                  </div>
                  <div className="fo-activity-list">
                    {activities.map((item) => (
                      <div className="fo-activity-item" key={item.ref}>
                        <span className="fo-activity-icon"><Activity size={16} /></span>
                        <div><strong>{item.title}</strong><small>{item.ref} · {item.time}</small></div>
                        <span className={`fo-status ${statusClass(item.status)}`}>{item.status}</span>
                      </div>
                    ))}
                  </div>
                </article>

                <article className="ad-card fo-card fo-quick-card">
                  <div className="ad-card-header">
                    <div><span className="ad-card-eyebrow">Quick Access</span><h2>Finance Workspace</h2></div>
                  </div>
                  <button type="button" className="fo-quick-link" onClick={() => openSection("Claims Verification")}><ClipboardCheck size={18} /><span><strong>Claims Verification</strong><small>Review claims and documentation</small></span><ChevronRight size={16} /></button>
                  <button type="button" className="fo-quick-link" onClick={() => openSection("Financial Operations")}><CircleDollarSign size={18} /><span><strong>Financial Operations</strong><small>Review financial entries</small></span><ChevronRight size={16} /></button>
                  <button type="button" className="fo-quick-link" onClick={() => openSection("Reports")}><ChartNoAxesCombined size={18} /><span><strong>Reports &amp; Analytics</strong><small>Access finance summaries</small></span><ChevronRight size={16} /></button>
                </article>
              </section>
            </>
          ) : (
            <section className="ad-card fo-card fo-placeholder">
              <span className="fo-placeholder-icon"><FileText size={25} /></span>
              <h2>{activeSection}</h2>
              <p>
                This section is part of the Finance Officer workspace. Detailed workflows and live records
                require the relevant API integration and are not simulated as completed actions here.
              </p>
              <p className="fo-placeholder-note">
                UI preview only. This screen does not approve claims, transfer funds, modify payroll,
                or change official financial records.
              </p>
              <button type="button" className="fo-back-button" onClick={() => openSection("Dashboard")}>
                Back to dashboard
              </button>
            </section>
          )}

          <footer className="fo-footer">
            <span>Government Finance Management System</span>
            <span>Finance Officer Workspace · UI preview</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
