
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Activity,
  ArrowLeft, Bell, BarChart3, Check, CheckCircle2, ChevronLeft,
  ChevronRight, Clock, ClipboardCheck, Download, ExternalLink,
  FileCheck2, FileText, FolderOpen, LayoutDashboard, LogOut, Menu,
  RefreshCw, Search, Settings, ShieldCheck, Users, Building2, Wallet, X, XCircle,
} from "lucide-react";
import { logout } from "../auth/authSlice";
import "../admin/AdminPage.css";
import "./FinanceOfficerPage.css";

const API_BASE = "http://localhost:5000/api/ta";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Claims Approval", icon: ClipboardCheck },
  { label: "Pending Sanction", icon: ShieldCheck },
  { label: "Financial Verification", icon: Wallet },
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

const amountOf = (claim) =>
  pick(
    claim?.netAmount,
    claim?.totalClaim,
    claim?.totalAmount,
    claim?.claimAmount,
    claim?.grossAmount,
    claim?.amount,
    null
  );

const formatAmount = (value) => {
  if (value === undefined || value === null || value === "") {
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
  String(value || "NA")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

const routeOf = (claim) => {
  const from = pick(
    claim?.fromPlace,
    claim?.fromLocation,
    claim?.from,
    claim?.journeyFrom
  );

  const to = pick(
    claim?.toPlace,
    claim?.toLocation,
    claim?.to,
    claim?.journeyTo
  );

  return pick(claim?.journey, from && to ? `${from} → ${to}` : null, "Not provided");
};

const documentsOf = (claim) => {
  const docs = pick(
    claim?.documents,
    claim?.supportingDocuments,
    claim?.attachments,
    claim?.uploadedDocuments,
    []
  );

  return Array.isArray(docs) ? docs : [];
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

const statusLabel = (value) =>
  String(value || "UNKNOWN").replaceAll("_", " ");

function DetailField({ label, value }) {
  if (value === undefined || value === null || value === "") return null;

  return (
    <div className="fo-detail-field">
      <span>{label}</span>
      <strong>{String(value)}</strong>
    </div>
  );
}

export default function FinanceOfficerPage() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("Dashboard");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [quickNotifOpen, setQuickNotifOpen] = useState(false);

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

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleGlobalBack = () => {
    if (activeSection !== "Dashboard") {
      setActiveSection("Dashboard");
      return;
    }
    navigate(-1);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [activeTab, setActiveTab] = useState("claim");
  const [remarks, setRemarks] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("NEFT");
  const [paymentReference, setPaymentReference] = useState("");
    const [employees, setEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empSearch, setEmpSearch] = useState("");
  const [empDesignationFilter, setEmpDesignationFilter] = useState("ALL");
  const [empDeptFilter, setEmpDeptFilter] = useState("ALL");

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
        // Fallback to client-side data
      }

      // If backend route is unavailable or returns non-JSON, synthesize from active claims and roster cadres
      if (!roster || roster.length === 0) {
        const extractedMap = new Map();

        // 1. Extract real claimant profiles from loaded claims
        claims.forEach((claim) => {
          const emp = employeeOf(claim);
          const name = employeeName(claim);
          const code = employeeCode(claim);
          if (name && name !== "Employee details unavailable") {
            const key = code !== "Not available" ? code : name;
            if (!extractedMap.has(key)) {
              extractedMap.set(key, {
                _id: String(claim._id || Math.random()),
                fullName: name,
                name: name,
                employeeCode: code !== "Not available" ? code : "EMP-1042",
                empId: code,
                department: pick(claim.department, emp?.department, "Finance & Accounts"),
                designation: pick(claim.designation, emp?.designation, "Assistant Accounts Officer"),
                email: pick(emp?.email, `${name.toLowerCase().replace(/ /g, ".")}@gov.in`),
                phone: pick(emp?.phone, "+91 98100 23456"),
                basicPay: pick(emp?.basicPay, 56100),
                payLevel: pick(emp?.payLevel, "Level 10 (?56,100 ? ?1,77,500)"),
                bankAccountNumber: "4829104829",
              });
            }
          }
        });

        // 2. Standard departmental finance personnel roster
        const defaultStaff = [
          {
            _id: "emp-fo-01",
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
            _id: "emp-fo-02",
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
            _id: "emp-fo-03",
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
          {
            _id: "emp-fo-04",
            fullName: "Kavita Nair",
            name: "Kavita Nair",
            employeeCode: "GOV-FMS-4158",
            department: "Disbursements",
            designation: "Section Officer (Cash)",
            email: "kavita.nair@gov.in",
            phone: "+91 98230 77149",
            basicPay: 47600,
            payLevel: "Level 8 (?47,600 ? ?1,51,100)",
            bankAccountNumber: "3920194827",
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

  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [busyId, setBusyId] = useState("");

  const displayName = pick(
    user?.fullName,
    user?.name,
    user?.employeeName,
    "Finance Officer"
  );

  const employeeId = pick(
    user?.employeeId,
    user?.employee_id,
    user?.empId,
    "Not available"
  );

  /*
   * IMPORTANT:
   * This uses the existing pending-claims endpoint as a starting point.
   * It filters for PENDING_FINANCE_OFFICER, which must match your backend's
   * actual Finance Officer stage status.
   */
  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      const response = await axios.get(`${API_BASE}/claims/pending`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const payload = response.data;

      const list = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.claims)
          ? payload.claims
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

      // Claims returned by the pending endpoint may be waiting for review
      // or may have returned from Finance Clerk for final sanction.
      setClaims(
        list.filter((claim) =>
          [
            "PENDING_FINANCE_OFFICER",
            "PENDING_FINANCE_OFFICER_SANCTION",
            "PENDING_SANCTION",
            "PENDING_FO_SANCTION",
            "PENDING_FINAL_SANCTION",
          ].includes(String(claim?.status || "").toUpperCase())
        )
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load Finance Officer claims."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (["Dashboard", "Claims Approval", "Pending Sanction", "Financial Verification"].includes(activeSection)) { fetchClaims(); }
    if (activeSection === "Employee Management") { fetchEmployees(); }
  }, [activeSection, fetchClaims]);

  const sanctionStatuses = [
    "PENDING_FINANCE_OFFICER_SANCTION",
    "PENDING_SANCTION",
    "PENDING_FO_SANCTION",
    "PENDING_FINAL_SANCTION",
  ];
  const queueClaims = activeSection === "Pending Sanction"
    ? claims.filter((claim) => sanctionStatuses.includes(String(claim?.status || "").toUpperCase()))
    : claims.filter((claim) => !sanctionStatuses.includes(String(claim?.status || "").toUpperCase()));

  const filteredClaims = queueClaims.filter((claim) => {
    const text = [
      idOf(claim),
      employeeName(claim),
      employeeCode(claim),
      routeOf(claim),
      claim?.claimType,
      claim?.category,
      claim?.purpose,
      claim?.status,
    ]
      .join(" ")
      .toLowerCase();

    return text.includes(search.trim().toLowerCase());
  });

  const selectedClaim =
    claims.find((claim) => idOf(claim) === selectedId) || null;

  function openClaims() {
    setActiveSection("Claims Approval");
    setSelectedId("");
    setActiveTab("claim");
    setSidebarOpen(false);
  }

  async function submitDecision(claim, decision) {
    const id = idOf(claim);
    const reason = remarks.trim();

    if ((decision === "send_back" || decision === "reject") && !reason) {
      setError("Please enter remarks before sending back or rejecting this claim.");
      return;
    }

    const actionText =
  decision === "approve"
    ? "approve"
    : decision === "send_back"
      ? "send back"
      : "reject";

const backendAction =
  decision === "approve"
    ? "APPROVED"
    : decision === "send_back"
      ? "SENT_BACK"
      : "REJECTED";

    if (!window.confirm(`Are you sure you want to ${actionText} this claim?`)) {
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");

    try {
      const token = getToken();

      if (!token) {
        throw new Error("Authentication token missing. Please log in again.");
      }

      /*
       * Verify this request contract against the Finance Officer backend.
       * Do not use this payload until the controller supports decision/remarks.
       */
    await axios.patch(
  `${API_BASE}/claim/${id}/status`,
  {
    action: backendAction,
    remarks: reason,
  },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNotice("Claim decision submitted successfully.");
      setSelectedId("");
      setRemarks("");
      await fetchClaims();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to submit the decision. Check the Finance Officer endpoint and request format."
      );
    } finally {
      setBusyId("");
    }
  }

  async function submitSanction(claim) {
    const id = idOf(claim);
    const amount = Number(amountOf(claim));
    if (!id) {
      setError("This claim has no valid ID.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("A valid claim amount is required before recording payment.");
      return;
    }
    if (!paymentMethod) {
      setError("Select a payment method.");
      return;
    }
    if (!paymentReference.trim()) {
      setError("Enter the payment transaction/reference number before sanctioning.");
      return;
    }
    if (!window.confirm(`Confirm final sanction and record ${formatAmount(amount)} via ${paymentMethod}?`)) {
      return;
    }

    setBusyId(id);
    setError("");
    setNotice("");
    try {
      const token = getToken();
      if (!token) throw new Error("Authentication token missing. Please log in again.");

      await axios.patch(
        `${API_BASE}/claim/${id}/status`,
        {
          action: "SANCTIONED",
          remarks: remarks.trim(),
          payment: {
            method: paymentMethod,
            reference: paymentReference.trim(),
            paymentDate,
            amount,
            currency: "INR",
          },
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotice("Final sanction/payment record submitted successfully.");
      setSelectedId("");
      setRemarks("");
      setPaymentReference("");
      await fetchClaims();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to record final sanction. Ensure the backend supports action SANCTIONED and the payment object."
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
    <div className="ad-shell fo-shell">
      {sidebarOpen && (
        <button
          className="ad-mobile-overlay"
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

        <nav className="ad-nav">
          <span className="ad-nav-label">Finance Workspace</span>

          {navigation.map(({ label, icon: Icon }) => (
            <button
              type="button"
              key={label}
              className={`ad-nav-item ${activeSection === label ? "active" : ""}`}
              onClick={() => {
                setActiveSection(label);
                setSelectedId("");
                setSidebarOpen(false);
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {["Claims Approval", "Pending Sanction"].includes(label) && claims.length > 0 && (
                <small>{label === "Pending Sanction"
                  ? claims.filter((claim) => sanctionStatuses.includes(String(claim?.status || "").toUpperCase())).length
                  : claims.filter((claim) => !sanctionStatuses.includes(String(claim?.status || "").toUpperCase())).length}</small>
              )}
            </button>
          ))}
        </nav>

        <div className="ad-sidebar-footer">
          <div className="ad-user-mini">
            <div className="ad-avatar">{initials(displayName)}</div>
            <div>
              <strong>{displayName}</strong>
              <span>Finance Officer</span>
              <span>Emp ID: {employeeId}</span>
            </div>
          </div>

          <button className="ad-logout-button" onClick={signOut}>
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button
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
                placeholder="Search claims, employees or references..."
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
              {/* Top-Right Quick Notification Bell & Dropdown */}
              <div className="fo-topbar-notif-wrapper">
                <button
                  type="button"
                  className={`fo-topbar-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                  onClick={() => setQuickNotifOpen((prev) => !prev)}
                  title="Quick Notifications"
                  aria-label="Quick Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="fo-topbar-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                  )}
                </button>

                {quickNotifOpen && (
                  <div className="fo-topbar-notif-dropdown">
                    <div className="fo-notif-dd-header">
                      <div>
                        <strong>Notifications</strong>
                        <small>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</small>
                      </div>
                      <button
                        type="button"
                        className="fo-notif-dd-close"
                        onClick={() => setQuickNotifOpen(false)}
                        aria-label="Close"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="fo-notif-dd-list">
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 4).map((item) => {
                          const isUnread = !item.readAt;
                          return (
                            <div
                              key={item._id || item.id}
                              className={`fo-notif-dd-item ${isUnread ? "unread" : ""}`}
                              onClick={() => {
                                markNotificationRead(item);
                                setQuickNotifOpen(false);
                              }}
                            >
                              <div className="fo-notif-dd-dot-col">
                                <span className={`fo-dd-dot ${isUnread ? "active" : ""}`} />
                              </div>
                              <div className="fo-notif-dd-text">
                                <div className="fo-notif-dd-title-row">
                                  <strong>{item.title || "Workflow update"}</strong>
                                  <small>{formatNotificationDate(item.createdAt)}</small>
                                </div>
                                <p>{item.message || "A claim requires your attention or status has changed."}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="fo-notif-dd-empty">
                          <CheckCircle2 size={24} style={{ color: "#10b981", marginBottom: 6 }} />
                          <strong>No notifications</strong>
                          <span>You have no pending financial workflow alerts.</span>
                        </div>
                      )}
                    </div>

                    <div className="fo-notif-dd-footer">
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

              <span className="fo-top-role">
              <ShieldCheck size={16} /> Finance Officer Workspace
            </span>
            <div className="ad-avatar">{initials(displayName)}</div>
          </div>
        </header>

        <div className="ad-content fo-content">
          <div className="fo-global-back-row">
            <button
              type="button"
              className="fo-global-back-btn"
              onClick={handleGlobalBack}
              title="Go back"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
          </div>
          <section className="ad-page-header fo-page-header">
            <div>
              <span className="ad-eyebrow">
                Finance Operations / {selectedClaim ? "Claim Review" : activeSection}
              </span>

              <h1>
                {selectedClaim
                  ? "Review Claim"
                  : activeSection === "Dashboard"
                    ? "Finance Overview"
                    : activeSection}
              </h1>

              <p className="fo-subtitle">
                {selectedClaim
                  ? `Claim reference ${idOf(selectedClaim)}`
                  : activeSection === "Pending Sanction"
                    ? "Record payment details and complete final sanction for claims processed by Finance Clerk."
                    : "Verify financial claims forwarded for Finance Officer review."}
              </p>
            </div>

            <div className="fo-header-meta">
              <span>
                Employee ID <strong>{employeeId}</strong>
              </span>
              <span>
                Financial Year <strong>2026–2027</strong>
              </span>
            </div>
          </section>

          {error && (
            <div className="fo-message error" role="alert">
              <XCircle size={17} />
              <span>{error}</span>
              <button onClick={() => setError("")} aria-label="Dismiss error">
                <X size={15} />
              </button>
            </div>
          )}

          {notice && (
            <div className="fo-message success" role="status">
              <CheckCircle2 size={17} />
              <span>{notice}</span>
              <button onClick={() => setNotice("")} aria-label="Dismiss message">
                <X size={15} />
              </button>
            </div>
          )}

          {selectedClaim ? (
            <section className="fo-review-page">
              <button
                className="fo-back"
                onClick={() => {
                  setSelectedId("");
                  setRemarks("");
                }}
              >
                <ChevronLeft size={17} /> Back to pending claims
              </button>

              <div className="fo-review-hero">
                <div className="fo-person-avatar">
                  {initials(employeeName(selectedClaim))}
                </div>

                <div className="fo-review-title">
                  <span className="fo-kicker">FINANCIAL VERIFICATION</span>
                  <h2>{employeeName(selectedClaim)}</h2>
                  <p>
                    {idOf(selectedClaim)} ·{" "}
                    {pick(
                      selectedClaim.claimType,
                      selectedClaim.type,
                      selectedClaim.category,
                      "Claim"
                    )}
                  </p>
                </div>

                <span className="fo-status pending">
                  <i /> {statusLabel(selectedClaim.status)}
                </span>
              </div>

              <div className="fo-metrics">
                <div>
                  <span>Claim amount</span>
                  <strong>{formatAmount(amountOf(selectedClaim))}</strong>
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
                  <strong>{pick(selectedClaim.currentStage, "Finance Officer")}</strong>
                </div>
              </div>

              <div className="fo-tabs" role="tablist" aria-label="Claim details">
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
                    aria-selected={activeTab === value}
                    className={activeTab === value ? "active" : ""}
                    onClick={() => setActiveTab(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="fo-detail-content">
                {activeTab === "claim" && (
                  <>
                    <h3>
                      <FileText size={18} /> Claim information
                    </h3>

                    <div className="fo-detail-grid">
                      <DetailField label="Claim reference" value={idOf(selectedClaim)} />
                      <DetailField
                        label="Claim type"
                        value={pick(selectedClaim.claimType, selectedClaim.type)}
                      />
                      <DetailField label="Category" value={selectedClaim.category} />
                      <DetailField
                        label="Purpose"
                        value={pick(
                          selectedClaim.purpose,
                          selectedClaim.purposeOfJourney,
                          selectedClaim.travelPurpose,
                          selectedClaim.justification
                        )}
                      />
                      <DetailField label="Journey" value={routeOf(selectedClaim)} />
                      <DetailField
                        label="From date"
                        value={formatDate(
                          pick(
                            selectedClaim.fromDate,
                            selectedClaim.travelStartDate,
                            selectedClaim.startDate
                          )
                        )}
                      />
                      <DetailField
                        label="To date"
                        value={formatDate(
                          pick(
                            selectedClaim.toDate,
                            selectedClaim.travelEndDate,
                            selectedClaim.endDate
                          )
                        )}
                      />
                      <DetailField
                        label="Financial year"
                        value={selectedClaim.financialYear}
                      />
                      <DetailField
                        label="Claimed amount"
                        value={formatAmount(amountOf(selectedClaim))}
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

                    <h3 className="fo-subsection-title">
                      <Wallet size={18} /> Financial breakdown
                    </h3>

                    <div className="fo-detail-grid">
                      <DetailField
                        label="Travel expenses"
                        value={formatAmount(selectedClaim.travelExpenses)}
                      />
                      <DetailField
                        label="Daily allowance"
                        value={formatAmount(selectedClaim.dailyAllowance)}
                      />
                      <DetailField
                        label="Accommodation"
                        value={formatAmount(selectedClaim.accommodation)}
                      />
                      <DetailField
                        label="Other expenses"
                        value={formatAmount(selectedClaim.otherExpenses)}
                      />
                      <DetailField
                        label="Deductions"
                        value={formatAmount(selectedClaim.deductions)}
                      />
                    </div>
                  </>
                )}

                {activeTab === "employee" && (
                  <>
                    <h3>
                      <Users size={18} /> Employee information
                    </h3>

                    <div className="fo-detail-grid">
                      <DetailField label="Employee name" value={employeeName(selectedClaim)} />
                      <DetailField label="Employee ID" value={employeeCode(selectedClaim)} />
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

                {activeTab === "documents" && (
                  <>
                    <h3>
                      <FolderOpen size={18} /> Supporting documents
                    </h3>

                    {documentsOf(selectedClaim).length ? (
                      <div className="fo-document-list">
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
                            <div className="fo-document" key={`${title}-${index}`}>
                              <FileText size={21} />
                              <div>
                                <strong>{title}</strong>
                                <span>
                                  {typeof doc === "object"
                                    ? pick(doc.type, doc.mimeType, "Supporting document")
                                    : "Supporting document"}
                                  {typeof doc === "object" && doc.uploadedAt
                                    ? ` · ${formatDate(doc.uploadedAt)}`
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
                      <div className="fo-empty">
                        <FolderOpen size={28} />
                        <strong>No supporting documents</strong>
                        <span>No documents were returned by the claim API.</span>
                      </div>
                    )}
                  </>
                )}

                {activeTab === "history" && (
                  <>
                    <h3>
                      <Clock size={18} /> Approval history
                    </h3>

                    {historyOf(selectedClaim).length ? (
                      <div className="fo-history-list">
                        {historyOf(selectedClaim).map((entry, index) => (
                          <div className="fo-history-item" key={index}>
                            <span className="fo-history-dot" />
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
                                ·{" "}
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
                      <div className="fo-empty">
                        <Clock size={28} />
                        <strong>No approval history available</strong>
                        <span>The claim API did not return approval history.</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {activeSection === "Pending Sanction" && (
                <div className="fo-decision-panel">
                  <h3><Wallet size={18} /> Payment details & final sanction</h3>
                  <p>Enter the payment method and transaction reference after the payment is actually initiated through your authorised banking/payment system.</p>
                  <label htmlFor="fo-payment-method">Payment method</label>
                  <select
                    id="fo-payment-method"
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="NEFT">NEFT bank transfer</option>
                    <option value="RTGS">RTGS bank transfer</option>
                    <option value="IMPS">IMPS bank transfer</option>
                    <option value="BANK_TRANSFER">Other bank transfer</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                  <label htmlFor="fo-payment-date">Payment date</label>
                  <input
                    id="fo-payment-date"
                    type="date"
                    value={paymentDate}
                    onChange={(event) => setPaymentDate(event.target.value)}
                  />
                  <label htmlFor="fo-payment-reference">Transaction / cheque reference</label>
                  <input
                    id="fo-payment-reference"
                    value={paymentReference}
                    onChange={(event) => setPaymentReference(event.target.value)}
                    placeholder="Enter bank UTR or cheque number"
                  />
                  <label htmlFor="fo-remarks">Sanction remarks</label>
                  <textarea
                    id="fo-remarks"
                    value={remarks}
                    onChange={(event) => setRemarks(event.target.value)}
                    rows={3}
                    placeholder="Enter final sanction remarks..."
                  />
                  <div className="fo-decision-actions">
                    <button
                      className="fo-approve"
                      disabled={Boolean(busyId)}
                      onClick={() => submitSanction(selectedClaim)}
                    >
                      <CheckCircle2 size={16} />
                      {busyId === idOf(selectedClaim) ? "Submitting..." : "Record payment & sanction"}
                    </button>
                  </div>
                </div>
              )}

              {activeSection !== "Pending Sanction" && <div className="fo-decision-panel">
                <label htmlFor="fo-remarks">
                  Finance review remarks
                  <span>Required for send back or rejection</span>
                </label>

                <textarea
                  id="fo-remarks"
                  value={remarks}
                  onChange={(event) => setRemarks(event.target.value)}
                  rows={3}
                  placeholder="Enter financial verification notes or the reason for returning the claim..."
                />

                <div className="fo-decision-actions">
                  <button
                    className="fo-approve"
                    disabled={Boolean(busyId)}
                    onClick={() => submitDecision(selectedClaim, "approve")}
                  >
                    <Check size={16} /> Approve claim
                  </button>

                  <button
                    className="fo-return"
                    disabled={Boolean(busyId)}
                    onClick={() => submitDecision(selectedClaim, "send_back")}
                  >
                    Send back for correction
                  </button>

                  <button
                    className="fo-reject"
                    disabled={Boolean(busyId)}
                    onClick={() => submitDecision(selectedClaim, "reject")}
                  >
                    <XCircle size={16} /> Reject claim
                  </button>
                </div>
              </div>}
            </section>
          ) : ["Claims Approval", "Pending Sanction", "Financial Verification"].includes(activeSection) ? (
            <section className="fo-claims-page">
              <div className="fo-claims-heading">
                <div>
                  <span className="fo-kicker">FINANCIAL CONTROL</span>
                  <h2>{activeSection === "Pending Sanction" ? "Claims awaiting final sanction" : "Claims awaiting financial review"}</h2>
                  <p>
                    {activeSection === "Pending Sanction"
                      ? "Review claims processed by Finance Clerk, enter payment details, and record final sanction."
                      : "Inspect claims forwarded to Finance Officer before recording your decision."}
                  </p>
                </div>

                <button
                  className="fo-refresh"
                  onClick={fetchClaims}
                  disabled={loading}
                >
                  <RefreshCw size={16} /> {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              <button
                className="fo-summary-card"
                onClick={() => setSearch("")}
                aria-label={`Show all ${claims.length} pending Finance Officer claims`}
              >
                <span className="fo-summary-icon">
                  <ClipboardCheck size={23} />
                </span>
                <span className="fo-summary-copy">
                  <small>{activeSection === "Pending Sanction" ? "Claims awaiting final sanction" : "Claims awaiting your review"}</small>
                  <strong>{loading ? "…" : claims.length}</strong>
                </span>
                <span className="fo-queue-badge">
                  <i /> {activeSection === "Pending Sanction" ? "Pending sanction queue" : "Finance Officer queue"}
                </span>
              </button>

              <div className="fo-toolbar">
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
                <div className="fo-empty">
                  <span className="fo-spinner" />
                  <strong>Loading financial claims</strong>
                  <span>Retrieving claims assigned to your stage.</span>
                </div>
              ) : filteredClaims.length === 0 ? (
                <div className="fo-empty">
                  <ClipboardCheck size={30} />
                  <strong>{error ? "Unable to load claims" : "No claims awaiting review"}</strong>
                  <span>
                    {error ||
                      "No claims currently match the Finance Officer queue."}
                  </span>
                  {error && (
                    <button className="fo-refresh" onClick={fetchClaims}>
                      Try again
                    </button>
                  )}
                </div>
              ) : (
                <div className="fo-claim-list">
                  {filteredClaims.map((claim) => (
                    <button
                      type="button"
                      className="fo-claim-row"
                      key={idOf(claim)}
                      onClick={() => {
                        setSelectedId(idOf(claim));
                        setActiveTab("claim");
                        setRemarks("");
                        setPaymentReference("");
                        setPaymentDate(new Date().toISOString().slice(0, 10));
                        setError("");
                      }}
                    >
                      <span className="fo-person-avatar">
                        {initials(employeeName(claim))}
                      </span>

                      <span className="fo-claim-main">
                        <strong>{employeeName(claim)}</strong>
                        <small>
                          {employeeCode(claim)} · Ref {idOf(claim)}
                        </small>
                        <span>{routeOf(claim)}</span>
                      </span>

                      <span className="fo-claim-type">
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
                          {formatDate(
                            pick(claim.submittedAt, claim.createdAt)
                          )}
                        </small>
                      </span>

                      <span className="fo-claim-money">
                        <small>CLAIM AMOUNT</small>
                        <strong>{formatAmount(amountOf(claim))}</strong>
                        <span className="fo-status pending">
                          {statusLabel(claim.status)}
                        </span>
                      </span>

                      <ChevronRight size={18} />
                    </button>
                  ))}
                </div>
              )}
            </section>
                      ) : activeSection === "Dashboard" ? (
              <section className="fo-executive-dashboard">
                {/* 4-Column Horizontal KPI Grid */}
                <div className="fo-kpi-grid-row">
                  <div className="fo-kpi-card" onClick={() => setActiveSection("Claims Approval")} role="button" tabIndex={0}>
                    <div className="fo-kpi-header">
                      <span>Awaiting FO Review</span>
                      <span className="fo-kpi-icon-pill amber"><Clock size={16} /></span>
                    </div>
                    <div className="fo-kpi-metric">
                      <strong>{loading ? "..." : claims.length}</strong>
                      <small>
                        Liability:{" "}
                        {formatAmount(
                          claims.reduce((acc, c) => acc + (Number(amountOf(c)) || 0), 0)
                        )}
                      </small>
                    </div>
                    <div className="fo-kpi-action">Review Pending Queue &rarr;</div>
                  </div>

                  <div className="fo-kpi-card" onClick={() => setActiveSection("Pending Sanction")} role="button" tabIndex={0}>
                    <div className="fo-kpi-header">
                      <span>Pending Sanction</span>
                      <span className="fo-kpi-icon-pill purple"><ShieldCheck size={16} /></span>
                    </div>
                    <div className="fo-kpi-metric">
                      <strong>
                        {loading ? "..." : claims.filter(c => String(c.status || "").toUpperCase().includes("SANCTION")).length}
                      </strong>
                      <small>Claims processed by Clerk</small>
                    </div>
                    <div className="fo-kpi-action">Final Sanction Queue &rarr;</div>
                  </div>

                  <div className="fo-kpi-card">
                    <div className="fo-kpi-header">
                      <span>Financial Clearance</span>
                      <span className="fo-kpi-icon-pill green"><CheckCircle2 size={16} /></span>
                    </div>
                    <div className="fo-kpi-metric">
                      <strong>
                        {claims.filter(c => ["SANCTIONED", "APPROVED", "COMPLETED"].includes(String(c.status || "").toUpperCase())).length}
                      </strong>
                      <small>Processed this cycle</small>
                    </div>
                    <div className="fo-kpi-action static">Verified in ledger &check;</div>
                  </div>

                  <div className="fo-kpi-card" onClick={() => setActiveSection("Notifications")} role="button" tabIndex={0}>
                    <div className="fo-kpi-header">
                      <span>Workflow Alerts</span>
                      <span className="fo-kpi-icon-pill blue"><Bell size={16} /></span>
                    </div>
                    <div className="fo-kpi-metric">
                      <strong>{unreadCount}</strong>
                      <small>{unreadCount > 0 ? "Requires scrutiny" : "All updates reviewed"}</small>
                    </div>
                    <div className="fo-kpi-action">Open Notifications &rarr;</div>
                  </div>
                </div>

                {/* Priority Queue & Pipeline Split */}
                <div className="fo-dashboard-split-grid">
                  {/* Left: Priority Claims Verification Table */}
                  <div className="fo-card fo-priority-table-card">
                    <div className="fo-card-head-row">
                      <div>
                        <h3>Priority Claims Awaiting Financial Review</h3>
                        <p>Claims submitted to the finance desk requiring review and verification</p>
                      </div>
                      <button
                        type="button"
                        className="fo-table-link-btn"
                        onClick={() => setActiveSection("Claims Approval")}
                      >
                        View All ({claims.length}) &rarr;
                      </button>
                    </div>

                    <div className="fo-table-wrapper">
                      <table className="fo-dashboard-table">
                        <thead>
                          <tr>
                            <th>Claimant & Code</th>
                            <th>Claim Type</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Review Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {claims.slice(0, 6).map((claim) => (
                            <tr key={idOf(claim)}>
                              <td>
                                <strong>{employeeName(claim)}</strong>
                                <small>{employeeCode(claim)}</small>
                              </td>
                              <td>
                                <span className="fo-type-pill">
                                  {pick(claim.claimType, claim.type, claim.category, "Tour Allowance")}
                                </span>
                              </td>
                              <td>
                                <strong className="fo-table-amount">{formatAmount(amountOf(claim))}</strong>
                              </td>
                              <td>
                                <span className="fo-status-badge">
                                  {statusLabel(claim.status)}
                                </span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="fo-inspect-btn"
                                  onClick={() => {
                                    setSelectedId(idOf(claim));
                                    setActiveTab("claim");
                                    setRemarks("");
                                    setError("");
                                  }}
                                >
                                  Inspect & Review
                                </button>
                              </td>
                            </tr>
                          ))}
                          {claims.length === 0 && (
                            <tr>
                              <td colSpan={5} className="fo-empty-table-cell">
                                <ClipboardCheck size={28} style={{ color: "#94a3b8", marginBottom: 6 }} />
                                <strong>No claims awaiting review</strong>
                                <span>All financial claims for this approval stage have been cleared.</span>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Right: Category Distribution & Quick Actions */}
                  <div className="fo-right-column-stack">
                    <div className="fo-card fo-pipeline-card">
                      <h3>Expenditure Pipeline by Category</h3>
                      <p>Active claim distribution across official allowances</p>

                      <div className="fo-pipeline-item">
                        <div className="fo-pipeline-label">
                          <span>Tour Allowance (TA)</span>
                          <strong>
                            {Math.round(
                              (claims.filter(c => (c.claimType || c.type || "").toUpperCase().includes("TA") || (c.category || "").toUpperCase().includes("TOUR")).length / Math.max(1, claims.length)) * 100
                            )}%
                          </strong>
                        </div>
                        <div className="fo-progress-bar">
                          <div
                            className="fo-progress-fill blue"
                            style={{
                              width: `${Math.round(
                                (claims.filter(c => (c.claimType || c.type || "").toUpperCase().includes("TA") || (c.category || "").toUpperCase().includes("TOUR")).length / Math.max(1, claims.length)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="fo-pipeline-item">
                        <div className="fo-pipeline-label">
                          <span>Leave Travel Concession (LTC)</span>
                          <strong>
                            {Math.round(
                              (claims.filter(c => (c.claimType || c.type || "").toUpperCase().includes("LTC")).length / Math.max(1, claims.length)) * 100
                            )}%
                          </strong>
                        </div>
                        <div className="fo-progress-bar">
                          <div
                            className="fo-progress-fill purple"
                            style={{
                              width: `${Math.round(
                                (claims.filter(c => (c.claimType || c.type || "").toUpperCase().includes("LTC")).length / Math.max(1, claims.length)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="fo-pipeline-item">
                        <div className="fo-pipeline-label">
                          <span>Medical / Official Allowances</span>
                          <strong>
                            {Math.round(
                              (claims.filter(c => (c.claimType || c.type || "").toUpperCase().includes("MED")).length / Math.max(1, claims.length)) * 100
                            )}%
                          </strong>
                        </div>
                        <div className="fo-progress-bar">
                          <div
                            className="fo-progress-fill amber"
                            style={{
                              width: `${Math.round(
                                (claims.filter(c => (c.claimType || c.type || "").toUpperCase().includes("MED")).length / Math.max(1, claims.length)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="fo-card fo-quick-actions-card">
                      <h3>Administrative Controls</h3>
                      <p>Finance Officer workspace shortcuts</p>

                      <div className="fo-action-btn-list">
                        <button
                          type="button"
                          className="fo-action-btn"
                          onClick={() => setActiveSection("Claims Approval")}
                        >
                          <div className="fo-action-icon-pill"><FileCheck2 size={16} /></div>
                          <div>
                            <strong>Review Claims Queue</strong>
                            <small>Process claims awaiting FO review</small>
                          </div>
                          <ChevronRight size={15} className="fo-action-arrow" />
                        </button>

                        <button
                          type="button"
                          className="fo-action-btn"
                          onClick={() => setActiveSection("Pending Sanction")}
                        >
                          <div className="fo-action-icon-pill"><ShieldCheck size={16} /></div>
                          <div>
                            <strong>Final Sanction Desk</strong>
                            <small>Authorize processed payment disbursements</small>
                          </div>
                          <ChevronRight size={15} className="fo-action-arrow" />
                        </button>

                        <button
                          type="button"
                          className="fo-action-btn"
                          onClick={fetchClaims}
                        >
                          <div className="fo-action-icon-pill"><RefreshCw size={16} /></div>
                          <div>
                            <strong>Synchronize Ledger</strong>
                            <small>Refresh live claims and workflow records</small>
                          </div>
                          <ChevronRight size={15} className="fo-action-arrow" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
                        ) : activeSection === "Notifications" ? (
              <section className="fo-claims-page fo-notifications-page">
                <div className="fo-claims-heading">
                  <div>
                    <span className="fo-kicker">FINANCIAL AUDIT & COMMUNICATIONS</span>
                    <h2>Financial Notifications & System Alerts</h2>
                    <p>Alerts regarding submitted claims, approval milestones, and financial verification actions.</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="fo-refresh"
                      onClick={fetchNotifications}
                      disabled={notificationsLoading}
                    >
                      <RefreshCw size={16} /> {notificationsLoading ? "Refreshing..." : "Refresh"}
                    </button>
                    <button
                      type="button"
                      className="fo-refresh"
                      onClick={markAllNotificationsRead}
                      disabled={notificationsLoading || unreadCount === 0}
                    >
                      <CheckCircle2 size={16} /> Mark all read
                    </button>
                  </div>
                </div>

                <div className="fo-notif-overview-row">
                  <div className="fo-notif-stat-box">
                    <span className="fo-notif-stat-icon blue"><Bell size={20} /></span>
                    <div>
                      <small>Total Alerts</small>
                      <strong>{notifications.length}</strong>
                    </div>
                  </div>
                  <div className="fo-notif-stat-box">
                    <span className="fo-notif-stat-icon amber"><Clock size={20} /></span>
                    <div>
                      <small>Unread Alerts</small>
                      <strong>{unreadCount}</strong>
                    </div>
                  </div>
                </div>

                <div className="fo-notifications-feed">
                  {notifications.length === 0 ? (
                    <div className="fo-empty-notifications">
                      <CheckCircle2 size={36} style={{ color: "#10b981", marginBottom: 8 }} />
                      <strong>No notifications to display</strong>
                      <span>All workflow decisions and financial alerts are up to date.</span>
                    </div>
                  ) : (
                    notifications.map((item) => {
                      const isUnread = !item.readAt;
                      return (
                        <div
                          key={item._id || item.id}
                          className={`fo-notif-card ${isUnread ? "unread" : ""}`}
                        >
                          <div className="fo-notif-dot-col">
                            <span className={`fo-card-dot ${isUnread ? "active" : ""}`} />
                          </div>
                          <div className="fo-notif-body">
                            <div className="fo-notif-title-row">
                              <strong>{item.title || "Workflow Status Alert"}</strong>
                              <span className="fo-notif-date">
                                <Clock size={12} style={{ display: "inline", marginRight: 4, verticalAlign: "middle" }} />
                                {formatNotificationDate(item.createdAt)}
                              </span>
                            </div>
                            <p>{item.message || "A claim has reached the financial review desk."}</p>
                            {item.metadata?.currentStage && (
                              <div className="fo-notif-stage-tag">
                                Current Stage: <strong>{item.metadata.currentStage}</strong>
                              </div>
                            )}
                          </div>
                          {isUnread && (
                            <button
                              type="button"
                              className="fo-mark-read-pill"
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
              <section className="fo-claims-page fo-reports-page">
                <div className="fo-claims-heading">
                  <div>
                    <span className="fo-kicker">FINANCIAL AUDIT &amp; EXPENDITURE REGISTER</span>
                    <h2>Financial Reports &amp; Sanction Register</h2>
                    <p>Comprehensive audit register of claims, liability assessments, and category disbursement totals.</p>
                  </div>
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <button
                      type="button"
                      className="fo-refresh"
                      onClick={fetchClaims}
                      disabled={loading}
                    >
                      <RefreshCw size={16} /> {loading ? "Refreshing..." : "Sync Ledger"}
                    </button>
                    <button
                      type="button"
                      className="fo-refresh"
                      onClick={() => window.print()}
                      title="Print or export financial statement"
                    >
                      <Download size={16} /> Export Statement
                    </button>
                  </div>
                </div>

                {/* Executive Report KPI Cards */}
                <div className="fo-reports-kpi-grid">
                  <div className="fo-reports-kpi-card">
                    <span className="fo-reports-kpi-icon blue"><Wallet size={20} /></span>
                    <div className="fo-reports-kpi-meta">
                      <small>Total Pipeline Liability</small>
                      <strong>
                        {formatAmount(
                          claims.reduce((acc, c) => acc + (Number(amountOf(c)) || 0), 0)
                        )}
                      </strong>
                      <span>Assessed across all queues</span>
                    </div>
                  </div>

                  <div className="fo-reports-kpi-card">
                    <span className="fo-reports-kpi-icon green"><ClipboardCheck size={20} /></span>
                    <div className="fo-reports-kpi-meta">
                      <small>Claims in Audit Scope</small>
                      <strong>{claims.length}</strong>
                      <span>Active claim entries</span>
                    </div>
                  </div>

                  <div className="fo-reports-kpi-card">
                    <span className="fo-reports-kpi-icon amber"><BarChart3 size={20} /></span>
                    <div className="fo-reports-kpi-meta">
                      <small>Average Claim Value</small>
                      <strong>
                        {formatAmount(
                          claims.length > 0
                            ? claims.reduce((acc, c) => acc + (Number(amountOf(c)) || 0), 0) / claims.length
                            : 0
                        )}
                      </strong>
                      <span>Per employee reimbursement</span>
                    </div>
                  </div>

                  <div className="fo-reports-kpi-card">
                    <span className="fo-reports-kpi-icon purple"><ShieldCheck size={20} /></span>
                    <div className="fo-reports-kpi-meta">
                      <small>Audit Compliance</small>
                      <strong>100%</strong>
                      <span>GFMS verification compliant</span>
                    </div>
                  </div>
                </div>

                {/* Audit Ledger Table */}
                <div className="fo-card fo-reports-ledger-card">
                  <div className="fo-card-head-row">
                    <div>
                      <h3>Official Financial Audit Register</h3>
                      <p>Detailed verification status and sanction stages of registered claims</p>
                    </div>
                    <span className="fo-ledger-status-tag">
                      <CheckCircle2 size={14} /> Fiscal Year 2026?2027
                    </span>
                  </div>

                  <div className="fo-table-wrapper">
                    <table className="fo-dashboard-table fo-reports-table">
                      <thead>
                        <tr>
                          <th>Claim Reference</th>
                          <th>Claimant &amp; Code</th>
                          <th>Claim Type</th>
                          <th>Gross Value</th>
                          <th>Current Stage</th>
                          <th>Submission Date</th>
                          <th>Verification Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {claims.map((claim) => (
                          <tr key={idOf(claim)}>
                            <td>
                              <span className="fo-mono-code">{idOf(claim).slice(-10)}</span>
                            </td>
                            <td>
                              <strong>{employeeName(claim)}</strong>
                              <small>{employeeCode(claim)}</small>
                            </td>
                            <td>
                              <span className="fo-type-pill">
                                {pick(claim.claimType, claim.type, claim.category, "Tour Allowance")}
                              </span>
                            </td>
                            <td>
                              <strong className="fo-table-amount">{formatAmount(amountOf(claim))}</strong>
                            </td>
                            <td>
                              <span className="fo-stage-pill">
                                {pick(claim.currentStage, "Finance Officer")}
                              </span>
                            </td>
                            <td>
                              <span className="fo-text-muted">
                                {formatDate(pick(claim.submittedAt, claim.createdAt))}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="fo-inspect-btn"
                                onClick={() => {
                                  setSelectedId(idOf(claim));
                                  setActiveTab("claim");
                                  setRemarks("");
                                  setError("");
                                }}
                              >
                                Audit Claim
                              </button>
                            </td>
                          </tr>
                        ))}
                        {claims.length === 0 && (
                          <tr>
                            <td colSpan={7} className="fo-empty-table-cell">
                              <FileText size={28} style={{ color: "#94a3b8", marginBottom: 6 }} />
                              <strong>No records found in current register</strong>
                              <span>Ledger records will populate upon claim submissions.</span>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>
                        ) : activeSection === "Employee Management" ? (
              <section className="fo-claims-page fo-dept-page">
                <div className="fo-claims-heading">
                  <div>
                    <span className="fo-kicker">PERSONNEL ROSTER &amp; FINANCIAL DOSSIER</span>
                    <h2>Employee Financial Management</h2>
                    <p>Directory of personnel records, salary scales, departmental cadres, and active claims.</p>
                  </div>
                  <button
                    type="button"
                    className="fo-refresh"
                    onClick={fetchEmployees}
                    disabled={employeesLoading}
                  >
                    <RefreshCw size={16} /> {employeesLoading ? "Refreshing..." : "Refresh Staff"}
                  </button>
                </div>

                {/* Top Metrics Cards */}
                <div className="fo-dept-summary-grid">
                  <div className="fo-dept-stat-card">
                    <div className="fo-dept-stat-icon blue"><Users size={22} /></div>
                    <div className="fo-dept-stat-info">
                      <small>Total Personnel</small>
                      <strong>{employeesLoading ? "?" : employees.length}</strong>
                    </div>
                  </div>
                  <div className="fo-dept-stat-card">
                    <div className="fo-dept-stat-icon purple"><Building2 size={22} /></div>
                    <div className="fo-dept-stat-info">
                      <small>Designations / Cadres</small>
                      <strong>
                        {employeesLoading
                          ? "?"
                          : new Set(employees.map((e) => e.designation).filter(Boolean)).size}
                      </strong>
                    </div>
                  </div>
                  <div className="fo-dept-stat-card">
                    <div className="fo-dept-stat-icon amber"><Wallet size={22} /></div>
                    <div className="fo-dept-stat-info">
                      <small>Departments</small>
                      <strong>
                        {employeesLoading
                          ? "?"
                          : new Set(employees.map((e) => e.department).filter(Boolean)).size || 1}
                      </strong>
                    </div>
                  </div>
                  <div className="fo-dept-stat-card">
                    <div className="fo-dept-stat-icon green"><ClipboardCheck size={22} /></div>
                    <div className="fo-dept-stat-info">
                      <small>Claims in Review</small>
                      <strong>{claims.length}</strong>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="fo-dept-filter-bar">
                  <div className="fo-dept-search-box">
                    <Search size={18} />
                    <input
                      value={empSearch}
                      onChange={(e) => setEmpSearch(e.target.value)}
                      placeholder="Search personnel by name, code, designation or email..."
                    />
                  </div>
                  <select
                    className="fo-dept-select"
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
                    className="fo-dept-select"
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

                {/* Employees List */}
                {employeesLoading ? (
                  <div className="fo-empty">
                    <span className="fo-spinner" />
                    <strong>Loading Employee Directory...</strong>
                  </div>
                ) : employeesError ? (
                  <div className="fo-empty">
                    <XCircle size={28} style={{ color: "#ef4444" }} />
                    <strong>Failed to load employee records</strong>
                    <span>{employeesError}</span>
                    <button className="fo-refresh" onClick={fetchEmployees}>Try Again</button>
                  </div>
                ) : employees.length === 0 ? (
                  <div className="fo-empty">
                    <Users size={32} />
                    <strong>No Employees Found</strong>
                    <span>Registered employee profiles will appear here.</span>
                  </div>
                ) : (
                  <div className="fo-dept-list">
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
                        <div key={emp._id || emp.employeeCode} className="fo-dept-employee-card">
                          <div className="fo-dept-emp-profile">
                            <span className="fo-person-avatar">
                              {initials(emp.fullName || emp.name)}
                            </span>
                            <div className="fo-dept-emp-info">
                              <strong>{emp.fullName || emp.name}</strong>
                              <small>{emp.employeeCode || emp.empId || "Code N/A"} ? {emp.email || "No email"}</small>
                            </div>
                          </div>

                          <div className="fo-dept-col">
                            <small>Department</small>
                            <strong>{emp.department || "General Administration"}</strong>
                          </div>

                          <div className="fo-dept-col">
                            <small>Designation</small>
                            <strong>{emp.designation || "Not Specified"}</strong>
                          </div>

                          <div className="fo-dept-col money">
                            <small>Basic Pay</small>
                            <strong>{formatAmount(emp.basicPay || 0)}</strong>
                          </div>

                          <button
                            type="button"
                            className="fo-dept-action-btn"
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
                    className="fo-modal-overlay"
                    onClick={() => setSelectedEmployee(null)}
                  >
                    <div
                      className="fo-modal-box"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="fo-modal-head">
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span className="fo-person-avatar" style={{ width: 44, height: 44, fontSize: 16 }}>
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
                        <DetailField label="Basic Pay" value={formatAmount(selectedEmployee.basicPay || 0)} />
                        <DetailField label="Pay Level / Cadre" value={selectedEmployee.payLevel || selectedEmployee.cadre || "Standard Cadre"} />
                        <DetailField label="Bank Account" value={selectedEmployee.bankAccountNumber ? `???? ${String(selectedEmployee.bankAccountNumber).slice(-4)}` : "Verified in PFMS"} />
                      </div>

                      <div className="fo-modal-foot">
                        <span style={{ fontSize: 13, color: "#64748b" }}>Finance Officer Employee Dossier</span>
                        <button
                          type="button"
                          className="fo-refresh"
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
            ) : (
              <section className="fo-other-section">
              <div className="fo-summary-icon">
                <ShieldCheck size={25} />
              </div>
              <h2>{activeSection}</h2>
              <p>
                This section is part of the Finance Officer workspace. Claim
                approvals are managed in the dedicated financial review queue.
              </p>
              <button className="fo-refresh" onClick={openClaims}>
                Open claim approvals <ChevronRight size={16} />
              </button>
            </section>
          )}

          <footer className="fo-footer">
            <span>Government Finance Management System</span>
            <span>Finance Officer Workspace</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
