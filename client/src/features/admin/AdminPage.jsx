// Helper to extract JWT token from localStorage (fms_auth or plain token)
function getStoredAuthToken() {
  try {
    const raw = localStorage.getItem("fms_auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) return parsed.token;
    }
  } catch (e) {}
  return localStorage.getItem("token") || "";
}

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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
  Download,
  FileBarChart,
  FileCheck2,
  FileSearch,
  IndianRupee,
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

import "./AdminPage.css";

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

/* -------------------------------------------------------------------------- */
/* Generate Payslip Modal                                                     */
/* -------------------------------------------------------------------------- */

function GeneratePayslipModal({ isOpen, onClose, onSuccess }) {
  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [month, setMonth] = useState(10);
  const [year, setYear] = useState(2026);
  const [basicPay, setBasicPay] = useState(45000);
  const [allowances, setAllowances] = useState(7500);
  const [deductions, setDeductions] = useState(3750);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const fetchEmployees = async () => {
      try {
        setLoadingEmployees(true);
        const token = getStoredAuthToken();
        const res = await axios.get("http://localhost:5000/api/employees", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const list = res.data.employees || [];
        setEmployees(list);
        if (list.length > 0 && !employeeId) {
          setEmployeeId(list[0]._id);
          if (list[0].basicPay) setBasicPay(list[0].basicPay);
        }
      } catch (err) {
        console.warn("Could not fetch employees for dropdown:", err);
      } finally {
        setLoadingEmployees(false);
      }
    };
    fetchEmployees();
  }, [isOpen]);

  if (!isOpen) return null;

  const netPay = Number(basicPay || 0) + Number(allowances || 0) - Number(deductions || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!employeeId.trim()) {
      setError("Please enter a valid Employee MongoDB ID.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getStoredAuthToken();

      await axios.post(
        "http://localhost:5000/api/payslips/generate",
        {
          employeeId: employeeId.trim(),
          month: Number(month),
          year: Number(year),
          basicPay: Number(basicPay),
          allowances: Number(allowances),
          deductions: Number(deductions),
          netPay: Number(netPay),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("Payslip generated successfully!");
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error("Failed to generate payslip:", err);
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to generate payslip. Verify the Employee ID and admin permissions."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "1rem",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "520px",
          padding: "24px",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "16px",
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: "1.25rem", color: "#0f172a" }}>
              Generate Employee Payslip
            </h3>
            <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#64748b" }}>
              Creates salary record &amp; PDF for official employee download.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#64748b",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "#fef2f2",
              border: "1px solid #fee2e2",
              color: "#b91c1c",
              borderRadius: "8px",
              fontSize: "0.875rem",
              marginBottom: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "12px" }}>
            <label
                style={{
                  display: "block",
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Select Employee
              </label>
              <select
                value={employeeId}
                onChange={(e) => {
                  const id = e.target.value;
                  setEmployeeId(id);
                  const found = employees.find((emp) => emp._id === id);
                  if (found && found.basicPay) setBasicPay(found.basicPay);
                }}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                  backgroundColor: "#fff",
                }}
                required
              >
                {loadingEmployees && <option value="">Loading employees...</option>}
                {!loadingEmployees && employees.length === 0 && (
                  <option value="">No employees found</option>
                )}
                {employees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {emp.name} ({emp.employeeCode || emp.designation || "Staff"}) - {emp.email}
                  </option>
                ))}
              </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Month (1 - 12)
              </label>
              <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Month {i + 1}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
                required
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Basic (₹)
              </label>
              <input
                type="number"
                value={basicPay}
                onChange={(e) => setBasicPay(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Allowances (₹)
              </label>
              <input
                type="number"
                value={allowances}
                onChange={(e) => setAllowances(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.8rem",
                  fontWeight: "600",
                  color: "#334155",
                  marginBottom: "4px",
                }}
              >
                Deductions (₹)
              </label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 10px",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  fontSize: "0.9rem",
                }}
                required
              />
            </div>
          </div>

          <div
            style={{
              padding: "12px 14px",
              backgroundColor: "#f8fafc",
              borderRadius: "8px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "18px",
              border: "1px solid #e2e8f0",
            }}
          >
            <span style={{ fontSize: "0.875rem", color: "#475569" }}>Calculated Net Pay:</span>
            <strong style={{ fontSize: "1.1rem", color: "#0f172a" }}>₹{netPay.toLocaleString()}</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="ad-primary-button"
              style={{ margin: 0, padding: "8px 20px" }}
            >
              {submitting ? "Generating..." : "Generate Slip"}
            </button>
          </div>
        </form>
      </div>
    </div>
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
  const [showGeneratePayslip, setShowGeneratePayslip] = useState(false);
  const [payslips, setPayslips] = useState([]);
  const [loadingPayslips, setLoadingPayslips] = useState(false);
  const [expandedService, setExpandedService] = useState(null);

  // Fetch all recent payslips for the admin view
  const fetchPayslips = async () => {
    try {
      setLoadingPayslips(true);
      const token = getStoredAuthToken();
      const res = await axios.get("http://localhost:5000/api/payslips", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPayslips(res.data.payslips || []);
    } catch (err) {
      console.warn("Could not fetch payslips for admin table:", err);
    } finally {
      setLoadingPayslips(false);
    }
  };

  useEffect(() => {
    fetchPayslips();
  }, []);

  const handleDownloadPdf = async (payslipId, month, year) => {
    try {
      const token = getStoredAuthToken();
      const res = await axios.get(`http://localhost:5000/api/payslips/download/${payslipId}`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: "blob",
      });
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Payslip-${month}-${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("Failed to download PDF.");
    }
  };

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


            <span className="ad-nav-label">Employee Management</span>

            <button
              type="button"
              className="ad-nav-item"
              onClick={() => setShowCreateEmployee(true)}
            >
              <Plus size={18} />
              <span>Add Employee</span>
            </button>

            <button
              type="button"
              className="ad-nav-item"
              onClick={() => navigate("/admin/employee-management/map")}
            >
              <Users size={18} />
              <span>Map Employee</span>
            </button>

            <button
              type="button"
              className="ad-nav-item"
              onClick={() => navigate("/admin/employee-management")}
            >
              <UserRound size={18} />
              <span>Manage Employee</span>
            </button>

            <button
              type="button"
              className="ad-nav-item"
              onClick={() => navigate("/admin/employee-management/audit-log")}
            >
              <FileSearch size={18} />
              <span>Employee Audit Log</span>
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

            <button
              type="button"
              className="ad-nav-item"
              onClick={() => setShowGeneratePayslip(true)}
            >
              <IndianRupee size={18} />
              <span>Generate Payslip</span>
            </button>

            <button type="button" className="ad-nav-item">
              <BarChart3 size={18} />
              <span>Expenditure</span>
            </button>
            <span className="ad-nav-label">Services</span>

            <button
              type="button"
              className="ad-nav-item"
              onClick={() => navigate("/admin/services/accommodation")}
            >
              <FileCheck2 size={18} />
              <span>Accommodation</span>
            </button>

            <button
              type="button"
              className="ad-nav-item"
              onClick={() =>
                setExpandedService((value) => (value === "LTC" ? null : "LTC"))
              }
              aria-expanded={expandedService === "LTC"}
            >
              <ChevronDown
                size={16}
                style={{
                  transform:
                    expandedService === "LTC"
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                  transition: "transform 160ms ease",
                }}
              />
              <span>LTC</span>
            </button>

            {expandedService === "LTC" && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/admin/services/ltc/claim")}
                  className="ad-nav-item"
                  style={{ paddingLeft: "42px" }}
                >
                  <FileCheck2 size={17} />
                  <span>LTC Claim</span>
                </button>

                <button
                  type="button"
                  className="ad-nav-item"
                  style={{ paddingLeft: "42px" }}
                >
                  <FileCheck2 size={17} />
                  <span>LTC Advance</span>
                </button>
              </>
            )}

            <button
              type="button"
              className="ad-nav-item"
              onClick={() =>
                setExpandedService((value) =>
                  value === "Medical" ? null : "Medical",
                )
              }
              aria-expanded={expandedService === "Medical"}
            >
              <ChevronDown
                size={16}
                style={{
                  transform:
                    expandedService === "Medical"
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                  transition: "transform 160ms ease",
                }}
              />
              <span>Medical</span>
            </button>

            {expandedService === "Medical" && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/admin/services/medical/claim")}
                  className="ad-nav-item"
                  style={{ paddingLeft: "42px" }}
                >
                  <FileCheck2 size={17} />
                  <span>Medical Claim</span>
                </button>

                <button
                  type="button"
                  className="ad-nav-item"
                  style={{ paddingLeft: "42px" }}
                >
                  <FileCheck2 size={17} />
                  <span>Medical Advance</span>
                </button>
              </>
            )}

            <button
              type="button"
              className="ad-nav-item"
              onClick={() =>
                setExpandedService((value) => (value === "TA" ? null : "TA"))
              }
              aria-expanded={expandedService === "TA"}
            >
              <ChevronDown
                size={16}
                style={{
                  transform:
                    expandedService === "TA"
                      ? "rotate(0deg)"
                      : "rotate(-90deg)",
                  transition: "transform 160ms ease",
                }}
              />
              <span>TA</span>
            </button>

            {expandedService === "TA" && (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/admin/services/ta/claim")}
                  className="ad-nav-item"
                  style={{ paddingLeft: "42px" }}
                >
                  <FileCheck2 size={17} />
                  <span>TA Claim</span>
                </button>

                <button
                  type="button"
                  className="ad-nav-item"
                  style={{ paddingLeft: "42px" }}
                >
                  <FileCheck2 size={17} />
                  <span>TA Advance</span>
                </button>
              </>
            )}

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
              <span>Finance &amp; Accounts</span>
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

              <kbd>⌘</kbd>
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
                  <span>Finance &amp; Accounts</span>
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

              <button
                type="button"
                className="ad-add-employee-button"
                style={{
                  backgroundColor: "#0284c7",
                  borderColor: "#0284c7",
                }}
                onClick={() => setShowGeneratePayslip(true)}
              >
                <IndianRupee size={17} />
                Generate Payslip
              </button>

              <div className="ad-header-period">
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
            </div>
          </section>

          {/* Generated Payslips Admin Section */}
          <section style={{ marginBottom: "2rem" }}>
            <div
              style={{
                background: "#ffffff",
                borderRadius: "16px",
                border: "1px solid #e2e8f0",
                padding: "20px 24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2 style={{ fontSize: "1.15rem", fontWeight: "700", color: "#0f172a", margin: 0 }}>
                    Recent Generated Payslips
                  </h2>
                  <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                    Official salary slips generated for employees with binary download access.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={fetchPayslips}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#f8fafc",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                >
                  Refresh List
                </button>
              </div>

              {loadingPayslips ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Loading slips...</div>
              ) : payslips.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                  No payslips generated yet. Click "Generate Payslip" above to create one.
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #f1f5f9", color: "#64748b" }}>
                        <th style={{ padding: "10px 14px", fontWeight: "600" }}>EMPLOYEE</th>
                        <th style={{ padding: "10px 14px", fontWeight: "600" }}>PERIOD</th>
                        <th style={{ padding: "10px 14px", fontWeight: "600" }}>BASIC PAY</th>
                        <th style={{ padding: "10px 14px", fontWeight: "600" }}>ALLOWANCES</th>
                        <th style={{ padding: "10px 14px", fontWeight: "600" }}>DEDUCTIONS</th>
                        <th style={{ padding: "10px 14px", fontWeight: "600" }}>NET PAY</th>
                        <th style={{ padding: "10px 14px", fontWeight: "600", textAlign: "right" }}>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {payslips.map((slip) => (
                        <tr key={slip._id} style={{ borderBottom: "1px solid #f8fafc" }}>
                          <td style={{ padding: "12px 14px", fontFamily: "monospace", color: "#475569" }}>
                            {slip.employeeId?.userId?.name || slip.employee?.name || slip.employee?.slice?.(0, 8) || "Employee"}
                          </td>
                          <td style={{ padding: "12px 14px", fontWeight: "600", color: "#0f172a" }}>
                            Month {slip.month} / {slip.year}
                          </td>
                          <td style={{ padding: "12px 14px", color: "#334155" }}>₹{slip.basicPay}</td>
                          <td style={{ padding: "12px 14px", color: "#16a34a" }}>+₹{slip.allowances}</td>
                          <td style={{ padding: "12px 14px", color: "#dc2626" }}>-₹{slip.deductions}</td>
                          <td style={{ padding: "12px 14px", fontWeight: "700", color: "#0f172a" }}>₹{slip.netPay}</td>
                          <td style={{ padding: "12px 14px", textAlign: "right" }}>
                            <button
                              type="button"
                              onClick={() => handleDownloadPdf(slip._id, slip.month, slip.year)}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #0284c7",
                                color: "#0284c7",
                                background: "#f0f9ff",
                                fontWeight: "600",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                              }}
                            >
                              <Download size={14} /> Download PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
                  <h2>Exceptions &amp; Queries</h2>
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
                <button
                  type="button"
                  className="ad-quick-action primary"
                  onClick={() => setShowGeneratePayslip(true)}
                >
                  <span>
                    <IndianRupee size={19} />
                  </span>

                  <div>
                    <strong>Generate Payslip</strong>
                    <small>Create employee salary slip</small>
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

      <GeneratePayslipModal
        isOpen={showGeneratePayslip}
        onClose={() => setShowGeneratePayslip(false)}
        onSuccess={fetchPayslips}
      />
    </div>
  );
}


