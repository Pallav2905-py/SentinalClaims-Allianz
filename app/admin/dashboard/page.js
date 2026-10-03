'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import ClaimInvestigationConsole from '@/components/admin/ClaimInvestigationConsole';

const STATUS_CONFIG = {
  AWAITING_PROCESSING: { label: 'Awaiting', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', border: 'rgba(139,92,246,0.4)' },
  PROCESSING: { label: 'Processing', color: '#4f7aff', bg: 'rgba(79,122,255,0.15)', border: 'rgba(79,122,255,0.4)' },
  AWAITING_REVIEW: { label: 'Review', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)' },
  approved: { label: 'Approved', color: '#10b981', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)' },
  rejected: { label: 'Rejected', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)' },
  ERROR: { label: 'Error', color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)' },
  pending: { label: 'Pending', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' },
};

const RISK_CONFIG = {
  high: { color: '#f87171', label: 'HIGH', icon: '🔴' },
  medium: { color: '#fbbf24', label: 'MED', icon: '🟡' },
  low: { color: '#34d399', label: 'LOW', icon: '🟢' },
};

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    } else if (session) {
      fetchDashboardData();
    }
  }, [session, isPending, router]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/claims?limit=50', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch dashboard data');
      const data = await response.json();
      setStats(data.stats || {});
      setClaims(data.claims || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimSelect = (claim) => {
    setSelectedClaim(claim);
    setViewMode('console');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedClaim(null);
    fetchDashboardData();
  };

  const formatDate = (dateString) => {
    const d = new Date(dateString);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = !searchQuery ||
      claim._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.textDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || claim.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isPending || loading) {
    return (
      <div style={{
        minHeight: '100vh', background: '#0a0d14',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#4f7aff',
                animation: `bounce 1.4s ease-in-out infinite`,
                animationDelay: `${i * 150}ms`,
              }} />
            ))}
          </div>
          <div style={{ color: '#8892b0', fontSize: '14px' }}>Loading SentinelClaims...</div>
        </div>
        <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
      </div>
    );
  }

  if (viewMode === 'console' && selectedClaim) {
    return <ClaimInvestigationConsole claim={selectedClaim} onBack={handleBackToList} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', fontFamily: 'Inter, system-ui, sans-serif', color: '#f0f4ff' }}>

      {/* Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(10,13,20,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 32px',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #4f7aff, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', boxShadow: '0 4px 16px rgba(79,122,255,0.4)',
            }}>🛡️</div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#f0f4ff', letterSpacing: '-0.02em' }}>
                SentinelClaims
                <span style={{ marginLeft: '6px', fontSize: '11px', fontWeight: 600, color: '#4f7aff', background: 'rgba(79,122,255,0.15)', padding: '2px 7px', borderRadius: '100px', border: '1px solid rgba(79,122,255,0.3)', verticalAlign: 'middle' }}>
                  ADMIN
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#8892b0' }}>AI Fraud Detection Console</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '8px',
              background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
            }}>
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              <span style={{ fontSize: '12px', color: '#34d399', fontWeight: 500 }}>Live</span>
            </div>
            <Link
              href="/"
              style={{
                padding: '7px 14px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#8892b0', fontSize: '13px', textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
            >
              ← Home
            </Link>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px' }}>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: '20px', padding: '12px 16px',
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '10px', color: '#f87171', fontSize: '13px',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            ⚠ {error}
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>×</button>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Total Claims', value: stats.totalClaims || 0, icon: '📁', color: '#4f7aff', bg: 'rgba(79,122,255,0.1)', border: 'rgba(79,122,255,0.2)', sublabel: 'All time' },
              { label: 'Awaiting Review', value: stats.pendingClaims || 0, icon: '⏳', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)', sublabel: 'Need action' },
              { label: 'High Risk', value: stats.highRiskClaims || 0, icon: '🔴', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.2)', sublabel: 'Flagged by AI' },
              { label: 'Approved', value: stats.approvedClaims || 0, icon: '✅', color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.2)', sublabel: 'Paid out' },
            ].map(stat => (
              <div key={stat.label} style={{
                background: stat.bg,
                border: `1px solid ${stat.border}`,
                borderRadius: '14px', padding: '20px',
                position: 'relative', overflow: 'hidden',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, marginBottom: '6px' }}>{stat.label}</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: stat.color, lineHeight: 1, marginBottom: '4px' }}>{stat.value}</div>
                    <div style={{ fontSize: '11px', color: '#8892b0' }}>{stat.sublabel}</div>
                  </div>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: '12px',
                    background: `${stat.color}22`,
                    border: `1px solid ${stat.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px',
                  }}>{stat.icon}</div>
                </div>
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  height: '3px',
                  background: `linear-gradient(90deg, ${stat.color}, transparent)`,
                  opacity: 0.6,
                }} />
              </div>
            ))}
          </div>
        )}

        {/* Claims panel */}
        <div style={{
          background: 'rgba(20,25,38,0.8)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', overflow: 'hidden',
        }}>
          {/* Panel header */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '16px', flexWrap: 'wrap',
          }}>
            <div>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#f0f4ff' }}>Claims Queue</h2>
              <p style={{ fontSize: '12px', color: '#8892b0', marginTop: '2px' }}>Select a claim to launch the AI investigation console</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {/* Search */}
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search claims..."
                  style={{
                    padding: '8px 12px 8px 34px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: '#f0f4ff', fontSize: '13px',
                    outline: 'none', width: '200px',
                  }}
                />
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8892b0', fontSize: '14px' }}>🔍</span>
              </div>
              {/* Filter */}
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#f0f4ff', fontSize: '13px', cursor: 'pointer',
                  outline: 'none',
                }}
              >
                <option value="all" style={{ background: '#141926' }}>All Status</option>
                <option value="AWAITING_PROCESSING" style={{ background: '#141926' }}>Awaiting Processing</option>
                <option value="AWAITING_REVIEW" style={{ background: '#141926' }}>Awaiting Review</option>
                <option value="approved" style={{ background: '#141926' }}>Approved</option>
                <option value="rejected" style={{ background: '#141926' }}>Rejected</option>
              </select>
              {/* Refresh */}
              <button
                onClick={fetchDashboardData}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                  color: '#8892b0', cursor: 'pointer', fontSize: '16px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                ↻
              </button>
            </div>
          </div>

          {/* Claims list */}
          {filteredClaims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 40px' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#f0f4ff', marginBottom: '6px' }}>No claims found</div>
              <div style={{ fontSize: '13px', color: '#8892b0' }}>
                {searchQuery || filterStatus !== 'all' ? 'Try adjusting your filters' : 'Claims will appear here once submitted'}
              </div>
            </div>
          ) : (
            <div>
              {/* Table header */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 120px 40px',
                padding: '10px 24px',
                background: 'rgba(255,255,255,0.02)',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                fontSize: '11px', fontWeight: 600, color: '#8892b0',
                textTransform: 'uppercase', letterSpacing: '0.06em', gap: '12px',
              }}>
                <span>Claim</span>
                <span>Status</span>
                <span>Risk</span>
                <span>Score</span>
                <span>Submitted</span>
                <span></span>
              </div>

              {filteredClaims.map((claim, idx) => {
                const statusCfg = STATUS_CONFIG[claim.status] || { label: claim.status, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.2)' };
                const riskCfg = RISK_CONFIG[claim.fraudAnalysis?.riskLevel];
                const fraudScore = claim.fraudAnalysis?.fraudProbability;

                return (
                  <div
                    key={claim._id}
                    onClick={() => handleClaimSelect(claim)}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 120px 100px 100px 120px 40px',
                      padding: '14px 24px', gap: '12px',
                      borderBottom: idx < filteredClaims.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                      cursor: 'pointer', alignItems: 'center',
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(79,122,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    {/* Claim info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: '12px', fontWeight: 700, color: '#4f7aff',
                        }}>
                          #{claim._id?.slice(-8).toUpperCase()}
                        </span>
                        {claim.uploadedFiles?.length > 0 && (
                          <span style={{ fontSize: '11px', color: '#8892b0' }}>📎 {claim.uploadedFiles.length}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: '#8892b0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '400px' }}>
                        {claim.textDescription || 'No description'}
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center',
                        padding: '3px 10px', borderRadius: '100px',
                        background: statusCfg.bg,
                        border: `1px solid ${statusCfg.border}`,
                        color: statusCfg.color,
                        fontSize: '11px', fontWeight: 600,
                      }}>
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Risk */}
                    <div>
                      {riskCfg ? (
                        <span style={{ fontSize: '13px', color: riskCfg.color, fontWeight: 700 }}>
                          {riskCfg.icon} {riskCfg.label}
                        </span>
                      ) : (
                        <span style={{ color: '#8892b0', fontSize: '12px' }}>—</span>
                      )}
                    </div>

                    {/* Score bar */}
                    <div>
                      {fraudScore !== undefined ? (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            <span style={{
                              fontSize: '12px', fontWeight: 700,
                              color: fraudScore > 0.6 ? '#f87171' : fraudScore > 0.3 ? '#fbbf24' : '#34d399',
                            }}>
                              {(fraudScore * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.08)', width: '60px' }}>
                            <div style={{
                              height: '100%', borderRadius: '2px',
                              width: `${(fraudScore * 100)}%`,
                              background: fraudScore > 0.6 ? '#ef4444' : fraudScore > 0.3 ? '#f59e0b' : '#10b981',
                            }} />
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#8892b0', fontSize: '12px' }}>—</span>
                      )}
                    </div>

                    {/* Date */}
                    <div style={{ fontSize: '12px', color: '#8892b0' }}>
                      {formatDate(claim.createdAt)}
                    </div>

                    {/* Arrow */}
                    <div style={{ color: '#8892b0', fontSize: '16px', textAlign: 'center' }}>›</div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Footer */}
          <div style={{
            padding: '12px 24px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            fontSize: '12px', color: '#8892b0',
          }}>
            <span>Showing {filteredClaims.length} of {claims.length} claims</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              AI agents ready
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
