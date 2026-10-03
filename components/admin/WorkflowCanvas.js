'use client';

import { useEffect, useState, useRef } from 'react';

const AGENT_NODES = [
  {
    id: 'start',
    type: 'trigger',
    agent: 'start',
    name: 'Claim Submitted',
    subtitle: 'Trigger',
    icon: '📥',
    color: '#8b5cf6',
    colorDim: 'rgba(139,92,246,0.15)',
    colorBorder: 'rgba(139,92,246,0.45)',
    col: 2, row: 0,
  },
  {
    id: 'planner',
    type: 'action',
    agent: 'planner-agent',
    name: 'Planner Agent',
    subtitle: 'Orchestration',
    icon: '🎯',
    color: '#4f7aff',
    colorDim: 'rgba(79,122,255,0.15)',
    colorBorder: 'rgba(79,122,255,0.45)',
    col: 2, row: 1,
  },
  {
    id: 'security',
    type: 'action',
    agent: 'cyber-agent',
    name: 'Security Check',
    subtitle: 'Validation',
    icon: '🔒',
    color: '#a78bfa',
    colorDim: 'rgba(167,139,250,0.15)',
    colorBorder: 'rgba(167,139,250,0.45)',
    col: 0, row: 2,
  },
  {
    id: 'coverage',
    type: 'action',
    agent: 'coverage-agent',
    name: 'Coverage Check',
    subtitle: 'Policy Analysis',
    icon: '📋',
    color: '#06b6d4',
    colorDim: 'rgba(6,182,212,0.15)',
    colorBorder: 'rgba(6,182,212,0.45)',
    col: 1, row: 2,
  },
  {
    id: 'weather',
    type: 'action',
    agent: 'weather-agent',
    name: 'Weather Verify',
    subtitle: 'Incident Validation',
    icon: '🌤️',
    color: '#22d3ee',
    colorDim: 'rgba(34,211,238,0.15)',
    colorBorder: 'rgba(34,211,238,0.45)',
    col: 2, row: 2,
  },
  {
    id: 'fraud',
    type: 'action',
    agent: 'fraud-agent',
    name: 'Fraud Detection',
    subtitle: 'Risk Analysis',
    icon: '🔍',
    color: '#f87171',
    colorDim: 'rgba(248,113,113,0.15)',
    colorBorder: 'rgba(248,113,113,0.45)',
    col: 3, row: 2,
  },
  {
    id: 'payout',
    type: 'action',
    agent: 'payout-agent',
    name: 'Payout Calc',
    subtitle: 'Financial Decision',
    icon: '💰',
    color: '#34d399',
    colorDim: 'rgba(52,211,153,0.15)',
    colorBorder: 'rgba(52,211,153,0.45)',
    col: 4, row: 2,
  },
  {
    id: 'audit',
    type: 'action',
    agent: 'audit-agent',
    name: 'Audit Agent',
    subtitle: 'Final Review',
    icon: '✅',
    color: '#94a3b8',
    colorDim: 'rgba(148,163,184,0.15)',
    colorBorder: 'rgba(148,163,184,0.45)',
    col: 2, row: 3,
  },
  {
    id: 'human',
    type: 'human',
    agent: 'human',
    name: 'Human Review',
    subtitle: 'Investigator',
    icon: '👤',
    color: '#fbbf24',
    colorDim: 'rgba(251,191,36,0.15)',
    colorBorder: 'rgba(251,191,36,0.45)',
    col: 2, row: 4,
  },
];

const CONNECTIONS = [
  { from: 'start', to: 'planner' },
  { from: 'planner', to: 'security' },
  { from: 'planner', to: 'coverage' },
  { from: 'planner', to: 'weather' },
  { from: 'planner', to: 'fraud' },
  { from: 'planner', to: 'payout' },
  { from: 'security', to: 'audit' },
  { from: 'coverage', to: 'audit' },
  { from: 'weather', to: 'audit' },
  { from: 'fraud', to: 'audit' },
  { from: 'payout', to: 'audit' },
  { from: 'audit', to: 'human' },
];

const NODE_W = 172;
const NODE_H = 80;
const COL_GAP = 50;
const ROW_GAP = 70;

