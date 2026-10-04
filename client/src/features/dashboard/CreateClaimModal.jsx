import React, { useState } from "react";
import { X, Send, Calculator, Plane, MapPin, Briefcase } from "lucide-react";
import { useSelector } from "react-redux";

function getStoredAuthToken() {
  try {
    const raw = localStorage.getItem("fms_auth");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token) return parsed.token;
      if (typeof parsed === "string") return parsed;
    }
    const direct = localStorage.getItem("token");
    if (direct) return direct;
  } catch (e) {}
  return "";
}

export default function CreateClaimModal({ isOpen, onClose, onSuccess, employeeId, initialType = "LTC" }) {
  const reduxToken = useSelector((state) => state.auth?.token);
  const [claimType, setClaimType] = useState(initialType);
  React.useEffect(() => {
    if (initialType) setClaimType(initialType);
  }, [initialType, isOpen]);

  // LTC Form State
  const [ltcData, setLtcData] = useState({
    ltcType: "Home Town",
    blockPeriod: "2026-2029",
    homeTown: "",
    graceYear: false,
    publicTransportation: "Train",
    destination: "",
    fromDate: "",
    toDate: "",
    fareClaimed: 0,
    advanceTaken: 0,
    remarks: "",
  });

  // TA Form State
  const [taData, setTaData] = useState({
    projectName: "",
    tourType: "Out-of-station",
    officeTransportation: false,
    publicTransportation: "Train",
    fromPlace: "",
    toPlace: "",
    fromDate: "",
    toDate: "",
    fare: 0,
    roadMileage: 0,
    dailyAllowance: 0,
    accommodationCharges: 0,
    advanceAdjusted: 0,
    remarks: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleLtcChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLtcData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const handleTaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTaData((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  // Calculations
  const ltcGross = Number(ltcData.fareClaimed) || 0;
  const ltcNet = Math.max(0, ltcGross - (Number(ltcData.advanceTaken) || 0));

  const taGross =
    (Number(taData.fare) || 0) +
    (Number(taData.roadMileage) || 0) +
    (Number(taData.dailyAllowance) || 0) +
    (Number(taData.accommodationCharges) || 0);
  const taNet = Math.max(0, taGross - (Number(taData.advanceAdjusted) || 0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const token = reduxToken || getStoredAuthToken();
    const endpoint =
      claimType === "LTC"
        ? "http://localhost:5000/api/ltc/claim"
        : "http://localhost:5000/api/ta/claim";

    const payload =
      claimType === "LTC"
        ? {
            ...ltcData,
            employeeId,
            fareClaimed: Number(ltcData.fareClaimed) || 0,
            advanceTaken: Number(ltcData.advanceTaken) || 0,
            grossAmount: ltcGross,
            netAmount: ltcNet,
          }
        : {
            ...taData,
            employeeId,
            fare: Number(taData.fare) || 0,
            roadMileage: Number(taData.roadMileage) || 0,
            dailyAllowance: Number(taData.dailyAllowance) || 0,
            accommodationCharges: Number(taData.accommodationCharges) || 0,
            advanceAdjusted: Number(taData.advanceAdjusted) || 0,
            grossAmount: taGross,
            netAmount: taNet,
          };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        if (onSuccess) onSuccess(data);
        onClose();
      } else {
        setError(data.error || data.message || "Submission failed.");
      }
    } catch (err) {
      setError("Network or server connection failed.");
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
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
        padding: "16px",
      }}
    >
      <div
        style={{
          background: "#ffffff",
          borderRadius: "16px",
          width: "100%",
          maxWidth: "680px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.2)",
          padding: "24px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700", color: "#0f172a" }}>
              Submit Official Claim (7th CPC)
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#64748b" }}>
              Compliant with IWST/ICFRE LTC & Tour Travel Regulations
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Claim Type Switcher */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px", background: "#f1f5f9", padding: "4px", borderRadius: "10px" }}>
          <button
            type="button"
            onClick={() => setClaimType("LTC")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: claimType === "LTC" ? "#ffffff" : "transparent",
              color: claimType === "LTC" ? "#0284c7" : "#64748b",
              boxShadow: claimType === "LTC" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <Plane size={16} /> Leave Travel Concession (LTC)
          </button>
          <button
            type="button"
            onClick={() => setClaimType("TA")}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "13px",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              background: claimType === "TA" ? "#ffffff" : "transparent",
              color: claimType === "TA" ? "#0284c7" : "#64748b",
              boxShadow: claimType === "TA" ? "0 2px 4px rgba(0,0,0,0.06)" : "none",
            }}
          >
            <Briefcase size={16} /> Tour Travel Allowance (TA)
          </button>
        </div>

        {error && (
          <div
            style={{
              padding: "10px 14px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              color: "#dc2626",
              fontSize: "12.5px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {/* LTC Fields */}
          {claimType === "LTC" ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>LTC Type</label>
                  <select
                    name="ltcType"
                    value={ltcData.ltcType}
                    onChange={handleLtcChange}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  >
                    <option value="Home Town">Home Town</option>
                    <option value="Anywhere in India">Anywhere in India</option>
                    <option value="Conversion to NER/J&K/A&N">Conversion to NER/J&K/A&N</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Block Period</label>
                  <input
                    type="text"
                    name="blockPeriod"
                    value={ltcData.blockPeriod}
                    onChange={handleLtcChange}
                    placeholder="e.g. 2026-2029"
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Home Town / Declared Place</label>
                  <input
                    type="text"
                    name="homeTown"
                    value={ltcData.homeTown}
                    onChange={handleLtcChange}
                    placeholder="e.g. Prayagraj / Varanasi"
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Public Transportation</label>
                  <select
                    name="publicTransportation"
                    value={ltcData.publicTransportation}
                    onChange={handleLtcChange}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  >
                    <option value="Train">Train (AC-2/3 Tier)</option>
                    <option value="Air">Air (Air India/Govt Route)</option>
                    <option value="Bus">Bus (Govt/Deluxe)</option>
                    <option value="Multiple">Multiple Modes</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "4px 0" }}>
                <input
                  type="checkbox"
                  id="graceYear"
                  name="graceYear"
                  checked={ltcData.graceYear}
                  onChange={handleLtcChange}
                />
                <label htmlFor="graceYear" style={{ fontSize: "12px", color: "#475569", cursor: "pointer" }}>
                  Availed in Grace Year of the Block Period? (Yes/No)
                </label>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Destination</label>
                  <input
                    type="text"
                    name="destination"
                    value={ltcData.destination}
                    onChange={handleLtcChange}
                    placeholder="Final Station"
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Journey Start</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={ltcData.fromDate}
                    onChange={handleLtcChange}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Journey End</label>
                  <input
                    type="date"
                    name="toDate"
                    value={ltcData.toDate}
                    onChange={handleLtcChange}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Fare Claimed (₹)</label>
                  <input
                    type="number"
                    name="fareClaimed"
                    value={ltcData.fareClaimed}
                    onChange={handleLtcChange}
                    min="0"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Advance Taken (₹)</label>
                  <input
                    type="number"
                    name="advanceTaken"
                    value={ltcData.advanceTaken}
                    onChange={handleLtcChange}
                    min="0"
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
              </div>
            </>
          ) : (
            /* TA Fields */
            <>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Research Project / Admin Head</label>
                  <input
                    type="text"
                    name="projectName"
                    value={taData.projectName}
                    onChange={handleTaChange}
                    placeholder="e.g. ICFRE National Forestry Project / General"
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Tour Type</label>
                  <select
                    name="tourType"
                    value={taData.tourType}
                    onChange={handleTaChange}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  >
                    <option value="Out-of-station">Out-of-station</option>
                    <option value="Local">Local Tour</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "24px" }}>
                  <input
                    type="checkbox"
                    id="officeTransportation"
                    name="officeTransportation"
                    checked={taData.officeTransportation}
                    onChange={handleTaChange}
                  />
                  <label htmlFor="officeTransportation" style={{ fontSize: "12px", color: "#334155", fontWeight: "600" }}>
                    Office Transport Provided? (Yes/No)
                  </label>
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Public Transportation Mode</label>
                  <select
                    name="publicTransportation"
                    value={taData.publicTransportation}
                    onChange={handleTaChange}
                    disabled={taData.officeTransportation}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  >
                    <option value="Train">Train</option>
                    <option value="Air">Air</option>
                    <option value="Bus">Bus</option>
                    <option value="Taxi/Auto">Taxi / Auto</option>
                    <option value="None">None</option>
                  </select>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>From Place</label>
                  <input
                    type="text"
                    name="fromPlace"
                    value={taData.fromPlace}
                    onChange={handleTaChange}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>To Place</label>
                  <input
                    type="text"
                    name="toPlace"
                    value={taData.toPlace}
                    onChange={handleTaChange}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Start Date</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={taData.fromDate}
                    onChange={handleTaChange}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>End Date</label>
                  <input
                    type="date"
                    name="toDate"
                    value={taData.toDate}
                    onChange={handleTaChange}
                    required
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
                  />
                </div>
              </div>

              {/* Financial Breakup */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "10px" }}>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Fare (₹)</label>
                  <input
                    type="number"
                    name="fare"
                    value={taData.fare}
                    onChange={handleTaChange}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Daily Allow. (₹)</label>
                  <input
                    type="number"
                    name="dailyAllowance"
                    value={taData.dailyAllowance}
                    onChange={handleTaChange}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Hotel / Acc. (₹)</label>
                  <input
                    type="number"
                    name="accommodationCharges"
                    value={taData.accommodationCharges}
                    onChange={handleTaChange}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "11px", fontWeight: "600", color: "#475569" }}>Adv. Adjusted (₹)</label>
                  <input
                    type="number"
                    name="advanceAdjusted"
                    value={taData.advanceAdjusted}
                    onChange={handleTaChange}
                    style={{ width: "100%", padding: "6px 10px", borderRadius: "6px", border: "1px solid #cbd5e1" }}
                  />
                </div>
              </div>
            </>
          )}

          {/* Net Amount Banner */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "10px",
              padding: "12px 16px",
              marginTop: "6px",
            }}
          >
            <div>
              <span style={{ fontSize: "12px", color: "#64748b", display: "block" }}>
                Gross Total: ₹{(claimType === "LTC" ? ltcGross : taGross).toLocaleString("en-IN")}
              </span>
              <span style={{ fontSize: "14px", fontWeight: "700", color: "#0f172a" }}>Net Payable Claim:</span>
            </div>
            <span style={{ fontSize: "18px", fontWeight: "800", color: "#0284c7" }}>
              ₹{(claimType === "LTC" ? ltcNet : taNet).toLocaleString("en-IN")}
            </span>
          </div>

          {/* Remarks */}
          <div>
            <label style={{ fontSize: "12px", fontWeight: "600", color: "#334155" }}>Official Remarks</label>
            <textarea
              name="remarks"
              value={claimType === "LTC" ? ltcData.remarks : taData.remarks}
              onChange={claimType === "LTC" ? handleLtcChange : handleTaChange}
              rows={2}
              placeholder="Enter sanctioned reference order or tour reason..."
              style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", marginTop: "4px" }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "10px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "9px 18px",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                background: "#ffffff",
                color: "#475569",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "9px 20px",
                borderRadius: "8px",
                border: "none",
                background: "#0284c7",
                color: "#ffffff",
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: "600",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Send size={15} /> {submitting ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
