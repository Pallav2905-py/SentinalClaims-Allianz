'use client';

import { useState } from 'react';

export default function ProcessingResults({ data, claimId }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [toast, setToast] = useState(null);

  const { fraudAnalysis, payoutDecision, auditSummary } = data;

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = async () => {
    if (!confirm('Approve this claim and authorize payout?')) return;
    setApproving(true);
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/approve`, {
        method: 'POST', credentials: 'include',
      });
      if (response.ok) {
        showToast('Claim approved successfully ✓');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('Failed to approve claim', 'error');
      }
    } catch {
      showToast('Error approving claim', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    setRejecting(true);
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes: reason }),
        credentials: 'include',
      });
      if (response.ok) {
        showToast('Claim rejected');
        setTimeout(() => window.location.reload(), 1500);
      } else {
        showToast('Failed to reject claim', 'error');
      }
    } catch {
      showToast('Error rejecting claim', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const riskColor = {
    high: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)' },
    medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
    low: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)' },
  }[fraudAnalysis?.riskLevel] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' };

  const recColor = {
    approve: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.35)' },
    'manual-review': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.35)' },
    reject: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.35)' },
  }[auditSummary?.humanRecommendation] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' };

  const fraudPct = ((fraudAnalysis?.fraudProbability || 0) * 100).toFixed(1);
  const fraudNum = parseFloat(fraudPct);

  const tabs = [
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'fraud', label: 'Fraud Analysis', icon: '🔍' },
    { id: 'payout', label: 'Payout', icon: '💰' },
  ];

  return (
    <div style={{
      background: 'rgba(14,18,30,0.9)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif', color: '#f0f4ff',
    }}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '12px 20px', borderRadius: '10px',
          background: toast.type === 'error' ? 'rgba(239,68,68,0.95)' : 'rgba(16,185,129,0.95)',
          color: 'white', fontSize: '13px', fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          animation: 'slideInRight 0.3s ease-out',
        }}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#f0f4ff' }}>Investigation Results</div>
          <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>AI-powered analysis complete</div>
        </div>
        <div style={{
          padding: '5px 14px', borderRadius: '100px',
          background: recColor.bg, border: `1px solid ${recColor.border}`,
          color: recColor.color, fontSize: '11px', fontWeight: 700,
          letterSpacing: '0.05em',
        }}>
          {(auditSummary?.humanRecommendation || 'PENDING').replace('-', ' ').toUpperCase()}
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        padding: '0 8px',
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '10px 16px', border: 'none', background: 'none',
              color: activeTab === tab.id ? '#4f7aff' : '#8892b0',
              fontSize: '13px', fontWeight: activeTab === tab.id ? 600 : 500,
              cursor: 'pointer',
              borderBottom: activeTab === tab.id ? '2px solid #4f7aff' : '2px solid transparent',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>{tab.icon}</span><span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div style={{ padding: '20px' }}>
        {/* SUMMARY TAB */}
        {activeTab === 'summary' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* AI Summary */}
            <div style={{
              padding: '16px',
              background: 'rgba(79,122,255,0.08)',
              border: '1px solid rgba(79,122,255,0.2)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#7b9fff', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                AI Audit Summary
              </div>
              <p style={{ fontSize: '13px', color: '#c8d3f5', lineHeight: 1.6, margin: 0 }}>
                {auditSummary?.summary || 'Analysis complete. Human review recommended.'}
              </p>
            </div>

            {/* Key metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {/* Risk */}
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Risk Level</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    padding: '4px 12px', borderRadius: '8px',
                    background: riskColor.bg, border: `1px solid ${riskColor.border}`,
                    color: riskColor.color, fontSize: '13px', fontWeight: 700,
                  }}>
                    {(fraudAnalysis?.riskLevel || 'N/A').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Fraud probability */}
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Fraud Probability</div>
                <div style={{ fontSize: '24px', fontWeight: 800, color: fraudNum > 60 ? '#f87171' : fraudNum > 30 ? '#fbbf24' : '#34d399', lineHeight: 1 }}>
                  {fraudPct}%
                </div>
                <div style={{ marginTop: '6px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                  <div style={{
                    height: '100%', borderRadius: '4px', width: `${fraudNum}%`,
                    background: fraudNum > 60 ? 'linear-gradient(90deg, #f87171, #ef4444)' : fraudNum > 30 ? 'linear-gradient(90deg, #fbbf24, #f59e0b)' : 'linear-gradient(90deg, #34d399, #10b981)',
                  }} />
                </div>
              </div>

              {/* Recommended payout */}
              <div style={{ padding: '14px', background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Recommended Payout</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#34d399' }}>
                  {payoutDecision?.currency || 'AUD'} ${(payoutDecision?.recommendedPayout || 0).toFixed(2)}
                </div>
              </div>

              {/* Claimed amount */}
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
                <div style={{ fontSize: '10px', color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Claimed Amount</div>
                <div style={{ fontSize: '20px', fontWeight: 800, color: '#f0f4ff' }}>
                  {payoutDecision?.currency || 'AUD'} ${(payoutDecision?.claimedAmount || 0).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Key checks */}
            {auditSummary?.keyChecks?.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Key Checks Performed
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {auditSummary.keyChecks.map((check, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px',
                      background: 'rgba(16,185,129,0.07)',
                      border: '1px solid rgba(16,185,129,0.15)',
                      borderRadius: '8px', fontSize: '12px', color: '#c8d3f5',
                    }}>
                      <span style={{ color: '#34d399', fontSize: '14px', flexShrink: 0 }}>✓</span>
                      <span>{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button
                onClick={handleApprove}
                disabled={approving}
                style={{
                  flex: 1, padding: '12px',
                  background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.35)',
                  borderRadius: '10px', color: '#34d399', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: approving ? 0.6 : 1,
                }}
              >
                ✓ Approve Claim
              </button>
              <button
                onClick={handleReject}
                disabled={rejecting}
                style={{
                  flex: 1, padding: '12px',
                  background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.35)',
                  borderRadius: '10px', color: '#f87171', fontSize: '13px', fontWeight: 600,
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  opacity: rejecting ? 0.6 : 1,
                }}
              >
                ✕ Reject Claim
              </button>
            </div>
          </div>
        )}

        {/* FRAUD TAB */}
        {activeTab === 'fraud' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {fraudAnalysis?.explanation && (
              <div style={{
                padding: '14px', background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
              }}>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>AI Analysis</div>
                <p style={{ fontSize: '13px', color: '#c8d3f5', lineHeight: 1.65, margin: 0, whiteSpace: 'pre-wrap' }}>
                  {fraudAnalysis.explanation}
                </p>
              </div>
            )}

            {fraudAnalysis?.comprehensiveAnalysis?.perspectives && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Multi-Angle Assessment</div>
                {Object.entries(fraudAnalysis.comprehensiveAnalysis.perspectives).map(([key, p]) => (
                  <div key={key} style={{
                    marginBottom: '8px', padding: '12px',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#f0f4ff', textTransform: 'capitalize' }}>{key} Perspective</span>
                      <span style={{
                        padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600,
                        background: 'rgba(255,255,255,0.08)', color: '#8892b0',
                      }}>{p.assessment}</span>
                    </div>
                    {p.flags?.length > 0 && (
                      <ul style={{ margin: 0, paddingLeft: '16px' }}>
                        {p.flags.map((flag, i) => (
                          <li key={i} style={{ fontSize: '12px', color: '#8892b0', marginBottom: '3px' }}>{flag}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Indicators */}
            {fraudAnalysis?.comprehensiveAnalysis?.indicators && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                {fraudAnalysis.comprehensiveAnalysis.indicators.leading?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#fbbf24', textTransform: 'uppercase', marginBottom: '6px' }}>⚠ Leading Indicators</div>
                    {fraudAnalysis.comprehensiveAnalysis.indicators.leading.map((ind, i) => (
                      <div key={i} style={{ marginBottom: '6px', padding: '10px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#fbbf24' }}>{ind.type}</div>
                        <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>{ind.description}</div>
                      </div>
                    ))}
                  </div>
                )}
                {fraudAnalysis.comprehensiveAnalysis.indicators.lagging?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#7b9fff', textTransform: 'uppercase', marginBottom: '6px' }}>ℹ Lagging Indicators</div>
                    {fraudAnalysis.comprehensiveAnalysis.indicators.lagging.map((ind, i) => (
                      <div key={i} style={{ marginBottom: '6px', padding: '10px', background: 'rgba(79,122,255,0.08)', border: '1px solid rgba(79,122,255,0.2)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 700, color: '#7b9fff' }}>{ind.type}</div>
                        <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>{ind.description}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Recommended actions */}
            {fraudAnalysis?.comprehensiveAnalysis?.recommendedActions?.length > 0 && (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Recommended Actions</div>
                {fraudAnalysis.comprehensiveAnalysis.recommendedActions.map((action, i) => (
                  <div key={i} style={{
                    marginBottom: '6px', padding: '10px 12px',
                    background: 'rgba(79,122,255,0.07)', border: '1px solid rgba(79,122,255,0.15)',
                    borderRadius: '8px', display: 'flex', gap: '10px', alignItems: 'flex-start',
                  }}>
                    <span style={{
                      padding: '2px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, flexShrink: 0,
                      background: action.priority === 'high' ? 'rgba(239,68,68,0.2)' : action.priority === 'medium' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                      color: action.priority === 'high' ? '#f87171' : action.priority === 'medium' ? '#fbbf24' : '#34d399',
                    }}>
                      {(action.priority || 'low').toUpperCase()}
                    </span>
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#f0f4ff' }}>{action.action}</div>
                      <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>{action.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PAYOUT TAB */}
        {activeTab === 'payout' && payoutDecision && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Calculation */}
            <div style={{
              padding: '16px',
              background: 'rgba(52,211,153,0.07)',
              border: '1px solid rgba(52,211,153,0.2)',
              borderRadius: '12px',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Payout Calculation
              </div>
              {[
                { label: 'Claimed Amount', value: `${payoutDecision.currency} $${(payoutDecision.claimedAmount || 0).toFixed(2)}`, color: '#f0f4ff' },
                { label: 'Coverage Limit', value: `${payoutDecision.currency} $${(payoutDecision.coverageLimit || 0).toFixed(2)}`, color: '#f0f4ff' },
                { label: 'Deductible', value: `− ${payoutDecision.currency} $${(payoutDecision.deductible || 0).toFixed(2)}`, color: '#f87171' },
                { label: 'Risk Multiplier', value: `× ${(payoutDecision.riskMultiplier || 1).toFixed(2)}`, color: '#fbbf24' },
              ].map(row => (
                <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span style={{ color: '#8892b0' }}>{row.label}</span>
                  <span style={{ color: row.color, fontWeight: 600 }}>{row.value}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid rgba(52,211,153,0.25)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff' }}>Recommended Payout</span>
                <span style={{ fontSize: '24px', fontWeight: 800, color: '#34d399' }}>
                  {payoutDecision.currency} ${(payoutDecision.recommendedPayout || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Eligibility */}
            <div style={{
              padding: '14px 16px',
              background: payoutDecision.eligible ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
              border: `1px solid ${payoutDecision.eligible ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
              borderRadius: '12px',
              display: 'flex', alignItems: 'center', gap: '12px',
            }}>
              <div style={{ fontSize: '24px' }}>{payoutDecision.eligible ? '✅' : '❌'}</div>
              <div>
                <div style={{
                  fontSize: '14px', fontWeight: 700,
                  color: payoutDecision.eligible ? '#34d399' : '#f87171',
                  marginBottom: '3px',
                }}>
                  {payoutDecision.eligible ? 'ELIGIBLE FOR PAYOUT' : 'NOT ELIGIBLE'}
                </div>
                <div style={{ fontSize: '12px', color: '#8892b0' }}>
                  {payoutDecision.reason || 'No reason provided'}
                </div>
              </div>
            </div>

            {/* Fast track */}
            {payoutDecision.fastTrack && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(79,122,255,0.08)',
                border: '1px solid rgba(79,122,255,0.25)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '18px' }}>⚡</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#7b9fff' }}>Fast Track Eligible</div>
                  <div style={{ fontSize: '11px', color: '#8892b0' }}>This claim qualifies for expedited processing</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
