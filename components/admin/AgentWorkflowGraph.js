'use client';

import { useState } from 'react';

const AGENT_CONFIG = {
  'planner-agent': {
    name: 'Planner Agent',
    icon: '🎯',
    color: 'blue',
    description: 'Routes claim to specialized agents'
  },
  'cyber-agent': {
    name: 'Security Agent',
    icon: '🔒',
    color: 'purple',
    description: 'Validates security & data handling'
  },
  'coverage-agent': {
    name: 'Coverage Agent',
    icon: '📋',
    color: 'indigo',
    description: 'Evaluates policy coverage eligibility'
  },
  'weather-agent': {
    name: 'Weather Agent',
    icon: '🌤️',
    color: 'cyan',
    description: 'Verifies incident weather conditions'
  },
  'fraud-agent': {
    name: 'Fraud Detection',
    icon: '🔍',
    color: 'red',
    description: 'Multi-angle fraud risk analysis'
  },
  'payout-agent': {
    name: 'Payout Agent',
    icon: '💰',
    color: 'green',
    description: 'Calculates recommended payout'
  },
  'audit-agent': {
    name: 'Audit Agent',
    icon: '✓',
    color: 'gray',
    description: 'Final audit and recommendation'
  },
};

const getColorClasses = (color, status) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      border: status === 'completed' ? 'border-blue-500' : status === 'running' ? 'border-blue-400 animate-pulse' : 'border-gray-300',
      text: 'text-blue-700',
      iconBg: 'bg-blue-100',
    },
    purple: {
      bg: 'bg-purple-50',
      border: status === 'completed' ? 'border-purple-500' : status === 'running' ? 'border-purple-400 animate-pulse' : 'border-gray-300',
      text: 'text-purple-700',
      iconBg: 'bg-purple-100',
    },
    indigo: {
      bg: 'bg-indigo-50',
      border: status === 'completed' ? 'border-indigo-500' : status === 'running' ? 'border-indigo-400 animate-pulse' : 'border-gray-300',
      text: 'text-indigo-700',
      iconBg: 'bg-indigo-100',
    },
    cyan: {
      bg: 'bg-cyan-50',
      border: status === 'completed' ? 'border-cyan-500' : status === 'running' ? 'border-cyan-400 animate-pulse' : 'border-gray-300',
      text: 'text-cyan-700',
      iconBg: 'bg-cyan-100',
    },
    red: {
      bg: 'bg-red-50',
      border: status === 'completed' ? 'border-red-500' : status === 'running' ? 'border-red-400 animate-pulse' : 'border-gray-300',
      text: 'text-red-700',
      iconBg: 'bg-red-100',
    },
    green: {
      bg: 'bg-green-50',
      border: status === 'completed' ? 'border-green-500' : status === 'running' ? 'border-green-400 animate-pulse' : 'border-gray-300',
      text: 'text-green-700',
      iconBg: 'bg-green-100',
    },
    gray: {
      bg: 'bg-gray-50',
      border: status === 'completed' ? 'border-gray-500' : status === 'running' ? 'border-gray-400 animate-pulse' : 'border-gray-300',
      text: 'text-gray-700',
      iconBg: 'bg-gray-100',
    },
  };
  return colors[color] || colors.gray;
};

const getStatusIcon = (decision) => {
  if (decision === 'continue' || decision === 'covered' || decision === 'matched' || decision === 'recommend-pay') {
    return (
      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  } else if (decision === 'stop' || decision === 'not-covered' || decision === 'not-matched' || decision === 'recommend-deny') {
    return (
      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    );
  } else if (decision === 'low' || decision === 'approve') {
    return (
      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    );
  } else if (decision === 'medium' || decision === 'manual-review') {
    return (
      <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    );
  } else if (decision === 'high' || decision === 'reject') {
    return (
      <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  }
  return null;
};

export default function AgentWorkflowGraph({ workflow, processing, onStepSelect, activeStep }) {
  const [expandedSteps, setExpandedSteps] = useState(new Set());

  if (!workflow || !workflow.steps) {
    return null;
  }

  const toggleStep = (index) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSteps(newExpanded);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Agent Workflow</h2>
          <p className="text-sm text-gray-600 mt-1">
            {workflow.durationSeconds ? `Completed in ${workflow.durationSeconds}s` : 'In progress...'}
          </p>
        </div>
        {workflow.models && (
          <div className="text-xs text-gray-500">
            <div>Model: {workflow.models.primary}</div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {workflow.steps.map((step, index) => {
          const config = AGENT_CONFIG[step.agent] || {
            name: step.agent,
            icon: '⚙️',
            color: 'gray',
            description: ''
          };
          
          const status = 'completed';
          const colors = getColorClasses(config.color, status);
          const isExpanded = expandedSteps.has(index);
          const statusIcon = getStatusIcon(step.decision);

          return (
            <div
              key={index}
              className={`rounded-lg border-2 transition-all ${colors.border} ${colors.bg}`}
            >
              <button
                onClick={() => toggleStep(index)}
                className="w-full px-4 py-3 flex items-center justify-between hover:opacity-80 transition-opacity"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-lg ${colors.iconBg} flex items-center justify-center text-lg flex-shrink-0`}>
                    {config.icon}
                  </div>
                  <div className="text-left">
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-sm font-bold ${colors.text}`}>
                        {config.name}
                      </h3>
                      {statusIcon}
                      <span className="text-xs font-medium text-gray-600">
                        {step.durationMs ? `${step.durationMs}ms` : ''}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5">{step.summary}</p>
                  </div>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-gray-200 pt-3 mt-1">
                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="font-semibold text-gray-700">Decision:</span>
                      <span className="ml-2 px-2 py-0.5 bg-white rounded font-medium">
                        {step.decision}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-gray-700">Duration:</span>
                      <span className="ml-2">{step.durationMs}ms</span>
                    </div>
                  </div>

                  {step.details && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <h4 className="text-xs font-bold text-gray-700 mb-2">Agent Output</h4>
                      <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-x-auto">
                        {JSON.stringify(step.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}

              {/* Connector Line */}
              {index < workflow.steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <div className="w-0.5 h-4 bg-gray-300"></div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Human Review Step */}
      <div className="mt-3 rounded-lg border-2 border-yellow-300 bg-yellow-50 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center text-lg flex-shrink-0">
            👤
          </div>
          <div>
            <h3 className="text-sm font-bold text-yellow-700">Human Review Required</h3>
            <p className="text-xs text-gray-600 mt-0.5">Final decision pending human reviewer</p>
          </div>
        </div>
      </div>
    </div>
  );
}
