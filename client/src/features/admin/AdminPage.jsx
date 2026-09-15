import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  ClipboardCheck,
  CreditCard,
  FileBarChart,
  FileCheck2,
  FileSearch,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { logout } from "../auth/authSlice";
import CreateEmployeeModal from "./components/CreateEmployeeModal";

const ADMIN_STATS = [
  {
    label: "Claims Awaiting Review",
    value: "42",
    highlight: "12",
    detail: "submitted today",
    icon: ClipboardCheck,
  },
  {
    label: "Documents Pending Verification",
    value: "18",
    highlight: "6",
    detail: "require attention",
    icon: FileSearch,
  },
  {
    label: "Approved / Sanctioned",
    value: "₹18.6L",
    highlight: "32",
    detail: "claims this month",
    icon: CheckCircle2,
  },
  {
    label: "Payment Processing",
    value: "₹12.6L",
    highlight: "24",
    detail: "claims ready",
    icon: CreditCard,
  },
];

const CLAIMS = [
  {
    id: "TA-2026-1042",
    employee: "Rahul Kumar",
    type: "TA",
    amount: "₹24,500",
    status: "Review",
  },
  {
    id: "LTC-2026-0871",
    employee: "Priya Sharma",
    type: "LTC",
    amount: "₹38,200",
    status: "Review",
  },
  {
    id: "MED-2026-2194",
    employee: "Amit Verma",
    type: "Medical",
    amount: "₹12,800",
    status: "Query",
  },
  {
    id: "TA-2026-1038",
    employee: "Neha Singh",
    type: "TA",
    amount: "₹18,600",
    status: "Review",
  },
];

const DEPARTMENTS = [
  {
    name: "Engineering",
    pending: 12,
    processing: 8,
    amount: "₹4.2L",
  },
  {
    name: "Finance",
    pending: 9,
    processing: 5,
    amount: "₹3.1L",
  },
  {
    name: "Operations",
    pending: 8,
    processing: 6,
    amount: "₹2.8L",
  },
  {
    name: "Administration",
    pending: 7,
    processing: 4,
    amount: "₹1.9L",
  },
  {
    name: "Human Resources",
    pending: 6,
    processing: 3,
    amount: "₹1.4L",
  },
];

const OPERATIONS = [
  {
    title: "Claim TA-2026-1042 approved",
    description: "₹24,500",
    time: "8 min ago",
    type: "success",
  },
  {
    title: "Documents verified",
    description: "LTC-2026-0871",
    time: "22 min ago",
    type: "verified",
  },
  {
    title: "Medical claim returned",
    description: "Missing prescription",
    time: "1 hour ago",
    type: "query",
  },
  {
    title: "Payment batch PB-2026-091 processed",
    description: "₹4.2L",
    time: "2 hours ago",
    type: "payment",
  },
];

function ClaimTypeChart({ selectedType, onSelect }) {
  const claimTypes = [
    {
      type: "TA",
      value: 96,
      percentage: 52,
    },
    {
      type: "LTC",
      value: 54,
      percentage: 29,
    },
    {
      type: "Medical",
      value: 34,
      percentage: 19,
    },
  ];

  return (
    <div className="ad-claim-breakdown">
      <div className="ad-breakdown-total">
        <div>
          <span>Total active claims</span>
          <strong>184</strong>
        </div>

        <span className="ad-breakdown-period">Current period</span>
      </div>

      <div className="ad-breakdown-bars">
        {claimTypes.map((item) => (
          <button
            type="button"
            key={item.type}
            className={`ad-breakdown-row ${
              selectedType === item.type ? "selected" : ""
            }`}
            onClick={() => onSelect(item.type)}
          >
            <div className="ad-breakdown-label">
              <span>{item.type}</span>
              <strong>{item.value}</strong>
            </div>

            <div className="ad-progress-track">
              <span
                className="ad-progress-fill"
                style={{ width: `${item.percentage}%` }}
              />
            </div>

            <small>{item.percentage}%</small>
          </button>
        ))}
      </div>

      {selectedType && (
        <button
          type="button"
          className="ad-clear-filter"
          onClick={() => onSelect(null)}
        >
          Clear claim filter
        </button>
      )}
    </div>
  );
}

