import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, PauseCircle, RefreshCw, X, AlertCircle } from "lucide-react";

export default function ApprovalQueueModal({ isOpen, onClose }) {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionRemarks, setActionRemarks] = useState({});
  const [processingId, setProcessingId] = useState(null);

  const fetchApprovals = async () => {
    setLoading(true);
    setError("");
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        try {
          const auth = JSON.parse(localStorage.getItem("fms_auth") || "{}");
          token = auth.token || auth.accessToken;
        } catch (e) {}
      }
      const res = await fetch("http://localhost:5000/api/approvals", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.success) {
        setApprovals(data.data || []);
      } else {
        setError(data.message || "Failed to fetch approvals");
      }
    } catch (err) {
      setError("Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchApprovals();
    }
  }, [isOpen]);

  const handleAction = async (id, status) => {
    setProcessingId(id);
    const remarks = actionRemarks[id] || "";
    try {
      let token = localStorage.getItem("token");
      if (!token) {
        try {
          const auth = JSON.parse(localStorage.getItem("fms_auth") || "{}");
          token = auth.token || auth.accessToken;
        } catch (e) {}
      }
      const res = await fetch(`http://localhost:5000/api/approvals/${id}/action`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status, remarks }),
      });
      const data = await res.json();
      if (data.success) {
        fetchApprovals();
      } else {
        alert(data.message || "Action failed");
      }
    } catch (err) {
      alert("Request failed: " + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", borderRadius: "12px", width: "90%", maxWidth: "950px",
        maxHeight: "85vh", display: "flex", flexDirection: "column", overflow: "hidden",
        boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700", color: "#111827", margin: 0 }}>
              Claims Approval Queue
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "0.875rem", color: "#6b7280" }}>
              Review, approve, hold, or reject employee reimbursement claims.
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={fetchApprovals}
              style={{ background: "#f3f4f6", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer" }}
              title="Refresh"
            >
              <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            </button>
            <button
              onClick={onClose}
              style={{ background: "transparent", border: "none", padding: "8px", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "6px", marginBottom: "16px" }}>
              {error}
            </div>
          )}

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>Loading queue...</div>
          ) : approvals.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "#6b7280" }}>
              No claims pending in the approval queue.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {approvals.map((item) => (
                <div key={item._id} style={{
                  border: "1px solid #e5e7eb", borderRadius: "8px", padding: "16px",
                  display: "flex", flexDirection: "column", gap: "12px", background: "#f9fafb"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{
                        display: "inline-block", padding: "2px 8px", borderRadius: "4px",
                        fontSize: "0.75rem", fontWeight: "600", textTransform: "uppercase",
                        background: item.claimType === "TAClaim" ? "#dbeafe" : "#fef3c7",
                        color: item.claimType === "TAClaim" ? "#1e40af" : "#92400e"
                      }}>
                        {item.claimType}
                      </span>
                      <h4 style={{ margin: "6px 0 2px", fontSize: "1rem", fontWeight: "600" }}>
                        Claim ID: {item.claimId?._id || item.claimId || item._id}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.85rem", color: "#4b5563" }}>
                        Status: <strong style={{ textTransform: "capitalize" }}>{item.status}</strong> | Stage: {item.currentStage}
                      </p>
                    </div>
                    <div style={{ textAlign: "right", fontSize: "0.9rem" }}>
                      <span style={{ fontWeight: "700", color: "#111827" }}>
                        Net: ₹{item.claimId?.netAmount || item.claimId?.netAmountClaimed || 0}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <input
                      type="text"
                      placeholder="Remarks / Reason..."
                      value={actionRemarks[item._id] || ""}
                      onChange={(e) => setActionRemarks({ ...actionRemarks, [item._id]: e.target.value })}
                      style={{
                        flex: 1, padding: "8px 12px", border: "1px solid #d1d5db",
                        borderRadius: "6px", fontSize: "0.875rem"
                      }}
                    />
                    <button
                      disabled={processingId === item._id}
                      onClick={() => handleAction(item._id, "approved")}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        background: "#16a34a", color: "#fff", border: "none",
                        padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600"
                      }}
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                    <button
                      disabled={processingId === item._id}
                      onClick={() => handleAction(item._id, "hold")}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        background: "#d97706", color: "#fff", border: "none",
                        padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600"
                      }}
                    >
                      <PauseCircle size={16} /> Hold
                    </button>
                    <button
                      disabled={processingId === item._id}
                      onClick={() => handleAction(item._id, "rejected")}
                      style={{
                        display: "flex", alignItems: "center", gap: "4px",
                        background: "#dc2626", color: "#fff", border: "none",
                        padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600"
                      }}
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

