'use client';

import { useState } from 'react';

export default function ClaimDetailsPanel({ claim }) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const STATUS_CONFIG = {
    AWAITING_PROCESSING: { label: 'Awaiting Processing', color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', border: 'rgba(167,139,250,0.4)' },
    PROCESSING: { label: 'Processing', color: '#4f7aff', bg: 'rgba(79,122,255,0.15)', border: 'rgba(79,122,255,0.4)' },
    AWAITING_REVIEW: { label: 'Awaiting Review', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.4)' },
    approved: { label: 'Approved', color: '#34d399', bg: 'rgba(52,211,153,0.15)', border: 'rgba(52,211,153,0.4)' },
    rejected: { label: 'Rejected', color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)' },
    ERROR: { label: 'Error', color: '#f87171', bg: 'rgba(248,113,113,0.15)', border: 'rgba(248,113,113,0.4)' },
    pending: { label: 'Pending', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' },
  };

  const statusCfg = STATUS_CONFIG[claim.status] || { label: claim.status, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)' };
  const claimAnswers = claim.claimAnswers || {};

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📄' },
    { id: 'evidence', label: 'Evidence', icon: '📎' },
  ];

  return (
    <div style={{
      background: 'rgba(14,18,30,0.9)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px', overflow: 'hidden',
      fontFamily: 'Inter, sans-serif', color: '#f0f4ff',
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex', background: 'rgba(255,255,255,0.02)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
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

      <div style={{ padding: '16px', maxHeight: 'calc(100vh - 240px)', overflowY: 'auto' }}>
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Status */}
            <div style={{
              padding: '12px 14px',
              background: statusCfg.bg, border: `1px solid ${statusCfg.border}`,
              borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <span style={{ fontSize: '12px', color: '#8892b0', fontWeight: 500 }}>Current Status</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: statusCfg.color }}>{statusCfg.label}</span>
            </div>

            {/* Basic info */}
            {[
              { label: 'Claim ID', value: claim._id?.slice(-12).toUpperCase(), mono: true },
              { label: 'Submitted', value: formatDate(claim.createdAt) },
              { label: 'Last Updated', value: formatDate(claim.updatedAt) },
              claim.claimType && { label: 'Claim Type', value: claim.claimType.replace('-', ' ') },
              claim.userId && { label: 'User ID', value: claim.userId?.toString()?.slice(-12), mono: true },
            ].filter(Boolean).map(item => (
              <div key={item.label} style={{
                padding: '10px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '11px', color: '#8892b0', fontWeight: 500 }}>{item.label}</span>
                <span style={{
                  fontSize: '12px', color: '#f0f4ff', fontWeight: 600,
                  fontFamily: item.mono ? 'JetBrains Mono, monospace' : 'inherit',
                }}>
                  {item.value}
                </span>
              </div>
            ))}

            {/* Description */}
            <div style={{
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
            }}>
              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Description
              </div>
              <p style={{ fontSize: '12px', color: '#c8d3f5', lineHeight: 1.65, margin: 0 }}>
                {claim.textDescription || 'No description provided'}
              </p>
            </div>

            {/* Claim answers */}
            {Object.keys(claimAnswers).length > 0 && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Claim Details
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {Object.entries(claimAnswers).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                      <span style={{ color: '#8892b0', fontWeight: 500, textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                      <span style={{ color: '#f0f4ff', fontWeight: 600, maxWidth: '60%', textAlign: 'right' }}>
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                          Array.isArray(value) ? value.join(', ') :
                            value || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Uploaded files */}
            {claim.uploadedFiles?.length > 0 ? (
              <div>
                <div style={{ fontSize: '11px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Uploaded Documents ({claim.uploadedFiles.length})
                </div>
                {claim.uploadedFiles.map((file, i) => (
                  <div key={i} style={{
                    marginBottom: '6px', padding: '10px 12px',
                    background: 'rgba(79,122,255,0.07)',
                    border: '1px solid rgba(79,122,255,0.2)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', gap: '10px',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      background: 'rgba(79,122,255,0.15)',
                      border: '1px solid rgba(79,122,255,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '14px', flexShrink: 0,
                    }}>📄</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4ff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.filePath ? file.filePath.split('/').pop() : `Document ${i + 1}`}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8892b0' }}>
                        {file.fileType || 'Document'}
                      </div>
                    </div>
                    <span style={{
                      padding: '2px 8px', borderRadius: '100px',
                      background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)',
                      fontSize: '10px', fontWeight: 600, color: '#34d399',
                    }}>Uploaded</span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>📭</div>
                <div style={{ fontSize: '13px', color: '#f0f4ff', fontWeight: 600, marginBottom: '4px' }}>No documents uploaded</div>
                <div style={{ fontSize: '12px', color: '#8892b0' }}>Evidence files will appear here</div>
              </div>
            )}

            {/* Audio */}
            {claim.audioPath && (
              <div style={{
                padding: '12px 14px',
                background: 'rgba(139,92,246,0.08)',
                border: '1px solid rgba(139,92,246,0.25)',
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px',
                  background: 'rgba(139,92,246,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px',
                }}>🎤</div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#f0f4ff' }}>Voice Recording</div>
                  <div style={{ fontSize: '11px', color: '#8892b0' }}>Audio description attached</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
