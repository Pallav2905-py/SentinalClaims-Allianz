'use client';

import { useState } from 'react';

const AGENT_CONFIG = {
  'planner-agent': { name: 'Planner Agent', icon: '🎯', color: '#4f7aff', colorDim: 'rgba(79,122,255,0.12)', colorBorder: 'rgba(79,122,255,0.35)', description: 'Orchestrates and routes claim to agents' },
  'cyber-agent': { name: 'Security Agent', icon: '🔒', color: '#a78bfa', colorDim: 'rgba(167,139,250,0.12)', colorBorder: 'rgba(167,139,250,0.35)', description: 'Validates security & data handling' },
  'coverage-agent': { name: 'Coverage Agent', icon: '📋', color: '#06b6d4', colorDim: 'rgba(6,182,212,0.12)', colorBorder: 'rgba(6,182,212,0.35)', description: 'Evaluates policy coverage eligibility' },
  'weather-agent': { name: 'Weather Agent', icon: '🌤️', color: '#22d3ee', colorDim: 'rgba(34,211,238,0.12)', colorBorder: 'rgba(34,211,238,0.35)', description: 'Verifies incident weather conditions' },
  'fraud-agent': { name: 'Fraud Detection', icon: '🔍', color: '#f87171', colorDim: 'rgba(248,113,113,0.12)', colorBorder: 'rgba(248,113,113,0.35)', description: 'Multi-angle fraud risk analysis' },
  'payout-agent': { name: 'Payout Agent', icon: '💰', color: '#34d399', colorDim: 'rgba(52,211,153,0.12)', colorBorder: 'rgba(52,211,153,0.35)', description: 'Calculates recommended payout amount' },
  'audit-agent': { name: 'Audit Agent', icon: '✅', color: '#94a3b8', colorDim: 'rgba(148,163,184,0.12)', colorBorder: 'rgba(148,163,184,0.35)', description: 'Final audit and human recommendation' },
};

