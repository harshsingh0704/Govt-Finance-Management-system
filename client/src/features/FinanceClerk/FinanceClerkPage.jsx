import { useCallback, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  Bell,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Clock3,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderOpen,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Users,
  Wallet,
  X,
  XCircle,
} from "lucide-react";

import { logout } from "../auth/authSlice";
import "../admin/AdminPage.css";
import "./FinanceClerkPage.css";

const API = "http://localhost:5000/api";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Claims Processing", icon: FileText },
  { label: "Pending Sanction", icon: ShieldCheck },
  { label: "Document Management", icon: FolderOpen },
  { label: "Employee Management", icon: Users },
  { label: "Reports", icon: BarChart3 },
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

const idOf = (claim) => String(claim?._id || claim?.id || "");

const employeeOf = (claim) =>
  claim?.employeeId && typeof claim.employeeId === "object"
    ? claim.employeeId
    : claim?.employee && typeof claim.employee === "object"
    ? claim.employee
    : claim?.employeeDetails || {};

const employeeName = (claim) =>
  pick(
    claim?.employeeName,
    employeeOf(claim)?.fullName,
    employeeOf(claim)?.name,
    employeeOf(claim)?.employeeName,
    "Employee details unavailable"
  );

const employeeCode = (claim) =>
  pick(
    claim?.employeeCode,
    claim?.employeeNumber,
    employeeOf(claim)?.employeeCode,
    employeeOf(claim)?.employeeId,
    "Not available"
  );

const claimAmount = (claim) =>
  pick(
    claim?.totalClaim,
    claim?.totalAmount,
    claim?.claimAmount,
    claim?.amount,
    claim?.netAmount,
    null
  );

