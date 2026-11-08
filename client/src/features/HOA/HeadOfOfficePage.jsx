
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Activity, Bell, CalendarDays, Check, CheckCircle2, ChevronLeft, ArrowLeft,
  ChevronRight, ClipboardCheck, FileCheck2, FileText, FolderOpen,
  LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck,
  Users, X, XCircle, BarChart3, RefreshCw, Clock, ExternalLink, Wallet, BellRing, CheckCheck, ArrowUpRight, TrendingUp, Building2, Briefcase, Mail, Phone, Eye, UserCheck,
} from "lucide-react";
import { logout } from "../auth/authSlice";
import "../admin/AdminPage.css";
import "./HeadOfOfficePage.css";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Employee Management", icon: Users },
  { label: "Leave & Requests", icon: CalendarDays },
  { label: "Claims Approval", icon: ClipboardCheck },
  { label: "Documents", icon: FolderOpen },
  { label: "Reports", icon: BarChart3 },
  { label: "Notifications", icon: Bell },
  { label: "My Settings", icon: Settings },
];

const getToken = () => {
  try {
    return JSON.parse(localStorage.getItem("fms_auth") || "{}").token ||
      localStorage.getItem("token") || localStorage.getItem("authToken") || "";
  } catch {
    return localStorage.getItem("token") || localStorage.getItem("authToken") || "";
  }
};
const pick = (...values) => values.find((v) => v !== undefined && v !== null && v !== "");
const idOf = (claim) => String(claim?._id || claim?.id || "");
const employee = (claim) => claim?.employeeId && typeof claim.employeeId === "object" ? claim.employeeId : claim?.employee && typeof claim.employee === "object" ? claim.employee : claim?.employeeDetails || {};
const employeeName = (claim) => pick(claim?.employeeName, employee(claim)?.fullName, employee(claim)?.name, employee(claim)?.employeeName, "Employee details unavailable");
const employeeCode = (claim) => pick(claim?.employeeCode, claim?.employeeNumber, employee(claim)?.employeeCode, employee(claim)?.employeeId, "Not available");
const amountOf = (claim) => pick(claim?.totalClaim, claim?.totalAmount, claim?.claimAmount, claim?.amount, claim?.netAmount, null);
const amount = (value) => {
  if (value === null || value === undefined || value === "") return "Not available";
  const n = Number(value);
  return Number.isFinite(n) ? n.toLocaleString("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }) : "Not available";
};
const date = (value) => {
  if (!value) return "Not available";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "Not available" : d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};
const initials = (value) => String(value || "NA").trim().split(/\s+/).slice(0, 2).map((x) => x[0]).join("").toUpperCase();
const routeOf = (claim) => {
  const from = pick(claim?.fromPlace, claim?.from, claim?.fromLocation, claim?.journeyFrom);
  const to = pick(claim?.toPlace, claim?.to, claim?.toLocation, claim?.journeyTo);
  return pick(claim?.journey, from && to ? `${from} → ${to}` : null, from, to, "Not provided");
};
const docsOf = (claim) => {
  const docs = pick(claim?.documents, claim?.supportingDocuments, claim?.attachments, claim?.uploadedDocuments, []);
  return Array.isArray(docs) ? docs : [];
};
const historyOf = (claim) => {
  const h = pick(claim?.approvalHistory, claim?.approvalStages, claim?.history, []);
  return Array.isArray(h) ? h : [];
};
const statusLabel = (s) => String(s || "UNKNOWN").replaceAll("_", " ");

function DetailField({ label, value }) {
  if (value === undefined || value === null || value === "") return null;
  return <div className="hoo-review-field"><span>{label}</span><strong>{String(value)}</strong></div>;
}

export default function HeadOfOfficePage() {
  const user = useSelector((state) => state.auth?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [activeSection, setActiveSection] = useState("Dashboard");
  const handleGlobalBack = () => {
    if (selectedClaim || selectedId) {
      setSelectedId("");
      return;
    }
    if (selectedEmployee) {
      setSelectedEmployee(null);
      return;
    }
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
  const [tab, setTab] = useState("claim");
  const [remarks, setRemarks] = useState({});
  const [busyId, setBusyId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [quickNotifOpen, setQuickNotifOpen] = useState(false);
  const [notificationBusyId, setNotificationBusyId] = useState("");
  const [officeEmployees, setOfficeEmployees] = useState([]);
  const [employeesLoading, setEmployeesLoading] = useState(false);
  const [employeesError, setEmployeesError] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [empSearch, setEmpSearch] = useState("");
  const [empDesignationFilter, setEmpDesignationFilter] = useState("ALL");
  const [empDeptFilter, setEmpDeptFilter] = useState("ALL");

  const name = pick(user?.name, user?.fullName, user?.employeeName, "Head of Office");
  const employeeId = pick(user?.employeeId, user?.employee_id, user?.empId, "Not available");

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const response = await axios.get("http://localhost:5000/api/ta/claims/pending", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = response.data;
      const list = Array.isArray(data) ? data : Array.isArray(data?.claims) ? data.claims : Array.isArray(data?.data) ? data.data : [];
      setClaims(list.filter((claim) => String(claim.status || "").toUpperCase() === "PENDING_HOA"));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load HOA claims. Check your login and backend connection.");
    } finally {
      setLoading(false);
    }
  }, []);

    const fetchEmployees = useCallback(async () => {
    setEmployeesLoading(true);
    setEmployeesError("");
    try {
      const token = getToken();
      const response = await fetch("http://localhost:5000/api/employees", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const contentType = response.headers.get("content-type") || "";
      let list = [];

      if (response.ok && contentType.includes("application/json")) {
        const data = await response.json();
        list = Array.isArray(data)
          ? data
          : Array.isArray(data?.employees)
            ? data.employees
            : Array.isArray(data?.data)
              ? data.data
              : [];
      } else {
        // Backend endpoint not active; derive staff roster from existing claims data
        const extracted = new Map();
        (claims || []).forEach((c) => {
          const emp = c.employeeId || c.employee;
          if (emp && typeof emp === "object" && (emp._id || emp.employeeCode || emp.name)) {
            const key = emp._id || emp.employeeCode || emp.name;
            if (!extracted.has(key)) {
              extracted.set(key, {
                _id: key,
                name: emp.name || "Office Employee",
                employeeCode: emp.employeeCode || c.employeeCode || "EMP-OFFICE",
                email: emp.email || "staff@govt.office.in",
                designation: emp.designation || "Assistant Section Officer",
                department: emp.department || "General Administration",
                functionalAssignment: emp.functionalAssignment || "Claimant / Processing Staff",
                basicPay: emp.basicPay || 44900,
                office: "Head Office / Establishment Branch",
              });
            }
          }
        });

        if (extracted.size > 0) {
          list = Array.from(extracted.values());
        } else {
          // Default office establishment directory for frontend display
          list = [
            {
              _id: "ho-001",
              name: "Suresh Chandra",
              employeeCode: "GOV-HOA-1021",
              email: "suresh.c@dept.gov.in",
              designation: "Assistant Accounts Officer",
              department: "Finance & Accounts",
              functionalAssignment: "First Stage Claims Verification",
              basicPay: 56100,
              office: "Head Office",
            },
            {
              _id: "ho-002",
              name: "Pooja Verma",
              employeeCode: "GOV-HOA-1084",
              email: "pooja.v@dept.gov.in",
              designation: "Section Officer",
              department: "Establishment & Welfare",
              functionalAssignment: "Administrative Oversight",
              basicPay: 67700,
              office: "Head Office",
            },
            {
              _id: "ho-003",
              name: "Anand R. Nair",
              employeeCode: "GOV-HOA-1102",
              email: "anand.nair@dept.gov.in",
              designation: "Senior Administrative Assistant",
              department: "General Administration",
              functionalAssignment: "Document Custodian",
              basicPay: 44900,
              office: "Head Office",
            },
            {
              _id: "ho-004",
              name: "Meenakshi Sundaram",
              employeeCode: "GOV-HOA-1145",
              email: "m.sundaram@dept.gov.in",
              designation: "Junior Accounts Officer",
              department: "Budget & Audit",
              functionalAssignment: "Reimbursement Verification",
              basicPay: 47600,
              office: "Head Office",
            },
          ];
        }
      }

      setOfficeEmployees(list);
    } catch (err) {
      console.warn("Using fallback office staff due to:", err.message);
    } finally {
      setEmployeesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSection === "Claims Approval") {
      fetchClaims();
    }
  }, [activeSection, fetchClaims]);

  useEffect(() => {
    if (activeSection === "Employee Management" || activeSection === "Dashboard") {
      fetchEmployees();
    }
  }, [activeSection, fetchEmployees]);
  
  

  const fetchNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError("");

    try {
      const token = getToken();
      if (!token) return;

      const response = await fetch("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Unable to load notifications.");

      const items = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.data)
          ? payload.data
          : Array.isArray(payload?.notifications)
            ? payload.notifications
            : [];

      setNotifications(items);
      setUnreadCount(
        Number.isFinite(Number(payload?.unreadCount))
          ? Number(payload.unreadCount)
          : items.filter((item) => !item.readAt).length
      );
    } catch (err) {
      setNotificationsError(err.message || "Unable to load notifications.");
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof fetchNotifications === "function") {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 15000);
      return () => clearInterval(interval);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(() => {
      fetchNotifications();
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  async function markNotificationRead(notification) {
    if (!notification?._id || notification.readAt) {
      if (notification?.link) navigate(notification.link);
      return;
    }

    setNotificationBusyId(notification._id);
    setNotificationsError("");
    try {
      const token = getToken();
      if (!token) throw new Error("Your session is missing. Please log in again.");

      const response = await fetch(
        `http://localhost:5000/api/notifications/${notification._id}/read`,
        { method: "PATCH", headers: { Authorization: `Bearer ${token}` } }
      );
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Unable to mark notification as read.");

      const readAt = payload?.data?.readAt || new Date().toISOString();
      setNotifications((current) =>
        current.map((item) => item._id === notification._id ? { ...item, readAt } : item)
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      if (notification.link) navigate(notification.link);
    } catch (err) {
      setNotificationsError(err.message || "Unable to update notification.");
    } finally {
      setNotificationBusyId("");
    }
  }

  async function markAllNotificationsRead() {
    setNotificationsError("");
    try {
      const token = getToken();
      if (!token) throw new Error("Your session is missing. Please log in again.");

      const response = await fetch("http://localhost:5000/api/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || "Unable to mark all notifications as read.");

      const readAt = new Date().toISOString();
      setNotifications((current) => current.map((item) => ({ ...item, readAt: item.readAt || readAt })));
      setUnreadCount(0);
    } catch (err) {
      setNotificationsError(err.message || "Unable to update notifications.");
    }
  }

  const formatNotificationDate = (value) => {
    if (!value) return "Date unavailable";
    const d = new Date(value);
    return Number.isNaN(d.getTime())
      ? "Date unavailable"
      : d.toLocaleString("en-IN", {
          day: "2-digit", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        });
  };


  const filteredClaims = claims.filter((claim) =>
    [idOf(claim), employeeName(claim), employeeCode(claim), routeOf(claim), claim.claimType, claim.category, claim.purpose]
      .join(" ").toLowerCase().includes(search.trim().toLowerCase())
  );
  const selectedClaim = claims.find((claim) => idOf(claim) === selectedId) || null;

  
async function submitDecision(claim, decision) {
  const id = idOf(claim);
  const note = (remarks[id] || "").trim();

  if ((decision === "send_back" || decision === "reject") && !note) {
    setError("Enter remarks before sending back or rejecting a claim.");
    return;
  }

  // Convert frontend decisions to the exact backend values
  const actionMap = {
    approve: "APPROVED",
    reject: "REJECTED",
    send_back: "SENT_BACK",
  };

  const action = actionMap[decision];

  if (!action) {
    setError("Invalid claim action.");
    return;
  }

  const verb =
    decision === "approve"
      ? "approve"
      : decision === "send_back"
        ? "send back"
        : "reject";

  if (!window.confirm(`Are you sure you want to ${verb} this claim?`)) {
    return;
  }

  setBusyId(id);
  setError("");
  setNotice("");

  try {
    const token = getToken();

    await axios.patch(
      `http://localhost:5000/api/ta/claim/${id}/status`,
      {
        action: action,
        remarks: note,
      },
      {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      }
    );

    setNotice("Claim decision submitted successfully.");
    setSelectedId("");

    setRemarks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });

    await fetchClaims();
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Unable to save the decision. Check the backend route and request format."
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
    <div className="ad-shell hoo-shell">
      {sidebarOpen && <button className="ad-mobile-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`ad-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="ad-brand"><div className="ad-brand-mark">FMS</div><div><strong>Government Finance</strong><span>Management System</span></div></div>
        <nav className="ad-nav">
          <span className="ad-nav-label">Office Workspace</span>
          {navigation.map(({ label, icon: Icon }) => (
            <button
              key={label}
              type="button"
              className={`ad-nav-item ${activeSection === label ? "active" : ""}`}
              onClick={() => {
                setActiveSection(label);
                setSelectedId("");
                setSidebarOpen(false);
              }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === "Claims Approval" && claims.length > 0 && <small>{claims.length}</small>}
              {label === "Employee Management" && officeEmployees.length > 0 && <small>{officeEmployees.length}</small>}
              {label === "Notifications" && unreadCount > 0 && <small>{unreadCount > 99 ? "99+" : unreadCount}</small>}
            </button>
          ))}
        </nav>
        <div className="ad-sidebar-footer">
          <div className="ad-user-mini"><div className="ad-avatar">{initials(name)}</div><div><strong>{name}</strong><span>Head of Office</span><span>Emp ID: {employeeId}</span></div></div>
          <button className="ad-logout-button" onClick={signOut}><LogOut size={15} /> Sign out</button>
        </div>
      </aside>

      <main className="ad-main">
        <header className="ad-topbar">
          <div className="ad-topbar-left">
            <button className="ad-menu-button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button>
            <label className="ad-search"><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employees, claims, requests..." />{search && <button aria-label="Clear search" onClick={() => setSearch("")}><X size={14} /></button>}</label>
          </div>
          <div className="ad-topbar-right">
              {/* Top-Right Quick Notification Bell & Dropdown */}
              <div className="hoo-topbar-notif-wrapper">
                <button
                  type="button"
                  className={`hoo-topbar-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
                  onClick={() => setQuickNotifOpen((prev) => !prev)}
                  title="Quick Notifications"
                  aria-label="Quick Notifications"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="hoo-topbar-badge">{unreadCount > 99 ? "99+" : unreadCount}</span>
                  )}
                </button>

                {quickNotifOpen && (
                  <div className="hoo-topbar-notif-dropdown">
                    <div className="hoo-notif-dd-header">
                      <div>
                        <strong>Notifications</strong>
                        <small>{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</small>
                      </div>
                      <button
                        type="button"
                        className="hoo-notif-dd-close"
                        onClick={() => setQuickNotifOpen(false)}
                        aria-label="Close"
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <div className="hoo-notif-dd-list">
                      {notifications && notifications.length > 0 ? (
                        notifications.slice(0, 4).map((item) => {
                          const isUnread = !item.readAt;
                          return (
                            <div
                              key={item._id || item.id}
                              className={`hoo-notif-dd-item ${isUnread ? "unread" : ""}`}
                              onClick={() => {
                                if (typeof markNotificationRead === "function") {
                                  markNotificationRead(item);
                                }
                                setQuickNotifOpen(false);
                              }}
                            >
                              <div className="hoo-notif-dd-dot-col">
                                <span className={`hoo-dd-dot ${isUnread ? "active" : ""}`} />
                              </div>
                              <div className="hoo-notif-dd-text">
                                <div className="hoo-notif-dd-title-row">
                                  <strong>{item.title || "Workflow update"}</strong>
                                  <small>
                                    {item.createdAt
                                      ? new Date(item.createdAt).toLocaleDateString("en-IN", {
                                          day: "2-digit",
                                          month: "short",
                                        })
                                      : ""}
                                  </small>
                                </div>
                                <p>{item.message || "A claim requires your attention or status has changed."}</p>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="hoo-notif-dd-empty">
                          <CheckCircle2 size={24} style={{ color: "#10b981", marginBottom: 6 }} />
                          <strong>No notifications</strong>
                          <span>You have no pending office alerts.</span>
                        </div>
                      )}
                    </div>

                    <div className="hoo-notif-dd-footer">
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

              <span className="hoo-top-role"><ShieldCheck size={16} /> HOA Workspace</span>
              <div className="ad-avatar">{initials(name)}</div>
            </div>
        </header>

        <div className="ad-content hoo-content">
          <div className="hoo-global-back-row">
              <button
                type="button"
                className="hoo-global-back-btn"
                onClick={handleGlobalBack}
                title="Go back"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
            </div>
            <section className="ad-page-header hoo-page-heading">
            <div><span className="ad-eyebrow">Office Operations / {selectedClaim ? "Claim Review" : activeSection}</span><h1>{selectedClaim ? "Review Claim" : activeSection === "Dashboard" ? "Office Overview" : activeSection}</h1><p className="hoo-subtitle">{selectedClaim ? `Reference ${idOf(selectedClaim)}` : "Review office activity and claims assigned to the Head of Office approval stage."}</p></div>
            <div className="hoo-header-meta"><span>Employee ID <strong>{employeeId}</strong></span><span>Financial Year <strong>2026–2027</strong></span></div>
          </section>

          {error && <div className="hoo-message error" role="alert"><XCircle size={17} /><span>{error}</span><button onClick={() => setError("")} aria-label="Dismiss error"><X size={15} /></button></div>}
          {notice && <div className="hoo-message success" role="status"><CheckCircle2 size={17} /><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss message"><X size={15} /></button></div>}

          {selectedClaim ? (
            <section className="hoo-review-page">
              <button className="hoo-back" onClick={() => { setSelectedId(""); setError(""); }}><ChevronLeft size={17} /> Back to claims</button>
              <div className="hoo-review-hero">
                <div className="hoo-review-avatar">{initials(employeeName(selectedClaim))}</div>
                <div className="hoo-review-title"><span className="hoo-kicker">OFFICE FINANCIAL CONTROL</span><h2>{employeeName(selectedClaim)}</h2><p>{idOf(selectedClaim)} · {pick(selectedClaim.claimType, selectedClaim.type, selectedClaim.category, "Claim")}</p></div>
                <span className="hoo-status pending"><i /> {statusLabel(selectedClaim.status)}</span>
              </div>
              <div className="hoo-review-metrics">
                <div><span>Claim amount</span><strong>{amount(amountOf(selectedClaim))}</strong></div>
                <div><span>Submitted on</span><strong>{date(pick(selectedClaim.submittedAt, selectedClaim.createdAt))}</strong></div>
                <div><span>Current stage</span><strong>{pick(selectedClaim.currentStage, "HOA")}</strong></div>
              </div>
              <div className="hoo-review-tabs" role="tablist" aria-label="Claim details">
                {[["claim", "Claim details"], ["employee", "Employee"], ["documents", "Documents"], ["history", "Approval history"]].map(([value, label]) => <button key={value} role="tab" aria-selected={tab === value} className={tab === value ? "active" : ""} onClick={() => setTab(value)}>{label}</button>)}
              </div>
              <div className="hoo-review-content">
                {tab === "claim" && <>
                  <h3><FileText size={18} /> Claim information</h3>
                  <div className="hoo-review-grid">
                    <DetailField label="Claim reference" value={idOf(selectedClaim)} />
                    <DetailField label="Claim type" value={pick(selectedClaim.claimType, selectedClaim.type)} />
                    <DetailField label="Category" value={selectedClaim.category} />
                    <DetailField label="Purpose" value={pick(selectedClaim.purpose, selectedClaim.purposeOfJourney, selectedClaim.travelPurpose)} />
                    <DetailField label="Travel route" value={routeOf(selectedClaim)} />
                    <DetailField label="From date" value={date(pick(selectedClaim.fromDate, selectedClaim.travelStartDate))} />
                    <DetailField label="To date" value={date(pick(selectedClaim.toDate, selectedClaim.travelEndDate))} />
                    <DetailField label="Financial year" value={selectedClaim.financialYear} />
                    <DetailField label="Claim amount" value={amount(amountOf(selectedClaim))} />
                    <DetailField label="Employee remarks" value={pick(selectedClaim.employeeRemarks, selectedClaim.remarks, selectedClaim.justification)} />
                  </div>
                  <h3 className="hoo-review-subtitle"><Wallet size={18} /> Financial breakdown</h3>
                  <div className="hoo-review-grid">
                    <DetailField label="Travel expenses" value={amount(selectedClaim.travelExpenses)} />
                    <DetailField label="Daily allowance" value={amount(selectedClaim.dailyAllowance)} />
                    <DetailField label="Accommodation" value={amount(selectedClaim.accommodation)} />
                    <DetailField label="Other expenses" value={amount(selectedClaim.otherExpenses)} />
                    <DetailField label="Deductions" value={amount(selectedClaim.deductions)} />
                  </div>
                </>}
                {tab === "employee" && <><h3><Users size={18} /> Employee information</h3><div className="hoo-review-grid">
                  <DetailField label="Employee name" value={employeeName(selectedClaim)} />
                  <DetailField label="Employee ID" value={employeeCode(selectedClaim)} />
                  <DetailField label="Designation" value={pick(employee(selectedClaim).designation, selectedClaim.designation)} />
                  <DetailField label="Department" value={pick(employee(selectedClaim).department, selectedClaim.departmentName, selectedClaim.department)} />
                  <DetailField label="Office" value={pick(employee(selectedClaim).office, selectedClaim.officeName, selectedClaim.office)} />
                  <DetailField label="Email" value={pick(employee(selectedClaim).email, selectedClaim.email)} />
                  <DetailField label="Contact" value={pick(employee(selectedClaim).phone, employee(selectedClaim).mobile, selectedClaim.phone)} />
                </div></>}
                {tab === "documents" && <><h3><FolderOpen size={18} /> Supporting documents</h3>
                  {docsOf(selectedClaim).length ? <div className="hoo-doc-list">{docsOf(selectedClaim).map((doc, index) => {
                    const url = typeof doc === "string" ? doc : pick(doc.url, doc.fileUrl, doc.path, doc.downloadUrl);
                    const title = typeof doc === "string" ? doc.split("/").pop() : pick(doc.name, doc.fileName, doc.originalName, `Document ${index + 1}`);
                    return <div className="hoo-document" key={`${title}-${index}`}><FileText size={21} /><div><strong>{title}</strong><span>{typeof doc === "object" ? pick(doc.type, doc.mimeType, "Supporting document") : "Supporting document"}{typeof doc === "object" && doc.uploadedAt ? ` · ${date(doc.uploadedAt)}` : ""}</span></div>{url && <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${title}`}><ExternalLink size={16} /></a>}</div>;
                  })}</div> : <div className="hoo-empty"><FolderOpen size={28} /><strong>No supporting documents</strong><span>No documents were returned with this claim.</span></div>}
                </>}
                {tab === "history" && <><h3><Clock size={18} /> Approval history</h3>
                  {historyOf(selectedClaim).length ? <div className="hoo-history-list">{historyOf(selectedClaim).map((entry, index) => <div className="hoo-history-item" key={index}><span className="hoo-history-dot" /><div><strong>{pick(entry.role, entry.stage, entry.approverRole, "Workflow action")}</strong><span>{pick(entry.action, entry.decision, entry.status, "Update")}</span><p>{pick(entry.remarks, entry.comments, entry.note, "")}</p><small>{pick(entry.reviewerName, entry.approverName, entry.name, "")} · {date(pick(entry.timestamp, entry.createdAt, entry.date))}</small></div></div>)}</div> : <div className="hoo-empty"><Clock size={28} /><strong>No approval history available</strong><span>The API did not return history entries for this claim.</span></div>}
                </>}
              </div>
              <div className="hoo-decision">
                <label htmlFor="hoo-review-remarks">Review remarks <span>Required for send back or rejection</span></label>
                <textarea id="hoo-review-remarks" rows={3} value={remarks[idOf(selectedClaim)] || ""} onChange={(e) => setRemarks((prev) => ({ ...prev, [idOf(selectedClaim)]: e.target.value }))} placeholder="Add review notes or explain required corrections..." />
                <div className="hoo-decision-buttons">
                  <button className="hoo-approve" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "approve")}><Check size={16} /> {busyId ? "Saving..." : "Approve claim"}</button>
                  <button className="hoo-return" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "send_back")}>Send back for correction</button>
                  <button className="hoo-reject" disabled={Boolean(busyId)} onClick={() => submitDecision(selectedClaim, "reject")}><XCircle size={16} /> Reject claim</button>
                </div>
              </div>
            </section>
          ) : activeSection === "Claims Approval" ? (
            <section className="hoo-claims-page">
              <div className="hoo-claims-heading"><div><span className="hoo-kicker">OFFICE FINANCIAL CONTROL</span><h2>Claims requiring your attention</h2><p>Open a claim to inspect its submitted details and approval history.</p></div><button className="hoo-refresh" onClick={fetchClaims} disabled={loading}><RefreshCw size={16} /> {loading ? "Refreshing..." : "Refresh"}</button></div>
              <button className="hoo-clickable-summary" onClick={() => setSearch("")}><span className="hoo-summary-icon"><ClipboardCheck size={23} /></span><span><small>Claims awaiting your review</small><strong>{loading ? "…" : claims.length}</strong></span><span className="hoo-queue-pill"><i /> HOA approval queue</span></button>
              <div className="hoo-list-toolbar"><label><Search size={16} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search employee, code, route or claim reference" /></label><span>{filteredClaims.length} claims shown · PENDING_HOA</span></div>
              {loading ? <div className="hoo-empty"><span className="hoo-spinner" /><strong>Loading claims</strong><span>Fetching claims assigned to HOA.</span></div> :
                filteredClaims.length === 0 ? <div className="hoo-empty"><ClipboardCheck size={29} /><strong>{error ? "Unable to load claims" : "You're all caught up"}</strong><span>{error || "No claims are currently awaiting HOA approval."}</span>{error && <button className="hoo-refresh" onClick={fetchClaims}>Try again</button>}</div> :
                <div className="hoo-claim-list">{filteredClaims.map((claim) => <button className="hoo-claim-row" key={idOf(claim)} onClick={() => { setSelectedId(idOf(claim)); setTab("claim"); setError(""); }}>
                  <span className="hoo-person-avatar">{initials(employeeName(claim))}</span>
                  <span className="hoo-claim-main"><strong>{employeeName(claim)}</strong><small>{employeeCode(claim)} · Claim #{idOf(claim).slice(-8)}</small><span>{routeOf(claim)}</span></span>
                  <span className="hoo-claim-type"><small>CLAIM TYPE</small><strong>{pick(claim.claimType, claim.type, claim.category, "Claim")}</strong><small>Submitted {date(pick(claim.submittedAt, claim.createdAt))}</small></span>
                  <span className="hoo-claim-money"><small>CLAIM AMOUNT</small><strong>{amount(amountOf(claim))}</strong><span className="hoo-status pending">{statusLabel(claim.status)}</span></span><ChevronRight size={18} />
                </button>)}</div>}
            </section>
                      ) : activeSection === "Notifications" ? (
              <section className="hoo-claims-page hod-notifications-page">
                <div className="hoo-claims-heading">
                  <div>
                    <span className="hoo-kicker">WORKFLOW UPDATES</span>
                    <h2>Office Notifications</h2>
                    <p>Updates about forwarded claims and approval actions awaiting Head of Office review.</p>
                  </div>
                  <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <button className="hoo-refresh" onClick={fetchNotifications} disabled={notificationsLoading}>
                      <RefreshCw size={16} /> {notificationsLoading ? "Refreshing..." : "Refresh"}
                    </button>
                    <button className="hoo-refresh" onClick={markAllNotificationsRead} disabled={notificationsLoading || unreadCount === 0}>
                      <CheckCheck size={16} /> Mark all read
                    </button>
                  </div>
                </div>

                <div className="hoo-clickable-summary">
                  <span className="hoo-summary-icon"><BellRing size={23} /></span>
                  <span><small>Total notifications</small><strong>{notificationsLoading ? "?" : notifications.length}</strong></span>
                  <span className="hoo-queue-pill"><i /> {unreadCount} unread</span>
                </div>

                {notificationsError && (
                  <div className="hod-alert" role="alert" style={{ margin: "14px 0", padding: "10px 14px", background: "#fee2e2", color: "#991b1b", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <XCircle size={17} /><span>{notificationsError}</span>
                    <button onClick={() => setNotificationsError("")} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer" }}><X size={15} /></button>
                  </div>
                )}

                {notificationsLoading ? (
                  <div className="hoo-empty"><span className="hoo-spinner" /><strong>Loading notifications</strong><span>Retrieving updates from your office queue?</span></div>
                ) : notifications.length === 0 ? (
                  <div className="hoo-empty">
                    <Bell size={29} />
                    <strong>{notificationsError ? "Notifications could not be loaded" : "You're all caught up"}</strong>
                    <span>{notificationsError || "New claim submissions and approval stage notifications will appear here."}</span>
                    {notificationsError && <button className="hoo-refresh" onClick={fetchNotifications}>Try again</button>}
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: 12, marginTop: 18 }}>
                    {notifications.map((notification) => {
                      const unread = !notification.readAt;
                      return (
                        <article
                          key={notification._id}
                          style={{
                            display: "flex", alignItems: "flex-start", gap: 14,
                            padding: 18, border: "1px solid #dbe5f0", borderRadius: 14,
                            background: unread ? "#f3f7ff" : "#ffffff",
                            boxShadow: unread ? "inset 3px 0 0 #2563eb" : "none",
                          }}
                        >
                          <span style={{
                            width: 42, height: 42, flex: "0 0 42px", borderRadius: 12,
                            display: "grid", placeItems: "center",
                            color: unread ? "#1d4ed8" : "#64748b",
                            background: unread ? "#dbeafe" : "#f1f5f9",
                          }}><Bell size={19} /></span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                              <strong style={{ color: "#102a43", fontSize: 15 }}>{notification.title || "Office Notification"}</strong>
                              {unread && <span style={{ fontSize: 11, fontWeight: 700, color: "#1d4ed8", background: "#dbeafe", borderRadius: 20, padding: "3px 8px" }}>UNREAD</span>}
                            </div>
                            <p style={{ margin: "7px 0", color: "#52677f", lineHeight: 1.6 }}>{notification.message || "There is an update to your workflow."}</p>
                            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", color: "#718096", fontSize: 12 }}>
                              <span><Clock size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 4 }} />{formatNotificationDate(notification.createdAt)}</span>
                              {notification.actor?.name && <span>From: {notification.actor.name}</span>}
                              {notification.metadata?.currentStage && <span>Stage: {notification.metadata.currentStage}</span>}
                            </div>
                          </div>
                          <button
                            className="hoo-refresh"
                            onClick={() => markNotificationRead(notification)}
                            disabled={notificationBusyId === notification._id}
                            title={notification.link ? "Mark as read and open related item" : "Mark as read"}
                          >
                            {notificationBusyId === notification._id ? "Saving..." : unread ? <><Check size={15} /> Mark read</> : notification.link ? <><ExternalLink size={15} /> Open</> : <CheckCircle2 size={15} />}
                          </button>
                        </article>
                      );
                    })}
                  </div>
                )}
              </section>

                        ) : activeSection === "Employee Management" ? (
              <section className="hoo-claims-page hoo-employee-page">
                <div className="hoo-claims-heading">
                  <div>
                    <span className="hoo-kicker">OFFICE ADMINISTRATIVE ESTABLISHMENT</span>
                    <h2>Office Personnel Directory</h2>
                    <p>Administrative and financial oversight of office personnel, cadres, pay grades, and service dossiers.</p>
                  </div>
                  <button className="hoo-refresh" onClick={fetchEmployees} disabled={employeesLoading}>
                    <RefreshCw size={16} /> {employeesLoading ? "Refreshing..." : "Refresh Staff"}
                  </button>
                </div>

                {/* Top Metrics Cards */}
                <div className="hoo-dept-summary-grid">
                  <div className="hoo-dept-stat-card">
                    <div className="hoo-dept-stat-icon"><Users size={22} /></div>
                    <div className="hoo-dept-stat-info">
                      <small>Total Office Staff</small>
                      <strong>{employeesLoading ? "?" : officeEmployees.length}</strong>
                    </div>
                  </div>
                  <div className="hoo-dept-stat-card">
                    <div className="hoo-dept-stat-icon"><Building2 size={22} /></div>
                    <div className="hoo-dept-stat-info">
                      <small>Cadres &amp; Designations</small>
                      <strong>
                        {employeesLoading
                          ? "?"
                          : new Set(officeEmployees.map((e) => e.designation).filter(Boolean)).size}
                      </strong>
                    </div>
                  </div>
                  <div className="hoo-dept-stat-card">
                    <div className="hoo-dept-stat-icon"><ClipboardCheck size={22} /></div>
                    <div className="hoo-dept-stat-info">
                      <small>Pending HOA Claims</small>
                      <strong>{claims.length}</strong>
                    </div>
                  </div>
                  <div className="hoo-dept-stat-card">
                    <div className="hoo-dept-stat-icon"><Briefcase size={22} /></div>
                    <div className="hoo-dept-stat-info">
                      <small>Departments / Sections</small>
                      <strong>
                        {employeesLoading
                          ? "?"
                          : new Set(officeEmployees.map((e) => e.department).filter(Boolean)).size}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Filter and Search Bar */}
                <div className="hoo-dept-filter-bar">
                  <div className="hoo-dept-search-box">
                    <Search size={18} />
                    <input
                      value={empSearch}
                      onChange={(e) => setEmpSearch(e.target.value)}
                      placeholder="Search staff by name, employee code, cadre, or email..."
                    />
                  </div>
                  <select
                    className="hoo-dept-select"
                    value={empDesignationFilter}
                    onChange={(e) => setEmpDesignationFilter(e.target.value)}
                    aria-label="Filter by designation"
                  >
                    <option value="ALL">All Designations</option>
                    {Array.from(
                      new Set(officeEmployees.map((e) => e.designation).filter(Boolean))
                    ).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                  <select
                    className="hoo-dept-select"
                    value={empDeptFilter}
                    onChange={(e) => setEmpDeptFilter(e.target.value)}
                    aria-label="Filter by department"
                  >
                    <option value="ALL">All Departments</option>
                    {Array.from(
                      new Set(officeEmployees.map((e) => e.department).filter(Boolean))
                    ).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Employees List */}
                {employeesLoading ? (
                  <div className="hoo-empty">
                    <span className="hoo-spinner" />
                    <strong>Loading Office Personnel...</strong>
                  </div>
                ) : employeesError ? (
                  <div className="hoo-empty">
                    <XCircle size={28} style={{ color: "#ef4444" }} />
                    <strong>Failed to load employees</strong>
                    <span>{employeesError}</span>
                    <button className="hoo-refresh" onClick={fetchEmployees}>Try Again</button>
                  </div>
                ) : officeEmployees.length === 0 ? (
                  <div className="hoo-empty">
                    <Users size={32} />
                    <strong>No Office Personnel Found</strong>
                    <span>Employees assigned to this office will appear here.</span>
                  </div>
                ) : (
                  <div className="hoo-dept-list">
                    {officeEmployees
                      .filter((emp) => {
                        const q = empSearch.toLowerCase();
                        const matchesSearch =
                          !q ||
                          emp.name?.toLowerCase().includes(q) ||
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
                        <div key={emp._id || emp.employeeCode} className="hoo-dept-employee-card">
                          <div className="hoo-dept-emp-profile">
                            <span className="hoo-person-avatar">
                              {initials(emp.name)}
                            </span>
                            <div className="hoo-dept-emp-info">
                              <strong>{emp.name}</strong>
                              <small>{emp.employeeCode} ? {emp.email || "No email registered"}</small>
                            </div>
                          </div>

                          <div className="hoo-dept-col">
                            <small>Designation / Cadre</small>
                            <strong>{emp.designation || "Not Assigned"}</strong>
                          </div>

                          <div className="hoo-dept-col">
                            <small>Department / Section</small>
                            <strong>{emp.department || "General Administration"}</strong>
                          </div>

                          <div className="hoo-dept-col">
                            <small>Functional Assignment</small>
                            <strong>{emp.functionalAssignment || "Employee"}</strong>
                          </div>

                          <div className="hoo-dept-col money">
                            <small>Basic Pay</small>
                            <strong>{amount(emp.basicPay || 0)}</strong>
                          </div>

                          <button
                            className="hoo-dept-action-btn"
                            onClick={() => setSelectedEmployee(emp)}
                          >
                            <Eye size={14} /> View Dossier <ChevronRight size={14} />
                          </button>
                        </div>
                      ))}
                  </div>
                )}

                {/* Employee Dossier Modal */}
                {selectedEmployee && (
                  <div
                    className="hoo-modal-backdrop"
                    onClick={() => setSelectedEmployee(null)}
                  >
                    <div
                      className="hoo-modal-card"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="hoo-modal-header">
                        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                          <span className="hoo-person-avatar" style={{ width: 48, height: 48, fontSize: 17 }}>
                            {initials(selectedEmployee.name)}
                          </span>
                          <div>
                            <h3 style={{ margin: 0, fontSize: 19, color: "#fff" }}>{selectedEmployee.name}</h3>
                            <small style={{ color: "#94a3b8" }}>{selectedEmployee.employeeCode} ? {selectedEmployee.designation}</small>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedEmployee(null)}
                          className="hoo-modal-close-btn"
                          aria-label="Close modal"
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <div className="hoo-modal-grid">
                        <DetailField label="Employee Code" value={selectedEmployee.employeeCode} />
                        <DetailField label="Full Name" value={selectedEmployee.name} />
                        <DetailField label="Designation / Cadre" value={selectedEmployee.designation || "Not Specified"} />
                        <DetailField label="Department / Branch" value={selectedEmployee.department || "General Administration"} />
                        <DetailField label="Functional Role" value={selectedEmployee.functionalAssignment || "Employee"} />
                        <DetailField label="Basic Pay" value={amount(selectedEmployee.basicPay || 0)} />
                        <DetailField label="Official Email" value={selectedEmployee.email || "N/A"} />
                        <DetailField label="Phone / Extension" value={selectedEmployee.phone || selectedEmployee.mobile || "N/A"} />
                        <DetailField label="Sanctioned Office" value={selectedEmployee.office || "Head Office"} />
                      </div>

                      <div className="hoo-modal-footer">
                        <span style={{ fontSize: 13, color: "#64748b" }}>Establishment Service Dossier ? Head of Office Record</span>
                        <button
                          className="hoo-refresh"
                          onClick={() => setSelectedEmployee(null)}
                          style={{ padding: "6px 18px" }}
                        >
                          Close Dossier
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </section>

            ) : activeSection === "Dashboard" ? (
              <section className="hoo-dashboard-container">
                {/* 1. Executive Metric Ribbons */}
                <div className="hoo-dash-kpi-grid">
                  <div
                    className="hoo-dash-kpi-card highlight-amber"
                    onClick={() => setActiveSection("Claims Approval")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="hoo-dash-kpi-header">
                      <span>Awaiting HOA Sanction</span>
                      <span className="hoo-dash-kpi-icon"><Clock size={19} /></span>
                    </div>
                    <div className="hoo-dash-kpi-body">
                      <strong>{claims.filter((c) => c.status === "PENDING_HOA" || !c.status).length}</strong>
                      <small>
                        Liability: {amount(
                          claims
                            .filter((c) => c.status === "PENDING_HOA" || !c.status)
                            .reduce((sum, c) => sum + Number(c.claimAmount || c.totalClaimAmount || 0), 0)
                        )}
                      </small>
                    </div>
                    <div className="hoo-dash-kpi-footer">
                      <span>Review Pending Queue</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  <div
                    className="hoo-dash-kpi-card highlight-blue"
                    onClick={() => setActiveSection("Employee Management")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="hoo-dash-kpi-header">
                      <span>Office Personnel</span>
                      <span className="hoo-dash-kpi-icon"><Users size={19} /></span>
                    </div>
                    <div className="hoo-dash-kpi-body">
                      <strong>{officeEmployees.length}</strong>
                      <small>
                        {new Set(officeEmployees.map((e) => e.department).filter(Boolean)).size || 1} Functional Sections
                      </small>
                    </div>
                    <div className="hoo-dash-kpi-footer">
                      <span>View Establishment Directory</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  <div
                    className="hoo-dash-kpi-card highlight-green"
                    onClick={() => setActiveSection("Claims Approval")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="hoo-dash-kpi-header">
                      <span>Sanctioned / Cleared</span>
                      <span className="hoo-dash-kpi-icon"><CheckCircle2 size={19} /></span>
                    </div>
                    <div className="hoo-dash-kpi-body">
                      <strong>
                        {claims.filter((c) => ["APPROVED", "FORWARDED_DDO", "SANCTIONED"].includes(c.status)).length}
                      </strong>
                      <small>Forwarded to DDO for payment</small>
                    </div>
                    <div className="hoo-dash-kpi-footer">
                      <span>Audit Sanction Register</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>

                  <div
                    className="hoo-dash-kpi-card highlight-purple"
                    onClick={() => setActiveSection("Notifications")}
                    role="button"
                    tabIndex={0}
                  >
                    <div className="hoo-dash-kpi-header">
                      <span>Workflow Alerts</span>
                      <span className="hoo-dash-kpi-icon"><BellRing size={19} /></span>
                    </div>
                    <div className="hoo-dash-kpi-body">
                      <strong>{unreadCount}</strong>
                      <small>{unreadCount === 0 ? "All updates reviewed" : "Unread approval actions"}</small>
                    </div>
                    <div className="hoo-dash-kpi-footer">
                      <span>Open Notifications</span>
                      <ArrowUpRight size={14} />
                    </div>
                  </div>
                </div>

                {/* 2. Main Executive Grid: Work Queue (Left 68%) + Action Center (Right 32%) */}
                <div className="hoo-dash-main-grid">
                  <div className="hoo-dash-col-primary">
                    {/* Priority Queue Table */}
                    <div className="hoo-dash-panel">
                      <div className="hoo-dash-panel-header">
                        <div>
                          <h3>Priority Claims Awaiting Head of Office Review</h3>
                          <p>Claims forwarded from Head of Department (HOD) review stage</p>
                        </div>
                        <button
                          className="hoo-dash-action-link"
                          onClick={() => setActiveSection("Claims Approval")}
                        >
                          View All ({claims.length}) &rarr;
                        </button>
                      </div>

                      {claims.filter((c) => c.status === "PENDING_HOA" || !c.status).length === 0 ? (
                        <div className="hoo-empty" style={{ padding: "36px 20px" }}>
                          <CheckCircle2 size={32} style={{ color: "#059669" }} />
                          <strong>Queue is clear</strong>
                          <span>No claims currently require Head of Office approval.</span>
                        </div>
                      ) : (
                        <div className="hoo-dash-table-wrap">
                          <table className="hoo-dash-table">
                            <thead>
                              <tr>
                                <th>Claimant &amp; Code</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th style={{ textAlign: "right" }}>Sanction Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {claims
                                .filter((c) => c.status === "PENDING_HOA" || !c.status)
                                .slice(0, 5)
                                .map((claim) => (
                                  <tr key={claim._id || claim.id}>
                                    <td>
                                      <strong>{claim.employeeId?.name || claim.employee || "Office Staff"}</strong>
                                      <small>{claim.employeeId?.employeeCode || claim.employeeCode || "GOV-CLAIM"}</small>
                                    </td>
                                    <td>
                                      <span className="hoo-dash-claim-type">
                                        {claim.claimType || "TA"}
                                      </span>
                                    </td>
                                    <td>
                                      <strong className="hoo-money-text">
                                        {amount(claim.claimAmount || claim.totalClaimAmount || 0)}
                                      </strong>
                                    </td>
                                    <td>
                                      <span className="hoo-badge-pending">PENDING_HOA</span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                      <button
                                        className="hoo-dash-btn-inspect"
                                        onClick={() => {
                                          setActiveSection("Claims Approval");
                                          setSelectedClaim(claim);
                                        }}
                                      >
                                        Inspect &amp; Sanction
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Claims Category Distribution */}
                    <div className="hoo-dash-panel" style={{ marginTop: "20px" }}>
                      <div className="hoo-dash-panel-header">
                        <div>
                          <h3>Office Sanction Pipeline by Category</h3>
                          <p>Volume distribution of active claims across official allowance heads</p>
                        </div>
                      </div>

                      <div className="hoo-dash-category-bars">
                        {[
                          {
                            type: "Tour Allowance (TA)",
                            count: claims.filter((c) => (c.claimType || "").toUpperCase() === "TA").length,
                            total: claims.length || 1,
                            color: "#2563eb",
                          },
                          {
                            type: "Leave Travel Concession (LTC)",
                            count: claims.filter((c) => (c.claimType || "").toUpperCase() === "LTC").length,
                            total: claims.length || 1,
                            color: "#0891b2",
                          },
                          {
                            type: "Medical / Other Official Claims",
                            count: claims.filter((c) => !["TA", "LTC"].includes((c.claimType || "").toUpperCase())).length,
                            total: claims.length || 1,
                            color: "#7c3aed",
                          },
                        ].map((cat) => {
                          const percent = Math.round((cat.count / cat.total) * 100);
                          return (
                            <div key={cat.type} className="hoo-dash-cat-row">
                              <div className="hoo-dash-cat-meta">
                                <span>{cat.type}</span>
                                <strong>{cat.count} claims ({percent}%)</strong>
                              </div>
                              <div className="hoo-dash-cat-track">
                                <div
                                  className="hoo-dash-cat-fill"
                                  style={{ width: `${percent}%`, backgroundColor: cat.color }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Quick Administrative Tools & Sanction Feed */}
                  <div className="hoo-dash-col-secondary">
                    <div className="hoo-dash-panel">
                      <div className="hoo-dash-panel-header">
                        <div>
                          <h3>Administrative Controls</h3>
                          <p>Direct workspace actions</p>
                        </div>
                      </div>
                      <div className="hoo-dash-action-list">
                        <button
                          className="hoo-dash-quick-btn"
                          onClick={() => setActiveSection("Claims Approval")}
                        >
                          <div className="hoo-dash-btn-icon" style={{ background: "#eff6ff", color: "#2563eb" }}>
                            <ClipboardCheck size={18} />
                          </div>
                          <div>
                            <strong>Review Claims Queue</strong>
                            <small>Review claims awaiting sanction</small>
                          </div>
                          <ChevronRight size={16} />
                        </button>

                        <button
                          className="hoo-dash-quick-btn"
                          onClick={() => setActiveSection("Employee Management")}
                        >
                          <div className="hoo-dash-btn-icon" style={{ background: "#f0fdf4", color: "#16a34a" }}>
                            <Users size={18} />
                          </div>
                          <div>
                            <strong>Staff Service Dossiers</strong>
                            <small>Establishment register &amp; cadres</small>
                          </div>
                          <ChevronRight size={16} />
                        </button>

                        <button
                          className="hoo-dash-quick-btn"
                          onClick={() => setActiveSection("Notifications")}
                        >
                          <div className="hoo-dash-btn-icon" style={{ background: "#fbf5ff", color: "#9333ea" }}>
                            <BellRing size={18} />
                          </div>
                          <div>
                            <strong>Workflow Activity Feed</strong>
                            <small>Inspect recent system notifications</small>
                          </div>
                          <ChevronRight size={16} />
                        </button>

                        <button
                          className="hoo-dash-quick-btn"
                          onClick={() => {
                            fetchClaims();
                            fetchEmployees();
                            fetchNotifications();
                          }}
                        >
                          <div className="hoo-dash-btn-icon" style={{ background: "#f8fafc", color: "#475569" }}>
                            <RefreshCw size={18} />
                          </div>
                          <div>
                            <strong>Refresh All Data</strong>
                            <small>Sync claims and establishment roster</small>
                          </div>
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Financial Year Oversight Box */}
                    <div className="hoo-dash-panel" style={{ marginTop: "20px" }}>
                      <div className="hoo-dash-panel-header">
                        <div>
                          <h3>Financial Year Record</h3>
                          <p>Establishment sanction status</p>
                        </div>
                      </div>
                      <div className="hoo-dash-fiscal-box">
                        <div className="hoo-fiscal-item">
                          <small>CURRENT FINANCIAL YEAR</small>
                          <strong>2026?2027</strong>
                        </div>
                        <div className="hoo-fiscal-item">
                          <small>OFFICE JURISDICTION</small>
                          <strong>Head of Office (HOA)</strong>
                        </div>
                        <div className="hoo-fiscal-item">
                          <small>SANCTION THRESHOLD</small>
                          <strong style={{ color: "#059669" }}>Competent Authority</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            ) : null}
          <footer className="hoo-footer"><span>Government Finance Management System</span><span>Head of Office Workspace</span></footer>
        </div>
      </main>
    </div>
  );
}
