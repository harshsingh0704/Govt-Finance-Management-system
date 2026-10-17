import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CloudUpload,
  Database,
  FileCheck2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  ClipboardList,
  Send,
  Users,
  Wallet,
  X,
  ChartColumnIncreasing,
} from "lucide-react";

import { logout } from "../../auth/authSlice";
import "../AdminPage.css";
import "./FinanceClerkPage.css";

const bills = [
  { id: "CL-2041", type: "TA Claim", employee: "Rahul Kumar", amount: "₹12,450", status: "Draft", due: "14 Oct 2026" },
  { id: "CL-2042", type: "Medical Claim", employee: "Priya Sharma", amount: "₹8,900", status: "Documents pending", due: "15 Oct 2026" },
  { id: "CL-2043", type: "LTC Claim", employee: "Ankit Verma", amount: "₹18,300", status: "Ready to forward", due: "16 Oct 2026" },
  { id: "BILL-1087", type: "Office Supplies", employee: "General Office", amount: "₹25,600", status: "In preparation", due: "17 Oct 2026" },
  { id: "BILL-1088", type: "Travel Reimbursement", employee: "Neha Singh", amount: "₹6,750", status: "Draft", due: "18 Oct 2026" },
];

const activities = [
  { time: "10:24 AM", activity: "Uploaded salary data for October 2026", ref: "PAY-2026-10", status: "Completed" },
  { time: "09:18 AM", activity: "Prepared bill draft for office supplies", ref: "BILL-1087", status: "In Progress" },
  { time: "08:45 AM", activity: "Verified documents for medical claim", ref: "CL-2042", status: "Documents verified" },
  { time: "08:32 AM", activity: "Updated claim details", ref: "CL-2041", status: "Updated" },
  { time: "07:56 AM", activity: "Generated payslip draft", ref: "PAY-2026-10", status: "Completed" },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Claims Processing", icon: FileText, count: "12" },
  { label: "Financial Data Entry", icon: Database },
  { label: "Payroll Assistance", icon: Wallet },
  { label: "Document Management", icon: FolderOpen },
  { label: "Reports", icon: ChartColumnIncreasing },
  { label: "Notifications", icon: Bell, count: "5" },
  { label: "My Settings", icon: Settings },
];

const taskItems = [
  { label: "Bills awaiting preparation", detail: "New bills from departments", count: "08", icon: FileText, tone: "blue", section: "Claims Processing" },
  { label: "Documents pending verification", detail: "Verify supporting documents", count: "07", icon: ClipboardList, tone: "purple", section: "Document Management" },
  { label: "Claims ready to forward", detail: "Send to Finance Officer", count: "04", icon: Send, tone: "green", section: "Claims Processing" },
  { label: "Tasks due today", detail: "High priority items", count: "05", icon: Clock3, tone: "amber", section: "Claims Processing" },
];