const DECISION_STYLES = {
  continue: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: '✓' },
  covered: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: '✓' },
  matched: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: '✓' },
  'recommend-pay': { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: '✓' },
  approve: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: '✓' },
  low: { color: '#34d399', bg: 'rgba(52,211,153,0.12)', border: 'rgba(52,211,153,0.3)', icon: '✓' },
  stop: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', icon: '✕' },
  'not-covered': { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', icon: '✕' },
  'not-matched': { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', icon: '✕' },
  'recommend-deny': { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', icon: '✕' },
  reject: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', icon: '✕' },
  high: { color: '#f87171', bg: 'rgba(248,113,113,0.12)', border: 'rgba(248,113,113,0.3)', icon: '⚠' },
  medium: { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', icon: '~' },
  'manual-review': { color: '#fbbf24', bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.3)', icon: '~' },
};

export default function AgentWorkflowGraph({ workflow, processing, onStepSelect, activeStep }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  if (!workflow?.steps) return null;

  const toggleStep = (index) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) newExpanded.delete(index);
    else newExpanded.add(index);
    setExpandedSteps(newExpanded);
  };

  const totalDurationMs = workflow.steps.reduce((sum, s) => sum + (s.durationMs || 0), 0);

  return (
    <div style={{
      background: 'rgba(14,18,30,0.9)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      fontFamily: 'Inter, sans-serif',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#f0f4ff' }}>Agent Timeline</div>
          <div style={{ fontSize: '11px', color: '#8892b0', marginTop: '2px' }}>
            {workflow.durationSeconds ? `Pipeline completed in ${workflow.durationSeconds}s` : 'In progress...'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {workflow.models && (
            <div style={{
              fontSize: '10px', color: '#8892b0',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              padding: '4px 10px', borderRadius: '6px',
            }}>
              Model: <span style={{ color: '#7b9fff' }}>{workflow.models.primary?.split('/').pop() || 'AI'}</span>
            </div>
          )}
          <div style={{
            fontSize: '12px', fontWeight: 600, color: '#34d399',
            background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)',
            padding: '4px 12px', borderRadius: '100px',
          }}>
            {workflow.steps.length} agents ✓
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)' }}>
        <div style={{
          height: '100%',
          width: processing ? '60%' : '100%',
          background: 'linear-gradient(90deg, #4f7aff, #10b981)',
          transition: 'width 0.5s ease',
        }} />
      </div>

      {/* Steps */}
      <div style={{ padding: '12px' }}>
        {workflow.steps.map((step, index) => {
          const config = AGENT_CONFIG[step.agent] || {
            name: step.agent,
            icon: '⚙️',
            color: '#94a3b8',
            colorDim: 'rgba(148,163,184,0.12)',
            colorBorder: 'rgba(148,163,184,0.35)',
            description: 'AI Processing Agent',
          };
          const decisionStyle = DECISION_STYLES[step.decision] || { color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', icon: '•' };
          const isExpanded = expandedSteps.has(index);
          const durationPct = totalDurationMs ? ((step.durationMs || 0) / totalDurationMs * 100).toFixed(0) : 0;

          return (
            <div key={index} style={{ marginBottom: '8px' }}>
              {/* Connector line */}
              {index > 0 && (
                <div style={{
                  width: '1px', height: '12px', margin: '0 auto',
                  marginLeft: '31px',
                  background: 'linear-gradient(180deg, rgba(79,122,255,0.4), rgba(79,122,255,0.1))',
                }} />
              )}

              <div style={{
                borderRadius: '12px',
                border: `1px solid ${config.colorBorder}`,
                background: config.colorDim,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
              }}>
                <button
                  onClick={() => toggleStep(index)}
                  style={{
                    width: '100%', padding: '12px 14px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                    background: 'none', border: 'none', cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  {/* Step number + icon */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '10px',
                      background: `${config.color}1a`,
                      border: `1.5px solid ${config.colorBorder}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '17px',
                    }}>
                      {config.icon}
                    </div>
                    <div style={{
                      position: 'absolute', top: '-4px', right: '-4px',
                      width: '16px', height: '16px', borderRadius: '50%',
                      background: '#0a0d14',
                      border: `2px solid ${decisionStyle.color}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '8px', color: decisionStyle.color, fontWeight: 700,
                    }}>
                      {decisionStyle.icon}
                    </div>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: config.color }}>
                        {config.name}
                      </span>
                      <span style={{
                        padding: '1px 8px', borderRadius: '100px',
                        background: decisionStyle.bg, border: `1px solid ${decisionStyle.border}`,
                        fontSize: '10px', fontWeight: 600, color: decisionStyle.color,
                        letterSpacing: '0.03em',
                      }}>
                        {step.decision?.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p style={{ fontSize: '12px', color: '#8892b0', margin: 0, lineHeight: 1.4 }}>
                      {step.summary}
                    </p>
                  </div>

                  {/* Right: timing */}
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4ff' }}>
                      {step.durationMs ? `${step.durationMs}ms` : '—'}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8892b0', marginTop: '2px' }}>{durationPct}% of total</div>
                  </div>

                  {/* Expand arrow */}
                  <div style={{
                    color: '#8892b0', fontSize: '14px', flexShrink: 0,
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.2s ease',
                  }}>▾</div>
                </button>

                {/* Duration progress mini bar */}
                <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', margin: '0 14px' }}>
                  <div style={{
                    height: '100%', borderRadius: '2px',
                    width: `${durationPct}%`,
                    background: config.color,
                    opacity: 0.6,
                  }} />
                </div>

                {/* Expanded details */}
                {isExpanded && step.details && (
                  <div style={{
                    padding: '14px', margin: '0 8px 8px',
                    background: 'rgba(0,0,0,0.3)', borderRadius: '8px',
                    marginTop: '8px',
                    border: '1px solid rgba(255,255,255,0.05)',
                  }}>
                    <div style={{
                      display: 'grid', gridTemplateColumns: '1fr 1fr',
                      gap: '12px', marginBottom: '12px',
                    }}>
                      {[
                        { label: 'Decision', value: step.decision },
                        { label: 'Duration', value: `${step.durationMs}ms` },
                        { label: 'Started', value: new Date(step.startedAt).toLocaleTimeString() },
                        { label: 'Finished', value: new Date(step.finishedAt).toLocaleTimeString() },
                      ].map(item => (
                        <div key={item.label} style={{
                          background: 'rgba(255,255,255,0.04)',
                          borderRadius: '6px', padding: '8px 10px',
                        }}>
                          <div style={{ fontSize: '10px', color: '#8892b0', marginBottom: '2px' }}>{item.label}</div>
                          <div style={{ fontSize: '12px', color: '#f0f4ff', fontWeight: 500 }}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#8892b0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Agent Output
                    </div>
                    <pre style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '6px', padding: '10px',
                      fontSize: '11px', color: '#94a3b8',
                      whiteSpace: 'pre-wrap', overflowX: 'auto',
                      fontFamily: 'JetBrains Mono, monospace',
                      maxHeight: '200px', overflowY: 'auto',
                      margin: 0,
                    }}>
                      {JSON.stringify(step.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Human review terminal node */}
        <div style={{ marginLeft: '31px', width: '1px', height: '12px', background: 'linear-gradient(180deg, rgba(251,191,36,0.4), rgba(251,191,36,0.1))' }} />
        <div style={{
          borderRadius: '12px',
          border: '1px solid rgba(251,191,36,0.4)',
          background: 'rgba(251,191,36,0.08)',
          padding: '12px 14px',
          display: 'flex', alignItems: 'center', gap: '12px',
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'rgba(251,191,36,0.15)',
            border: '1.5px solid rgba(251,191,36,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '17px',
          }}>👤</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fbbf24' }}>Human Reviewer</div>
            <div style={{ fontSize: '12px', color: '#8892b0', marginTop: '2px' }}>Final decision pending — use approve/reject buttons in Results tab</div>
          </div>
          <div style={{
            marginLeft: 'auto', padding: '4px 12px',
            background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)',
            borderRadius: '100px', fontSize: '11px', fontWeight: 600, color: '#fbbf24',
          }}>
            AWAITING
          </div>
        </div>
      </div>
    </div>
  );
}
