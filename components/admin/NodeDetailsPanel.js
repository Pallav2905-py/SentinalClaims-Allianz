'use client';

export default function NodeDetailsPanel({ step, onClose }) {
  if (!step) return null;

  const AGENT_CONFIG = {
    'planner-agent': { name: 'Planner Agent', icon: '🎯', color: '#4f7aff', colorDim: 'rgba(79,122,255,0.15)' },
    'cyber-agent': { name: 'Security Agent', icon: '🔒', color: '#a78bfa', colorDim: 'rgba(167,139,250,0.15)' },
    'coverage-agent': { name: 'Coverage Agent', icon: '📋', color: '#06b6d4', colorDim: 'rgba(6,182,212,0.15)' },
    'weather-agent': { name: 'Weather Agent', icon: '🌤️', color: '#22d3ee', colorDim: 'rgba(34,211,238,0.15)' },
    'fraud-agent': { name: 'Fraud Detection', icon: '🔍', color: '#f87171', colorDim: 'rgba(248,113,113,0.15)' },
    'payout-agent': { name: 'Payout Agent', icon: '💰', color: '#34d399', colorDim: 'rgba(52,211,153,0.15)' },
    'audit-agent': { name: 'Audit Agent', icon: '✅', color: '#94a3b8', colorDim: 'rgba(148,163,184,0.15)' },
  };

  const config = AGENT_CONFIG[step.agent] || { name: step.agent, icon: '⚙️', color: '#94a3b8', colorDim: 'rgba(148,163,184,0.15)' };

  const decisionColor = (d) => {
    if (['continue', 'covered', 'matched', 'recommend-pay', 'approve', 'low'].includes(d)) return { color: '#34d399', bg: 'rgba(52,211,153,0.12)' };
    if (['medium', 'manual-review'].includes(d)) return { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)' };
    if (['stop', 'not-covered', 'not-matched', 'recommend-deny', 'reject', 'high'].includes(d)) return { color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
    return { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' };
  };
  const dc = decisionColor(step.decision);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)', zIndex: 48,
        }}
      />

      {/* Panel */}
      <div style={{
        position: 'fixed', inset: '0 0 0 auto',
        width: '380px', zIndex: 50,
        background: '#0d1120',
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        display: 'flex', flexDirection: 'column',
        fontFamily: 'Inter, sans-serif',
        animation: 'slideInRight 0.25s ease-out',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          background: `linear-gradient(135deg, ${config.colorDim}, rgba(13,17,32,0.8))`,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '12px',
            background: config.colorDim,
            border: `1.5px solid ${config.color}66`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px',
          }}>
            {config.icon}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#f0f4ff' }}>{config.name}</div>
            <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>Agent Details</div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#8892b0', cursor: 'pointer', fontSize: '16px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Summary */}
          <div style={{
            padding: '12px 14px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Summary</div>
            <p style={{ fontSize: '13px', color: '#c8d3f5', lineHeight: 1.6, margin: 0 }}>{step.summary}</p>
          </div>

          {/* Decision */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1, padding: '12px', background: dc.bg, border: `1px solid ${dc.color}33`, borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Decision</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: dc.color }}>
                {step.decision?.replace('-', ' ').toUpperCase()}
              </div>
            </div>
            <div style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Duration</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff' }}>
                {step.durationMs}ms
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {[
              { label: 'Started', value: new Date(step.startedAt).toLocaleTimeString() },
              { label: 'Finished', value: new Date(step.finishedAt).toLocaleTimeString() },
            ].map(t => (
              <div key={t.label} style={{ padding: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px' }}>
                <div style={{ fontSize: '10px', color: '#8892b0', marginBottom: '2px' }}>{t.label}</div>
                <div style={{ fontSize: '12px', color: '#f0f4ff', fontWeight: 500 }}>{t.value}</div>
              </div>
            ))}
          </div>

          {/* Output */}
          {step.details && (
            <div>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>Agent Output</div>
              <div style={{
                background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '10px', padding: '12px',
                maxHeight: '320px', overflowY: 'auto',
              }}>
                <pre style={{
                  fontSize: '11px', color: '#94a3b8',
                  fontFamily: 'JetBrains Mono, monospace',
                  whiteSpace: 'pre-wrap', margin: 0, lineHeight: 1.6,
                }}>
                  {JSON.stringify(step.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(24px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </>
  );
}
