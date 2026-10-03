'use client';

import { useState } from 'react';

export default function ProcessingResults({ data, claimId }) {
  const [activeTab, setActiveTab] = useState('summary');
  const { fraudAnalysis, payoutDecision, auditSummary, processingSummary } = data;

  const getRiskColor = (risk) => {
    const colors = {
      low: 'bg-green-100 text-green-800 border-green-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      high: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[risk] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getRecommendationColor = (rec) => {
    const colors = {
      approve: 'bg-green-100 text-green-800 border-green-300',
      'manual-review': 'bg-yellow-100 text-yellow-800 border-yellow-300',
      reject: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[rec] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const handleApprove = async () => {
    if (!confirm('Approve this claim and authorize payout?')) return;
    
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        alert('Claim approved successfully');
        window.location.reload();
      } else {
        alert('Failed to approve claim');
      }
    } catch (error) {
      alert('Error approving claim');
    }
  };

  const handleReject = async () => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes: reason }),
        credentials: 'include',
      });
      
      if (response.ok) {
        alert('Claim rejected');
        window.location.reload();
      } else {
        alert('Failed to reject claim');
      }
    } catch (error) {
      alert('Error rejecting claim');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-900">Investigation Results</h2>
        <p className="text-sm text-gray-600 mt-1">AI-powered analysis and recommendations</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('summary')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'summary'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Summary
        </button>
        <button
          onClick={() => setActiveTab('fraud')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'fraud'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Fraud Analysis
        </button>
        <button
          onClick={() => setActiveTab('payout')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'payout'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Payout
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Overall Recommendation */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                  Overall Recommendation
                </h3>
                <span className={`px-4 py-2 text-sm font-bold rounded-lg border-2 ${getRecommendationColor(auditSummary?.humanRecommendation)}`}>
                  {auditSummary?.humanRecommendation?.replace('-', ' ').toUpperCase() || 'PENDING'}
                </span>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                {auditSummary?.summary || 'Analysis complete. Human review recommended.'}
              </p>
            </div>

            {/* Key Metrics Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Risk Level */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 uppercase">Risk Level</span>
                  {fraudAnalysis?.riskLevel === 'high' && (
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <div className={`inline-block px-3 py-1.5 text-sm font-bold rounded-lg border ${getRiskColor(fraudAnalysis?.riskLevel)}`}>
                  {fraudAnalysis?.riskLevel?.toUpperCase() || 'UNKNOWN'}
                </div>
              </div>

              {/* Fraud Score */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-600 uppercase block mb-2">Fraud Probability</span>
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold text-gray-900">
                    {fraudAnalysis?.fraudProbability 
                      ? (fraudAnalysis.fraudProbability * 100).toFixed(1)
                      : '0.0'}
                  </span>
                  <span className="text-lg font-semibold text-gray-600 ml-1">%</span>
                </div>
              </div>

              {/* Recommended Payout */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <span className="text-xs font-semibold text-gray-600 uppercase block mb-2">Recommended Payout</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-green-700">
                    {payoutDecision?.currency || 'AUD'} ${payoutDecision?.recommendedPayout?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>

              {/* Claimed Amount */}
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs font-semibold text-gray-600 uppercase block mb-2">Claimed Amount</span>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {payoutDecision?.currency || 'AUD'} ${payoutDecision?.claimedAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Key Checks */}
            {auditSummary?.keyChecks && auditSummary.keyChecks.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-3">Key Checks Performed</h3>
                <div className="space-y-2">
                  {auditSummary.keyChecks.map((check, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={handleApprove}
                className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Approve Claim
              </button>
              <button
                onClick={handleReject}
                className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject Claim
              </button>
            </div>
          </div>
        )}

        {activeTab === 'fraud' && (
          <div className="space-y-6">
            {/* Fraud Explanation */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">AI Analysis</h3>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {fraudAnalysis?.explanation || 'No detailed explanation available.'}
                </p>
              </div>
            </div>

            {/* Comprehensive Analysis */}
            {fraudAnalysis?.comprehensiveAnalysis && (
              <>
                {/* Perspectives */}
                {fraudAnalysis.comprehensiveAnalysis.perspectives && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Multi-Angle Assessment</h3>
                    <div className="space-y-3">
                      {Object.entries(fraudAnalysis.comprehensiveAnalysis.perspectives).map(([key, perspective]) => (
                        <div key={key} className="p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-bold text-gray-900 capitalize">{key} Perspective</h4>
                            <span className={`px-2.5 py-1 text-xs font-bold rounded ${getRiskColor(perspective.assessment?.toLowerCase().split(' ')[0])}`}>
                              {perspective.assessment}
                            </span>
                          </div>
                          {perspective.flags && perspective.flags.length > 0 && (
                            <ul className="space-y-1 mt-2">
                              {perspective.flags.map((flag, idx) => (
                                <li key={idx} className="text-xs text-gray-600 flex items-start">
                                  <span className="mr-2">•</span>
                                  <span>{flag}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Indicators */}
                {fraudAnalysis.comprehensiveAnalysis.indicators && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Fraud Indicators</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {fraudAnalysis.comprehensiveAnalysis.indicators.leading?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Leading Indicators</h4>
                          <div className="space-y-2">
                            {fraudAnalysis.comprehensiveAnalysis.indicators.leading.map((indicator, idx) => (
                              <div key={idx} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-xs">
                                <div className="font-bold text-gray-900">{indicator.type}</div>
                                <div className="text-gray-700 mt-1">{indicator.description}</div>
                                <div className="text-gray-600 mt-1 font-medium">{indicator.value}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {fraudAnalysis.comprehensiveAnalysis.indicators.lagging?.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold text-gray-600 uppercase mb-2">Lagging Indicators</h4>
                          <div className="space-y-2">
                            {fraudAnalysis.comprehensiveAnalysis.indicators.lagging.map((indicator, idx) => (
                              <div key={idx} className="p-3 bg-blue-50 rounded-lg border border-blue-200 text-xs">
                                <div className="font-bold text-gray-900">{indicator.type}</div>
                                <div className="text-gray-700 mt-1">{indicator.description}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {fraudAnalysis.comprehensiveAnalysis.recommendedActions?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 mb-3">Recommended Actions</h3>
                    <div className="space-y-2">
                      {fraudAnalysis.comprehensiveAnalysis.recommendedActions.map((action, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className={`px-2 py-1 text-xs font-bold rounded ${
                            action.priority === 'high' ? 'bg-red-200 text-red-800' :
                            action.priority === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                            'bg-green-200 text-green-800'
                          }`}>
                            {action.priority.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-bold text-gray-900">{action.action}</div>
                            <div className="text-xs text-gray-600 mt-1">{action.description}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === 'payout' && payoutDecision && (
          <div className="space-y-6">
            {/* Payout Calculation */}
            <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Payout Calculation</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Claimed Amount:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {payoutDecision.currency} ${payoutDecision.claimedAmount?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Coverage Limit:</span>
                  <span className="font-semibold text-gray-900">
                    {payoutDecision.currency} ${payoutDecision.coverageLimit?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Deductible:</span>
                  <span className="font-semibold text-red-600">
                    - {payoutDecision.currency} ${payoutDecision.deductible?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">Risk Adjustment:</span>
                  <span className="font-semibold text-gray-900">
                    ×{payoutDecision.riskMultiplier?.toFixed(2) || '1.00'}
                  </span>
                </div>
                <div className="border-t-2 border-green-300 pt-3 flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Recommended Payout:</span>
                  <span className="text-2xl font-bold text-green-700">
                    {payoutDecision.currency} ${payoutDecision.recommendedPayout?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Eligibility Status */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-3">Eligibility Status</h3>
              <div className={`p-4 rounded-lg border-2 ${
                payoutDecision.eligible 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center space-x-3 mb-2">
                  {payoutDecision.eligible ? (
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className={`text-lg font-bold ${
                    payoutDecision.eligible ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {payoutDecision.eligible ? 'ELIGIBLE FOR PAYOUT' : 'NOT ELIGIBLE'}
                  </span>
                </div>
                <p className="text-sm text-gray-700 ml-9">
                  {payoutDecision.reason || 'No reason provided'}
                </p>
              </div>
            </div>

            {/* Fast Track */}
            {payoutDecision.fastTrack && (
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200 flex items-center space-x-3">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <div className="text-sm font-bold text-blue-900">Fast Track Eligible</div>
                  <div className="text-xs text-blue-700">This claim qualifies for expedited processing</div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