function computeLayout() {
  // Group cols per row
  const rowCols = {};
  AGENT_NODES.forEach(n => {
    if (!rowCols[n.row]) rowCols[n.row] = [];
    rowCols[n.row].push(n.col);
  });
  const maxCol = Math.max(...AGENT_NODES.map(n => n.col));
  const totalW = (maxCol + 1) * (NODE_W + COL_GAP) - COL_GAP;

  const positions = {};
  AGENT_NODES.forEach(node => {
    const rowNodes = AGENT_NODES.filter(n => n.row === node.row);
    const totalRowW = rowNodes.length * NODE_W + (rowNodes.length - 1) * COL_GAP;
    const rowStartX = (totalW - totalRowW) / 2;
    const nodeIndexInRow = rowNodes.sort((a, b) => a.col - b.col).findIndex(n => n.id === node.id);
    positions[node.id] = {
      x: rowStartX + nodeIndexInRow * (NODE_W + COL_GAP),
      y: node.row * (NODE_H + ROW_GAP) + 20,
    };
  });
  return { positions, totalW, totalH: 5 * (NODE_H + ROW_GAP) };
}

const PROCESSING_SEQUENCE = ['start', 'planner', 'security', 'coverage', 'weather', 'fraud', 'payout', 'audit', 'human'];

