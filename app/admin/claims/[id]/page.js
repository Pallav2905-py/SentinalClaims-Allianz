'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import MarkdownRenderer from '@/components/MarkdownRenderer';

export default function ClaimDetailsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const params = useParams();
  const claimId = params.id;

  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    } else if (session && claimId) {
      // TODO: Add admin role check here
      fetchClaim();
    }
  }, [session, isPending, router, claimId]);

  const fetchClaim = async () => {
    try {
      const response = await fetch(`/api/admin/claims/${claimId}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch claim details');
      }

      const data = await response.json();
      setClaim(data.claim);
      setReviewNotes(data.claim.reviewNotes || '');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reviewNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve claim');
      }

      await fetchClaim();
      setShowApproveModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/admin/claims/${claimId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: reviewNotes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject claim');
      }

      await fetchClaim();
      setShowRejectModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      processing: 'bg-yellow-50 text-yellow-700 border border-yellow-200',
      pending: 'bg-blue-50 text-blue-700 border border-blue-200',
      approved: 'bg-green-50 text-green-700 border border-green-200',
      rejected: 'bg-red-50 text-red-700 border border-red-200',
    };

    return (
      <span className={`px-3 py-1 text-sm font-bold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskBadge = (riskLevel, fraudProbability) => {
    if (!riskLevel) return null;

    const riskStyles = {
      low: 'bg-green-50 text-green-700 border-green-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      high: 'bg-red-50 text-red-700 border-red-200',
    };

    return (
      <div className={`px-3 py-1 text-sm font-bold rounded-full border ${riskStyles[riskLevel] || 'bg-gray-100 text-gray-800'}`}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
        {fraudProbability && ` - ${(fraudProbability * 100).toFixed(1)}% Probability`}
      </div>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAgentName = (name) => {
    return (name || 'agent')
      .replace('-agent', '')
      .replace(/(^|\s)\S/g, (t) => t.toUpperCase());
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Not Found</h2>
          <Link href="/admin/claims" className="text-[#003781] hover:text-[#002455] hover:underline font-medium">
            Return to Claims List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/claims"
                className="text-gray-500 hover:text-[#003781] transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div className="w-10 h-10 bg-[#003781] rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Claim Details</h1>
                <p className="text-sm text-gray-600">ID: {claim._id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {claim.status === 'pending' && (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="px-4 py-2 text-sm font-medium bg-[#003781] text-white hover:bg-[#002455] rounded-lg transition-colors"
                  >
                    Approve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Risk */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Status & Risk Assessment</h2>
              <div className="flex flex-wrap gap-4 items-center">
                {getStatusBadge(claim.status)}
                {claim.fraudAnalysis?.riskLevel && getRiskBadge(claim.fraudAnalysis.riskLevel, claim.fraudAnalysis.fraudProbability)}
              </div>
              {claim.status === 'processing' && (
                <div className="mt-4 flex items-center text-sm text-yellow-700 font-medium">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI analysis in progress...
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Incident Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                {claim.textDescription || 'No description provided'}
              </p>
            </div>

            {/* Extracted Features */}
            {claim.fraudAnalysis?.extractedFeatures && (
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Extracted Features</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(claim.fraudAnalysis.extractedFeatures).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Explanation */}


            {/* Nemo Agent Workflow */}
            {claim.agentWorkflow?.steps?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Nemo Agent Workflow</h2>
                <p className="text-sm text-gray-600 mb-4">
                  Completed in approximately {claim.agentWorkflow.durationSeconds || 0} second(s)
                </p>
                <div className="space-y-3">
                  {claim.agentWorkflow.steps.map((step, idx) => (
                    <div key={`agent-step-${idx}`} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {idx + 1}. {formatAgentName(step.agent)} Agent
                        </p>
                        <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                          {step.decision}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{step.summary}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payout Recommendation */}
            {claim.payoutDecision && (
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Payout Agent Recommendation</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Claimed Amount</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {claim.payoutDecision.currency || 'AUD'} {claim.payoutDecision.claimedAmount ?? 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Recommended Payout</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {claim.payoutDecision.currency || 'AUD'} {claim.payoutDecision.recommendedPayout ?? 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Eligibility</p>
                    <p className="text-sm font-semibold text-gray-900">{claim.payoutDecision.eligible ? 'Eligible' : 'Not Eligible'}</p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500">Fast Track (&lt;= 500)</p>
                    <p className="text-sm font-semibold text-gray-900">{claim.payoutDecision.fastTrack ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Audit Summary */}
            {claim.auditSummary?.summary && (
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Audit Agent Handoff</h2>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{claim.auditSummary.summary}</p>
                  {claim.auditSummary.humanRecommendation && (
                    <p className="text-xs text-gray-600 mt-3">
                      Recommended human action: <span className="font-semibold">{claim.auditSummary.humanRecommendation}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Review Notes */}
            {claim.reviewNotes && (
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Notes</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {claim.reviewNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {claim.uploadedFiles?.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files</h2>
                <div className="space-y-2">
                  {claim.uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">{file.mimeType}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
                        {claim.fraudAnalysis?.explanation && (
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Analysis</h2>
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                  <MarkdownRenderer content={claim.fraudAnalysis.explanation} />
                </div>
              </div>
            )}
          </div>

          

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(claim.createdAt)}</p>
                </div>
                {claim.reviewedAt && (
                  <div>
                    <p className="text-xs text-gray-500">Reviewed</p>
                    <p className="text-sm text-gray-900 font-medium">{formatDate(claim.reviewedAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Last Updated</p>
                  <p className="text-sm text-gray-900 font-medium">{formatDate(claim.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">User ID</p>
                  <p className="text-sm font-mono text-gray-900 break-all">{claim.userId}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {claim.status === 'pending' && (
              <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full px-4 py-2 bg-[#003781] text-white rounded-lg hover:bg-[#002455] font-medium transition-colors"
                  >
                    Approve Claim
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                  >
                    Reject Claim
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowApproveModal(false)}></div>
            
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Approve Claim</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Are you sure you want to approve this claim?
                </p>
                {claim.fraudAnalysis?.riskLevel === 'high' && (
                  <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-lg mb-4">
                    <p className="text-sm text-yellow-800 font-medium">
                      ⚠️ Warning: This claim has a HIGH fraud risk level.
                    </p>
                  </div>
                )}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#003781] focus:border-transparent"
                  placeholder="Add any notes about your decision..."
                />
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-[#003781] text-white rounded-lg hover:bg-[#002455] disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Approving...' : 'Approve'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowRejectModal(false)}></div>
            
            <div className="relative bg-white rounded-xl shadow-2xl max-w-lg w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Claim</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Please provide a reason for rejecting this claim.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-[#003781] focus:border-transparent"
                  placeholder="Explain why this claim is being rejected..."
                  required
                />
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !reviewNotes.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                  >
                    {actionLoading ? 'Rejecting...' : 'Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
