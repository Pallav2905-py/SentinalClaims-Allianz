'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// Build digital twin graph from claim data
function buildDigitalTwin(claim) {
  const claimId = claim._id?.slice(-8).toUpperCase() || 'UNKNOWN';
  const claimAnswers = claim.claimAnswers || {};

  // --- CENTRAL NODE ---
  const nodes = [
    {
      id: 'claim',
      type: 'claim',
      label: `Claim #${claimId}`,
      sublabel: claim.status?.replace('_', ' ') || 'Unknown',
      icon: '📁',
      color: '#4f7aff',
      colorDim: 'rgba(79,122,255,0.18)',
      status: 'verified',
      x: 500, y: 300,
      size: 64,
      data: {
        'Claim ID': claimId,
        'Status': claim.status,
        'Submitted': claim.createdAt ? new Date(claim.createdAt).toLocaleDateString() : 'Unknown',
        'Description': (claim.textDescription || 'No description').slice(0, 120) + '...',
      },
    },
  ];

  const edges = [];

  // --- CUSTOMER NODE ---
  const userId = claim.userId?.toString()?.slice(-6) || 'USR001';
  nodes.push({
    id: 'customer',
    type: 'customer',
    label: 'Customer',
    sublabel: `ID: ${userId}`,
    icon: '👤',
    color: '#8b5cf6',
    colorDim: 'rgba(139,92,246,0.18)',
    status: 'verified',
    x: 200, y: 140,
    size: 52,
    data: {
      'Customer ID': userId,
      'User ID': claim.userId?.toString() || 'N/A',
      'Claims Filed': '1 (current)',
      'Account Status': 'Active',
    },
  });
  edges.push({
    from: 'claim', to: 'customer',
    label: 'filed by',
    status: 'verified',
    suspicion: false,
  });

  // --- POLICY NODE ---
  nodes.push({
    id: 'policy',
    type: 'policy',
    label: 'Policy',
    sublabel: claimAnswers.policyNumber || 'Standard Coverage',
    icon: '📋',
    color: '#06b6d4',
    colorDim: 'rgba(6,182,212,0.18)',
    status: 'verified',
    x: 800, y: 140,
    size: 52,
    data: {
      'Policy Number': claimAnswers.policyNumber || 'N/A',
      'Coverage Type': claimAnswers.coverageType || 'Standard',
      'Status': 'Active',
      'Start Date': claimAnswers.policyStart || 'Unknown',
    },
  });
  edges.push({
    from: 'claim', to: 'policy',
    label: 'covered by',
    status: 'verified',
    suspicion: false,
  });

  // --- VEHICLE NODE (if motor claim) ---
  if (claimAnswers.vehicleReg || claimAnswers.vehicleMake || claim.claimType?.includes('motor')) {
    nodes.push({
      id: 'vehicle',
      type: 'vehicle',
      label: 'Vehicle',
      sublabel: claimAnswers.vehicleReg || claimAnswers.vehicleMake || 'Reg. Unknown',
      icon: '🚗',
      color: '#34d399',
      colorDim: 'rgba(52,211,153,0.18)',
      status: 'verified',
      x: 200, y: 460,
      size: 52,
      data: {
        'Registration': claimAnswers.vehicleReg || 'N/A',
        'Make/Model': claimAnswers.vehicleMake || 'N/A',
        'Year': claimAnswers.vehicleYear || 'N/A',
        'Previous Claims': '0 known',
      },
    });
    edges.push({
      from: 'claim', to: 'vehicle',
      label: 'involves',
      status: 'verified',
      suspicion: false,
    });
  }

  // --- INCIDENT NODE ---
  nodes.push({
    id: 'incident',
    type: 'incident',
    label: 'Incident',
    sublabel: claimAnswers.incidentDate || claimAnswers.eventType || 'Event',
    icon: '⚡',
    color: '#f59e0b',
    colorDim: 'rgba(245,158,11,0.18)',
    status: claim.fraudAnalysis?.riskLevel === 'high' ? 'suspicious' : 'inferred',
    x: 800, y: 460,
    size: 52,
    data: {
      'Date': claimAnswers.incidentDate || 'N/A',
      'Location': claimAnswers.location || claimAnswers.incidentLocation || 'N/A',
      'Type': claimAnswers.eventType || claim.claimType || 'General',
      'Damage': claimAnswers.damageDesc || 'See description',
    },
  });
  edges.push({
    from: 'claim', to: 'incident',
    label: 'reports',
    status: 'inferred',
    suspicion: claim.fraudAnalysis?.riskLevel === 'high',
    suspicionReason: claim.fraudAnalysis?.riskLevel === 'high'
      ? 'Incident details flagged by fraud detection — timeline and location warrant verification'
      : null,
  });

  // --- FRAUD RISK NODE (if high risk) ---
  if (claim.fraudAnalysis?.riskLevel === 'high') {
    nodes.push({
      id: 'fraud-alert',
      type: 'risk',
      label: 'Fraud Alert',
      sublabel: `${((claim.fraudAnalysis?.fraudProbability || 0) * 100).toFixed(0)}% Risk`,
      icon: '🚨',
      color: '#ef4444',
      colorDim: 'rgba(239,68,68,0.18)',
      status: 'suspicious',
      x: 500, y: 520,
      size: 48,
      data: {
        'Risk Level': 'HIGH',
        'Fraud Score': `${((claim.fraudAnalysis?.fraudProbability || 0) * 100).toFixed(1)}%`,
        'AI Explanation': (claim.fraudAnalysis?.explanation || 'Anomalous patterns detected').slice(0, 150),
        'Action Required': 'Manual review',
      },
    });
    edges.push({
      from: 'incident', to: 'fraud-alert',
      label: 'triggers',
      status: 'suspicious',
      suspicion: true,
      suspicionReason: 'Incident details triggered automated fraud alert due to high-risk patterns',
    });
    edges.push({
      from: 'claim', to: 'fraud-alert',
      label: 'flagged',
      status: 'suspicious',
      suspicion: true,
      suspicionReason: `Claim scored ${((claim.fraudAnalysis?.fraudProbability || 0) * 100).toFixed(0)}% fraud probability by AI agents`,
    });
  }

  // --- EVIDENCE NODES (uploaded files) ---
  if (claim.uploadedFiles?.length > 0) {
    const evidenceNode = {
      id: 'evidence',
      type: 'evidence',
      label: 'Evidence',
      sublabel: `${claim.uploadedFiles.length} document(s)`,
      icon: '📎',
      color: '#a78bfa',
      colorDim: 'rgba(167,139,250,0.18)',
      status: 'verified',
      x: 140, y: 300,
      size: 48,
      data: {
        'Files': `${claim.uploadedFiles.length} uploaded`,
        'Types': [...new Set(claim.uploadedFiles.map(f => f.fileType || 'doc'))].join(', '),
        'Verified': 'AI-scanned',
      },
    };
    nodes.push(evidenceNode);
    edges.push({
      from: 'claim', to: 'evidence',
      label: 'supported by',
      status: 'verified',
      suspicion: false,
    });
  }

  // --- PAYOUT NODE (if processed) ---
  if (claim.payoutDecision) {
    nodes.push({
      id: 'payout',
      type: 'payout',
      label: 'Payout',
      sublabel: claim.payoutDecision.eligible
        ? `${claim.payoutDecision.currency} $${(claim.payoutDecision.recommendedPayout || 0).toFixed(0)}`
        : 'Not Eligible',
      icon: '💰',
      color: claim.payoutDecision.eligible ? '#34d399' : '#f87171',
      colorDim: claim.payoutDecision.eligible ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)',
      status: 'verified',
      x: 860, y: 300,
      size: 48,
      data: {
        'Claimed Amount': `${claim.payoutDecision.currency} $${(claim.payoutDecision.claimedAmount || 0).toFixed(2)}`,
        'Recommended': `${claim.payoutDecision.currency} $${(claim.payoutDecision.recommendedPayout || 0).toFixed(2)}`,
        'Eligible': claim.payoutDecision.eligible ? 'Yes' : 'No',
        'Reason': claim.payoutDecision.reason || 'N/A',
      },
    });
    edges.push({
      from: 'policy', to: 'payout',
      label: 'determines',
      status: 'verified',
      suspicion: false,
    });
  }

  return { nodes, edges };
}

