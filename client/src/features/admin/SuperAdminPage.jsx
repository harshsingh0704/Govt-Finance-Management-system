import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  FileCheck2,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";
import "./SuperAdminPage.css";
import { logout } from "../auth/authSlice";
import ApprovalQueueModal from "./components/ApprovalQueueModal";

const KPI_DATA = [
  {
    label: "Total Employees",
    value: "2,486",
    change: "+4.2%",
    changeText: "this quarter",
    icon: Users,
  },
  {
    label: "Active Claims",
    value: "184",
    change: "32",
    changeText: "require attention",
    icon: ClipboardCheck,
  },
  {
    label: "Total Expenditure",
    value: "â‚¹2.84 Cr",
    change: "FY 2026â€“27",
    changeText: "current financial year",
    icon: CircleDollarSign,
  },
  {
    label: "Pending Approvals",
    value: "27",
    change: "8",
    changeText: "high priority",
    icon: FileCheck2,
  },
];

const DEPARTMENT_DATA = [
  {
    name: "Engineering",
    claims: 56,
    approved: 44,
    amount: "â‚¹31.8L",
    percentage: 86,
  },
  {
    name: "Finance",
    claims: 42,
    approved: 38,
    amount: "â‚¹24.5L",
    percentage: 72,
  },
  {
    name: "Operations",
    claims: 37,
    approved: 29,
    amount: "â‚¹22.1L",
    percentage: 63,
  },
  {
    name: "Administration",
    claims: 31,
    approved: 27,
    amount: "â‚¹18.2L",
    percentage: 54,
  },
  {
    name: "Human Resources",
    claims: 18,
    approved: 16,
    amount: "â‚¹9.4L",
    percentage: 38,
  },
];

const ACTIVITIES = [
  {
    title: "12 claims approved",
    description: "Finance Department",
    time: "10 min ago",
    type: "approval",
  },
  {
    title: "New administrator created",
    description: "HR Department",
    time: "1 hour ago",
    type: "admin",
  },
  {
    title: "Payment batch processed",
    description: "â‚¹18.4L processed successfully",
    time: "2 hours ago",
    type: "payment",
  },
  {
    title: "8 claims flagged for review",
    description: "Automated compliance check",
    time: "3 hours ago",
    type: "alert",
  },
];

const FINANCIAL_DATA = [
  38, 44, 42, 49, 56, 51, 61, 58, 68, 64, 73, 79,
];

const MONTHS = [
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
  "Jan",
  "Feb",
  "Mar",
];

function FinancialChart() {
  const points = FINANCIAL_DATA.map((value, index) => {
    const x = 20 + index * 28;
    const y = 170 - value * 1.55;
    return `${x},${y}`;
  }).join(" ");

  return (
    <div className="sa-chart">
      <svg
        viewBox="0 0 340 190"
        preserveAspectRatio="none"
        className="sa-chart-svg"
        aria-label="Financial expenditure trend"
        role="img"
      >
        {[35, 70, 105, 140].map((y) => (
          <line
            key={y}
            x1="20"
            x2="328"
            y1={y}
            y2={y}
            className="sa-chart-grid"
          />
        ))}

        <polyline
          points={points}
          fill="none"
          className="sa-chart-line"
        />

        {FINANCIAL_DATA.map((value, index) => {
          const x = 20 + index * 28;
          const y = 170 - value * 1.55;

          return (
            <circle
              key={`${value}-${index}`}
              cx={x}
              cy={y}
              r="3"
              className="sa-chart-point"
            />
          );
        })}
      </svg>

      <div className="sa-chart-labels">
        {MONTHS.map((month) => (
          <span key={month}>{month}</span>
        ))}
      </div>
    </div>
  );
}