function VerificationPanel() {
  return (
    <article className="ad-card ad-verification-card">
      <div className="ad-card-header">
        <div>
          <span className="ad-card-eyebrow">Document control</span>
          <h2>Verification Queue</h2>
        </div>

        <span className="ad-count-badge">18</span>
      </div>

      <div className="ad-verification-list">
        <button type="button" className="ad-verification-item danger">
          <div className="ad-verification-icon">
            <AlertTriangle size={17} />
          </div>

          <div>
            <strong>6 Missing Documents</strong>
            <span>Employee action required</span>
          </div>

          <span className="ad-arrow">→</span>
        </button>

        <button type="button" className="ad-verification-item warning">
          <div className="ad-verification-icon">
            <FileCheck2 size={17} />
          </div>

          <div>
            <strong>8 Awaiting Verification</strong>
            <span>Ready for document review</span>
          </div>

          <span className="ad-arrow">→</span>
        </button>

        <button type="button" className="ad-verification-item success">
          <div className="ad-verification-icon">
            <CheckCircle2 size={17} />
          </div>

          <div>
            <strong>4 Recently Verified</strong>
            <span>Completed today</span>
          </div>

          <span className="ad-arrow">→</span>
        </button>
      </div>

      <button type="button" className="ad-primary-button full">
        Open Verification Queue
      </button>
    </article>
  );
}

function PaymentPanel() {
  return (
    <article className="ad-card">
      <div className="ad-card-header">
        <div>
          <span className="ad-card-eyebrow">Financial operations</span>
          <h2>Payment Processing</h2>
        </div>

        <button type="button" className="ad-text-button">
          View all →
        </button>
      </div>

      <div className="ad-payment-summary">
        <div className="ad-payment-highlight">
          <div className="ad-payment-icon">
            <CreditCard size={19} />
          </div>

          <div>
            <span>Ready for payment</span>
            <strong>₹12.6L</strong>
            <small>24 claims</small>
          </div>
        </div>

        <div className="ad-payment-line">
          <span>Processing</span>
          <strong>₹7.8L</strong>
          <small>15 claims</small>
        </div>

        <div className="ad-payment-line">
          <span>Completed today</span>
          <strong>₹4.2L</strong>
          <small>9 claims</small>
        </div>
      </div>

      <button type="button" className="ad-primary-button full">
        Open Payment Processing
      </button>
    </article>
  );
}

export default function AdminPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user);

