import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FileText,
  Clock3,
  CheckCircle2,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  X,
  IndianRupee,
  Plane,
  HeartPulse,
  Home,
  Briefcase,
  ArrowLeft,
  Calendar,
} from 'lucide-react';
import { fetchAllEmployeeClaims } from './services/claimsService';
import './EmployeeClaimsPage.css';

const formatINR = (val) => {
  const num = Number(val) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatDate = (val) => {
  if (!val) return 'Date unavailable';
  const d = new Date(val);
  if (Number.isNaN(d.getTime())) return 'Date unavailable';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const getCategoryIcon = (type) => {
  const t = String(type || '').toUpperCase();
  if (t.includes('TA')) return <Plane size={18} />;
  if (t.includes('MED')) return <HeartPulse size={18} />;
  if (t.includes('ACCOM')) return <Home size={18} />;
  return <Briefcase size={18} />;
};

const formatStatus = (raw) => {
  if (!raw) return 'Submitted';
  return String(raw)
    .replace(/_/g, ' ')
    .replace(/hod/gi, 'HOD')
    .replace(/hoa/gi, 'HOA')
    .replace(/fo/gi, 'FO')
    .replace(/clerk/gi, 'Clerk')
    .replace(/\w/g, (char) => char.toUpperCase());
};

export default function EmployeeClaimsPage() {
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.auth?.user);

  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [selectedYear, setSelectedYear] = useState('ALL');
  const [selectedClaim, setSelectedClaim] = useState(null);

  const loadClaims = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const data = await fetchAllEmployeeClaims();
      setClaims(data || []);
    } catch (err) {
      console.error('Failed to load employee claims:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // Extract all distinct years available in claims
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    claims.forEach((c) => {
      const d = new Date(c.createdAt);
      if (!Number.isNaN(d.getTime())) {
        yearsSet.add(d.getFullYear());
      }
    });
    // Ensure current year is always present
    yearsSet.add(new Date().getFullYear());
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [claims]);

  // 1. Filter claims by Selected Year first (for year-scoped stats)
  const yearFilteredClaims = useMemo(() => {
    if (selectedYear === 'ALL') return claims;
    return claims.filter((item) => {
      const d = new Date(item.createdAt);
      return !Number.isNaN(d.getTime()) && String(d.getFullYear()) === String(selectedYear);
    });
  }, [claims, selectedYear]);

  // 2. Compute Metric summaries for the selected year
  const stats = useMemo(() => {
    const total = yearFilteredClaims.length;
    const pending = yearFilteredClaims.filter((c) =>
      ['submitted', 'pending', 'verified', 'under_review', 'draft'].includes(c.status) ||
      String(c.status).toLowerCase().startsWith('pending')
    ).length;
    const approvedList = yearFilteredClaims.filter((c) =>
      ['approved', 'sanctioned', 'paid', 'completed', 'settled'].includes(c.status)
    );
    const approved = approvedList.length;
    const totalVal = yearFilteredClaims.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);
    const approvedVal = approvedList.reduce((acc, c) => acc + (Number(c.amount) || 0), 0);

    return { total, pending, approved, totalVal, approvedVal };
  }, [yearFilteredClaims]);

  // 3. Further filter by Category and Search query for the display list
  const filteredClaims = useMemo(() => {
    return yearFilteredClaims.filter((item) => {
      const matchCategory =
        activeCategory === 'ALL' ||
        String(item.claimType || '').toUpperCase().includes(activeCategory);

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        q === '' ||
        String(item.applicationId || '').toLowerCase().includes(q) ||
        String(item.claimType || '').toLowerCase().includes(q) ||
        String(item.status || '').toLowerCase().includes(q);

      return matchCategory && matchSearch;
    });
  }, [yearFilteredClaims, activeCategory, searchQuery]);

  return (
    <div className="ec-page">
      <div className="ec-container">
        {/* Header with Back Button */}
        <div className="ec-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="button"
              className="ec-button ec-button-primary"
              onClick={() => navigate(-1)}
              style={{
                padding: '8px 16px',
                borderRadius: 10,
                display: 'inline-flex',
                alignItems: 'center',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 13,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
              }}
              title="Go back"
            >
              <ArrowLeft size={16} style={{ marginRight: 6 }} />
              Back
            </button>
            <div>
              <p className="ec-eyebrow">Finance Management System</p>
              <h1>My Claims</h1>
              <p className="ec-subtitle">
                Track and monitor all your submitted travel, medical, and allowance claims.
              </p>
            </div>
          </div>
          <div className="ec-header-actions">
            <button
              type="button"
              className="ec-button ec-button-secondary"
              onClick={() => loadClaims(true)}
              disabled={refreshing || loading}
            >
              <RefreshCw size={15} className={refreshing ? 'ec-spin' : ''} style={{ marginRight: 6 }} />
              Refresh
            </button>
          </div>
        </div>

        {/* 4 Stat Cards (Updated dynamically by Year) */}
        <div className="ec-stats">
          <div className="ec-stat-card">
            <div className="ec-stat-top">
              <span>Total Claims</span>
              <span className="ec-stat-icon ec-blue">
                <FileText size={18} />
              </span>
            </div>
            <div className="ec-count">{stats.total}</div>
            <p className="ec-stat-money">
              {selectedYear === 'ALL' ? 'All submitted claims' : `Submitted in ${selectedYear}`}
            </p>
          </div>

          <div className="ec-stat-card">
            <div className="ec-stat-top">
              <span>Pending Review</span>
              <span className="ec-stat-icon ec-orange">
                <Clock3 size={18} />
              </span>
            </div>
            <div className="ec-count">{stats.pending}</div>
            <p className="ec-stat-money">Awaiting decision</p>
          </div>

          <div className="ec-stat-card">
            <div className="ec-stat-top">
              <span>Approved Claims</span>
              <span className="ec-stat-icon ec-green">
                <CheckCircle2 size={18} />
              </span>
            </div>
            <div className="ec-count">{stats.approved}</div>
            <p className="ec-stat-money">Approved or settled</p>
          </div>

          <div className="ec-stat-card">
            <div className="ec-stat-top">
              <span>Total Claim Value</span>
              <span className="ec-stat-icon ec-purple">
                <IndianRupee size={18} />
              </span>
            </div>
            <div className="ec-count">{formatINR(stats.totalVal)}</div>
            <p className="ec-stat-money">Approved value: {formatINR(stats.approvedVal)}</p>
          </div>
        </div>

        {/* Filter Controls: Categories, Year Selector, and Search */}
        <div
          className="ec-overview-header"
          style={{
            marginTop: 28,
            marginBottom: 20,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {['ALL', 'TA', 'LTC', 'MEDICAL', 'ACCOMMODATION'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`ec-button ${activeCategory === cat ? 'ec-button-primary' : 'ec-button-secondary'}`}
                style={{ fontSize: 12, padding: '7px 14px' }}
              >
                {cat === 'ALL' ? 'All Claims' : cat}
              </button>
            ))}
          </div>

          {/* Right Controls: Year Filter + Search Bar */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Year Dropdown Filter */}
            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
              <Calendar
                size={15}
                style={{ position: 'absolute', left: 12, color: '#64748b', pointerEvents: 'none' }}
              />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                style={{
                  padding: '8px 14px 8px 34px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#1e293b',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                }}
              >
                <option value="ALL">All Years</option>
                {availableYears.map((yr) => (
                  <option key={yr} value={String(yr)}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="ec-search" style={{ position: 'relative', minWidth: 240 }}>
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94a3b8',
                }}
              />
              <input
                type="text"
                placeholder="Search claims..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px 9px 36px',
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        {/* Claims List Section */}
        <section className="ec-section">
          <div className="ec-section-header">
            <h2 className="ec-section-title">
              <span className="ec-section-icon ec-icon-pending">
                <FileText size={18} />
              </span>
              Submitted Claims
              <span className="ec-count">{filteredClaims.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className="ec-loading" style={{ padding: 48, textAlign: 'center', color: '#64748b' }}>
              <RefreshCw size={24} className="ec-spin" style={{ margin: '0 auto 12px' }} />
              <p style={{ margin: 0, fontSize: 14 }}>Loading claims records...</p>
            </div>
          ) : filteredClaims.length === 0 ? (
            <div className="ec-empty">
              <div className="ec-empty-icon">
                <FileText size={28} />
              </div>
              <h3>No claims found</h3>
              <p>
                No claims match {selectedYear !== 'ALL' ? `year ${selectedYear} and ` : ''}your active category or search query.
              </p>
            </div>
          ) : (
            <div className="ec-claim-list">
              {filteredClaims.map((claim) => {
                const isAppr = ['approved', 'sanctioned', 'paid', 'completed'].includes(claim.status);
                const isRej = ['rejected', 'declined', 'cancelled'].includes(claim.status);
                const statusClass = isAppr
                  ? 'ec-status ec-status-approved'
                  : isRej
                  ? 'ec-status ec-status-rejected'
                  : 'ec-status ec-status-pending';

                return (
                  <div key={claim.id} className="ec-claim-row">
                    <div className="ec-claim-type-icon">
                      {getCategoryIcon(claim.claimType)}
                    </div>

                    <div className="ec-claim-main">
                      <div className="ec-claim-info">
                        <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>
                          {claim.applicationId}
                        </h4>
                        <div className="ec-claim-meta" style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>
                            {claim.claimType} Claim
                          </span>
                          <span className="ec-meta-dot">&bull;</span>
                          <span className="ec-date">{formatDate(claim.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ec-claim-right">
                      <div className="ec-claim-amount" style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: 15, fontWeight: 800, color: '#0f172a' }}>
                          {formatINR(claim.amount)}
                        </span>
                      </div>

                      <span className={statusClass}>
                        {isAppr ? <CheckCircle2 size={13} /> : isRej ? <XCircle size={13} /> : <Clock3 size={13} />}
                        <span>{formatStatus(claim.status)}</span>
                      </span>

                      <button
                        type="button"
                        className="ec-button ec-button-secondary"
                        onClick={() => setSelectedClaim(claim)}
                        style={{ padding: '6px 14px', fontSize: 12, fontWeight: 600 }}
                      >
                        <Eye size={13} style={{ marginRight: 5 }} />
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Modal for Details */}
        {selectedClaim && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              backgroundColor: 'rgba(15, 23, 42, 0.5)',
              backdropFilter: 'blur(3px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 16,
            }}
            onClick={() => setSelectedClaim(null)}
          >
            <div
              style={{
                background: '#fff',
                borderRadius: 16,
                maxWidth: 540,
                width: '100%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                overflow: 'hidden',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  padding: '18px 24px',
                  borderBottom: '1px solid #f1f5f9',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                    Claim Details: {selectedClaim.applicationId}
                  </h3>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    Category: {selectedClaim.claimType}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedClaim(null)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
                >
                  <X size={20} />
                </button>
              </div>

              <div style={{ padding: 24, fontSize: 13, lineHeight: 1.8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 700 }}>AMOUNT</span>
                    <strong style={{ fontSize: 16, color: '#276fb5' }}>{formatINR(selectedClaim.amount)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 700 }}>STATUS</span>
                    <strong>{formatStatus(selectedClaim.status)}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 700 }}>SUBMITTED ON</span>
                    <span>{formatDate(selectedClaim.createdAt)}</span>
                  </div>
                  <div>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 700 }}>REFERENCE ID</span>
                    <span>{selectedClaim.id || selectedClaim.applicationId}</span>
                  </div>
                </div>

                {selectedClaim.purpose && (
                  <div style={{ marginBottom: 12 }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 700 }}>PURPOSE</span>
                    <p style={{ margin: '4px 0 0', color: '#1e293b' }}>{selectedClaim.purpose}</p>
                  </div>
                )}

                {selectedClaim.remarks && (
                  <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, marginTop: 12 }}>
                    <span style={{ color: '#64748b', display: 'block', fontSize: 11, fontWeight: 700 }}>REMARKS</span>
                    <p style={{ margin: '4px 0 0', color: '#334155' }}>{selectedClaim.remarks}</p>
                  </div>
                )}
              </div>

              <div style={{ padding: '14px 24px', background: '#f8fafc', borderTop: '1px solid #f1f5f9', textAlign: 'right' }}>
                <button
                  type="button"
                  className="ec-button ec-button-primary"
                  onClick={() => setSelectedClaim(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