function QuickActionModal({ onClose }) {
  return (
    <div
      className="sa-modal-overlay"
      role="presentation"
      onMouseDown={onClose}
    >
      <div
        className="sa-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-admin-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="sa-modal-header">
          <div>
            <span className="sa-modal-eyebrow">Administrator Management</span>
            <h2 id="add-admin-title">Create / Invite Administrator</h2>
          </div>

          <button
            type="button"
            className="sa-icon-button"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={19} />
          </button>
        </div>

        <p className="sa-modal-description">
          Start the controlled administrator account creation workflow.
          The administrator will receive an invitation after the details and
          permissions are reviewed.
        </p>

        <div className="sa-form-grid">
          <label>
            Full Name
            <input placeholder="Enter administrator name" />
          </label>

          <label>
            Official Email
            <input
              type="email"
              placeholder="administrator@fms.gov.in"
            />
          </label>

          <label>
            Employee ID
            <input placeholder="Enter employee ID" />
          </label>

          <label>
            Department
            <select defaultValue="Finance Department">
              <option>Finance Department</option>
              <option>Administration</option>
              <option>Human Resources</option>
              <option>Operations</option>
              <option>Engineering</option>
            </select>
          </label>
        </div>

        <div className="sa-permission-box">
          <div>
            <strong>Initial permissions</strong>
            <span>These can be adjusted before sending the invitation.</span>
          </div>

          <div className="sa-permission-list">
            <label>
              <input type="checkbox" defaultChecked />
              Review claims
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Verify documents
            </label>

            <label>
              <input type="checkbox" defaultChecked />
              Process reimbursements
            </label>

            <label>
              <input type="checkbox" />
              Approve payments
            </label>
          </div>
        </div>

        <div className="sa-modal-footer">
          <button
            type="button"
            className="sa-secondary-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button type="button" className="sa-primary-button">
            Send Invitation
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState("FY 2026â€“27");
  const [showProfile, setShowProfile] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  return (
    <div className="sa-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="sa-mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sa-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sa-brand">
          <div className="sa-brand-mark">FMS</div>

          <div>
            <strong>Finance Management</strong>
            <span>System</span>
          </div>

          <button
            type="button"
            className="sa-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sa-sidebar-scroll">
          <nav className="sa-nav">
            <span className="sa-nav-label">Overview</span>

            <button className="sa-nav-item active">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button className="sa-nav-item">
              <Activity size={18} />
              <span>Organization Overview</span>
            </button>

            <span className="sa-nav-label">Finance</span>

            <button className="sa-nav-item">
              <ClipboardCheck size={18} />
              <span>All Claims</span>
            </button>

            <button className="sa-nav-item" onClick={() => setShowApprovalModal(true)}><FileCheck2 size={18} /><span>Approval Queue</span>
              <small>27</small>
            </button>

            <button className="sa-nav-item">
              <CreditCard size={18} />
              <span>Payments</span>
            </button>

            <button className="sa-nav-item">
              <CircleDollarSign size={18} />
              <span>Expenditure</span>
            </button>

            <span className="sa-nav-label">Organization</span>

            <button className="sa-nav-item">
              <Users size={18} />
              <span>Employees</span>
            </button>

            <button className="sa-nav-item">
              <UserCog size={18} />
              <span>Administrators</span>
            </button>

            <button className="sa-nav-item">
              <Building2 size={18} />
              <span>Departments</span>
            </button>

            <span className="sa-nav-label">Insights</span>

            <button className="sa-nav-item">
              <FileBarChart size={18} />
              <span>Reports</span>
            </button>

            <button className="sa-nav-item">
              <BarChart3 size={18} />
              <span>Financial Analytics</span>
            </button>

            <button className="sa-nav-item">
              <ShieldCheck size={18} />
              <span>Audit Trail</span>
            </button>

            <span className="sa-nav-label">System</span>

            <button className="sa-nav-item">
              <Settings size={18} />
              <span>System Settings</span>
            </button>
          </nav>
        </div>

        <div className="sa-sidebar-footer">
          <div className="sa-user-mini">
            <div className="sa-avatar">SA</div>

            <div>
              <strong>{user?.name || "FMS Super Admin"}</strong>
              <span>Super Administrator</span>
            </div>
          </div>

          <button
            type="button"
            className="sa-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="sa-main">
        <header className="sa-topbar">
          <div className="sa-topbar-left">
            <button
              type="button"
              className="sa-menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="sa-search">
              <Search size={17} />
              <input
                placeholder="Search employees, claims, reports..."
                aria-label="Search"
              />
              <kbd>âŒ˜ K</kbd>
            </div>
          </div>

          <div className="sa-topbar-right">
            <button
              type="button"
              className="sa-notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span />
            </button>

            <div className="sa-profile-wrapper">
              <button
                type="button"
                className="sa-profile-button"
                onClick={() => setShowProfile((value) => !value)}
              >
                <div className="sa-avatar">SA</div>

                <div className="sa-profile-text">
                  <strong>{user?.name || "FMS Super Admin"}</strong>
                  <span>Chief Executive / Management</span>
                </div>

                <ChevronDown size={16} />
              </button>

              {showProfile && (
                <div className="sa-profile-menu">
                  <button type="button">My Profile</button>
                  <button type="button">Organization Settings</button>
                  <button type="button" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="sa-content">
          <section className="sa-page-header">
            <div>
              <span className="sa-eyebrow">Organization / Dashboard</span>

              <h1>Good morning, Management</h1>

              <p>
                Here's the current financial and operational overview
                across your organization.
              </p>
            </div>

            <div className="sa-header-period">
              <span>Financial period</span>

              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option>FY 2026â€“27</option>
                <option>FY 2025â€“26</option>
                <option>FY 2024â€“25</option>
              </select>
            </div>
          </section>

          <section className="sa-kpi-grid">
            {KPI_DATA.map((item) => {
              const Icon = item.icon;

              return (
                <article className="sa-kpi-card" key={item.label}>
                  <div className="sa-kpi-top">
                    <div className="sa-kpi-icon">
                      <Icon size={20} />
                    </div>

                    <button type="button" className="sa-card-link">
                      View
                    </button>
                  </div>

                  <div className="sa-kpi-value">{item.value}</div>

                  <div className="sa-kpi-label">{item.label}</div>

                  <div className="sa-kpi-change">
                    <strong>{item.change}</strong>
                    <span>{item.changeText}</span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="sa-main-grid">
            <article className="sa-card sa-financial-card">
              <div className="sa-card-header">
                <div>
                  <span className="sa-card-eyebrow">Financial performance</span>
                  <h2>Financial Overview</h2>
                </div>

                <button type="button" className="sa-outline-button">
                  View report
                </button>
              </div>

              <div className="sa-financial-summary">
                <div>
                  <span>Total expenditure</span>
                  <strong>â‚¹2.84 Cr</strong>
                </div>

                <div>
                  <span>Approved claims</span>
                  <strong>â‚¹2.31 Cr</strong>
                </div>

                <div>
                  <span>Utilization</span>
                  <strong>81.3%</strong>
                </div>
              </div>

              <FinancialChart />
            </article>

            <article className="sa-card sa-approval-card">
              <div className="sa-card-header">
                <div>
                  <span className="sa-card-eyebrow">Action required</span>
                  <h2>Approval Queue</h2>
                </div>

                <span className="sa-count-badge">27</span>
              </div>

              <div className="sa-queue">
                <button type="button" className="sa-queue-item danger">
                  <div className="sa-queue-icon">
                    <AlertTriangle size={18} />
                  </div>

                  <div>
                    <strong>8 High Priority</strong>
                    <span>Claims requiring immediate attention</span>
                  </div>

                  <span className="sa-arrow">â†’</span>
                </button>

                <button type="button" className="sa-queue-item warning">
                  <div className="sa-queue-icon">
                    <FileCheck2 size={18} />
                  </div>

                  <div>
                    <strong>19 Pending Review</strong>
                    <span>Awaiting administrative action</span>
                  </div>

                  <span className="sa-arrow">â†’</span>
                </button>

                <button type="button" className="sa-queue-item success">
                  <div className="sa-queue-icon">
                    <ClipboardCheck size={18} />
                  </div>

                  <div>
                    <strong>42 Recently Approved</strong>
                    <span>Approved during the current month</span>
                  </div>

                  <span className="sa-arrow">â†’</span>
                </button>
              </div>

              <button type="button" className="sa-primary-button full" onClick={() => setShowApprovalModal(true)}>Open Approval Queue</button>
            </article>
          </section>

          <section className="sa-secondary-grid">
            <article className="sa-card">
              <div className="sa-card-header">
                <div>
                  <span className="sa-card-eyebrow">Organization</span>
                  <h2>Department Performance</h2>
                </div>

                <button type="button" className="sa-text-button">
                  View report â†’
                </button>
              </div>

              <div className="sa-department-table">
                <div className="sa-table-head">
                  <span>Department</span>
                  <span>Claims</span>
                  <span>Approved</span>
                  <span>Amount</span>
                </div>

                {DEPARTMENT_DATA.map((department) => (
                  <div className="sa-table-row" key={department.name}>
                    <div className="sa-department-name">
                      <span
                        className="sa-department-bar"
                        style={{
                          width: `${department.percentage}%`,
                        }}
                      />
                      <strong>{department.name}</strong>
                    </div>

                    <span>{department.claims}</span>
                    <span>{department.approved}</span>
                    <strong>{department.amount}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="sa-card">
              <div className="sa-card-header">
                <div>
                  <span className="sa-card-eyebrow">System activity</span>
                  <h2>Recent Activity</h2>
                </div>

                <button type="button" className="sa-text-button">
                  Audit trail â†’
                </button>
              </div>

              <div className="sa-activity-list">
                {ACTIVITIES.map((activity) => (
                  <div className="sa-activity-item" key={activity.title}>
                    <span
                      className={`sa-activity-dot ${activity.type}`}
                    />

                    <div>
                      <strong>{activity.title}</strong>
                      <span>{activity.description}</span>
                    </div>

                    <time>{activity.time}</time>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="sa-bottom-grid">
            <article className="sa-card sa-attention-card">
              <div className="sa-card-header">
                <div>
                  <span className="sa-card-eyebrow">Management alerts</span>
                  <h2>Requires Attention</h2>
                </div>

                <AlertTriangle size={20} />
              </div>

              <div className="sa-alert-list">
                <button type="button">
                  <span className="sa-alert-icon warning">
                    <AlertTriangle size={17} />
                  </span>

                  <div>
                    <strong>8 claims pending beyond SLA</strong>
                    <span>Review the delayed claims queue.</span>
                  </div>

                  <span>â†’</span>
                </button>

                <button type="button">
                  <span className="sa-alert-icon warning">
                    <CreditCard size={17} />
                  </span>

                  <div>
                    <strong>Payment batch awaiting processing</strong>
                    <span>â‚¹12.6L is ready for processing.</span>
                  </div>

                  <span>â†’</span>
                </button>

                <button type="button">
                  <span className="sa-alert-icon info">
                    <UserCog size={17} />
                  </span>

                  <div>
                    <strong>2 administrator invitations pending</strong>
                    <span>Awaiting account activation.</span>
                  </div>

                  <span>â†’</span>
                </button>
              </div>
            </article>

            <article className="sa-card sa-quick-card">
              <div className="sa-card-header">
                <div>
                  <span className="sa-card-eyebrow">Management tools</span>
                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="sa-quick-actions">
                <button
                  type="button"
                  className="sa-quick-action primary"
                  onClick={() => setShowAdminModal(true)}
                >
                  <span>
                    <Plus size={20} />
                  </span>

                  <div>
                    <strong>Add Administrator</strong>
                    <small>Create or invite a finance administrator</small>
                  </div>
                </button>

                <button type="button" className="sa-quick-action">
                  <span>
                    <Plus size={20} />
                  </span>

                  <div>
                    <strong>Add Employee</strong>
                    <small>Register an employee account</small>
                  </div>
                </button>

                <button type="button" className="sa-quick-action">
                  <span>
                    <FileBarChart size={19} />
                  </span>

                  <div>
                    <strong>View Reports</strong>
                    <small>Organization financial reports</small>
                  </div>
                </button>

                <button type="button" className="sa-quick-action">
                  <span>
                    <ShieldCheck size={19} />
                  </span>

                  <div>
                    <strong>Open Audit Trail</strong>
                    <small>Review system activity</small>
                  </div>
                </button>
              </div>
            </article>
          </section>
        </div>
      </main>

      {showApprovalModal && (
        <ApprovalQueueModal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
        />
      )}

      {showAdminModal && (
        <QuickActionModal onClose={() => setShowAdminModal(false)} />
      )}
    </div>
  );
}

