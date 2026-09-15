import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Activity,
  ArrowUpRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  FileCheck2,
  FileText,
  HeartPulse,
  Home,
  IndianRupee,
  LayoutDashboard,
  LogOut,
  Menu,
  MoreHorizontal,
  Search,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
  WalletCards,
  X,
} from "lucide-react";

import "../../App.css";

const claims = [
  {
    id: "TA-2026-0042",
    type: "TA Final",
    description: "Official travel reimbursement",
    date: "12 Sep 2026",
    amount: "₹18,450",
    status: "Under Review",
    statusType: "review",
  },
  {
    id: "MED-2026-0021",
    type: "Medical",
    description: "Medical reimbursement claim",
    date: "08 Sep 2026",
    amount: "₹7,820",
    status: "Approved",
    statusType: "approved",
  },
  {
    id: "LTC-2026-0014",
    type: "LTC",
    description: "Leave travel concession",
    date: "04 Sep 2026",
    amount: "₹25,000",
    status: "Pending",
    statusType: "pending",
  },
  {
    id: "TA-2026-0038",
    type: "TA Advance",
    description: "Advance for official tour",
    date: "28 Aug 2026",
    amount: "₹12,500",
    status: "Paid",
    statusType: "paid",
  },
];

const activities = [
  {
    icon: FileCheck2,
    title: "Medical claim approved",
    description: "MED-2026-0021 has been approved.",
    time: "1 hour ago",
    type: "success",
  },
  {
    icon: ClipboardCheck,
    title: "TA claim submitted",
    description: "TA-2026-0042 is now under review.",
    time: "3 hours ago",
    type: "info",
  },
  {
    icon: IndianRupee,
    title: "TA Advance processed",
    description: "₹12,500 has been credited.",
    time: "Yesterday",
    type: "payment",
  },
  {
    icon: FileText,
    title: "New document uploaded",
    description: "Supporting document added to LTC-2026-0014.",
    time: "2 days ago",
    type: "document",
  },
];

const notifications = [
  {
    title: "TA claim requires attention",
    description: "TA-2026-0042 is awaiting review.",
    time: "10 min ago",
    unread: true,
  },
  {
    title: "Medical claim approved",
    description: "Your medical reimbursement was approved.",
    time: "1 hour ago",
    unread: true,
  },
  {
    title: "Payslip available",
    description: "September 2026 payslip is now available.",
    time: "Yesterday",
    unread: false,
  },
];

