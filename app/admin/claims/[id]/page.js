'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

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
      processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status] || 'bg-zinc-100 text-zinc-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskBadge = (riskLevel, fraudProbability) => {
    if (!riskLevel) return null;

    const riskStyles = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
    };

    return (
      <div className={`px-3 py-1 text-sm font-semibold rounded-full border ${riskStyles[riskLevel] || 'bg-zinc-100 text-zinc-800'}`}>
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

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  if (!claim) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2">Claim Not Found</h2>
          <Link href="/admin/claims" className="text-blue-600 dark:text-blue-400 hover:underline">
            Return to Claims List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin/claims"
                className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Claim Details</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">ID: {claim._id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {claim.status === 'pending' && (
                <>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-md"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="px-4 py-2 text-sm font-medium bg-green-600 text-white hover:bg-green-700 rounded-md"
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
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Risk */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Status & Risk Assessment</h2>
              <div className="flex flex-wrap gap-4 items-center">
                {getStatusBadge(claim.status)}
                {claim.fraudAnalysis?.riskLevel && getRiskBadge(claim.fraudAnalysis.riskLevel, claim.fraudAnalysis.fraudProbability)}
              </div>
              {claim.status === 'processing' && (
                <div className="mt-4 flex items-center text-sm text-yellow-600 dark:text-yellow-400">
                  <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  AI analysis in progress...
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Incident Description</h2>
              <p className="text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md">
                {claim.textDescription || 'No description provided'}
              </p>
            </div>

            {/* Extracted Features */}
            {claim.fraudAnalysis?.extractedFeatures && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Extracted Features</h2>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(claim.fraudAnalysis.extractedFeatures).map(([key, value]) => (
                    <div key={key} className="bg-zinc-50 dark:bg-zinc-900 p-3 rounded-md">
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                        {key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
                      </p>
                      <p className="text-sm font-medium text-zinc-900 dark:text-white">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Explanation */}
            {claim.fraudAnalysis?.explanation && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">AI Analysis</h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-md">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {claim.fraudAnalysis.explanation}
                  </p>
                </div>
              </div>
            )}

            {/* Review Notes */}
            {claim.reviewNotes && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Review Notes</h2>
                <div className="bg-zinc-50 dark:bg-zinc-900 p-4 rounded-md">
                  <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {claim.reviewNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Uploaded Files */}
            {claim.uploadedFiles?.length > 0 && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Uploaded Files</h2>
                <div className="space-y-2">
                  {claim.uploadedFiles.map((file, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-md">
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-zinc-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-white">{file.originalName}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{file.mimeType}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Metadata */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Timeline</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Submitted</p>
                  <p className="text-sm text-zinc-900 dark:text-white">{formatDate(claim.createdAt)}</p>
                </div>
                {claim.reviewedAt && (
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">Reviewed</p>
                    <p className="text-sm text-zinc-900 dark:text-white">{formatDate(claim.reviewedAt)}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Last Updated</p>
                  <p className="text-sm text-zinc-900 dark:text-white">{formatDate(claim.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">User Information</h2>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">User ID</p>
                  <p className="text-sm font-mono text-zinc-900 dark:text-white break-all">{claim.userId}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            {claim.status === 'pending' && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowApproveModal(true)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                  >
                    Approve Claim
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
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
            
            <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-lg w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Approve Claim</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Are you sure you want to approve this claim?
                </p>
                {claim.fraudAnalysis?.riskLevel === 'high' && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 p-3 rounded-md mb-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-400">
                      ⚠️ Warning: This claim has a HIGH fraud risk level.
                    </p>
                  </div>
                )}
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Review Notes (Optional)
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  placeholder="Add any notes about your decision..."
                />
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
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
            
            <div className="relative bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-lg w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-white mb-4">Reject Claim</h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Please provide a reason for rejecting this claim.
                </p>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                  Reason for Rejection *
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white"
                  placeholder="Explain why this claim is being rejected..."
                  required
                />
                <div className="mt-6 flex gap-3 justify-end">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={actionLoading || !reviewNotes.trim()}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
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
