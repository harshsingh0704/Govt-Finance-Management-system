import React, { useState } from "react";
import { X, Send, Calculator } from "lucide-react";

export default function CreateClaimModal({ isOpen, onClose, onSuccess, employeeId }) {
  const [formData, setFormData] = useState({
    fare: 0,
    roadMileage: 0,
    dailyAllowance: 0,
    accommodationCharges: 0,
    advanceAdjusted: 0,
    purposeOfJourney: "",
    departurePlace: "",
    arrivalPlace: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const grossAmount =
    (Number(formData.fare) || 0) +
    (Number(formData.roadMileage) || 0) +
    (Number(formData.dailyAllowance) || 0) +
    (Number(formData.accommodationCharges) || 0);

  const netAmount = Math.max(0, grossAmount - (Number(formData.advanceAdjusted) || 0));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/ta/claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          employeeId,
          grossAmount,
          netAmount,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (onSuccess) onSuccess(data.claim);
        onClose();
      } else {
        setError(data.error || data.message || "Failed to submit claim.");
      }
    } catch (err) {
      setError("Server connection failed. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.6)", display: "flex",
      alignItems: "center", justifyContent: "center", zIndex: 1100
    }}>
      <div style={{
        background: "#fff", borderRadius: "12px", width: "90%", maxWidth: "600px",
        overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
      }}>
        <div style={{
          padding: "16px 24px", borderBottom: "1px solid #e5e7eb",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 700, color: "#111827" }}>
              Submit TA Claim
            </h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.85rem", color: "#6b7280" }}>
              Fill in travel expenses for verification and approval.
            </p>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer" }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px 24px" }}>
          {error && (
            <div style={{ background: "#fee2e2", color: "#991b1b", padding: "10px", borderRadius: "6px", marginBottom: "14px", fontSize: "0.875rem" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Departure Place</label>
              <input
                type="text"
                name="departurePlace"
                required
                value={formData.departurePlace}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Arrival Place</label>
              <input
                type="text"
                name="arrivalPlace"
                required
                value={formData.arrivalPlace}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px" }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "12px" }}>
            <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Purpose of Journey</label>
            <input
              type="text"
              name="purposeOfJourney"
              required
              value={formData.purposeOfJourney}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Train/Air Fare (₹)</label>
              <input
                type="number"
                name="fare"
                min="0"
                value={formData.fare}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Road Mileage (₹)</label>
              <input
                type="number"
                name="roadMileage"
                min="0"
                value={formData.roadMileage}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Daily Allowance (₹)</label>
              <input
                type="number"
                name="dailyAllowance"
                min="0"
                value={formData.dailyAllowance}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", fontWeight: 600, marginBottom: "4px" }}>Accommodation (₹)</label>
              <input
                type="number"
                name="accommodationCharges"
                min="0"
                value={formData.accommodationCharges}
                onChange={handleChange}
                style={{ width: "100%", padding: "8px 10px", border: "1px solid #d1d5db", borderRadius: "6px" }}
              />
            </div>
          </div>

          <div style={{ background: "#f3f4f6", padding: "12px", borderRadius: "6px", marginBottom: "16px", display: "flex", justifyContent: "space-between" }}>
            <span>Gross: <strong>₹{grossAmount}</strong></span>
            <span>Net Claim: <strong style={{ color: "#2563eb" }}>₹{netAmount}</strong></span>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ background: "#e5e7eb", color: "#374151", border: "none", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{ background: "#2563eb", color: "#fff", border: "none", padding: "8px 18px", borderRadius: "6px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <Send size={16} /> {submitting ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