const [sidebarOpen, setSidebarOpen] = useState(false);
const [period, setPeriod] = useState("Today");
const [showProfile, setShowProfile] = useState(false);
const [selectedClaimType, setSelectedClaimType] = useState(null);
const [showCreateEmployee, setShowCreateEmployee] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };

  const visibleClaims = selectedClaimType
    ? CLAIMS.filter((claim) => claim.type === selectedClaimType)
    : CLAIMS;

  return (
    <div className="ad-shell">
      {sidebarOpen && (
        <button
          type="button"
          className="ad-mobile-overlay"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ad-brand">
          <div className="ad-brand-mark">FMS</div>

          <div>
            <strong>Finance Management</strong>
            <span>System</span>
          </div>

          <button
            type="button"
            className="ad-mobile-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <X size={19} />
          </button>
        </div>

        <div className="ad-sidebar-scroll">
          <nav className="ad-nav">
            <span className="ad-nav-label">Overview</span>

            <button type="button" className="ad-nav-item active">
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </button>

            <button type="button" className="ad-nav-item">
              <Activity size={18} />
              <span>Operations Overview</span>
            </button>

            <span className="ad-nav-label">Claims</span>

            <button type="button" className="ad-nav-item">
              <ClipboardCheck size={18} />
              <span>All Claims</span>
            </button>

            <button type="button" className="ad-nav-item">
              <FileCheck2 size={18} />
              <span>Review Queue</span>
              <small>42</small>
            </button>

            <button type="button" className="ad-nav-item">
              <FileSearch size={18} />
              <span>Verification</span>
              <small>18</small>
            </button>

            <button type="button" className="ad-nav-item">
              <AlertTriangle size={18} />
              <span>Queries / Returns</span>
              <small>7</small>
            </button>

            <span className="ad-nav-label">Financial Operations</span>

            <button type="button" className="ad-nav-item">
              <ShieldCheck size={18} />
              <span>Sanctions</span>
            </button>

            <button type="button" className="ad-nav-item">
              <CircleDollarSign size={18} />
              <span>Reimbursements</span>
            </button>

            <button type="button" className="ad-nav-item">
              <CreditCard size={18} />
              <span>Payment Processing</span>
            </button>

            <button type="button" className="ad-nav-item">
              <BarChart3 size={18} />
              <span>Expenditure</span>
            </button>

            <span className="ad-nav-label">Services</span>

            <button type="button" className="ad-nav-item">
              <FileCheck2 size={18} />
              <span>TA Claims</span>
            </button>

            <button type="button" className="ad-nav-item">
              <FileCheck2 size={18} />
              <span>LTC Claims</span>
            </button>

            <button type="button" className="ad-nav-item">
              <FileCheck2 size={18} />
              <span>Medical Claims</span>
            </button>

            <span className="ad-nav-label">Reports</span>

            <button type="button" className="ad-nav-item">
              <FileBarChart size={18} />
              <span>Financial Reports</span>
            </button>

            <button type="button" className="ad-nav-item">
              <Activity size={18} />
              <span>Audit Activity</span>
            </button>

            <span className="ad-nav-label">System</span>

            <button type="button" className="ad-nav-item">
              <Bell size={18} />
              <span>Notifications</span>
            </button>

            <button type="button" className="ad-nav-item">
              <Settings size={18} />
              <span>My Settings</span>
            </button>
          </nav>
        </div>

        <div className="ad-sidebar-footer">
          <div className="ad-user-mini">
            <div className="ad-avatar">AD</div>

            <div>
              <strong>{user?.name || "FMS Administrator"}</strong>
              <span>Finance & Accounts</span>
            </div>
          </div>

          <button
            type="button"
            className="ad-logout-button"
            onClick={handleLogout}
          >
            <LogOut size={17} />
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
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="ad-search">
              <Search size={17} />

              <input
                placeholder="Search claims, employees, claim IDs..."
                aria-label="Search"
              />

              <kbd>⌘ K</kbd>
            </div>
          </div>

          <div className="ad-topbar-right">
            <button
              type="button"
              className="ad-notification-button"
              aria-label="Notifications"
            >
              <Bell size={19} />
              <span />
            </button>

            <div className="ad-profile-wrapper">
              <button
                type="button"
                className="ad-profile-button"
                onClick={() => setShowProfile((value) => !value)}
              >
                <div className="ad-avatar">AD</div>

                <div className="ad-profile-text">
                  <strong>{user?.name || "FMS Administrator"}</strong>
                  <span>Finance & Accounts</span>
                </div>

                <ChevronDown size={16} />
              </button>

              {showProfile && (
                <div className="ad-profile-menu">
                  <button type="button">My Profile</button>
                  <button type="button">My Settings</button>
                  <button type="button" onClick={handleLogout}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="ad-content">
          <section className="ad-page-header">
            <div>
              <span className="ad-eyebrow">Operations / Dashboard</span>

              <h1>Good morning, FMS Administrator</h1>

              <p>
                Here's what's waiting for review, verification,
                sanction and payment processing today.
              </p>
            </div>

            <div className="ad-header-actions">
  <button
    type="button"
    className="ad-add-employee-button"
    onClick={() => setShowCreateEmployee(true)}
  >
    <Plus size={17} />
    Add Employee
  </button>

  <div className="ad-header-period"></div>
              <span>View period</span>

              <select
                value={period}
                onChange={(event) => setPeriod(event.target.value)}
              >
                <option>Today</option>
                <option>This week</option>
                <option>This month</option>
                <option>Current quarter</option>
              </select>
            </div>
          </section>

          <section className="ad-stats-grid">
            {ADMIN_STATS.map((item) => {
              const Icon = item.icon;

              return (
                <article className="ad-stat-card" key={item.label}>
                  <div className="ad-stat-top">
                    <div className="ad-stat-icon">
                      <Icon size={20} />
                    </div>

                    <button type="button" className="ad-card-link">
                      View
                    </button>
                  </div>

                  <div className="ad-stat-value">{item.value}</div>

                  <div className="ad-stat-label">{item.label}</div>

                  <div className="ad-stat-detail">
                    <strong>{item.highlight}</strong>
                    <span>{item.detail}</span>
                  </div>
                </article>
              );
            })}
          </section>

          <section className="ad-primary-grid">
            <article className="ad-card ad-claims-card">
              <div className="ad-card-header">
                <div>
                  <span className="ad-card-eyebrow">Action required</span>
                  <h2>Claims Requiring Action</h2>
                </div>

                <button type="button" className="ad-text-button">
                  View all →
                </button>
              </div>

              {selectedClaimType && (
                <div className="ad-active-filter">
                  Showing {selectedClaimType} claims
                  <button
                    type="button"
                    onClick={() => setSelectedClaimType(null)}
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="ad-claims-table">
                <div className="ad-claims-head">
                  <span>Claim ID</span>
                  <span>Employee</span>
                  <span>Type</span>
                  <span>Amount</span>
                  <span>Status</span>
                </div>

                {visibleClaims.map((claim) => (
                  <button
                    type="button"
                    className="ad-claim-row"
                    key={claim.id}
                  >
                    <strong>{claim.id}</strong>
                    <span>{claim.employee}</span>
                    <span>
                      <b className={`ad-type-badge ${claim.type.toLowerCase()}`}>
                        {claim.type}
                      </b>
                    </span>
                    <strong>{claim.amount}</strong>
                    <span>
                      <b
                        className={`ad-status-badge ${claim.status.toLowerCase()}`}
                      >
                        {claim.status}
                      </b>
                    </span>
                  </button>
                ))}
              </div>

              <button type="button" className="ad-primary-button full">
                Open Review Queue
              </button>
            </article>

            <VerificationPanel />
          </section>

          <section className="ad-secondary-grid">
            <PaymentPanel />

            <article className="ad-card">
              <div className="ad-card-header">
                <div>
                  <span className="ad-card-eyebrow">Workload distribution</span>
                  <h2>Claim Type Breakdown</h2>
                </div>

                <BarChart3 size={20} className="ad-header-icon" />
              </div>

              <ClaimTypeChart
                selectedType={selectedClaimType}
                onSelect={setSelectedClaimType}
              />
            </article>
          </section>

          <section className="ad-tertiary-grid">
            <article className="ad-card">
              <div className="ad-card-header">
                <div>
                  <span className="ad-card-eyebrow">Operational workload</span>
                  <h2>Department Activity</h2>
                </div>

                <button type="button" className="ad-text-button">
                  View report →
                </button>
              </div>

              <div className="ad-department-table">
                <div className="ad-department-head">
                  <span>Department</span>
                  <span>Pending</span>
                  <span>Processing</span>
                  <span>Amount</span>
                </div>

                {DEPARTMENTS.map((department) => (
                  <div
                    className="ad-department-row"
                    key={department.name}
                  >
                    <strong>{department.name}</strong>
                    <span>{department.pending}</span>
                    <span>{department.processing}</span>
                    <strong>{department.amount}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="ad-card">
              <div className="ad-card-header">
                <div>
                  <span className="ad-card-eyebrow">Workflow activity</span>
                  <h2>Recent Operations</h2>
                </div>

                <button type="button" className="ad-text-button">
                  View activity →
                </button>
              </div>

              <div className="ad-operation-list">
                {OPERATIONS.map((operation) => (
                  <div
                    className="ad-operation-item"
                    key={operation.title}
                  >
                    <span
                      className={`ad-operation-dot ${operation.type}`}
                    />

                    <div>
                      <strong>{operation.title}</strong>
                      <span>{operation.description}</span>
                    </div>

                    <time>{operation.time}</time>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="ad-bottom-grid">
            <article className="ad-card ad-exception-card">
              <div className="ad-card-header">
                <div>
                  <span className="ad-card-eyebrow">Workflow exceptions</span>
                  <h2>Exceptions & Queries</h2>
                </div>

                <AlertTriangle size={20} />
              </div>

              <div className="ad-exception-list">
                <button type="button">
                  <span className="ad-exception-icon warning">
                    <AlertTriangle size={17} />
                  </span>

                  <div>
                    <strong>7 claims returned to employees</strong>
                    <span>Awaiting correction or additional information.</span>
                  </div>

                  <span>→</span>
                </button>

                <button type="button">
                  <span className="ad-exception-icon warning">
                    <FileCheck2 size={17} />
                  </span>

                  <div>
                    <strong>4 claims with missing documents</strong>
                    <span>Supporting documents need attention.</span>
                  </div>

                  <span>→</span>
                </button>

                <button type="button">
                  <span className="ad-exception-icon danger">
                    <AlertTriangle size={17} />
                  </span>

                  <div>
                    <strong>3 claims exceeding review SLA</strong>
                    <span>Immediate administrative action recommended.</span>
                  </div>

                  <span>→</span>
                </button>
              </div>
            </article>

            <article className="ad-card ad-quick-card">
              <div className="ad-card-header">
                <div>
                  <span className="ad-card-eyebrow">Operations tools</span>
                  <h2>Quick Actions</h2>
                </div>
              </div>

              <div className="ad-quick-actions">
                <button type="button" className="ad-quick-action primary">
                  <span>
                    <ClipboardCheck size={19} />
                  </span>

                  <div>
                    <strong>Review Claims</strong>
                    <small>Open pending claim queue</small>
                  </div>
                </button>

                <button type="button" className="ad-quick-action">
                  <span>
                    <FileCheck2 size={19} />
                  </span>

                  <div>
                    <strong>Verify Documents</strong>
                    <small>Process verification queue</small>
                  </div>
                </button>

                <button type="button" className="ad-quick-action">
                  <span>
                    <CreditCard size={19} />
                  </span>

                  <div>
                    <strong>Process Payments</strong>
                    <small>Manage payment-ready claims</small>
                  </div>
                </button>

                <button type="button" className="ad-quick-action">
                  <span>
                    <FileBarChart size={19} />
                  </span>

                  <div>
                    <strong>Generate Report</strong>
                    <small>Create financial or claim report</small>
                  </div>
                </button>
              </div>
            </article>
          </section>
        </div>
      </main>
      <CreateEmployeeModal
      isOpen={showCreateEmployee}
      onClose={() => setShowCreateEmployee(false)}
      />
    </div>
  );
}