export default function WorkflowCanvas({ workflow, processing, onNodeClick }) {
  const [activeNodes, setActiveNodes] = useState(new Set(['start']));
  const [completedNodes, setCompletedNodes] = useState(new Set());
  const [selectedNode, setSelectedNode] = useState(null);
  const [tooltip, setTooltip] = useState(null);
  const intervalRef = useRef(null);
  const { positions, totalW, totalH } = computeLayout();

  useEffect(() => {
    if (!workflow) {
      setActiveNodes(new Set(['start']));
      setCompletedNodes(new Set());
      return;
    }
    const completed = new Set(['start', 'planner']);
    workflow.steps?.forEach(step => {
      const nodeId = AGENT_NODES.find(n => n.agent === step.agent)?.id;
      if (nodeId) completed.add(nodeId);
    });
    setCompletedNodes(completed);
    setActiveNodes(new Set(['human']));
  }, [workflow]);

  useEffect(() => {
    if (!processing) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    let idx = 0;
    setCompletedNodes(new Set());
    setActiveNodes(new Set([PROCESSING_SEQUENCE[0]]));
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx < PROCESSING_SEQUENCE.length) {
        const current = PROCESSING_SEQUENCE[idx];
        const prev = PROCESSING_SEQUENCE[idx - 1];
        setCompletedNodes(prev => new Set([...prev, AGENT_NODES.find(n => n.id === prev || n.id === current) ? PROCESSING_SEQUENCE[idx - 1] : '']));
        setCompletedNodes(c => new Set([...c, PROCESSING_SEQUENCE[idx - 1]]));
        setActiveNodes(new Set([current]));
      } else {
        clearInterval(intervalRef.current);
      }
    }, 700);
    return () => clearInterval(intervalRef.current);
  }, [processing]);

  const getStatus = (id) => {
    if (completedNodes.has(id)) return 'completed';
    if (activeNodes.has(id)) return 'active';
    return 'idle';
  };

  const handleNodeClick = (node) => {
    setSelectedNode(node.id === selectedNode ? null : node.id);
    if (onNodeClick) {
      const step = workflow?.steps?.find(s => s.agent === node.agent);
      onNodeClick(step);
    }
  };

  // SVG path between two node center-bottoms/tops
  const getCurvedPath = (fromId, toId) => {
    const from = positions[fromId];
    const to = positions[toId];
    if (!from || !to) return '';
    const x1 = from.x + NODE_W / 2;
    const y1 = from.y + NODE_H;
    const x2 = to.x + NODE_W / 2;
    const y2 = to.y;
    const midY = (y1 + y2) / 2;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  };

  const getConnectionStatus = (from, to) => {
    if (completedNodes.has(to)) return 'completed';
    if (completedNodes.has(from) || activeNodes.has(from)) return 'active';
    return 'idle';
  };

  const canvasW = totalW + 80;
  const canvasH = totalH + 80;

  return (
    <div
      style={{
        background: 'linear-gradient(160deg, #0a0d14 0%, #0f1620 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255,255,255,0.08)',
        overflow: 'hidden',
        position: 'relative',
        minHeight: '560px',
      }}
    >
      {/* Dot grid bg */}
      <div className="dot-bg" style={{ position: 'absolute', inset: 0, opacity: 0.6, zIndex: 0 }} />

      {/* Top bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        padding: '12px 20px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(10,13,20,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 10,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: processing ? '#f59e0b' : workflow ? '#10b981' : '#4f7aff',
            boxShadow: processing ? '0 0 8px #f59e0b' : workflow ? '0 0 8px #10b981' : '0 0 8px #4f7aff',
            animation: processing ? 'pulse 1s infinite' : 'none',
          }} />
          <span style={{ color: '#8892b0', fontSize: '12px', fontWeight: 500 }}>
            {processing ? 'Executing workflow...' : workflow ? `Completed in ${workflow.durationSeconds}s` : 'AI Agent Workflow'}
          </span>
        </div>
        {workflow && (
          <div style={{
            background: 'rgba(16,185,129,0.1)',
            border: '1px solid rgba(16,185,129,0.3)',
            borderRadius: '100px',
            padding: '3px 12px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#34d399',
            letterSpacing: '0.05em',
          }}>
            ✓ COMPLETE
          </div>
        )}
        {processing && (
          <div style={{
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.3)',
            borderRadius: '100px',
            padding: '3px 12px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#fbbf24',
          }}>
            {completedNodes.size} / {PROCESSING_SEQUENCE.length - 1} agents done
          </div>
        )}
      </div>

      {/* Scrollable canvas */}
      <div style={{ overflowX: 'auto', overflowY: 'auto', paddingTop: '48px', position: 'relative', zIndex: 2 }}>
        <div style={{ position: 'relative', width: canvasW, height: canvasH, margin: '0 auto' }}>
          {/* SVG connections */}
          <svg
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
          >
            <defs>
              <marker id="arrow-idle" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6 Z" fill="rgba(255,255,255,0.15)" />
              </marker>
              <marker id="arrow-active" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6 Z" fill="#4f7aff" />
              </marker>
              <marker id="arrow-completed" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                <path d="M0 0 L6 3 L0 6 Z" fill="#10b981" />
              </marker>
            </defs>
            {CONNECTIONS.map((conn, i) => {
              const status = getConnectionStatus(conn.from, conn.to);
              const path = getCurvedPath(conn.from, conn.to);
              const color = status === 'completed' ? '#10b981' : status === 'active' ? '#4f7aff' : 'rgba(255,255,255,0.12)';
              const arrowId = status === 'completed' ? 'arrow-completed' : status === 'active' ? 'arrow-active' : 'arrow-idle';
              return (
                <g key={i}>
                  {/* Shadow path */}
                  <path d={path} fill="none" stroke={color} strokeWidth="4" strokeOpacity="0.15" />
                  {/* Main path */}
                  <path
                    d={path}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.5"
                    strokeDasharray={status === 'active' && !completedNodes.has(conn.to) ? '6 4' : '0'}
                    style={status === 'active' && !completedNodes.has(conn.to) ? {
                      animation: 'dataFlow 1s linear infinite',
                      strokeDashoffset: 0,
                    } : {}}
                    markerEnd={`url(#${arrowId})`}
                  />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {AGENT_NODES.map(node => {
            const pos = positions[node.id];
            if (!pos) return null;
            const status = getStatus(node.id);
            const isSelected = selectedNode === node.id;
            const step = workflow?.steps?.find(s => s.agent === node.agent);

            return (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node)}
                style={{
                  position: 'absolute',
                  left: pos.x,
                  top: pos.y,
                  width: NODE_W,
                  height: NODE_H,
                  borderRadius: '14px',
                  background: status === 'active'
                    ? `linear-gradient(135deg, ${node.colorDim}, rgba(20,25,38,0.95))`
                    : status === 'completed'
                      ? 'rgba(16,185,129,0.06)'
                      : 'rgba(20,25,38,0.9)',
                  border: `1.5px solid ${status === 'active'
                    ? node.color
                    : status === 'completed'
                      ? 'rgba(16,185,129,0.4)'
                      : isSelected
                        ? node.colorBorder
                        : 'rgba(255,255,255,0.09)'}`,
                  boxShadow: status === 'active'
                    ? `0 0 0 3px ${node.colorDim}, 0 8px 32px rgba(0,0,0,0.5)`
                    : status === 'completed'
                      ? '0 4px 20px rgba(16,185,129,0.08)'
                      : isSelected
                        ? `0 0 0 2px ${node.colorDim}`
                        : '0 4px 20px rgba(0,0,0,0.3)',
                  cursor: 'pointer',
                  animation: status === 'active' ? 'nodeActivate 2s ease-in-out infinite' : 'none',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  padding: '12px 14px',
                  backdropFilter: 'blur(8px)',
                  zIndex: isSelected ? 5 : 3,
                  transform: isSelected ? 'scale(1.04) translateY(-2px)' : 'scale(1)',
                }}
              >
                {/* Top strip accent */}
                <div style={{
                  position: 'absolute',
                  top: 0, left: '14px', right: '14px',
                  height: '2px',
                  borderRadius: '0 0 4px 4px',
                  background: status === 'completed'
                    ? 'linear-gradient(90deg, #10b981, #34d399)'
                    : status === 'active'
                      ? `linear-gradient(90deg, ${node.color}, transparent)`
                      : 'transparent',
                  opacity: 0.8,
                }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {/* Icon */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: node.colorDim,
                    border: `1px solid ${node.colorBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '16px', flexShrink: 0,
                    position: 'relative',
                  }}>
                    {status === 'active' ? (
                      <div style={{
                        position: 'absolute', inset: 0, borderRadius: '10px',
                        background: node.colorDim,
                        animation: 'pulse 1.5s ease-in-out infinite',
                      }} />
                    ) : null}
                    <span style={{ position: 'relative', zIndex: 1 }}>{node.icon}</span>
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '12px', fontWeight: 700, color: '#f0f4ff',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      lineHeight: '1.3',
                    }}>
                      {node.name}
                    </div>
                    <div style={{ fontSize: '10px', color: '#8892b0', marginTop: '2px' }}>
                      {node.subtitle}
                    </div>
                  </div>

                  {/* Status dot */}
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    background: status === 'completed' ? '#10b981' : status === 'active' ? node.color : 'rgba(255,255,255,0.15)',
                    boxShadow: status === 'completed' ? '0 0 6px #10b981' : status === 'active' ? `0 0 8px ${node.color}` : 'none',
                    animation: status === 'active' ? 'pulse 1.2s ease-in-out infinite' : 'none',
                  }} />
                </div>

                {/* Bottom: status text or step duration */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginTop: '8px', paddingTop: '6px',
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <span style={{
                    fontSize: '10px', fontWeight: 600,
                    color: status === 'completed' ? '#34d399' : status === 'active' ? node.color : 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}>
                    {status === 'completed' ? '✓ Done' : status === 'active' ? '⟳ Running' : 'Waiting'}
                  </span>
                  {step?.durationMs && (
                    <span style={{ fontSize: '10px', color: '#8892b0' }}>
                      {step.durationMs}ms
                    </span>
                  )}
                </div>

                {/* Connection bottom port */}
                <div style={{
                  position: 'absolute', bottom: '-5px', left: '50%', transform: 'translateX(-50%)',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: 'rgba(20,25,38,1)',
                  border: `2px solid ${status === 'completed' ? '#10b981' : status === 'active' ? node.color : 'rgba(255,255,255,0.2)'}`,
                }} />

                {/* Connection top port */}
                <div style={{
                  position: 'absolute', top: '-5px', left: '50%', transform: 'translateX(-50%)',
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: 'rgba(20,25,38,1)',
                  border: `2px solid ${status === 'completed' ? '#10b981' : status === 'active' ? node.color : 'rgba(255,255,255,0.2)'}`,
                  display: node.id === 'start' ? 'none' : 'block',
                }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom legend */}
      <div style={{
        position: 'absolute', bottom: '12px', left: '20px',
        display: 'flex', alignItems: 'center', gap: '16px',
        zIndex: 10,
      }}>
        {[
          { color: 'rgba(255,255,255,0.15)', label: 'Waiting' },
          { color: '#4f7aff', label: 'Running', glow: true },
          { color: '#10b981', label: 'Completed' },
        ].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: item.color,
              boxShadow: item.glow ? `0 0 6px ${item.color}` : 'none',
            }} />
            <span style={{ fontSize: '11px', color: '#8892b0' }}>{item.label}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes nodeActivate {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.025); }
        }
        @keyframes dataFlow {
          to { stroke-dashoffset: -10; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}
