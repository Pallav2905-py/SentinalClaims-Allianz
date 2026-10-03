'use client';

import { useState, useEffect, useRef } from 'react';
import WorkflowCanvas from './WorkflowCanvas';
import AgentWorkflowGraph from './AgentWorkflowGraph';
import ClaimDetailsPanel from './ClaimDetailsPanel';
import ProcessingResults from './ProcessingResults';
import NodeDetailsPanel from './NodeDetailsPanel';
import EvidenceGraph from './EvidenceGraph';

const NAV_TABS = [
  { id: 'workflow', label: 'AI Workflow', icon: '⚡' },
  { id: 'evidence', label: 'Evidence Graph', icon: '🕸️' },
  { id: 'results', label: 'Results', icon: '📊' },
  { id: 'claim', label: 'Claim Details', icon: '📁' },
];

export default function ClaimInvestigationConsole({ claim, onBack }) {
  const [processing, setProcessing] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [error, setError] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const [activeTab, setActiveTab] = useState('workflow');
  const [workflowViewMode, setWorkflowViewMode] = useState('canvas');
  const [processedClaim, setProcessedClaim] = useState(claim);

  useEffect(() => {
    if (claim.agentWorkflow) {
      setWorkflow(claim.agentWorkflow);
      setProcessedData({
        fraudAnalysis: claim.fraudAnalysis,
        payoutDecision: claim.payoutDecision,
        auditSummary: claim.auditSummary,
        processingSummary: claim.processingSummary,
      });
    }
  }, [claim]);

  const handleProcessClaim = async () => {
    setProcessing(true);
    setError('');
    setWorkflow(null);
    setActiveStep(null);
    setActiveTab('workflow');

    try {
      const response = await fetch(`/api/admin/claims/${claim._id}/process`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      const data = await response.json();

      if (data.success) {
        setWorkflow(data.claim.agentWorkflow);
        setProcessedData({
          fraudAnalysis: data.claim.fraudAnalysis,
          payoutDecision: data.claim.payoutDecision,
          auditSummary: data.claim.auditSummary,
          processingSummary: data.claim.processingSummary,
        });
        setProcessedClaim({ ...claim, ...data.claim });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const canProcess = claim.status === 'AWAITING_PROCESSING' || claim.status === 'pending' || claim.status === 'ERROR';
  const claimId = claim._id?.slice(-8).toUpperCase() || 'N/A';

  const getRiskBadge = () => {
    const risk = processedData?.fraudAnalysis?.riskLevel || claim.fraudAnalysis?.riskLevel;
    if (!risk) return null;
    const map = {
      high: { bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.4)', color: '#f87171', label: '🔴 HIGH RISK' },
      medium: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', color: '#fbbf24', label: '🟡 MEDIUM RISK' },
      low: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', color: '#34d399', label: '🟢 LOW RISK' },
    };
    return map[risk] || null;
  };

  const riskBadge = getRiskBadge();

  return (
    <div style={{ minHeight: '100vh', background: '#0a0d14', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Top Header */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(10,13,20,0.95)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '0 24px',
      }}>
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '60px' }}>
          {/* Left: back + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onBack}
              style={{
                width: '34px', height: '34px', borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#f0f4ff',
              }}
            >
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f7aff, #8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '15px',
            }}>🛡️</div>

            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: '#f0f4ff', lineHeight: 1.2 }}>
                Claim Investigation
                <span style={{
                  marginLeft: '10px', fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '13px', color: '#4f7aff',
                }}>#{claimId}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#8892b0' }}>AI-powered fraud detection & risk assessment</div>
            </div>

            {riskBadge && (
              <div style={{
                padding: '4px 12px', borderRadius: '100px',
                background: riskBadge.bg, border: `1px solid ${riskBadge.border}`,
                fontSize: '11px', fontWeight: 700, color: riskBadge.color,
                letterSpacing: '0.05em',
              }}>
                {riskBadge.label}
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {workflow && (
              <button
                onClick={handleProcessClaim}
                disabled={processing}
                style={{
                  padding: '8px 16px', borderRadius: '8px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#8892b0', fontSize: '13px', fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                ↻ Reprocess
              </button>
            )}
            {canProcess && (
              <button
                onClick={handleProcessClaim}
                disabled={processing}
                style={{
                  padding: '8px 20px', borderRadius: '10px',
                  background: processing ? 'rgba(79,122,255,0.3)' : 'linear-gradient(135deg, #4f7aff, #6b5aff)',
                  border: 'none',
                  color: '#ffffff', fontSize: '13px', fontWeight: 600,
                  cursor: processing ? 'not-allowed' : 'pointer',
                  boxShadow: processing ? 'none' : '0 4px 16px rgba(79,122,255,0.35)',
                  display: 'flex', alignItems: 'center', gap: '8px',
                  opacity: processing ? 0.7 : 1,
                }}
              >
                {processing ? (
                  <>
                    <svg className="animate-spin" width="14" height="14" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="4" strokeOpacity="0.3" />
                      <path fill="white" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Processing...
                  </>
                ) : (
                  <>⚡ Process Claim</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Nav tabs */}
        <div style={{ maxWidth: '1800px', margin: '0 auto', display: 'flex', gap: '4px', paddingBottom: '0' }}>
          {NAV_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '10px 18px', border: 'none',
                background: 'transparent',
                color: activeTab === tab.id ? '#4f7aff' : '#8892b0',
                fontSize: '13px', fontWeight: activeTab === tab.id ? 600 : 500,
                cursor: 'pointer', borderBottom: activeTab === tab.id ? '2px solid #4f7aff' : '2px solid transparent',
                display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s ease',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.id === 'evidence' && (
                <span style={{
                  padding: '1px 6px', borderRadius: '100px',
                  background: 'rgba(79,122,255,0.2)', color: '#7b9fff',
                  fontSize: '10px', fontWeight: 700,
                }}>NEW</span>
              )}
            </button>
          ))}
        </div>
      </header>

      {/* Error banner */}
      {error && (
        <div style={{
          margin: '16px 24px 0',
          padding: '12px 16px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', gap: '10px',
          color: '#f87171', fontSize: '13px',
        }}>
          <span>⚠</span>
          <span>{error}</span>
          <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
      )}

      {/* Main content */}
      <main style={{ flex: 1, maxWidth: '1800px', margin: '0 auto', width: '100%', padding: '24px' }}>

        {/* === WORKFLOW TAB === */}
        {activeTab === 'workflow' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Processing idle state */}
            {!workflow && !processing && (
              <div style={{
                background: 'rgba(20,25,38,0.8)',
                border: '2px dashed rgba(79,122,255,0.3)',
                borderRadius: '16px',
                padding: '60px', textAlign: 'center',
              }}>
                <div style={{
                  width: '64px', height: '64px', borderRadius: '16px',
                  background: 'rgba(79,122,255,0.15)',
                  border: '1px solid rgba(79,122,255,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '28px', margin: '0 auto 20px',
                }}>⚡</div>
                <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#f0f4ff', marginBottom: '8px' }}>
                  Ready to Investigate
                </h3>
                <p style={{ color: '#8892b0', fontSize: '14px', maxWidth: '400px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Launch the AI agent pipeline to analyze this claim through 7 specialized agents — fraud detection, coverage check, weather validation, and more.
                </p>
                <button
                  onClick={handleProcessClaim}
                  style={{
                    padding: '12px 32px', borderRadius: '12px',
                    background: 'linear-gradient(135deg, #4f7aff, #6b5aff)',
                    border: 'none', color: 'white',
                    fontSize: '15px', fontWeight: 600,
                    cursor: 'pointer',
                    boxShadow: '0 6px 24px rgba(79,122,255,0.4)',
                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                  }}
                >
                  ⚡ Start AI Investigation
                </button>
              </div>
            )}

            {/* Workflow Canvas */}
            {(workflow || processing) && (
              <>
                {/* View toggle */}
                {workflow && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#8892b0' }}>View:</span>
                    {[
                      { id: 'canvas', label: 'Canvas' },
                      { id: 'list', label: 'Timeline' },
                    ].map(v => (
                      <button
                        key={v.id}
                        onClick={() => setWorkflowViewMode(v.id)}
                        style={{
                          padding: '4px 14px', borderRadius: '8px',
                          background: workflowViewMode === v.id ? 'rgba(79,122,255,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${workflowViewMode === v.id ? 'rgba(79,122,255,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          color: workflowViewMode === v.id ? '#7b9fff' : '#8892b0',
                          fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                        }}
                      >
                        {v.label}
                      </button>
                    ))}
                  </div>
                )}

                {workflowViewMode === 'canvas' ? (
                  <WorkflowCanvas
                    workflow={workflow}
                    processing={processing}
                    onNodeClick={setActiveStep}
                  />
                ) : (
                  <AgentWorkflowGraph
                    workflow={workflow}
                    processing={processing}
                    onStepSelect={setActiveStep}
                    activeStep={activeStep}
                  />
                )}
              </>
            )}

            {/* Processing spinner */}
            {processing && (
              <div style={{
                background: 'rgba(79,122,255,0.08)',
                border: '1px solid rgba(79,122,255,0.2)',
                borderRadius: '12px',
                padding: '20px 24px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <svg className="animate-spin" width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="rgba(79,122,255,0.3)" strokeWidth="4" />
                  <path fill="#4f7aff" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#f0f4ff' }}>AI Agents Processing Claim...</div>
                  <div style={{ fontSize: '12px', color: '#8892b0', marginTop: '2px' }}>Running 7 specialized agents in parallel pipeline</div>
                </div>
              </div>
            )}

            {/* Quick results preview */}
            {processedData && !processing && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
                {[
                  {
                    label: 'Fraud Score',
                    value: `${((processedData.fraudAnalysis?.fraudProbability || 0) * 100).toFixed(0)}%`,
                    color: (processedData.fraudAnalysis?.fraudProbability || 0) > 0.6 ? '#f87171' : (processedData.fraudAnalysis?.fraudProbability || 0) > 0.3 ? '#fbbf24' : '#34d399',
                    icon: '🔍',
                  },
                  {
                    label: 'Risk Level',
                    value: (processedData.fraudAnalysis?.riskLevel || 'N/A').toUpperCase(),
                    color: { high: '#f87171', medium: '#fbbf24', low: '#34d399' }[processedData.fraudAnalysis?.riskLevel] || '#94a3b8',
                    icon: '⚠',
                  },
                  {
                    label: 'Recommendation',
                    value: (processedData.auditSummary?.humanRecommendation || 'N/A').replace('-', ' ').toUpperCase(),
                    color: { approve: '#34d399', reject: '#f87171', 'manual-review': '#fbbf24' }[processedData.auditSummary?.humanRecommendation] || '#94a3b8',
                    icon: '✅',
                  },
                  {
                    label: 'Payout',
                    value: processedData.payoutDecision?.eligible
                      ? `$${(processedData.payoutDecision?.recommendedPayout || 0).toFixed(0)}`
                      : 'NOT ELIGIBLE',
                    color: processedData.payoutDecision?.eligible ? '#34d399' : '#f87171',
                    icon: '💰',
                  },
                ].map(item => (
                  <div key={item.label} style={{
                    background: 'rgba(20,25,38,0.8)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '12px', padding: '16px',
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '10px',
                      background: `${item.color}22`,
                      border: `1px solid ${item.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '16px', flexShrink: 0,
                    }}>{item.icon}</div>
                    <div>
                      <div style={{ fontSize: '10px', color: '#8892b0', marginBottom: '2px' }}>{item.label}</div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: item.color }}>{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === EVIDENCE GRAPH TAB === */}
        {activeTab === 'evidence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{
              padding: '12px 16px',
              background: 'rgba(79,122,255,0.08)',
              border: '1px solid rgba(79,122,255,0.2)',
              borderRadius: '10px',
              fontSize: '13px', color: '#7b9fff',
              display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              <span>ℹ️</span>
              <span>The <strong>Claim Digital Twin</strong> maps all entities and relationships detected in this claim. Suspicious connections are highlighted in red. Inferred data is shown with dashed edges.</span>
            </div>
            <EvidenceGraph claim={processedClaim} />
          </div>
        )}

        {/* === RESULTS TAB === */}
        {activeTab === 'results' && (
          processedData ? (
            <ProcessingResults data={processedData} claimId={claim._id} />
          ) : (
            <div style={{
              textAlign: 'center', padding: '80px 40px',
              background: 'rgba(20,25,38,0.8)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>📊</div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f0f4ff', marginBottom: '8px' }}>No Results Yet</h3>
              <p style={{ color: '#8892b0', fontSize: '14px' }}>
                Process the claim first to view AI investigation results
              </p>
            </div>
          )
        )}

        {/* === CLAIM DETAILS TAB === */}
        {activeTab === 'claim' && (
          <ClaimDetailsPanel claim={processedClaim} />
        )}
      </main>

      {/* Node Details Sidebar */}
      {activeStep && (
        <NodeDetailsPanel
          step={activeStep}
          onClose={() => setActiveStep(null)}
        />
      )}
    </div>
  );
}