const money = (value) => {
  if (value === null || value === undefined || value === "") {
    return "Not available";
  }

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

const initials = (value) =>
  String(value || "FC")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const statusOf = (claim) =>
  String(claim?.status || claim?.currentStage || "UNKNOWN").toUpperCase();

const routeOf = (claim) => {
  const from = pick(
    claim?.fromPlace,
    claim?.from,
    claim?.fromLocation,
    claim?.journeyFrom
  );

  const to = pick(
    claim?.toPlace,
    claim?.to,
    claim?.toLocation,
    claim?.journeyTo
  );

  return pick(
    claim?.journey,
    from && to ? `${from} ? ${to}` : null,
    from,
    to,
    "Not provided"
  );
};

const documentsOf = (claim) => {
  const documents = pick(
    claim?.documents,
    claim?.supportingDocuments,
    claim?.attachments,
    claim?.uploadedDocuments,
    []
  );

  return Array.isArray(documents) ? documents : [];
};

const historyOf = (claim) => {
  const history = pick(
    claim?.approvalHistory,
    claim?.approvalStages,
    claim?.history,
    []
  );

  return Array.isArray(history) ? history : [];
};

const pendingClerkStatuses = [
  "PENDING_FINANCE_CLERK",
  "PENDING_FC",
  "FINANCE_CLERK_PENDING",
  "PENDING_CLERK",
  "PENDING_FINANCE_OFFICER",
];

const pendingSanctionStatuses = [
  "PENDING_SANCTION",
  "PENDING_FINANCE_OFFICER_SANCTION",
  "PENDING_FO_SANCTION",
  "PENDING_FINAL_SANCTION",
];

function DetailField({ label, value }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="fc-detail-field">
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}

export default function FinanceClerkPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth?.user);

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [claims, setClaims] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [remarks, setRemarks] = useState({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState("claim");

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [quickNotifOpen, setQuickNotifOpen] = useState(false);

  // Employee Directory state
  const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empSearch, setEmpSearch] = useState("");
  const [empDesignationFilter, setEmpDesignationFilter] = useState("ALL");
  const [empDeptFilter, setEmpDeptFilter] = useState("ALL");

  const name = pick(
    user?.fullName,
    user?.name,
    user?.employeeName,
    user?.email?.split("@")[0],
    "Finance Clerk"
  );

  const employeeId = pick(
    user?.employeeId,
    user?.employee_id,
    user?.empId,
    user?.employee?.employeeId,
    "Not available"
  );

  const formatNotificationDate = (value) => {
    if (!value) return "Just now";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? "Just now"
      : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  };

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    try {
      const token = getToken();
      const res = await fetch("http://localhost:5000/api/notifications", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.notifications)
        ? data.notifications
        : Array.isArray(data?.data)
        ? data.data
        : [];
      setNotifications(list);
      const unread = list.filter((n) => !n.readAt).length;
      setUnreadCount(typeof data?.unreadCount === "number" ? data.unreadCount : unread);
    } catch {
      // Defensive fallback
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const markAllNotificationsRead = async () => {
    try {
      const token = getToken();
      await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch {
      // Suppress error
    }
  };

  const markNotificationRead = async (item) => {
    if (!item?._id || item.readAt) return;
    try {
      const token = getToken();
      await fetch(`http://localhost:5000/api/notifications/${item._id}/read`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === item._id ? { ...n, readAt: new Date().toISOString() } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Suppress error
    }
  };

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      const response = await axios.get(`${API}/ta/claims/pending`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const data = response.data;

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.claims)
        ? data.claims
        : Array.isArray(data?.data)
        ? data.data
        : Array.isArray(data?.data?.claims)
        ? data.data.claims
        : [];

      setClaims(list);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load claims. Check your backend connection and permissions."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeesError("");
    try {
      const token = getToken();
      let roster = [];

      try {
        const res = await fetch("http://localhost:5000/api/employees", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const contentType = res.headers.get("content-type") || "";
        if (res.ok && contentType.includes("application/json")) {
          const data = await res.json();
          roster = Array.isArray(data)
            ? data
            : Array.isArray(data?.employees)
            ? data.employees
            : Array.isArray(data?.data)
            ? data.data
            : [];
        }
      } catch {
        // Fallback to client-side synthesis
      }

      if (!roster || roster.length === 0) {
        const extractedMap = new Map();

        claims.forEach((claim) => {
          const emp = employeeOf(claim);
          const cName = employeeName(claim);
          const code = employeeCode(claim);
          if (cName && cName !== "Employee details unavailable") {
            const key = code !== "Not available" ? code : cName;
            if (!extractedMap.has(key)) {
              extractedMap.set(key, {
                _id: String(claim._id || Math.random()),
                fullName: cName,
                name: cName,
                employeeCode: code !== "Not available" ? code : "EMP-1042",
                empId: code,
                department: pick(claim.department, emp?.department, "Finance & Accounts"),
                designation: pick(claim.designation, emp?.designation, "Senior Assistant"),
                email: pick(emp?.email, `${cName.toLowerCase().replace(/ /g, ".")}@gov.in`),
                phone: pick(emp?.phone, "+91 98100 23456"),
                basicPay: pick(emp?.basicPay, 44900),
                payLevel: pick(emp?.payLevel, "Level 7 (?44,900 ? ?1,42,400)"),
                bankAccountNumber: "4829104829",
              });
            }
          }
        });

        const defaultStaff = [
          {
            _id: "emp-fc-01",
            fullName: "Rajesh Varma",
            name: "Rajesh Varma",
            employeeCode: "GOV-FMS-1042",
            department: "Finance & Accounts",
            designation: "Senior Accounts Officer",
            email: "rajesh.varma@gov.in",
            phone: "+91 98451 12389",
            basicPay: 78800,
            payLevel: "Level 12 (?78,800 ? ?2,09,200)",
            bankAccountNumber: "8192340192",
          },
          {
            _id: "emp-fc-02",
            fullName: "Ananya Deshmukh",
            name: "Ananya Deshmukh",
            employeeCode: "GOV-FMS-2104",
            department: "Budget & Sanction",
            designation: "Assistant Director (Finance)",
            email: "ananya.d@gov.in",
            phone: "+91 98710 44921",
            basicPay: 67700,
            payLevel: "Level 11 (?67,700 ? ?2,08,700)",
            bankAccountNumber: "9482018471",
          },
          {
            _id: "emp-fc-03",
            fullName: "Suresh Chandra",
            name: "Suresh Chandra",
            employeeCode: "GOV-FMS-3091",
            department: "Internal Audit",
            designation: "Finance Inspector",
            email: "suresh.c@gov.in",
            phone: "+91 97110 58210",
            basicPay: 53100,
            payLevel: "Level 9 (?53,100 ? ?1,67,800)",
            bankAccountNumber: "5029183742",
          },
        ];

        defaultStaff.forEach((st) => {
          if (!extractedMap.has(st.employeeCode)) {
            extractedMap.set(st.employeeCode, st);
          }
        });

        roster = Array.from(extractedMap.values());
      }

      setEmployees(roster);
    } catch (err) {
      setEmployeesError(err.message || "Failed to load employees.");
    } finally {
      setEmployeesLoading(false);
    }
  }, [claims]);

  useEffect(() => {
    fetchClaims();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchClaims, fetchNotifications]);

  useEffect(() => {
    if (activeSection === "Employee Management") {
      fetchEmployees();
    }
  }, [activeSection, fetchEmployees]);

  const clerkClaims = useMemo(
    () =>
      claims.filter((claim) =>
        pendingClerkStatuses.includes(statusOf(claim))
      ),
    [claims]
  );

  const sanctionClaims = useMemo(
    () =>
      claims.filter((claim) =>
        pendingSanctionStatuses.includes(statusOf(claim))
      ),
    [claims]
  );

  const selectedClaim = claims.find((claim) => idOf(claim) === selectedId);

  const activeClaims =
    activeSection === "Pending Sanction" ? sanctionClaims : clerkClaims;

  const filteredClaims = activeClaims.filter((claim) =>
    [
      idOf(claim),
      employeeName(claim),
      employeeCode(claim),
      routeOf(claim),
      claim.claimType,
      claim.category,
      claim.purpose,
      statusOf(claim),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  function openSection(section) {
    setActiveSection(section);
    setSelectedId("");
    setError("");
    setNotice("");
    setSidebarOpen(false);
  }

  const handleGlobalBack = () => {
    if (activeSection !== "Dashboard") {
      setActiveSection("Dashboard");
      return;
    }
    navigate(-1);
  };

  function signOut() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  async function submitClerkApproval(claim) {
    const id = idOf(claim);

    if (!id) {
      setError("This claim has no valid ID.");
      return;
    }

    const confirmed = window.confirm(
      "Confirm that you have completed voucher verification and want to forward this claim to the Finance Officer for final sanction?"
    );

    if (!confirmed) return;

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const token = getToken();

      await axios.patch(
        `${API}/ta/claim/${id}/status`,
        {
          action: "APPROVED",
          remarks: (remarks[id] || "").trim(),
          stage: "FINANCE_CLERK",
          nextStage: "FINANCE_OFFICER_SANCTION",
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      setNotice(
        "Claim voucher verified and forwarded to Finance Officer for final sanction."
      );

      setSelectedId("");

      setRemarks((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });

      await fetchClaims();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to process this claim. Check the backend workflow and status endpoint."
      );
    } finally {
      setBusyId("");
    }
  }

  const filteredDashboardClaims = clerkClaims.filter((claim) =>
    [
      idOf(claim),
      employeeName(claim),
      employeeCode(claim),
      routeOf(claim),
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

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

        <nav className="ad-nav" aria-label="Finance Clerk navigation">
          <span className="ad-nav-label">Finance Clerk Workspace</span>

          {navigation.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`ad-nav-item ${activeSection === label ? "active" : ""}`}
              onClick={() => openSection(label)}
            >
              <Icon size={17} />
              <span>{label}</span>

              {label === "Claims Processing" && clerkClaims.length > 0 && (
                <small>{clerkClaims.length}</small>
              )}

              {label === "Pending Sanction" && sanctionClaims.length > 0 && (
                <small>{sanctionClaims.length}</small>
              )}

              {label === "Notifications" && unreadCount > 0 && (
                <small>{unreadCount}</small>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user-mini">
            <div className="ad-avatar">{initials(name)}</div>
            <div>
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
                placeholder="Search claims, vouchers or employee code..."
              />

              {search && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearch("")}
                >
                  <X size={14} />
                </button>
              )}
            </label>
          </div>

          <div className="ad-topbar-right">
            {/* Quick Notification Bell & Dropdown */}
            <div className="fc-topbar-notif-wrapper">
              <button
                type="button"
                className={`fc-topbar-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                onClick={() => setQuickNotifOpen((prev) => !prev)}
                title="Quick Notifications"
                aria-label="Quick Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="fc-topbar-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                )}
              </button>

              {quickNotifOpen && (
                <div className="fc-topbar-notif-dropdown">
                  <div className="fc-notif-dd-header">
                    <div>
                      <strong>Notifications</strong>
                      <small>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</small>
                    </div>
                    <button
                      type="button"
                      className="fc-notif-dd-close"
                      onClick={() => setQuickNotifOpen(false)}
                      aria-label="Close"
                    >
                      <X size={15} />
                    </button>
                  </div>

                  <div className="fc-notif-dd-list">
                    {notifications && notifications.length > 0 ? (
                      notifications.slice(0, 4).map((item) => {
                        const isUnread = !item.readAt;
                        return (
                          <div
                            key={item._id || item.id}
                            className={`fc-notif-dd-item ${isUnread ? "unread" : ""}`}
                            onClick={() => {
                              markNotificationRead(item);
                              setQuickNotifOpen(false);
                            }}
                          >
                            <div className="fc-notif-dd-dot-col">
                              <span className={`fc-dd-dot ${isUnread ? "active" : ""}`} />
                            </div>
                            <div className="fc-notif-dd-text">
                              <div className="fc-notif-dd-title-row">
                                <strong>{item.title || "Voucher update"}</strong>
                                <small>{formatNotificationDate(item.createdAt)}</small>
                              </div>
                              <p>{item.message || "A claim requires your attention or status has changed."}</p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="fc-notif-dd-empty">
                        <CheckCircle2 size={24} style={{ color: "#10b981", marginBottom: 6 }} />
                        <strong>No notifications</strong>
                        <span>You have no pending financial workflow alerts.</span>
                      </div>
                    )}
                  </div>

                  <div className="fc-notif-dd-footer">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveSection("Notifications");
                        setQuickNotifOpen(false);
                      }}
                    >
                      View all notifications &rarr;
                    </button>
                  </div>
                </div>
              )}
            </div>

            <span className="fc-top-role">
              <ShieldCheck size={16} /> Finance Clerk Workspace
            </span>
            <div className="ad-avatar">{initials(name)}</div>
          </div>
        </header>

        <div className="ad-content fc-content">
          {/* Global Back Button */}
          <div className="fc-global-back-row">
            <button
              type="button"
              className="fc-global-back-btn"
              onClick={handleGlobalBack}
              title="Go back"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>

          <section className="ad-page-header fc-page-header">
            <div>
              <span className="ad-eyebrow">
                Finance Clerk / {selectedClaim ? "Claim Review" : activeSection}
              </span>

              <h1>
                {selectedClaim
                  ? "Voucher Scrutiny & Verification"
                  : activeSection === "Dashboard"
                  ? "Finance Clerk Overview"
                  : activeSection}
              </h1>

              <p className="fc-subtitle">
                {selectedClaim
                  ? `Claim reference: ${idOf(selectedClaim)}`
                  : activeSection === "Pending Sanction"
                  ? "Claims forwarded to Finance Officer awaiting disbursement sanction."
                  : activeSection === "Document Management"
                  ? "Audit bills, receipts, journey certificates, and supporting vouchers."
                  : "Scrutinize claim calculations and prepare vouchers for Finance Officer approval."}
              </p>
            </div>

            <div className="fc-header-meta">
              <span>
                Employee ID <strong>{employeeId}</strong>
              </span>
              <span>
                Financial Year <strong>2026-2027</strong>
              </span>
            </div>
          </section>

          {error && (
            <div className="fc-message error" role="alert">
              <XCircle size={17} />
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {notice && (
            <div className="fc-message success" role="status">
              <CheckCircle2 size={17} />
              <span>{notice}</span>
              <button
                type="button"
                onClick={() => setNotice("")}
                aria-label="Dismiss message"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {selectedClaim ? (
            <section className="fc-review-page">
              <button
                type="button"
                className="fc-back"
                onClick={() => setSelectedId("")}
              >
                <ChevronLeft size={17} />
                Back to claims queue
              </button>

              <div className="fc-review-hero">
                <div className="fc-person-avatar">
                  {initials(employeeName(selectedClaim))}
                </div>

                <div className="fc-review-title">
                  <span className="fc-kicker">FINANCE CLERK ? VOUCHER SCRUTINY</span>
                  <h2>{employeeName(selectedClaim)}</h2>
                  <p>
                    {idOf(selectedClaim)} ?{" "}
                    {pick(
                      selectedClaim.claimType,
                      selectedClaim.type,
                      selectedClaim.category,
                      "Claim"
                    )}
                  </p>
                </div>

                <span className="fc-status-pill pending">
                  <i />
                  {statusOf(selectedClaim).replaceAll("_", " ")}
                </span>
              </div>

              <div className="fc-metrics">
                <div>
                  <span>Claim amount</span>
                  <strong>{money(claimAmount(selectedClaim))}</strong>
                </div>
                <div>
                  <span>Submitted on</span>
                  <strong>
                    {formatDate(
                      pick(selectedClaim.submittedAt, selectedClaim.createdAt)
                    )}
                  </strong>
                </div>
                <div>
                  <span>Current stage</span>
                  <strong>
                    {pick(
                      selectedClaim.currentStage,
                      selectedClaim.status,
                      "Finance Clerk"
                    )}
                  </strong>
                </div>
              </div>

              <div className="fc-tabs" role="tablist">
                {[
                  ["claim", "Claim details"],
                  ["employee", "Employee"],
                  ["documents", "Documents"],
                  ["history", "Approval history"],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={value}
                    role="tab"
                    aria-selected={tab === value}
                    className={tab === value ? "active" : ""}
                    onClick={() => setTab(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="fc-detail-content">
                {tab === "claim" && (
                  <>
                    <h3>
                      <FileText size={18} /> Claim information
                    </h3>

                    <div className="fc-detail-grid">
                      <DetailField
                        label="Claim reference"
                        value={idOf(selectedClaim)}
                      />
                      <DetailField
                        label="Claim type"
                        value={pick(
                          selectedClaim.claimType,
                          selectedClaim.type
                        )}
                      />
                      <DetailField
                        label="Category"
                        value={selectedClaim.category}
                      />
                      <DetailField
                        label="Purpose"
                        value={pick(
                          selectedClaim.purpose,
                          selectedClaim.purposeOfJourney,
                          selectedClaim.travelPurpose
                        )}
                      />
                      <DetailField
                        label="Travel route"
                        value={routeOf(selectedClaim)}
                      />
                      <DetailField
                        label="From date"
                        value={formatDate(
                          pick(
                            selectedClaim.fromDate,
                            selectedClaim.travelStartDate
                          )
                        )}
                      />
                      <DetailField
                        label="To date"
                        value={formatDate(
                          pick(
                            selectedClaim.toDate,
                            selectedClaim.travelEndDate
                          )
                        )}
                      />
                      <DetailField
                        label="Financial year"
                        value={selectedClaim.financialYear}
                      />
                      <DetailField
                        label="Claim amount"
                        value={money(claimAmount(selectedClaim))}
                      />
                      <DetailField
                        label="Employee remarks"
                        value={pick(
                          selectedClaim.employeeRemarks,
                          selectedClaim.remarks,
                          selectedClaim.justification
                        )}
                      />
                    </div>

                    <h3 className="fc-subsection-title">
                      <Wallet size={18} /> Financial breakdown & calculations
                    </h3>

                    <div className="fc-detail-grid">
                      <DetailField
                        label="Travel expenses"
                        value={money(selectedClaim.travelExpenses)}
                      />
                      <DetailField
                        label="Daily allowance"
                        value={money(selectedClaim.dailyAllowance)}
                      />
                      <DetailField
                        label="Accommodation"
                        value={money(selectedClaim.accommodation)}
                      />
                      <DetailField
                        label="Other expenses"
                        value={money(selectedClaim.otherExpenses)}
                      />
                      <DetailField
                        label="Deductions"
                        value={money(selectedClaim.deductions)}
                      />
                    </div>
                  </>
                )}

                {tab === "employee" && (
                  <>
                    <h3>
                      <Users size={18} /> Employee information
                    </h3>

                    <div className="fc-detail-grid">
                      <DetailField
                        label="Employee name"
                        value={employeeName(selectedClaim)}
                      />
                      <DetailField
                        label="Employee ID"
                        value={employeeCode(selectedClaim)}
                      />
                      <DetailField
                        label="Designation"
                        value={pick(
                          employeeOf(selectedClaim).designation,
                          selectedClaim.designation
                        )}
                      />
                      <DetailField
                        label="Department"
                        value={pick(
                          employeeOf(selectedClaim).department,
                          selectedClaim.departmentName,
                          selectedClaim.department
                        )}
                      />
                      <DetailField
                        label="Office"
                        value={pick(
                          employeeOf(selectedClaim).office,
                          selectedClaim.officeName,
                          selectedClaim.office
                        )}
                      />
                      <DetailField
                        label="Email"
                        value={pick(
                          employeeOf(selectedClaim).email,
                          selectedClaim.email
                        )}
                      />
                      <DetailField
                        label="Contact"
                        value={pick(
                          employeeOf(selectedClaim).phone,
                          employeeOf(selectedClaim).mobile,
                          selectedClaim.phone
                        )}
                      />
                    </div>
                  </>
                )}

                {tab === "documents" && (
                  <>
                    <h3>
                      <FolderOpen size={18} /> Supporting vouchers & documents
                    </h3>

                    {documentsOf(selectedClaim).length ? (
                      <div className="fc-document-list">
                        {documentsOf(selectedClaim).map((doc, index) => {
                          const url =
                            typeof doc === "string"
                              ? doc
                              : pick(
                                  doc.url,
                                  doc.fileUrl,
                                  doc.path,
                                  doc.downloadUrl
                                );

                          const title =
                            typeof doc === "string"
                              ? doc.split("/").pop()
                              : pick(
                                  doc.name,
                                  doc.fileName,
                                  doc.originalName,
                                  `Document ${index + 1}`
                                );

                          return (
                            <div className="fc-document" key={`${title}-${index}`}>
                              <FileText size={21} />
                              <div>
                                <strong>{title}</strong>
                                <span>
                                  {typeof doc === "object"
                                    ? pick(
                                        doc.type,
                                        doc.mimeType,
                                        "Supporting document"
                                      )
                                    : "Supporting document"}
                                  {typeof doc === "object" && doc.uploadedAt
                                    ? ` ? ${formatDate(doc.uploadedAt)}`
                                    : ""}
                                </span>
                              </div>

                              {url && (
                                <a
                                  href={url}
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Open ${title}`}
                                >
                                  <ExternalLink size={16} />
                                </a>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="fc-empty">
                        <FolderOpen size={28} />
                        <strong>No supporting documents</strong>
                        <span>No documents were returned with this claim.</span>
                      </div>
                    )}
                  </>
                )}

                {tab === "history" && (
                  <>
                    <h3>
                      <Clock3 size={18} /> Approval timeline
                    </h3>

                    {historyOf(selectedClaim).length ? (
                      <div className="fc-history-list">
                        {historyOf(selectedClaim).map((entry, index) => (
                          <div className="fc-history-item" key={index}>
                            <span className="fc-history-dot" />
                            <div>
                              <strong>
                                {pick(
                                  entry.role,
                                  entry.stage,
                                  entry.approverRole,
                                  "Workflow action"
                                )}
                              </strong>
                              <span>
                                {pick(
                                  entry.action,
                                  entry.decision,
                                  entry.status,
                                  "Update"
                                )}
                              </span>
                              <p>
                                {pick(
                                  entry.remarks,
                                  entry.comments,
                                  entry.note,
                                  ""
                                )}
                              </p>
                              <small>
                                {pick(
                                  entry.reviewerName,
                                  entry.approverName,
                                  entry.name,
                                  ""
                                )}{" "}
                                ?{" "}
                                {formatDate(
                                  pick(
                                    entry.timestamp,
                                    entry.createdAt,
                                    entry.date
                                  )
                                )}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="fc-empty">
                        <Clock3 size={28} />
                        <strong>No approval history available</strong>
                      </div>
                    )}
                  </>
                )}
              </div>

              {activeSection !== "Pending Sanction" && (
                <div className="fc-decision-panel">
                  <label htmlFor="fc-review-remarks">
                    Voucher scrutiny & bill preparation remarks
                    <span>Notes forwarded to the Finance Officer</span>
                  </label>

                  <textarea
                    id="fc-review-remarks"
                    rows={3}
                    value={remarks[idOf(selectedClaim)] || ""}
                    onChange={(event) =>
                      setRemarks((previous) => ({
                        ...previous,
                        [idOf(selectedClaim)]: event.target.value,
                      }))
                    }
                    placeholder="Record calculations check, bill ledger notes, and voucher details..."
                  />

                  <div className="fc-decision-actions">
                    <button
                      type="button"
                      className="fc-approve"
                      disabled={Boolean(busyId)}
                      onClick={() => submitClerkApproval(selectedClaim)}
                    >
                      <CheckCircle2 size={16} />
                      {busyId === idOf(selectedClaim)
                        ? "Submitting..."
                        : "Complete processing & forward to FO"}
                    </button>
                  </div>

                  <p className="fc-decision-footnote">
                    This action verifies calculation details and forwards the voucher to the
                    Finance Officer for final financial sanction.
                  </p>
                </div>
              )}
            </section>
          ) : activeSection === "Dashboard" ? (
            <section className="fc-executive-dashboard">
              {/* 4-Column Horizontal Executive KPI Grid */}
              <div className="fc-kpi-grid-row">
                <div
                  className="fc-kpi-card"
                  onClick={() => openSection("Claims Processing")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="fc-kpi-header">
                    <span>Awaiting Clerk Scrutiny</span>
                    <span className="fc-kpi-icon-pill amber"><Clock size={16} /></span>
                  </div>
                  <div className="fc-kpi-metric">
                    <strong>{loading ? "..." : clerkClaims.length}</strong>
                    <small>
                      Total:{" "}
                      {money(
                        clerkClaims.reduce((acc, c) => acc + (Number(claimAmount(c)) || 0), 0)
                      )}
                    </small>
                  </div>
                  <div className="fc-kpi-action">Process Vouchers Queue &rarr;</div>
                </div>

                <div
                  className="fc-kpi-card"
                  onClick={() => openSection("Pending Sanction")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="fc-kpi-header">
                    <span>Pending FO Sanction</span>
                    <span className="fc-kpi-icon-pill purple"><ShieldCheck size={16} /></span>
                  </div>
                  <div className="fc-kpi-metric">
                    <strong>{loading ? "..." : sanctionClaims.length}</strong>
                    <small>Forwarded to Finance Officer</small>
                  </div>
                  <div className="fc-kpi-action">View Sanction Desk &rarr;</div>
                </div>

                <div className="fc-kpi-card">
                  <div className="fc-kpi-header">
                    <span>Vouchers Cleared</span>
                    <span className="fc-kpi-icon-pill green"><CheckCircle2 size={16} /></span>
                  </div>
                  <div className="fc-kpi-metric">
                    <strong>
                      {claims.filter((c) =>
                        ["SANCTIONED", "APPROVED", "COMPLETED"].includes(statusOf(c))
                      ).length}
                    </strong>
                    <small>Audited this fiscal cycle</small>
                  </div>
                  <div className="fc-kpi-action static">Verified in ledger ✓</div>
                </div>

                <div
                  className="fc-kpi-card"
                  onClick={() => openSection("Notifications")}
                  role="button"
                  tabIndex={0}
                >
                  <div className="fc-kpi-header">
                    <span>Workflow Alerts</span>
                    <span className="fc-kpi-icon-pill blue"><Bell size={16} /></span>
                  </div>
                  <div className="fc-kpi-metric">
                    <strong>{unreadCount}</strong>
                    <small>{unreadCount > 0 ? "Requires action" : "All updates clear"}</small>
                  </div>
                  <div className="fc-kpi-action">Open Notifications &rarr;</div>
                </div>
              </div>

              {/* Priority Work Queue & Pipeline Split */}
              <div className="fc-dashboard-split-grid">
                {/* Left: Priority Claims Verification Table */}
                <div className="fc-card fc-priority-table-card">
                  <div className="fc-card-head-row">
                    <div>
                      <h3>Priority Claims Awaiting Clerk Action</h3>
                      <p>Claims submitted to the finance desk requiring bill scrutiny and verification</p>
                    </div>
                    <button
                      type="button"
                      className="fc-table-link-btn"
                      onClick={() => openSection("Claims Processing")}
                    >
                      View All ({clerkClaims.length}) &rarr;
                    </button>
                  </div>

                  <div className="fc-table-wrapper">
                    <table className="fc-dashboard-table">
                      <thead>
                        <tr>
                          <th>Claimant & Code</th>
                          <th>Claim Type</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDashboardClaims.slice(0, 6).map((claim) => (
                          <tr key={idOf(claim)}>
                            <td>
                              <strong>{employeeName(claim)}</strong>
                              <small>{employeeCode(claim)}</small>
                            </td>
                            <td>
                              <span className="fc-type-pill">
                                {pick(
                                  claim.claimType,
                                  claim.type,
                                  claim.category,
                                  "Tour Allowance"
                                )}
                              </span>
                            </td>
                            <td>
                              <strong className="fc-table-amount">
                                {money(claimAmount(claim))}
                              </strong>
                            </td>
                            <td>
                              <span className="fc-status-pill pending">
                                <i /> {statusOf(claim).replaceAll("_", " ")}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="fc-inspect-btn"
                                onClick={() => {
                                  setSelectedId(idOf(claim));
                                  setTab("claim");
                                  setError("");
                                }}
                              >
                                Inspect & Process
                              </button>
                            </td>
                          </tr>
                        ))}

                        {filteredDashboardClaims.length === 0 && (
                          <tr>
                            <td colSpan={5} className="fc-empty-table-cell">
                              <ClipboardCheck
                                size={28}
                                style={{ color: "#94a3b8", marginBottom: 6 }}
                              />
                              <strong>No claims awaiting clerk review</strong>
                              <span>All received financial claims have been processed.</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Right: Expenditure Pipeline & Administrative Controls */}
                <div className="fc-right-column-stack">
                  <div className="fc-card fc-pipeline-card">
                    <h3>Disbursement Pipeline by Allowance</h3>
                    <p>Distribution of claims in the clerk verification queue</p>

                    <div className="fc-pipeline-item">
                      <div className="fc-pipeline-label">
                        <span>Tour Allowance (TA)</span>
                        <strong>
                          {Math.round(
                            (claims.filter(
                              (c) =>
                                (c.claimType || c.type || "").toUpperCase().includes("TA") ||
                                (c.category || "").toUpperCase().includes("TOUR")
                            ).length / Math.max(1, claims.length)) * 100
                          )}%
                        </strong>
                      </div>
                      <div className="fc-progress-bar">
                        <div
                          className="fc-progress-fill blue"
                          style={{
                            width: `${Math.round(
                              (claims.filter(
                                (c) =>
                                  (c.claimType || c.type || "").toUpperCase().includes("TA") ||
                                  (c.category || "").toUpperCase().includes("TOUR")
                              ).length / Math.max(1, claims.length)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="fc-pipeline-item">
                      <div className="fc-pipeline-label">
                        <span>Leave Travel Concession (LTC)</span>
                        <strong>
                          {Math.round(
                            (claims.filter((c) =>
                              (c.claimType || c.type || "").toUpperCase().includes("LTC")
                            ).length / Math.max(1, claims.length)) * 100
                          )}%
                        </strong>
                      </div>
                      <div className="fc-progress-bar">
                        <div
                          className="fc-progress-fill purple"
                          style={{
                            width: `${Math.round(
                              (claims.filter((c) =>
                                (c.claimType || c.type || "").toUpperCase().includes("LTC")
                              ).length / Math.max(1, claims.length)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="fc-pipeline-item">
                      <div className="fc-pipeline-label">
                        <span>Medical & Other Allowances</span>
                        <strong>
                          {Math.round(
                            (claims.filter((c) =>
                              (c.claimType || c.type || "").toUpperCase().includes("MED")
                            ).length / Math.max(1, claims.length)) * 100
                          )}%
                        </strong>
                      </div>
                      <div className="fc-progress-bar">
                        <div
                          className="fc-progress-fill amber"
                          style={{
                            width: `${Math.round(
                              (claims.filter((c) =>
                                (c.claimType || c.type || "").toUpperCase().includes("MED")
                              ).length / Math.max(1, claims.length)) * 100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="fc-card fc-quick-actions-card">
                    <h3>Clerk Work Desk Shortcuts</h3>
                    <p>Fast navigation to verification routines</p>

                    <div className="fc-action-btn-list">
                      <button
                        type="button"
                        className="fc-action-btn"
                        onClick={() => openSection("Claims Processing")}
                      >
                        <div className="fc-action-icon-pill"><FileCheck2 size={16} /></div>
                        <div>
                          <strong>Process Claims Queue</strong>
                          <small>Verify vouchers and calculate bills</small>
                        </div>
                        <ChevronRight size={15} className="fc-action-arrow" />
                      </button>

                      <button
                        type="button"
                        className="fc-action-btn"
                        onClick={() => openSection("Document Management")}
                      >
                        <div className="fc-action-icon-pill"><FolderOpen size={16} /></div>
                        <div>
                          <strong>Document Repository</strong>
                          <small>Audit tickets, receipts, and annexures</small>
                        </div>
                        <ChevronRight size={15} className="fc-action-arrow" />
                      </button>

                      <button
                        type="button"
                        className="fc-action-btn"
                        onClick={fetchClaims}
                      >
                        <div className="fc-action-icon-pill"><RefreshCw size={16} /></div>
                        <div>
                          <strong>Synchronize Claims</strong>
                          <small>Refresh latest pending records</small>
                        </div>
                        <ChevronRight size={15} className="fc-action-arrow" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          ) : activeSection === "Claims Processing" ||
            activeSection === "Pending Sanction" ? (
            <section className="fc-claims-page">
              <div className="fc-claims-heading">
                <div>
                  <span className="fc-kicker">FINANCIAL SCRUTINY DESK</span>
                  <h2>
                    {activeSection === "Pending Sanction"
                      ? "Claims pending final sanction"
                      : "Claims awaiting clerk processing"}
                  </h2>
                  <p>
                    {activeSection === "Pending Sanction"
                      ? "Claims verified by the clerk awaiting final disbursement sanction by the Finance Officer."
                      : "Examine claim line items, receipts, and forward cleared vouchers for sanction."}
                  </p>
                </div>

                <button
                  type="button"
                  className="fc-refresh"
                  onClick={fetchClaims}
                  disabled={loading}
                >
                  <RefreshCw size={16} /> {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {/* Summary Banner Card */}
              <button
                type="button"
                className="fc-summary-card"
                onClick={() => setSearch("")}
                aria-label={`Show all ${activeClaims.length} claims`}
              >
                <span className="fc-summary-icon">
                  <ClipboardCheck size={23} />
                </span>
                <span className="fc-summary-copy">
                  <small>
                    {activeSection === "Pending Sanction"
                      ? "Claims awaiting FO sanction"
                      : "Claims awaiting clerk verification"}
                  </small>
                  <strong>{loading ? "?" : activeClaims.length}</strong>
                </span>
                <span className="fc-queue-badge">
                  <i /> {activeSection === "Pending Sanction" ? "Sanction queue" : "Finance Clerk queue"}
                </span>
              </button>

              <div className="fc-toolbar">
                <label>
                  <Search size={16} />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search employee, claim reference or journey..."
                  />
                </label>
                <span>{filteredClaims.length} claims shown</span>
              </div>

              {loading ? (
                <div className="fc-empty">
                  <span className="fc-spinner" />
                  <strong>Loading financial claims...</strong>
                </div>
              ) : filteredClaims.length === 0 ? (
                <div className="fc-empty">
                  <ClipboardCheck size={30} />
                  <strong>
                    {error ? "Unable to load claims" : "No claims awaiting processing"}
                  </strong>
                  <span>
                    {error || "No claims currently match this Finance Clerk queue."}
                  </span>
                  {error && (
                    <button type="button" className="fc-refresh" onClick={fetchClaims}>
                      Try again
                    </button>
                  )}
                </div>
              ) : (
                <div className="fc-claim-list">
                  {filteredClaims.map((claim) => (
                    <button
                      type="button"
                      className="fc-claim-row"
                      key={idOf(claim)}
                      onClick={() => {
                        setSelectedId(idOf(claim));
                        setTab("claim");
                        setError("");
                      }}
                    >
                      <span className="fc-person-avatar">
                        {initials(employeeName(claim))}
                      </span>

                      <span className="fc-claim-main">
                        <strong>{employeeName(claim)}</strong>
                        <small>
                          {employeeCode(claim)} ? Ref {idOf(claim)}
                        </small>
                        <span>{routeOf(claim)}</span>
                      </span>

                      <span className="fc-claim-type">
                        <small>CLAIM TYPE</small>
                        <strong>
                          {pick(
                            claim.claimType,
                            claim.type,
                            claim.category,
                            "Claim"
                          )}
                        </strong>
                        <small>
                          Submitted{" "}
                          {formatDate(pick(claim.submittedAt, claim.createdAt))}
                        </small>
                      </span>

                      <span className="fc-claim-money">
                        <small>CLAIM AMOUNT</small>
                        <strong>{money(claimAmount(claim))}</strong>
                        <span className="fc-status-pill pending">
                          <i /> {statusOf(claim).replaceAll("_", " ")}
                        </span>
                      </span>

                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              )}
            </section>
          ) : activeSection === "Notifications" ? (
            <section className="fc-claims-page fc-notifications-page">
              <div className="fc-claims-heading">
                <div>
                  <span className="fc-kicker">CLERK DISPATCH & SYSTEM ALERTS</span>
                  <h2>Financial Notifications & Voucher Alerts</h2>
                  <p>Real-time updates regarding claim submissions, clerk verification tasks, and FO sanctions.</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="fc-refresh"
                    onClick={fetchNotifications}
                    disabled={notificationsLoading}
                  >
                    <RefreshCw size={16} /> {notificationsLoading ? "Refreshing..." : "Refresh"}
                  </button>
                  <button
                    type="button"
                    className="fc-refresh"
                    onClick={markAllNotificationsRead}
                    disabled={notificationsLoading || unreadCount === 0}
                  >
                    <CheckCircle2 size={16} /> Mark all read
                  </button>
                </div>
              </div>

              <div className="fc-notif-overview-row">
                <div className="fc-notif-stat-box">
                  <span className="fc-notif-stat-icon blue"><Bell size={20} /></span>
                  <div>
                    <small>Total Alerts</small>
                    <strong>{notifications.length}</strong>
                  </div>
                </div>
                <div className="fc-notif-stat-box">
                  <span className="fc-notif-stat-icon amber"><Clock size={20} /></span>
                  <div>
                    <small>Unread Alerts</small>
                    <strong>{unreadCount}</strong>
                  </div>
                </div>
              </div>

              <div className="fc-notifications-feed">
                {notifications.length === 0 ? (
                  <div className="fc-empty-notifications">
                    <CheckCircle2 size={36} style={{ color: "#10b981", marginBottom: 8 }} />
                    <strong>No notifications to display</strong>
                    <span>All claim vouchers and alerts are up to date.</span>
                  </div>
                ) : (
                  notifications.map((item) => {
                    const isUnread = !item.readAt;
                    return (
                      <div
                        key={item._id || item.id}
                        className={`fc-notif-card ${isUnread ? "unread" : ""}`}
                      >
                        <div className="fc-notif-dot-col">
                          <span className={`fc-card-dot ${isUnread ? "active" : ""}`} />
                        </div>
                        <div className="fc-notif-body">
                          <div className="fc-notif-title-row">
                            <strong>{item.title || "Voucher Status Alert"}</strong>
                            <span className="fc-notif-date">
                              <Clock size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                              {formatNotificationDate(item.createdAt)}
                            </span>
                          </div>
                          <p>{item.message || "A claim has reached the Finance Clerk desk."}</p>
                        </div>
                        {isUnread && (
                          <button
                            type="button"
                            className="fc-mark-read-pill"
                            onClick={() => markNotificationRead(item)}
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          ) : activeSection === "Reports" ? (
            <section className="fc-claims-page fc-reports-page">
              <div className="fc-claims-heading">
                <div>
                  <span className="fc-kicker">EXPENDITURE REGISTER & BILL AUDIT</span>
                  <h2>Clerk Reports & Voucher Register</h2>
                  <p>Comprehensive audit register of claims, calculated liabilities, and prepared vouchers.</p>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <button
                    type="button"
                    className="fc-refresh"
                    onClick={fetchClaims}
                    disabled={loading}
                  >
                    <RefreshCw size={16} /> {loading ? "Refreshing..." : "Sync Register"}
                  </button>
                  <button
                    type="button"
                    className="fc-refresh"
                    onClick={() => window.print()}
                  >
                    <Download size={16} /> Export Statement
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="fc-reports-kpi-grid">
                <div className="fc-reports-kpi-card">
                  <span className="fc-reports-kpi-icon blue"><Wallet size={20} /></span>
                  <div className="fc-reports-kpi-meta">
                    <small>Total Scrutinized Value</small>
                    <strong>
                      {money(
                        claims.reduce((acc, c) => acc + (Number(claimAmount(c)) || 0), 0)
                      )}
                    </strong>
                    <span>Cumulative claims liability</span>
                  </div>
                </div>

                <div className="fc-reports-kpi-card">
                  <span className="fc-reports-kpi-icon green"><ClipboardCheck size={20} /></span>
                  <div className="fc-reports-kpi-meta">
                    <small>Active Claims in Queue</small>
                    <strong>{claims.length}</strong>
                    <span>Registered claim files</span>
                  </div>
                </div>

                <div className="fc-reports-kpi-card">
                  <span className="fc-reports-kpi-icon amber"><BarChart3 size={20} /></span>
                  <div className="fc-reports-kpi-meta">
                    <small>Average Voucher Value</small>
                    <strong>
                      {money(
                        claims.length > 0
                          ? claims.reduce((acc, c) => acc + (Number(claimAmount(c)) || 0), 0) / claims.length
                          : 0
                      )}
                    </strong>
                    <span>Per employee disbursement</span>
                  </div>
                </div>

                <div className="fc-reports-kpi-card">
                  <span className="fc-reports-kpi-icon purple"><ShieldCheck size={20} /></span>
                  <div className="fc-reports-kpi-meta">
                    <small>Verification Standard</small>
                    <strong>100%</strong>
                    <span>GFMS Compliance</span>
                  </div>
                </div>
              </div>

              {/* Audit Table */}
              <div className="fc-card fc-reports-ledger-card">
                <div className="fc-card-head-row">
                  <div>
                    <h3>Official Voucher Register</h3>
                    <p>Audit trail of all claim vouchers processed or awaiting action</p>
                  </div>
                  <span className="fc-ledger-status-tag">
                    <CheckCircle2 size={14} /> Fiscal Year 2026-2027
                  </span>
                </div>

                <div className="fc-table-wrapper">
                  <table className="fc-dashboard-table">
                    <thead>
                      <tr>
                        <th>Claim Ref</th>
                        <th>Claimant & Code</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Current Stage</th>
                        <th>Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {claims.map((claim) => (
                        <tr key={idOf(claim)}>
                          <td>
                            <span className="fc-mono-code">{idOf(claim).slice(-10)}</span>
                          </td>
                          <td>
                            <strong>{employeeName(claim)}</strong>
                            <small>{employeeCode(claim)}</small>
                          </td>
                          <td>
                            <span className="fc-type-pill">
                              {pick(claim.claimType, claim.type, claim.category, "TA Claim")}
                            </span>
                          </td>
                          <td>
                            <strong className="fc-table-amount">{money(claimAmount(claim))}</strong>
                          </td>
                          <td>
                            <span className="fc-stage-pill">
                              {pick(claim.currentStage, "Finance Clerk")}
                            </span>
                          </td>
                          <td>
                            <span className="fc-text-muted">
                              {formatDate(pick(claim.submittedAt, claim.createdAt))}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="fc-inspect-btn"
                              onClick={() => {
                                setSelectedId(idOf(claim));
                                setTab("claim");
                                setError("");
                              }}
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>
                      ))}
                      {claims.length === 0 && (
                        <tr>
                          <td colSpan={7} className="fc-empty-table-cell">
                            <FileText size={28} style={{ color: "#94a3b8", marginBottom: 6 }} />
                            <strong>No records in current register</strong>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          ) : activeSection === "Employee Management" ? (
            <section className="fc-claims-page fc-dept-page">
              <div className="fc-claims-heading">
                <div>
                  <span className="fc-kicker">PERSONNEL ROSTER & FINANCIAL DOSSIER</span>
                  <h2>Employee Directory & Cadre Ledger</h2>
                  <p>Personnel records, departmental designations, and active claim records.</p>
                </div>
                <button
                  type="button"
                  className="fc-refresh"
                  onClick={fetchEmployees}
                  disabled={employeesLoading}
                >
                  <RefreshCw size={16} /> {employeesLoading ? "Refreshing..." : "Refresh Staff"}
                </button>
              </div>

              {/* Roster KPI Summary */}
              <div className="fc-dept-summary-grid">
                <div className="fc-dept-stat-card">
                  <div className="fc-dept-stat-icon blue"><Users size={22} /></div>
                  <div className="fc-dept-stat-info">
                    <small>Total Personnel</small>
                    <strong>{employeesLoading ? "?" : employees.length}</strong>
                  </div>
                </div>
                <div className="fc-dept-stat-card">
                  <div className="fc-dept-stat-icon purple"><Building2 size={22} /></div>
                  <div className="fc-dept-stat-info">
                    <small>Cadres / Designations</small>
                    <strong>
                      {employeesLoading
                        ? "?"
                        : new Set(employees.map((e) => e.designation).filter(Boolean)).size}
                    </strong>
                  </div>
                </div>
                <div className="fc-dept-stat-card">
                  <div className="fc-dept-stat-icon amber"><Wallet size={22} /></div>
                  <div className="fc-dept-stat-info">
                    <small>Departments</small>
                    <strong>
                      {employeesLoading
                        ? "?"
                        : new Set(employees.map((e) => e.department).filter(Boolean)).size || 1}
                    </strong>
                  </div>
                </div>
                <div className="fc-dept-stat-card">
                  <div className="fc-dept-stat-icon green"><ClipboardCheck size={22} /></div>
                  <div className="fc-dept-stat-info">
                    <small>Active Claims</small>
                    <strong>{claims.length}</strong>
                  </div>
                </div>
              </div>

              {/* Filter and Search Bar */}
              <div className="fc-dept-filter-bar">
                <div className="fc-dept-search-box">
                  <Search size={18} />
                  <input
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                    placeholder="Search personnel by name, code, designation or email..."
                  />
                </div>
                <select
                  className="fc-dept-select"
                  value={empDesignationFilter}
                  onChange={(e) => setEmpDesignationFilter(e.target.value)}
                  aria-label="Filter by designation"
                >
                  <option value="ALL">All Designations</option>
                  {Array.from(
                    new Set(employees.map((e) => e.designation).filter(Boolean))
                  ).map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <select
                  className="fc-dept-select"
                  value={empDeptFilter}
                  onChange={(e) => setEmpDeptFilter(e.target.value)}
                  aria-label="Filter by department"
                >
                  <option value="ALL">All Departments</option>
                  {Array.from(
                    new Set(employees.map((e) => e.department).filter(Boolean))
                  ).map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Cards List */}
              {employeesLoading ? (
                <div className="fc-empty">
                  <span className="fc-spinner" />
                  <strong>Loading Employee Directory...</strong>
                </div>
              ) : employeesError ? (
                <div className="fc-empty">
                  <XCircle size={28} style={{ color: "#ef4444" }} />
                  <strong>Failed to load employee records</strong>
                  <span>{employeesError}</span>
                  <button type="button" className="fc-refresh" onClick={fetchEmployees}>Try Again</button>
                </div>
              ) : employees.length === 0 ? (
                <div className="fc-empty">
                  <Users size={32} />
                  <strong>No Employees Found</strong>
                </div>
              ) : (
                <div className="fc-dept-list">
                  {employees
                    .filter((emp) => {
                      const q = empSearch.toLowerCase();
                      const matchesSearch =
                        !q ||
                        emp.name?.toLowerCase().includes(q) ||
                        emp.fullName?.toLowerCase().includes(q) ||
                        emp.employeeCode?.toLowerCase().includes(q) ||
                        emp.email?.toLowerCase().includes(q) ||
                        emp.designation?.toLowerCase().includes(q);
                      const matchesDesig =
                        empDesignationFilter === "ALL" || emp.designation === empDesignationFilter;
                      const matchesDept =
                        empDeptFilter === "ALL" || emp.department === empDeptFilter;
                      return matchesSearch && matchesDesig && matchesDept;
                    })
                    .map((emp) => (
                      <div key={emp._id || emp.employeeCode} className="fc-dept-employee-card">
                        <div className="fc-dept-emp-profile">
                          <span className="fc-person-avatar">
                            {initials(emp.fullName || emp.name)}
                          </span>
                          <div className="fc-dept-emp-info">
                            <strong>{emp.fullName || emp.name}</strong>
                            <small>{emp.employeeCode || emp.empId || "Code N/A"} ? {emp.email || "No email"}</small>
                          </div>
                        </div>

                        <div className="fc-dept-col">
                          <small>Department</small>
                          <strong>{emp.department || "Finance & Accounts"}</strong>
                        </div>

                        <div className="fc-dept-col">
                          <small>Designation</small>
                          <strong>{emp.designation || "Senior Assistant"}</strong>
                        </div>

                        <div className="fc-dept-col money">
                          <small>Basic Pay</small>
                          <strong>{money(emp.basicPay || 0)}</strong>
                        </div>

                        <button
                          type="button"
                          className="fc-dept-action-btn"
                          onClick={() => setSelectedEmployee(emp)}
                        >
                          View Dossier <ChevronRight size={14} />
                        </button>
                      </div>
                    ))}
                </div>
              )}

              {/* Employee Dossier Modal */}
              {selectedEmployee && (
                <div
                  className="fc-modal-overlay"
                  onClick={() => setSelectedEmployee(null)}
                >
                  <div
                    className="fc-modal-box"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="fc-modal-head">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span className="fc-person-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
                          {initials(selectedEmployee.fullName || selectedEmployee.name)}
                        </span>
                        <div>
                          <h3 style={{ margin: 0, fontSize: 18, color: "#fff" }}>
                            {selectedEmployee.fullName || selectedEmployee.name}
                          </h3>
                          <small style={{ color: "#94a3b8" }}>
                            {selectedEmployee.employeeCode} ? {selectedEmployee.designation}
                          </small>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedEmployee(null)}
                        style={{ background: "none", border: "none", color: "#94a3b8", cursor: "pointer" }}
                        aria-label="Close"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                      <DetailField label="Employee Code" value={selectedEmployee.employeeCode || selectedEmployee.empId} />
                      <DetailField label="Department" value={selectedEmployee.department || "General"} />
                      <DetailField label="Designation" value={selectedEmployee.designation || "Not Specified"} />
                      <DetailField label="Official Email" value={selectedEmployee.email || "N/A"} />
                      <DetailField label="Phone / Contact" value={selectedEmployee.phone || selectedEmployee.mobile || "N/A"} />
                      <DetailField label="Basic Pay" value={money(selectedEmployee.basicPay || 0)} />
                      <DetailField label="Pay Level / Cadre" value={selectedEmployee.payLevel || selectedEmployee.cadre || "Standard Cadre"} />
                      <DetailField label="Bank Account" value={selectedEmployee.bankAccountNumber ? `???? ${String(selectedEmployee.bankAccountNumber).slice(-4)}` : "Verified in PFMS"} />
                    </div>

                    <div className="fc-modal-foot">
                      <span style={{ fontSize: 13, color: "#64748b" }}>Finance Clerk Personnel Record</span>
                      <button
                        type="button"
                        className="fc-refresh"
                        onClick={() => setSelectedEmployee(null)}
                        style={{ padding: "6px 16px" }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          ) : activeSection === "Document Management" ? (
            <section className="fc-claims-page">
              <div className="fc-claims-heading">
                <div>
                  <span className="fc-kicker">VOUCHERS & ATTACHMENTS</span>
                  <h2>Supporting Document Management</h2>
                  <p>Repository of tickets, journey vouchers, sanction orders, and receipts attached to claims.</p>
                </div>
                <button
                  type="button"
                  className="fc-refresh"
                  onClick={fetchClaims}
                  disabled={loading}
                >
                  <RefreshCw size={16} /> Refresh Repository
                </button>
              </div>

              <div className="fc-table-wrapper">
                <table className="fc-dashboard-table">
                  <thead>
                    <tr>
                      <th>Claim Reference</th>
                      <th>Claimant</th>
                      <th>Total Documents</th>
                      <th>Claim Amount</th>
                      <th>Status</th>
                      <th>Inspection Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claims.map((claim) => {
                      const docs = documentsOf(claim);
                      return (
                        <tr key={idOf(claim)}>
                          <td><strong>{idOf(claim).slice(-10)}</strong></td>
                          <td>
                            <strong>{employeeName(claim)}</strong>
                            <small>{employeeCode(claim)}</small>
                          </td>
                          <td>
                            <span className="fc-type-pill">
                              <FolderOpen size={13} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                              {docs.length} Attached {docs.length === 1 ? "file" : "files"}
                            </span>
                          </td>
                          <td>
                            <strong className="fc-table-amount">{money(claimAmount(claim))}</strong>
                          </td>
                          <td>
                            <span className="fc-status-pill pending">
                              {statusOf(claim).replaceAll("_", " ")}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="fc-inspect-btn"
                              onClick={() => {
                                setSelectedId(idOf(claim));
                                setTab("documents");
                                setError("");
                              }}
                            >
                              View Vouchers
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {claims.length === 0 && (
                      <tr>
                        <td colSpan={6} className="fc-empty-table-cell">
                          <FolderOpen size={28} style={{ color: "#94a3b8", marginBottom: 6 }} />
                          <strong>No documents found in repository</strong>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          ) : (
            <section className="fc-other-section">
              <div className="fc-summary-icon">
                <Settings size={25} />
              </div>
              <h2>{activeSection}</h2>
              <p>
                Finance Clerk workspace configuration and profile settings. Manage your desk preferences,
                bill notification templates, and verification presets.
              </p>
              <button
                type="button"
                className="fc-refresh"
                onClick={() => openSection("Dashboard")}
              >
                Return to Dashboard <ChevronRight size={16} />
              </button>
            </section>
          )}

          <footer className="fc-footer">
            <span>Government Finance Management System</span>
            <span>Finance Clerk Workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
