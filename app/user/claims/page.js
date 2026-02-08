'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function UserClaimsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    } else if (session) {
      fetchClaims();
    }
  }, [session, isPending, router]);

  const fetchClaims = async () => {
    try {
      const response = await fetch('/api/user/submit-claim', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }

      const data = await response.json();
      setClaims(data.claims || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      processing: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      pending: 'bg-blue-100 text-blue-800 border border-blue-200',
      approved: 'bg-green-100 text-green-800 border border-green-200',
      rejected: 'bg-red-100 text-red-800 border border-red-200',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskBadge = (riskLevel, fraudProbability) => {
    if (!riskLevel) return null;

    const riskStyles = {
      low: 'bg-green-100 text-green-800 border border-green-200',
      medium: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
      high: 'bg-red-100 text-red-800 border border-red-200',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full ${riskStyles[riskLevel] || 'bg-gray-100 text-gray-800 border border-gray-200'}`}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)} Risk
        {fraudProbability && ` (${(fraudProbability * 100).toFixed(1)}%)`}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const openClaimDetails = (claim) => {
    setSelectedClaim(claim);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedClaim(null);
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50">
      {/* Professional Header with Logo */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-[#003781] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Claims</h1>
              <p className="text-sm text-gray-600">View and track your insurance claims</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/user/submit-claim"
              className="px-4 py-2 text-sm font-semibold bg-[#003781] text-white hover:bg-[#002455] rounded-lg transition-colors"
            >
              Submit New Claim
            </Link>
            <Link
              href="/user/policy"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Policies
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {claims.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-xl font-bold text-gray-900">No claims yet</h3>
            <p className="mt-2 text-sm text-gray-600">Get started by submitting your first claim.</p>
            <div className="mt-6">
              <Link
                href="/user/submit-claim"
                className="inline-flex items-center px-6 py-3 border border-transparent shadow-md text-base font-semibold rounded-lg text-white bg-[#003781] hover:bg-[#002455] transition-colors"
              >
                Submit Claim
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {claims.map((claim, index) => (
              <div
                key={claim._id || `claim-${index}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all cursor-pointer"
                onClick={() => openClaimDetails(claim)}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-500 mb-1">Claim ID</p>
                      <p className="text-sm font-mono font-bold text-gray-900">
                        {claim._id ? claim._id.slice(-8).toUpperCase() : 'N/A'}
                      </p>
                    </div>
                    {getStatusBadge(claim.status)}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {claim.textDescription || 'No description provided'}
                    </p>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Submitted {formatDate(claim.createdAt)}
                    </div>
                    {claim.uploadedFiles?.length > 0 && (
                      <div className="flex items-center text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        {claim.uploadedFiles.length} file(s) attached
                      </div>
                    )}
                  </div>

                  {claim.fraudAnalysis?.riskLevel && (
                    <div className="pt-4 border-t border-gray-200">
                      {getRiskBadge(claim.fraudAnalysis.riskLevel, claim.fraudAnalysis.fraudProbability)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && selectedClaim && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={closeModal}></div>
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h3 className="text-lg font-bold text-gray-900">Claim Details</h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="px-6 py-4 space-y-6">
                {/* Basic Info */}
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Claim ID</h4>
                  <p className="text-sm font-mono text-gray-900">{selectedClaim._id || 'N/A'}</p>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Status</h4>
                  <div className="flex gap-2">
                    {getStatusBadge(selectedClaim.status)}
                    {selectedClaim.fraudAnalysis?.riskLevel && getRiskBadge(selectedClaim.fraudAnalysis.riskLevel, selectedClaim.fraudAnalysis.fraudProbability)}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">Description</h4>
                  <p className="text-sm text-gray-900 whitespace-pre-wrap bg-gray-50 p-4 rounded-lg border border-gray-200">
                    {selectedClaim.textDescription || 'No description provided'}
                  </p>
                </div>

                {/* Files */}
                {selectedClaim.uploadedFiles?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Attached Files</h4>
                    <div className="space-y-2">
                      {selectedClaim.uploadedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                          <svg className="w-5 h-5 text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm text-gray-900">{file.originalName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fraud Analysis */}
                {selectedClaim.fraudAnalysis?.explanation && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Fraud Analysis</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedClaim.fraudAnalysis.explanation}
                      </p>
                    </div>
                  </div>
                )}

                {/* Review Notes */}
                {selectedClaim.reviewNotes && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">Review Notes</h4>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-900 whitespace-pre-wrap">
                        {selectedClaim.reviewNotes}
                      </p>
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
                  <div>
                    <span className="font-semibold">Submitted:</span> {formatDate(selectedClaim.createdAt)}
                  </div>
                  {selectedClaim.reviewedAt && (
                    <div>
                      <span className="font-semibold">Reviewed:</span> {formatDate(selectedClaim.reviewedAt)}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
                <button
                  onClick={closeModal}
                  className="w-full px-4 py-2 bg-[#003781] text-white rounded-lg hover:bg-[#002455] font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
