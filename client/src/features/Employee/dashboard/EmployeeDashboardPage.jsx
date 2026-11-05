
import { useState, useEffect } from "react";
import TATravelPage from "../ta-travel/TATravelPage.jsx";
import TAAdvance from "../ta-travel/TAAdavance.jsx";
import EmployeeLTCPage from "../ltc/EmployeeLTCPage.jsx";
import EmployeeLTCAdvanceModal from "../ltc/EmployeeLTCAdvanceModal.jsx";
import MedicalClaimPage from "../../medical/MedicalClaimPage";
import EmployeeMedicalPage from "../medical/EmployeeMedicalPage.jsx";
import EmployeeMedicalAdvancePage from "../medical/EmployeeMedicalAdvancePage.jsx";
import EmployeeAccommodationPage from "../accommodation/EmployeeAccommodationPage.jsx";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../auth/authSlice";
import axios from "axios";
import apiClient from "../../../services/api/axios";
import {
  Activity,
  ArrowUpRight,
  Bell,
  CheckCheck,
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

import "../../../App.css";
import "./EmployeeDashboardPage.css";

const claims = [
  {
    id: "TA-2026-0042",
    type: "TA Final",
    description: "Official travel reimbursement",
    date: "12 Sep 2026",
    amount: "Ã¢â€šÂ¹18,450",
    status: "Under Review",
    statusType: "review",
  },
  {
    id: "MED-2026-0021",
    type: "Medical",
    description: "Medical reimbursement claim",
    date: "08 Sep 2026",
    amount: "Ã¢â€šÂ¹7,820",
    status: "Approved",
    statusType: "approved",
  },
  {
    id: "LTC-2026-0014",
    type: "LTC",
    description: "Leave travel concession",
    date: "04 Sep 2026",
    amount: "Ã¢â€šÂ¹25,000",
    status: "Pending",
    statusType: "pending",
  },
  {
    id: "TA-2026-0038",
    type: "TA Advance",
    description: "Advance for official tour",
    date: "28 Aug 2026",
    amount: "Ã¢â€šÂ¹12,500",
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
    description: "Ã¢â€šÂ¹12,500 has been credited.",
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
  const currentUser = useSelector((state) => state.auth.user);
  const displayName = currentUser?.name || currentUser?.email || "Employee";
  const displayInitials = displayName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleGlobalLogout = () => {
    dispatch(logout());
    navigate("/login", { replace: true });
  };
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [expandedFinance, setExpandedFinance] = useState({
    ta: false,
    ltc: false,
    medical: false,
  });

  const toggleFinanceGroup = (group) => {
    setExpandedFinance((previous) => ({
      ...previous,
      [group]: !previous[group],
    }));
  };

  // Close the TA & Travel modal and return to the dashboard.
  useEffect(() => {
    const closeTATravel = () => setActiveNav("Dashboard");
    window.addEventListener("fms:close-ta-travel", closeTATravel);
    return () => window.removeEventListener("fms:close-ta-travel", closeTATravel);
  }, []);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [liveUnreadCount, setLiveUnreadCount] = useState(0);

  const fetchLiveNotifications = async () => {
    try {
      const res = await apiClient.get('/notifications?limit=10');
      if (res.data?.success) {
        setLiveNotifications(res.data.data || []);
        setLiveUnreadCount(res.data.unreadCount || 0);
      }
    } catch (err) {
      // Fallback silently if offline or token refresh pending
    }
  };

  useEffect(() => {
    fetchLiveNotifications();
    const interval = setInterval(fetchLiveNotifications, 15000);
    return () => clearInterval(interval);
  }, []);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleNavigation = (label) => {
    setActiveNav(label);
    setSidebarOpen(false);

    if (label === "My Claims") {
    navigate("/claims");
  }
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

            <button
              type="button"
              className="finance-sidebar-placeholder accommodation-sidebar-button"
              onClick={() => handleNavigation("Accommodation Form")}
            >
              <FileText size={17} />
              <span>Accommodation Form</span>
            </button>

            <div className="finance-sidebar-group">
              <SidebarItem
                icon={BriefcaseBusiness}
                label="TA & Travel Form"
                active={activeNav === "TA & Travel"}
                onClick={() => toggleFinanceGroup("ta")}
              />
              <button
                type="button"
                className="finance-sidebar-expand"
                aria-label={expandedFinance.ta ? "Collapse TA & Travel options" : "Expand TA & Travel options"}
                aria-expanded={expandedFinance.ta}
                onClick={() => toggleFinanceGroup("ta")}
              >
                <ChevronDown size={14} className={expandedFinance.ta ? "finance-chevron-open" : ""} />
              </button>
              {expandedFinance.ta && (
                <div className="finance-sidebar-children">
                  <button
                    type="button"
                    className="finance-sidebar-child"
                    onClick={() => handleNavigation("TA & Travel")}
                  >
                    <span className="finance-child-branch">â†³</span>
                    <span>TA Claim</span>
                  </button>
                  <button
                    type="button"
                    className="finance-sidebar-child"
                    onClick={() => handleNavigation("TA Advance Claim")}
                  >
                    <span className="finance-child-branch">â†³</span>
                    <span>TA Advance Claim</span>
                  </button>
                </div>
              )}
            </div>

            <div className="finance-sidebar-group">
              <SidebarItem
                icon={Building2}
                label="LTC Form"
                active={activeNav === "LTC"}
                onClick={() => toggleFinanceGroup("ltc")}
              />
              <button
                type="button"
                className="finance-sidebar-expand"
                aria-label={expandedFinance.ltc ? "Collapse LTC options" : "Expand LTC options"}
                aria-expanded={expandedFinance.ltc}
                onClick={() => toggleFinanceGroup("ltc")}
              >
                <ChevronDown size={14} className={expandedFinance.ltc ? "finance-chevron-open" : ""} />
              </button>
              {expandedFinance.ltc && (
                <div className="finance-sidebar-children">
                  <button
                    type="button"
                    className="finance-sidebar-child"
                    onClick={() => handleNavigation("LTC Claim")}
                  >
                    <span className="finance-child-branch">â†³</span>
                    <span>LTC Claim</span>
                  </button>
                  <button
                    type="button"
                    className="finance-sidebar-child"
                    onClick={() => handleNavigation("LTC Advance Claim")}
                  >
                    <span className="finance-child-branch">â†³</span>
                    <span>LTC Advance Claim</span>
                  </button>
                </div>
              )}
            </div>

            <div className="finance-sidebar-group">
              <SidebarItem
                icon={HeartPulse}
                label="Medical Form"
                active={activeNav === "Medical"}
                onClick={() => toggleFinanceGroup("medical")}
              />
              <button
                type="button"
                className="finance-sidebar-expand"
                aria-label={expandedFinance.medical ? "Collapse Medical options" : "Expand Medical options"}
                aria-expanded={expandedFinance.medical}
                onClick={() => toggleFinanceGroup("medical")}
              >
                <ChevronDown size={14} className={expandedFinance.medical ? "finance-chevron-open" : ""} />
              </button>
              {expandedFinance.medical && (
                <div className="finance-sidebar-children">
                  <button
                    type="button"
                    className="finance-sidebar-child"
                    onClick={() => handleNavigation("Medical Claim")}
                  >
                    <span className="finance-child-branch">â†³</span>
                    <span>Medical Claim</span>
                  </button>
                  <button
                    type="button"
                    className="finance-sidebar-child"
                    onClick={() => handleNavigation("Medical Advance Claim")}
                  >
                    <span className="finance-child-branch">â†³</span>
                    <span>Medical Advance Claim</span>
                  </button>
                </div>
              )}
            </div>
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
              badge={liveUnreadCount > 0 ? String(liveUnreadCount) : null}
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
            <div className="avatar avatar-small">{displayInitials}</div>

            <div className="sidebar-user-details">
              <strong>{displayName}</strong>
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

              <span className="search-shortcut">Ã¢Å’Ëœ K</span>
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
                {liveUnreadCount > 0 && <span className="notification-dot" />}
              </button>

              {notificationsOpen && (
                <NotificationPanel
                  onClose={() => setNotificationsOpen(false)}
                  notifications={liveNotifications}
                  unreadCount={liveUnreadCount}
                  onRefresh={fetchLiveNotifications}
                  onNavigate={navigate}
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
                <div className="avatar">{displayInitials}</div>

                <div className="profile-trigger-text">
                  <strong>{displayName}</strong>
                  <span>Employee</span>
                </div>

                <ChevronDown size={16} />
              </button>

              {profileOpen && <ProfilePanel onNavigate={navigate} onLogout={handleGlobalLogout} displayName={displayName} displayInitials={displayInitials} />}
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
  <Dashboard
    onNavigate={handleNavigation}
    onOpenClaim={() => navigate("/claims")}
  />
) : activeNav === "TA & Travel" ? (
  <TATravelPage currentUser={currentUser} />
) : activeNav === "TA Advance Claim" ? (
  <TAAdvance onClose={() => handleNavigation("Dashboard")} />
) : activeNav === "LTC Advance Claim" ? (
  <EmployeeLTCAdvanceModal
    isOpen={true}
    onClose={() => handleNavigation("Dashboard")}
  />
) : activeNav === "LTC Claim" ? (
  <EmployeeLTCPage onClose={() => handleNavigation("Dashboard")} />
) : activeNav === "Pay Slips" ? (
  <PayslipsView />
) : activeNav === "Accommodation Form" ? (
  <EmployeeAccommodationPage onClose={() => handleNavigation("Dashboard")} />
) : activeNav === "Medical Advance Claim" ? (
  <EmployeeMedicalAdvancePage onClose={() => handleNavigation("Dashboard")} />
) : activeNav === "Medical Claim" ? (
  <EmployeeMedicalPage onClose={() => handleNavigation("Dashboard")} />
) : activeNav === "Medical" ? (
  <MedicalClaimPage />
) : activeNav === "Notifications" ? (
  <NotificationsView
    notifications={liveNotifications}
    unreadCount={liveUnreadCount}
    onRefresh={fetchLiveNotifications}
    onNavigate={navigate}
  />
) : (
  <PlaceholderPage section={activeNav} />
)}</div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Dashboard                                                                  */
/* -------------------------------------------------------------------------- */

function Dashboard({ onNavigate, onOpenClaim }) {
  return (
    <div className="dashboard">
      {/* Welcome */}
      <section className="welcome-banner">
        <div className="welcome-content">
          <div className="welcome-eyebrow">
            <span className="status-pulse" />
            Finance Management System
          </div>

          <h2>Good morning, Sahaj Ã°Å¸â€˜â€¹</h2>
          <button type="button" onClick={onOpenClaim} style={{ marginTop: '12px', padding: '8px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>+ Submit New Claim</button>

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
          value="Ã¢â€šÂ¹48,750"
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
          <strong>Ã¢â€šÂ¹86,420</strong>
        </div>

        <div className="financial-approved">
          <span>Approved</span>
          <strong>Ã¢â€šÂ¹61,250</strong>
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

function NotificationPanel({ onClose, notifications = [], unreadCount = 0, onRefresh, onNavigate }) {
  const markAllAsRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const markSingleRead = async (id, link) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      if (onRefresh) onRefresh();
      if (link && onNavigate) {
        onClose();
        onNavigate(link);
      }
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const formatTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const diff = Math.floor((new Date() - new Date(dateStr)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  return (
    <div className="dropdown-panel notification-panel" style={{ width: 360, maxHeight: 460, display: 'flex', flexDirection: 'column' }}>
      <div className="dropdown-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Notifications</strong>
          <span>{unreadCount} unread notification{unreadCount === 1 ? '' : 's'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={markAllAsRead}
              style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              title="Mark all as read"
            >
              Mark read
            </button>
          )}
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="notification-list" style={{ overflowY: 'auto', flex: 1, padding: '4px 0' }}>
        {notifications.length === 0 ? (
          <div style={{ padding: '36px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
            No notifications available.
          </div>
        ) : (
          notifications.map((notification) => (
            <button
              className="notification-item"
              key={notification._id}
              onClick={() => markSingleRead(notification._id, notification.link)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                padding: '12px 16px',
                textAlign: 'left',
                width: '100%',
                background: notification.readAt ? 'transparent' : '#f0f7ff',
                border: 'none',
                borderBottom: '1px solid #f1f5f9',
                cursor: 'pointer',
              }}
            >
              <span
                className={`notification-status ${!notification.readAt ? 'unread' : ''}`}
                style={{ marginTop: 6 }}
              />

              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: 13, color: '#0f172a', display: 'block', marginBottom: 2 }}>
                  {notification.title}
                </strong>
                <span style={{ fontSize: 12, color: '#475569', display: 'block', lineHeight: 1.4 }}>
                  {notification.message}
                </span>
                <small style={{ fontSize: 11, color: '#94a3b8', marginTop: 4, display: 'block' }}>
                  {formatTimeAgo(notification.createdAt)}
                </small>
              </div>
            </button>
          ))
        )}
      </div>

      <button
        className="dropdown-footer-button"
        type="button"
        onClick={() => {
          onClose();
          if (onNavigate) onNavigate('/claims');
        }}
      >
        View claims history
        <ArrowUpRight size={15} />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Profile Panel                                                              */
/* -------------------------------------------------------------------------- */

function ProfilePanel({ onNavigate, onLogout, displayName, displayInitials }) {
  return (
    <div className="dropdown-panel profile-panel">
      <div className="profile-panel-header">
        <div className="avatar avatar-medium">{displayInitials}</div>

        <div>
          <strong>{displayName}</strong>
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

      <button className="profile-menu-item danger" type="button" onClick={onLogout}>
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
  const [error, setError] = useState("");
  const [downloadingId, setDownloadingId] = useState(null);

  const fmsAuth = (() => {
    try {
      return JSON.parse(localStorage.getItem("fms_auth") || "{}");
    } catch {
      return {};
    }
  })();

  const token = localStorage.getItem("token") || fmsAuth?.token;

  useEffect(() => {
    let cancelled = false;

    async function fetchPayslips() {
      setLoading(true);
      setError("");

      if (!token) {
        setPayslips([]);
        setError("Your session was not found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          "http://localhost:5000/api/payslips/mine",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!cancelled) {
          setPayslips(
            Array.isArray(response.data?.payslips)
              ? response.data.payslips
              : []
          );
        }
      } catch (err) {
        console.error("Failed to load payslips:", err);

        if (!cancelled) {
          setPayslips([]);
          setError(
            err.response?.data?.error ||
              "Unable to load payslips. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchPayslips();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleDownload = async (payslipId, month, year) => {
    try {
      setDownloadingId(payslipId);

      const response = await axios.get(
        `http://localhost:5000/api/payslips/download/${payslipId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = `Payslip_${month}_${year}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      console.error("Payslip download failed:", err);
      alert(
        err.response?.status === 403
          ? "You are not allowed to download this payslip."
          : "Failed to download the payslip. Please try again."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  const formatINR = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

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
        ) : error ? (
          <div className="table-empty">
            <FileText size={28} />
            <strong>Could not load payslips</strong>
            <span>{error}</span>
          </div>
        ) : payslips.length === 0 ? (
          <div className="table-empty">
            <FileText size={28} />
            <strong>No payslips found</strong>
            <span>
              You have no generated payslips in the system yet.
            </span>
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
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {payslips.map((payslip) => (
                <tr key={payslip._id}>
                  <td>
                    <div className="claim-cell">
                      <div className="claim-type-icon">
                        <IndianRupee size={16} />
                      </div>

                      <div>
                        <strong>
                          {payslip.month}/{payslip.year}
                        </strong>
                        <span>Salary Slip</span>
                      </div>
                    </div>
                  </td>

                  <td className="amount-cell">
                    {formatINR(payslip.basicPay)}
                  </td>

                  <td className="muted-cell" style={{ color: "#16a34a" }}>
                    +{formatINR(payslip.allowances)}
                  </td>

                  <td className="muted-cell" style={{ color: "#dc2626" }}>
                    -{formatINR(payslip.deductions)}
                  </td>

                  <td className="amount-cell" style={{ fontWeight: "700" }}>
                    {formatINR(payslip.netPay)}
                  </td>

                  <td>
                    <button
                      className="row-action"
                      type="button"
                      disabled={downloadingId === payslip._id}
                      onClick={() =>
                        handleDownload(
                          payslip._id,
                          payslip.month,
                          payslip.year
                        )
                      }
                    >
                      {downloadingId === payslip._id
                        ? "Downloading..."
                        : "Download PDF"}
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
/* Notifications View (Live Claim Alerts with Auto-Dismiss)                   */
/* -------------------------------------------------------------------------- */

function NotificationsView({ notifications = [], unreadCount = 0, onRefresh, onNavigate }) {
  const [filter, setFilter] = useState("active"); // 'active' (unread) or 'all'
  const [dismissingId, setDismissingId] = useState(null);

  const displayList = filter === "active" 
    ? notifications.filter((n) => !n.readAt) 
    : notifications;

  const handleViewClaim = async (notification) => {
    try {
      setDismissingId(notification._id);
      // Mark as read in backend so it disappears from unread queue
      await apiClient.patch(`/notifications/${notification._id}/read`);
      if (onRefresh) await onRefresh();
      // Route employee directly to claims review
      if (onNavigate) {
        onNavigate("/claims");
      }
    } catch (err) {
      console.error("Failed to dismiss viewed notification:", err);
    } finally {
      setDismissingId(null);
    }
  };

  const handleDismiss = async (id, e) => {
    e.stopPropagation();
    try {
      setDismissingId(id);
      await apiClient.patch(`/notifications/${id}/read`);
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    } finally {
      setDismissingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      if (onRefresh) await onRefresh();
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const formatTimestamp = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="panel claims-panel" style={{ padding: '24px' }}>
      <div className="panel-header" style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Claim Notifications &amp; Pipeline Updates
          </h3>
          <p style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
            Real-time stage transitions, department transfers, and sanction alerts. Notifications disappear once viewed.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #bfdbfe',
              padding: '6px 14px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <CheckCheck size={15} />
            Mark all as viewed
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 12, marginBottom: 20 }}>
        <button
          type="button"
          onClick={() => setFilter("active")}
          style={{
            background: filter === "active" ? "#2563eb" : "#f1f5f9",
            color: filter === "active" ? "#ffffff" : "#475569",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          Active / Unread
          <span
            style={{
              background: filter === "active" ? "rgba(255,255,255,0.25)" : "#cbd5e1",
              color: filter === "active" ? "#ffffff" : "#0f172a",
              borderRadius: 10,
              padding: "1px 7px",
              fontSize: 11,
            }}
          >
            {unreadCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter("all")}
          style={{
            background: filter === "all" ? "#2563eb" : "#f1f5f9",
            color: filter === "all" ? "#ffffff" : "#475569",
            border: "none",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          All Activity History
        </button>
      </div>

      {/* Notifications List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 16px', background: '#f8fafc', borderRadius: 12, border: '1px dashed #cbd5e1' }}>
            <FileCheck2 size={36} color="#10b981" style={{ margin: '0 auto 10px', display: 'block' }} />
            <strong style={{ display: 'block', fontSize: 15, color: '#0f172a', marginBottom: 4 }}>
              {filter === "active" ? "All Caught Up!" : "No notifications found"}
            </strong>
            <span style={{ fontSize: 13, color: '#64748b' }}>
              {filter === "active"
                ? "You have viewed all claim pipeline updates. New notifications will appear here when an officer takes action."
                : "There is no recorded notification activity for your account yet."}
            </span>
          </div>
        ) : (
          displayList.map((item) => {
            const isApproved = item.type === "CLAIM_APPROVED" || item.type === "CLAIM_SANCTIONED";
            const isRejected = item.type === "CLAIM_REJECTED";
            const isReturned = item.type === "CLAIM_RETURNED";

            const badgeBg = isApproved ? "#dcfce7" : isRejected ? "#fee2e2" : isReturned ? "#fef3c7" : "#e0e7ff";
            const badgeColor = isApproved ? "#15803d" : isRejected ? "#b91c1c" : isReturned ? "#b45309" : "#4338ca";
            const badgeLabel = isApproved ? "Approved & Forwarded" : isRejected ? "Rejected" : isReturned ? "Returned for Correction" : "Pipeline Update";

            return (
              <div
                key={item._id}
                style={{
                  background: item.readAt ? "#ffffff" : "#f0f7ff",
                  border: item.readAt ? "1px solid #e2e8f0" : "1px solid #bfdbfe",
                  borderRadius: 12,
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  boxShadow: item.readAt ? "none" : "0 2px 6px rgba(37, 99, 235, 0.06)",
                  transition: "all 0.2s ease",
                  opacity: dismissingId === item._id ? 0.5 : 1,
                }}
              >
                <div style={{ flex: 1, paddingRight: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span
                      style={{
                        background: badgeBg,
                        color: badgeColor,
                        padding: "3px 10px",
                        borderRadius: 6,
                        fontSize: 11,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      {badgeLabel}
                    </span>

                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </div>

                  <h4 style={{ margin: "0 0 6px 0", fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
                    {item.title}
                  </h4>

                  <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    {item.message}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <button
                    type="button"
                    onClick={() => handleViewClaim(item)}
                    style={{
                      background: "#2563eb",
                      color: "#ffffff",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                    title="View claim in history"
                  >
                    View Claim
                    <ArrowUpRight size={14} />
                  </button>

                  {!item.readAt && (
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(item._id, e)}
                      style={{
                        background: "#f1f5f9",
                        color: "#64748b",
                        border: "1px solid #cbd5e1",
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                      title="Dismiss from unread queue"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            );
          })
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