function initials(value) {
  return String(value || "FC")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function statusClass(status) {
  if (status === "Draft") return "draft";
  if (status === "Documents pending") return "documents";
  if (status === "Ready to forward") return "ready";
  if (status === "In preparation") return "preparing";
  if (status === "Completed" || status === "Documents verified") return "completed";
  if (status === "In Progress") return "in-progress";
  return "updated";
}

export default function FinanceClerkPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [financialYear, setFinancialYear] = useState("2026–2027");
  const [payrollMonth, setPayrollMonth] = useState("October 2026");

  const name =
    user?.fullName ||
    user?.name ||
    user?.employeeName ||
    user?.email?.split("@")[0] ||
    "Finance Clerk";

  const employeeId =
    user?.employeeId ||
    user?.employee_id ||
    user?.empId ||
    user?.employee?.employeeId ||
    "Not available";

  const visibleBills = bills.filter((bill) =>
    `${bill.id} ${bill.type} ${bill.employee} ${bill.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const visibleActivities = activities.filter((item) =>
    `${item.activity} ${item.ref} ${item.status}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  function openSection(section) {
    setActiveSection(section);
    setSidebarOpen(false);
  }

  function signOut() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

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

        <div className="ad-sidebar-scroll">
          <nav className="ad-nav" aria-label="Finance Clerk navigation">
            <span className="ad-nav-label">Finance Clerk Workspace</span>
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
            <div className="fc-user-details">
              <strong>{name}</strong>
              <span>Finance Clerk</span>
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
                placeholder="Search claims, bills, employees, documents..."
                aria-label="Search Finance Clerk records"
              />
              {search && (
                <button
                  type="button"
                  className="fc-clear-search"
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
              <span className="fc-notification-dot" />
            </button>
            <div className="ad-profile-wrapper">
              <div className="ad-profile-button fc-profile">
                <div className="ad-avatar">{initials(name)}</div>
                <div className="ad-profile-text">
                  <strong>{name}</strong>
                  <span>Finance Clerk</span>
                  <small>{employeeId}</small>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="ad-content fc-content">
          <section className="ad-page-header fc-page-header">
            <div>
              <span className="ad-eyebrow">Finance Clerk / {activeSection}</span>
              <h1>{activeSection === "Dashboard" ? "Finance Clerk Dashboard" : activeSection}</h1>
              <p className="fc-subtitle">
                {activeSection === "Dashboard"
                  ? "Data entry, bill preparation and document verification."
                  : `Finance Clerk workspace for ${activeSection.toLowerCase()}.`}
              </p>
            </div>

            <label className="fc-year-select">
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

          {activeSection === "Dashboard" ? (
            <>
              <section className="fc-kpi-grid">
                <article className="fc-kpi-card">
                  <div className="fc-kpi-icon blue"><FileText size={23} /></div>
                  <div className="fc-kpi-copy">
                    <span>Bills to Prepare</span>
                    <strong>18</strong>
                    <small>Pending bill preparation</small>
                  </div>
                  <span className="fc-trend up">↑ +4 <small>vs last week</small></span>
                </article>

                <article className="fc-kpi-card">
                  <div className="fc-kpi-icon purple"><ClipboardList size={23} /></div>
                  <div className="fc-kpi-copy">
                    <span>Claims in Progress</span>
                    <strong>12</strong>
                    <small>Under processing</small>
                  </div>
                  <span className="fc-trend down">↓ -3 <small>vs last week</small></span>
                </article>

                <article className="fc-kpi-card">
                  <div className="fc-kpi-icon amber"><FolderOpen size={23} /></div>
                  <div className="fc-kpi-copy">
                    <span>Documents to Verify</span>
                    <strong>07</strong>
                    <small>Awaiting verification</small>
                  </div>
                  <span className="fc-trend up">↑ +2 <small>vs last week</small></span>
                </article>

                <article className="fc-kpi-card">
                  <div className="fc-kpi-icon green"><CheckCircle2 size={23} /></div>
                  <div className="fc-kpi-copy">
                    <span>Tasks Due Today</span>
                    <strong>05</strong>
                    <small>High priority items</small>
                  </div>
                  <span className="fc-trend down">↓ -1 <small>vs yesterday</small></span>
                </article>
              </section>

              <section className="fc-main-grid">
                <article className="ad-card fc-card fc-work-queue">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Work Queue</span>
                      <h2>Pending Bills &amp; Claims</h2>
                    </div>
                    <button type="button" className="fc-link-button" onClick={() => openSection("Claims Processing")}>
                      View all <ChevronRight size={15} />
                    </button>
                  </div>

                  <div className="fc-table-wrap">
                    <table className="fc-table">
                      <thead>
                        <tr>
                          <th>ID</th><th>Type</th><th>Employee</th><th>Amount</th><th>Status</th><th>Due Date</th><th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleBills.map((bill) => (
                          <tr key={bill.id}>
                            <td>{bill.id}</td>
                            <td>{bill.type}</td>
                            <td>{bill.employee}</td>
                            <td>{bill.amount}</td>
                            <td><span className={`fc-status ${statusClass(bill.status)}`}>{bill.status}</span></td>
                            <td>{bill.due}</td>
                            <td>
                              <button type="button" className="fc-open-button" onClick={() => openSection("Claims Processing")}>
                                Open
                              </button>
                            </td>
                          </tr>
                        ))}
                        {visibleBills.length === 0 && (
                          <tr><td colSpan={7} className="fc-empty">No matching bills or claims found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="ad-card fc-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Task Summary</span>
                      <h2>Key Activities</h2>
                    </div>
                    <button type="button" className="fc-link-button" onClick={() => openSection("Claims Processing")}>
                      View all <ChevronRight size={15} />
                    </button>
                  </div>

                  <div className="fc-task-list">
                    {taskItems.map(({ label, detail, count, icon: Icon, tone, section }) => (
                      <button type="button" className="fc-task-item" key={label} onClick={() => openSection(section)}>
                        <span className={`fc-task-icon ${tone}`}><Icon size={20} /></span>
                        <span className="fc-task-copy">
                          <strong>{label}</strong>
                          <small>{detail}</small>
                        </span>
                        <b>{count}</b>
                        <ChevronRight size={16} />
                      </button>
                    ))}
                  </div>
                </article>
              </section>

              <section className="fc-lower-grid">
                <article className="ad-card fc-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Recent Activity</span>
                      <h2>Latest Updates</h2>
                    </div>
                    <button type="button" className="fc-link-button" onClick={() => openSection("Reports")}>
                      View all <ChevronRight size={15} />
                    </button>
                  </div>

                  <div className="fc-table-wrap">
                    <table className="fc-activity-table">
                      <thead>
                        <tr><th>Time</th><th>Activity</th><th>Reference ID</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {visibleActivities.map((item) => (
                          <tr key={`${item.time}-${item.ref}`}>
                            <td>{item.time}</td>
                            <td>{item.activity}</td>
                            <td>{item.ref}</td>
                            <td><span className={`fc-status ${statusClass(item.status)}`}>{item.status}</span></td>
                          </tr>
                        ))}
                        {visibleActivities.length === 0 && (
                          <tr><td colSpan={4} className="fc-empty">No matching activity found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </article>

                <article className="ad-card fc-card fc-payroll-card">
                  <div className="ad-card-header">
                    <div>
                      <span className="ad-card-eyebrow">Payroll Preparation</span>
                      <h2>Salary Data Upload</h2>
                    </div>
                    <label className="fc-month-select">
                      <CalendarDays size={15} />
                      <select value={payrollMonth} onChange={(event) => setPayrollMonth(event.target.value)} aria-label="Payroll month">
                        <option>October 2026</option>
                        <option>September 2026</option>
                        <option>August 2026</option>
                      </select>
                    </label>
                  </div>

                  <div className="fc-upload-summary">
                    <span className="fc-upload-icon"><CloudUpload size={23} /></span>
                    <div className="fc-upload-copy">
                      <strong>Salary Data Upload</strong>
                      <small>Upload and prepare salary data as per process</small>
                      <div className="fc-progress"><span /></div>
                    </div>
                    <div className="fc-progress-value"><strong>80%</strong><small>Completed</small></div>
                  </div>

                  <div className="fc-payroll-stats">
                    <div>
                      <span className="fc-payroll-icon"><Users size={21} /></span>
                      <span><strong>128</strong><small>Salary records processed</small></span>
                    </div>
                    <div>
                      <span className="fc-payroll-icon"><FileCheck2 size={21} /></span>
                      <span><strong>124</strong><small>Payslip drafts generated</small></span>
                    </div>
                  </div>

                  <button type="button" className="fc-payroll-button" onClick={() => openSection("Payroll Assistance")}>
                    View payroll workspace <ChevronRight size={15} />
                  </button>
                </article>
              </section>
            </>
          ) : (
            <section className="ad-card fc-card fc-placeholder">
              <div className="fc-placeholder-icon"><FolderOpen size={26} /></div>
              <h2>{activeSection}</h2>
              <p>
                This workspace is prepared for the Finance Clerk role.
                Detailed workflows and live records will be connected in a later integration step.
              </p>
              <p className="fc-demo-note">
                UI preview only. No financial records, payroll data, or approval decisions are changed by this screen.
              </p>
              <button type="button" className="fc-back-button" onClick={() => openSection("Dashboard")}>
                Back to dashboard
              </button>
            </section>
          )}

          <footer className="fc-footer">
            <span>Government Finance Management System</span>
            <span>Finance Clerk Workspace · UI preview</span>
          </footer>
        </div>
      </main>
    </div>
  );
}