function App() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleNavigation = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);
  };

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          type="button"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark">
            <ShieldCheck size={21} strokeWidth={2.2} />
          </div>

          <div className="brand-copy">
            <span className="brand-name">FMS</span>
            <span className="brand-subtitle">Finance Management</span>
          </div>

          <button
            className="mobile-close-button"
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close navigation"
          >
            <X size={19} />
          </button>
        </div>

        <div className="sidebar-divider" />

        <nav className="sidebar-nav">
          <SidebarSection label="Workspace">
            <SidebarItem
              icon={LayoutDashboard}
              label="Dashboard"
              active={activeNav === "Dashboard"}
              onClick={handleNavigation}
            />

            <SidebarItem
              icon={UserCircle}
              label="My Profile"
              active={activeNav === "My Profile"}
              onClick={() => {
                setActiveNav("My Profile");
                setSidebarOpen(false);
                navigate("/profile");
              }}
            />

            <SidebarItem
              icon={Activity}
              label="My Activity"
              active={activeNav === "My Activity"}
              onClick={handleNavigation}
            />
          </SidebarSection>

          <SidebarSection label="My Finance">
            <SidebarItem
              icon={WalletCards}
              label="My Claims"
              active={activeNav === "My Claims"}
              onClick={handleNavigation}
              badge="3"
            />
            <SidebarItem
              icon={BriefcaseBusiness}
              label="TA & Travel"
              active={activeNav === "TA & Travel"}
              onClick={handleNavigation}
            />
            <SidebarItem
              icon={Building2}
              label="LTC"
              active={activeNav === "LTC"}
              onClick={handleNavigation}
            />
            <SidebarItem
              icon={HeartPulse}
              label="Medical"
              active={activeNav === "Medical"}
              onClick={handleNavigation}
            />
          </SidebarSection>

          <SidebarSection label="Records">
            <SidebarItem
              icon={FileText}
              label="Documents"
              active={activeNav === "Documents"}
              onClick={handleNavigation}
            />
            <SidebarItem
              icon={IndianRupee}
              label="Pay Slips"
              active={activeNav === "Pay Slips"}
              onClick={handleNavigation}
            />
          </SidebarSection>

          <SidebarSection label="Insights">
            <SidebarItem
              icon={ClipboardCheck}
              label="Reports"
              active={activeNav === "Reports"}
              onClick={handleNavigation}
            />
            <SidebarItem
              icon={Bell}
              label="Notifications"
              active={activeNav === "Notifications"}
              onClick={handleNavigation}
              badge="2"
            />
          </SidebarSection>
        </nav>

        <div className="sidebar-bottom">
          <SidebarItem
            icon={Settings}
            label="Settings"
            active={activeNav === "Settings"}
            onClick={handleNavigation}
          />

          <SidebarItem
            icon={CircleHelp}
            label="Help & Support"
            active={activeNav === "Help & Support"}
            onClick={handleNavigation}
          />

          <div className="sidebar-user">
            <div className="avatar avatar-small">SD</div>

            <div className="sidebar-user-details">
              <strong>Sahaj Dubey</strong>
              <span>Employee</span>
            </div>

            <MoreHorizontal size={17} className="sidebar-user-more" />
          </div>

          <div className="sidebar-footer">
            <span>FMS Portal</span>
            <span>v1.0</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="main-content">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu-button"
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu size={21} />
            </button>

            <div className="search-container">
              <Search size={18} />

              <input
                type="search"
                placeholder="Search claims, documents, payslips..."
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
              />

              {searchValue && (
                <button
                  className="search-clear"
                  type="button"
                  onClick={() => setSearchValue("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}

              <span className="search-shortcut">⌘ K</span>
            </div>
          </div>

          <div className="topbar-actions">
            {/* Notification */}
            <div className="dropdown-wrapper">
              <button
                className={`icon-button ${
                  notificationsOpen ? "icon-button-active" : ""
                }`}
                type="button"
                aria-label="Notifications"
                onClick={() => {
                  setNotificationsOpen((value) => !value);
                  setProfileOpen(false);
                }}
              >
                <Bell size={19} />
                <span className="notification-dot" />
              </button>

              {notificationsOpen && (
                <NotificationPanel
                  onClose={() => setNotificationsOpen(false)}
                />
              )}
            </div>

            <div className="topbar-divider" />

            {/* Profile */}
            <div className="dropdown-wrapper">
              <button
                className="profile-trigger"
                type="button"
                onClick={() => {
                  setProfileOpen((value) => !value);
                  setNotificationsOpen(false);
                }}
              >
                <div className="avatar">SD</div>

                <div className="profile-trigger-text">
                  <strong>Sahaj Dubey</strong>
                  <span>Employee</span>
                </div>

                <ChevronDown size={16} />
              </button>

              {profileOpen && <ProfilePanel onNavigate={navigate} />}
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="page-content">
          <div className="page-header">
            <div>
              <div className="breadcrumb">
                <span>Workspace</span>
                <ChevronRight size={14} />
                <strong>{activeNav}</strong>
              </div>

              <h1>{activeNav === "Dashboard" ? "Dashboard" : activeNav}</h1>

              <p>
                {activeNav === "Dashboard"
                  ? "A clear view of your claims, payments and financial activity."
                  : `Manage and review your ${activeNav.toLowerCase()} information.`}
              </p>
            </div>

            <div className="page-header-date">
              <Clock3 size={15} />
              <span>16 September 2026</span>
            </div>
          </div>

          {activeNav === "Dashboard" ? (
            <Dashboard onNavigate={handleNavigation} />
          ) : activeNav === "Pay Slips" ? (
            <PayslipsView />
          ) : (
            <PlaceholderPage section={activeNav} />
          )}
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

function Dashboard({ onNavigate }) {
  return (
    <div className="dashboard">
      {/* Welcome */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-eyebrow">
            <span className="status-pulse" />
            Finance Management System
          </div>

          <h2>Good morning, Sahaj 👋</h2>

          <p>
            Stay on top of your claims, reimbursements and financial records.
          </p>
        </div>

        <div className="welcome-decoration">
          <div className="decoration-circle circle-one" />
          <div className="decoration-circle circle-two" />
          <div className="decoration-card">
            <ShieldCheck size={23} />
            <span>Secure &amp; verified</span>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-grid">
        <StatCard
          icon={WalletCards}
          label="Total Claims"
          value="08"
          description="2 submitted this month"
          trend="+33%"
          trendDirection="up"
          iconClass="blue"
          onClick={() => onNavigate("My Claims")}
        />

        <StatCard
          icon={Clock3}
          label="Pending Claims"
          value="03"
          description="Requires attention"
          trend="2 active"
          trendDirection="neutral"
          iconClass="amber"
          onClick={() => onNavigate("My Claims")}
        />

        <StatCard
          icon={FileCheck2}
          label="Approved Claims"
          value="04"
          description="Successfully approved"
          trend="+1 this month"
          trendDirection="up"
          iconClass="green"
          onClick={() => onNavigate("My Claims")}
        />

        <StatCard
          icon={IndianRupee}
          label="Last Payslip"
          value="₹48,750"
          description="September 2026"
          trend="View"
          trendDirection="action"
          iconClass="purple"
          onClick={() => onNavigate("Pay Slips")}
        />
      </section>

      {/* Main grid */}
      <section className="dashboard-grid">
        <div className="dashboard-column">
          <ClaimsCard onNavigate={onNavigate} />
          <ActivityCard />
        </div>

        <div className="dashboard-column">
          <QuickActions onNavigate={onNavigate} />
          <FinancialOverview />
        </div>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  description,
  trend,
  trendDirection,
  iconClass,
  onClick,
}) {
  return (
    <button className="stat-card" type="button" onClick={onClick}>
      <div className={`stat-icon ${iconClass}`}>
        <Icon size={19} strokeWidth={2} />
      </div>

      <div className="stat-card-top">
        <span>{label}</span>

        <ArrowUpRight size={16} className="stat-arrow" />
      </div>

      <div className="stat-value">{value}</div>

      <div className="stat-card-footer">
        <span>{description}</span>

        <span className={`stat-trend ${trendDirection}`}>{trend}</span>
      </div>
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Claims                                                                     */
/* -------------------------------------------------------------------------- */

function ClaimsCard({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Pending", "Approved", "Paid"];

  const filteredClaims =
    activeFilter === "All"
      ? claims
      : claims.filter((claim) => {
          if (activeFilter === "Pending") {
            return claim.statusType === "pending" || claim.statusType === "review";
          }

          return claim.statusType === activeFilter.toLowerCase();
        });

  return (
    <section className="panel claims-panel">
      <div className="panel-header">
        <div>
          <h3>My Claims</h3>
          <p>Your recent financial requests and reimbursements.</p>
        </div>

        <button
          className="text-button"
          type="button"
          onClick={() => onNavigate("My Claims")}
        >
          View all
          <ArrowUpRight size={15} />
        </button>
      </div>

      <div className="claim-filters">
        {filters.map((filter) => (
          <button
            key={filter}
            className={`filter-button ${
              activeFilter === filter ? "filter-active" : ""
            }`}
            type="button"
            onClick={() => setActiveFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      <div className="claims-table-wrapper">
        <table className="claims-table">
          <thead>
            <tr>
              <th>Claim</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>

          <tbody>
            {filteredClaims.map((claim) => (
              <tr key={claim.id}>
                <td>
                  <div className="claim-cell">
                    <div className="claim-type-icon">
                      {claim.type === "Medical" ? (
                        <HeartPulse size={16} />
                      ) : claim.type === "LTC" ? (
                        <Building2 size={16} />
                      ) : (
                        <BriefcaseBusiness size={16} />
                      )}
                    </div>

                    <div>
                      <strong>{claim.id}</strong>
                      <span>{claim.type}</span>
                    </div>
                  </div>
                </td>

                <td className="muted-cell">{claim.date}</td>

                <td className="amount-cell">{claim.amount}</td>

                <td>
                  <StatusBadge
                    status={claim.status}
                    type={claim.statusType}
                  />
                </td>

                <td>
                  <button
                    className="row-action"
                    type="button"
                    onClick={() => onNavigate("My Claims")}
                  >
                    View
                    <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredClaims.length === 0 && (
          <div className="table-empty">
            <FileText size={25} />
            <strong>No claims found</strong>
            <span>There are no claims in this category.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status, type }) {
  return (
    <span className={`status-badge ${type}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Quick Actions                                                              */
/* -------------------------------------------------------------------------- */

function QuickActions({ onNavigate }) {
  const actions = [
    {
      icon: BriefcaseBusiness,
      label: "Apply TA",
      description: "Travel claim",
      color: "blue",
      target: "TA & Travel",
    },
    {
      icon: Building2,
      label: "Apply LTC",
      description: "Travel concession",
      color: "green",
      target: "LTC",
    },
    {
      icon: HeartPulse,
      label: "Medical Claim",
      description: "Reimbursement",
      color: "red",
      target: "Medical",
    },
    {
      icon: IndianRupee,
      label: "View Payslip",
      description: "Salary details",
      color: "purple",
      target: "Pay Slips",
    },
  ];

  return (
    <section className="panel quick-actions-panel">
      <div className="panel-header">
        <div>
          <h3>Quick Actions</h3>
          <p>Start a new request or access records.</p>
        </div>
      </div>

      <div className="quick-actions-grid">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <button
              key={action.label}
              className="quick-action"
              type="button"
              onClick={() => onNavigate(action.target)}
            >
              <div className={`quick-action-icon ${action.color}`}>
                <Icon size={19} />
              </div>

              <div className="quick-action-copy">
                <strong>{action.label}</strong>
                <span>{action.description}</span>
              </div>

              <ArrowUpRight size={16} className="quick-action-arrow" />
            </button>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Activity                                                                   */
/* -------------------------------------------------------------------------- */

function ActivityCard() {
  return (
    <section className="panel activity-panel">
      <div className="panel-header">
        <div>
          <h3>Recent Activity</h3>
          <p>Your latest account and claim activity.</p>
        </div>

        <button className="more-button" type="button" aria-label="More options">
          <MoreHorizontal size={18} />
        </button>
      </div>

      <div className="activity-list">
        {activities.map((activity) => {
          const Icon = activity.icon;

          return (
            <div className="activity-item" key={activity.title}>
              <div className={`activity-icon ${activity.type}`}>
                <Icon size={16} />
              </div>

              <div className="activity-copy">
                <strong>{activity.title}</strong>
                <span>{activity.description}</span>
              </div>

              <time>{activity.time}</time>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Financial Overview                                                         */
/* -------------------------------------------------------------------------- */

function FinancialOverview() {
  return (
    <section className="panel financial-panel">
      <div className="panel-header">
        <div>
          <h3>Financial Overview</h3>
          <p>Claim activity across the current year.</p>
        </div>

        <button className="period-button" type="button">
          2026
          <ChevronDown size={14} />
        </button>
      </div>

      <div className="financial-summary">
        <div>
          <span>Total claimed</span>
          <strong>₹86,420</strong>
        </div>

        <div className="financial-approved">
          <span>Approved</span>
          <strong>₹61,250</strong>
        </div>
      </div>

      <div className="chart-container">
        <div className="chart-grid">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="chart-bars">
          {[42, 58, 48, 72, 61, 82, 68, 92, 74, 86, 78, 96].map(
            (height, index) => (
              <div className="chart-bar-wrapper" key={index}>
                <div
                  className="chart-bar"
                  style={{ height: `${height}%` }}
                  title={`Month ${index + 1}`}
                />
              </div>
            ),
          )}
        </div>

        <div className="chart-labels">
          <span>Jan</span>
          <span>Mar</span>
          <span>May</span>
          <span>Jul</span>
          <span>Sep</span>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Notification Panel                                                         */
/* -------------------------------------------------------------------------- */

function NotificationPanel({ onClose }) {
  return (
    <div className="dropdown-panel notification-panel">
      <div className="dropdown-header">
        <div>
          <strong>Notifications</strong>
          <span>2 unread notifications</span>
        </div>

        <button type="button" onClick={onClose}>
          <X size={16} />
        </button>
      </div>

      <div className="notification-list">
        {notifications.map((notification) => (
          <button className="notification-item" key={notification.title}>
            <span
              className={`notification-status ${
                notification.unread ? "unread" : ""
              }`}
            />

            <div>
              <strong>{notification.title}</strong>
              <span>{notification.description}</span>
              <small>{notification.time}</small>
            </div>
          </button>
        ))}
      </div>

      <button className="dropdown-footer-button" type="button">
        View all notifications
        <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile Panel                                                              */
/* -------------------------------------------------------------------------- */

function ProfilePanel({ onNavigate }) {
  return (
    <div className="dropdown-panel profile-panel">
      <div className="profile-panel-header">
        <div className="avatar avatar-medium">SD</div>

        <div>
          <strong>Sahaj Dubey</strong>
          <span>Employee</span>
        </div>
      </div>

      <div className="profile-panel-divider" />

      <button
        className="profile-menu-item"
        type="button"
        onClick={() => onNavigate("/profile")}
      >
        <UserCircle size={17} />
        My Profile
      </button>

      <button className="profile-menu-item" type="button">
        <Settings size={17} />
        Account Settings
      </button>

      <div className="profile-panel-divider" />

      <button className="profile-menu-item danger" type="button">
        <LogOut size={17} />
        Sign out
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

function SidebarSection({ label, children }) {
  return (
    <div className="sidebar-section">
      <div className="sidebar-section-label">{label}</div>
      {children}
    </div>
  );
}

function SidebarItem({
  icon: Icon,
  label,
  active,
  badge,
  onClick,
}) {
  return (
    <button
      className={`sidebar-item ${active ? "sidebar-item-active" : ""}`}
      type="button"
      onClick={() => onClick(label)}
    >
      <Icon size={18} strokeWidth={active ? 2.2 : 1.9} />

      <span>{label}</span>

      {badge && <small>{badge}</small>}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Pay Slips View (Live Connected)                                            */
/* -------------------------------------------------------------------------- */

function PayslipsView() {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const token = localStorage.getItem("token");
  const fmsAuth = localStorage.getItem("fms_auth") ? JSON.parse(localStorage.getItem("fms_auth")) : null;
  const user = fmsAuth?.user || (localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null);

  useEffect(() => {
    const fetchPayslips = async () => {
      try {
        const userId = user?.id || user?._id;
        if (!userId) {
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/payslips/${userId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setPayslips(res.data);
      } catch (err) {
        console.error("Failed to load payslips", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayslips();
  }, [token]);

  const handleDownload = async (payslipId, month, year) => {
    try {
      setDownloadingId(payslipId);
      const res = await axios.get(
        `http://localhost:5000/api/payslips/download/${payslipId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("download", `Payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("PDF download failed", err);
      alert("Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="panel claims-panel">
      <div className="panel-header">
        <div>
          <h3>Monthly Pay Slips</h3>
          <p>Download official salary statements generated by finance.</p>
        </div>
      </div>

      <div className="claims-table-wrapper">
        {loading ? (
          <div className="table-empty">
            <strong>Loading payslips...</strong>
          </div>
        ) : payslips.length === 0 ? (
          <div className="table-empty">
            <FileText size={28} />
            <strong>No payslips found</strong>
            <span>You have no generated payslips in the system yet.</span>
          </div>
        ) : (
          <table className="claims-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Basic Pay</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Net Salary</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {payslips.map((ps) => (
                <tr key={ps._id}>
                  <td>
                    <div className="claim-cell">
                      <div className="claim-type-icon">
                        <IndianRupee size={16} />
                      </div>
                      <div>
                        <strong>Month {ps.month} / {ps.year}</strong>
                        <span>Salary Slip</span>
                      </div>
                    </div>
                  </td>
                  <td className="amount-cell">₹{ps.basicPay}</td>
                  <td className="muted-cell" style={{ color: "#16a34a" }}>
                    +₹{ps.allowances}
                  </td>
                  <td className="muted-cell" style={{ color: "#dc2626" }}>
                    -₹{ps.deductions}
                  </td>
                  <td className="amount-cell" style={{ fontWeight: "700" }}>
                    ₹{ps.netPay}
                  </td>
                  <td>
                    <button
                      className="row-action"
                      type="button"
                      disabled={downloadingId === ps._id}
                      onClick={() => handleDownload(ps._id, ps.month, ps.year)}
                    >
                      {downloadingId === ps._id ? "Downloading..." : "Download PDF"}
                      <ArrowUpRight size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Placeholder                                                                */
/* -------------------------------------------------------------------------- */

function PlaceholderPage({ section }) {
  return (
    <section className="placeholder-page">
      <div className="placeholder-icon">
        <LayoutDashboard size={28} />
      </div>

      <h2>{section}</h2>

      <p>
        This section is part of the FMS frontend and will be implemented in
        the next UI phase.
      </p>

      <span className="coming-soon-badge">Frontend module</span>
    </section>
  );
}

export default App;