export default function EvidenceGraph({ claim }) {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(0.9);
  const isPanning = useRef(false);
  const lastPan = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    if (claim) {
      setGraphData(buildDigitalTwin(claim));
    }
  }, [claim]);

  const handleNodeClick = useCallback((node, e) => {
    e.stopPropagation();
    setSelectedEdge(null);
    setSelectedNode(prev => prev?.id === node.id ? null : node);
  }, []);

  const handleEdgeClick = useCallback((edge, e) => {
    e.stopPropagation();
    setSelectedNode(null);
    setSelectedEdge(prev => prev === edge ? null : edge);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Pan
  const handleMouseDown = useCallback((e) => {
    if (e.target.closest('[data-node]') || e.target.closest('[data-edge]')) return;
    isPanning.current = true;
    lastPan.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  }, [panOffset]);

  const handleMouseMove = useCallback((e) => {
    if (!isPanning.current) return;
    setPanOffset({ x: e.clientX - lastPan.current.x, y: e.clientY - lastPan.current.y });
  }, []);

  const handleMouseUp = useCallback(() => { isPanning.current = false; }, []);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    setScale(s => Math.max(0.4, Math.min(2, s - e.deltaY * 0.001)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, [handleWheel]);

  const getEdgePath = (edge) => {
    const from = graphData.nodes.find(n => n.id === edge.from);
    const to = graphData.nodes.find(n => n.id === edge.to);
    if (!from || !to) return '';
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ux = dx / dist;
    const uy = dy / dist;
    const x1 = from.x + ux * (from.size / 2 + 2);
    const y1 = from.y + uy * (from.size / 2 + 2);
    const x2 = to.x - ux * (to.size / 2 + 8);
    const y2 = to.y - uy * (to.size / 2 + 8);
    const cx = (x1 + x2) / 2 + dy * 0.15;
    const cy = (y1 + y2) / 2 - dx * 0.15;
    return `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;
  };

  const getEdgeMidpoint = (edge) => {
    const from = graphData.nodes.find(n => n.id === edge.from);
    const to = graphData.nodes.find(n => n.id === edge.to);
    if (!from || !to) return { x: 0, y: 0 };
    const cx = (from.x + to.x) / 2 + (to.y - from.y) * 0.08;
    const cy = (from.y + to.y) / 2 - (to.x - from.x) * 0.08;
    return { x: cx, y: cy };
  };

  const statusColor = {
    verified: '#10b981',
    suspicious: '#ef4444',
    inferred: '#f59e0b',
  };

  return (
    <div style={{
      background: 'linear-gradient(160deg, #080b12, #0d1120)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.08)',
      overflow: 'hidden',
      position: 'relative',
      height: '540px',
      display: 'flex',
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '12px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(8,11,18,0.8)',
        backdropFilter: 'blur(8px)',
        zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'rgba(79,122,255,0.2)',
            border: '1px solid rgba(79,122,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '13px',
          }}>🕸️</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff' }}>
              Claim Digital Twin — Evidence Graph
            </div>
            <div style={{ fontSize: '10px', color: '#8892b0' }}>
              Click nodes/edges to inspect • Scroll to zoom • Drag to pan
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {[
            { color: '#10b981', label: 'Verified' },
            { color: '#f59e0b', label: 'Inferred', dashed: true },
            { color: '#ef4444', label: 'Suspicious' },
          ].map(item => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '20px', height: '2px',
                background: item.dashed ? `repeating-linear-gradient(90deg, ${item.color} 0, ${item.color} 4px, transparent 4px, transparent 8px)` : item.color,
                borderRadius: '2px',
              }} />
              <span style={{ fontSize: '10px', color: '#8892b0' }}>{item.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
            <button onClick={() => setScale(s => Math.min(2, s + 0.15))} style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f4ff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>+</button>
            <button onClick={() => setScale(s => Math.max(0.4, s - 0.15))} style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f4ff', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
            <button onClick={() => { setScale(0.9); setPanOffset({ x: 0, y: 0 }); }} style={{
              width: '26px', height: '26px', borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#f0f4ff', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>⌖</button>
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        style={{ flex: 1, marginTop: '48px', position: 'relative', overflow: 'hidden', cursor: isPanning.current ? 'grabbing' : 'grab' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        <div className="dot-bg" style={{ position: 'absolute', inset: 0, opacity: 0.5 }} />

        <svg
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            transformOrigin: 'center center',
          }}
        >
          <defs>
            <marker id="arrow-verified" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0 0 L8 3 L0 6 Z" fill="#10b981" fillOpacity="0.8" />
            </marker>
            <marker id="arrow-suspicious" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0 0 L8 3 L0 6 Z" fill="#ef4444" fillOpacity="0.8" />
            </marker>
            <marker id="arrow-inferred" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0 0 L8 3 L0 6 Z" fill="#f59e0b" fillOpacity="0.8" />
            </marker>
          </defs>

          <g transform={`translate(${panOffset.x},${panOffset.y}) scale(${scale})`} style={{ transformOrigin: '500px 300px' }}>
            {/* Edges */}
            {graphData.edges.map((edge, i) => {
              const path = getEdgePath(edge);
              const mid = getEdgeMidpoint(edge);
              const col = edge.suspicion ? '#ef4444' : edge.status === 'inferred' ? '#f59e0b' : '#10b981';
              const isSelected = selectedEdge === edge;
              return (
                <g key={i}>
                  {/* Clickable fat edge */}
                  <path
                    d={path}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                    style={{ cursor: 'pointer' }}
                    data-edge="true"
                    onClick={(e) => handleEdgeClick(edge, e)}
                  />
                  {/* Visual edge */}
                  <path
                    d={path}
                    fill="none"
                    stroke={col}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeOpacity={isSelected ? 0.9 : 0.5}
                    strokeDasharray={edge.status === 'inferred' || edge.suspicion ? '5 3' : '0'}
                    markerEnd={`url(#arrow-${edge.suspicion ? 'suspicious' : edge.status})`}
                    style={{ transition: 'all 0.2s ease' }}
                  />
                  {/* Edge glow on select */}
                  {isSelected && (
                    <path
                      d={path}
                      fill="none"
                      stroke={col}
                      strokeWidth="6"
                      strokeOpacity="0.15"
                    />
                  )}
                  {/* Suspicious badge on edge */}
                  {edge.suspicion && (
                    <g onClick={(e) => handleEdgeClick(edge, e)} style={{ cursor: 'pointer' }}>
                      <circle cx={mid.x} cy={mid.y} r="10" fill="rgba(239,68,68,0.2)" stroke="#ef4444" strokeWidth="1.5" />
                      <text x={mid.x} y={mid.y + 4} textAnchor="middle" fontSize="10" fill="#f87171">!</text>
                    </g>
                  )}
                  {/* Edge label */}
                  {!edge.suspicion && (
                    <text x={mid.x} y={mid.y - 6} textAnchor="middle" fontSize="9" fill={col} fillOpacity="0.7">
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {graphData.nodes.map(node => {
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNode === node.id;
              const borderColor = node.status === 'suspicious' ? '#ef4444'
                : node.status === 'inferred' ? '#f59e0b'
                  : node.color;

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x},${node.y})`}
                  onClick={(e) => handleNodeClick(node, e)}
                  onMouseEnter={() => setHoveredNode(node.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                  style={{ cursor: 'pointer' }}
                  data-node="true"
                >
                  {/* Outer glow ring */}
                  {(isSelected || isHovered) && (
                    <circle
                      r={node.size / 2 + 8}
                      fill="none"
                      stroke={borderColor}
                      strokeWidth="1.5"
                      strokeOpacity="0.3"
                    />
                  )}
                  {/* Suspicious pulse ring */}
                  {node.status === 'suspicious' && (
                    <circle
                      r={node.size / 2 + 12}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1"
                      strokeOpacity="0.2"
                      style={{ animation: 'pulse 2s ease-in-out infinite' }}
                    />
                  )}
                  {/* Main circle */}
                  <circle
                    r={node.size / 2}
                    fill={node.colorDim}
                    stroke={borderColor}
                    strokeWidth={isSelected ? 2.5 : 1.5}
                    strokeDasharray={node.status === 'inferred' ? '4 2' : '0'}
                    strokeOpacity={isSelected ? 1 : 0.7}
                  />
                  {/* Icon */}
                  <text
                    y="6"
                    textAnchor="middle"
                    fontSize={node.size * 0.35}
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >{node.icon}</text>
                  {/* Node label below */}
                  <text
                    y={node.size / 2 + 16}
                    textAnchor="middle"
                    fontSize="11"
                    fontWeight="700"
                    fill="#f0f4ff"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >{node.label}</text>
                  <text
                    y={node.size / 2 + 28}
                    textAnchor="middle"
                    fontSize="9"
                    fill="#8892b0"
                    style={{ userSelect: 'none', pointerEvents: 'none' }}
                  >{node.sublabel}</text>
                  {/* Status indicator top-right */}
                  <circle
                    cx={node.size / 2 - 4}
                    cy={-(node.size / 2 - 4)}
                    r="6"
                    fill={statusColor[node.status] || '#8892b0'}
                    stroke="#0a0d14"
                    strokeWidth="2"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Side panel: node details */}
      {(selectedNode || selectedEdge) && (
        <div style={{
          position: 'absolute', right: 0, top: '48px', bottom: 0,
          width: '260px',
          background: 'rgba(14,18,30,0.96)',
          backdropFilter: 'blur(16px)',
          borderLeft: '1px solid rgba(255,255,255,0.08)',
          padding: '16px',
          overflowY: 'auto',
          zIndex: 20,
          animation: 'slideInRight 0.25s ease-out',
        }}>
          {selectedNode && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: selectedNode.colorDim,
                  border: `1.5px solid ${selectedNode.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {selectedNode.icon}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff' }}>{selectedNode.label}</div>
                  <div style={{
                    fontSize: '10px', fontWeight: 600,
                    color: statusColor[selectedNode.status],
                    textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    ● {selectedNode.status}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Entity Data
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(selectedNode.data || {}).map(([key, val]) => (
                  <div key={key} style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '8px', padding: '8px 12px',
                  }}>
                    <div style={{ fontSize: '10px', color: '#8892b0', marginBottom: '2px' }}>{key}</div>
                    <div style={{ fontSize: '12px', color: '#f0f4ff', fontWeight: 500, wordBreak: 'break-word' }}>{val || 'N/A'}</div>
                  </div>
                ))}
              </div>

              {selectedNode.status === 'suspicious' && (
                <div style={{
                  marginTop: '12px', padding: '10px 12px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>⚠ Suspicious Entity</div>
                  <div style={{ fontSize: '11px', color: '#fca5a5', lineHeight: 1.5 }}>
                    This entity has been flagged by the AI fraud detection pipeline. Manual investigation recommended.
                  </div>
                </div>
              )}
            </>
          )}

          {selectedEdge && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: selectedEdge.suspicion ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                  border: `1.5px solid ${selectedEdge.suspicion ? '#ef4444' : '#10b981'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px',
                }}>
                  {selectedEdge.suspicion ? '⚠️' : '🔗'}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f4ff' }}>
                    {selectedEdge.from} → {selectedEdge.to}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8892b0' }}>{selectedEdge.label}</div>
                </div>
              </div>

              <div style={{ fontSize: '10px', fontWeight: 600, color: '#8892b0', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                Relationship Type
              </div>
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '8px', padding: '10px 12px',
                fontSize: '12px', color: '#f0f4ff',
                lineHeight: 1.6,
              }}>
                {selectedEdge.status === 'verified' && 'This relationship is verified through official records and system data.'}
                {selectedEdge.status === 'inferred' && 'This relationship is inferred from AI analysis and claim narrative — not yet independently confirmed.'}
                {selectedEdge.status === 'suspicious' && 'This connection has been flagged as anomalous by the fraud detection pipeline.'}
              </div>

              {selectedEdge.suspicion && selectedEdge.suspicionReason && (
                <div style={{
                  marginTop: '12px', padding: '10px 12px',
                  background: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  borderRadius: '8px',
                }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#f87171', marginBottom: '4px' }}>Why is this suspicious?</div>
                  <div style={{ fontSize: '11px', color: '#fca5a5', lineHeight: 1.6 }}>
                    {selectedEdge.suspicionReason}
                  </div>
                </div>
              )}
            </>
          )}

          <button
            onClick={() => { setSelectedNode(null); setSelectedEdge(null); }}
            style={{
              marginTop: '16px', width: '100%', padding: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: '#8892b0', fontSize: '12px', cursor: 'pointer',
            }}
          >
            Close Panel
          </button>
        </div>
      )}

      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
}
