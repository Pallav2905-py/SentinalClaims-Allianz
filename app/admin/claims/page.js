'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function AdminClaimsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [claims, setClaims] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [riskFilter, setRiskFilter] = useState(searchParams.get('riskLevel') || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    } else if (session) {
      // TODO: Add admin role check here
      fetchClaims();
    }
  }, [session, isPending, router, statusFilter, riskFilter, currentPage]);

  const fetchClaims = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (riskFilter) params.append('riskLevel', riskFilter);
      params.append('limit', itemsPerPage.toString());
      params.append('skip', ((currentPage - 1) * itemsPerPage).toString());

      const response = await fetch(`/api/admin/claims?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch claims');
      }

      const data = await response.json();
      setClaims(data.claims || []);
      setStats(data.stats || {});
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleRiskFilterChange = (risk) => {
    setRiskFilter(risk);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setStatusFilter('');
    setRiskFilter('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      processing: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      pending: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-zinc-100 text-zinc-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskBadge = (riskLevel) => {
    if (!riskLevel) return null;

    const riskStyles = {
      low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${riskStyles[riskLevel] || 'bg-zinc-100 text-zinc-800'}`}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
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

  // Filter claims by search term (client-side)
  const filteredClaims = claims.filter((claim) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      claim._id.toLowerCase().includes(term) ||
      claim.textDescription?.toLowerCase().includes(term) ||
      claim.userId?.toLowerCase().includes(term)
    );
  });

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-zinc-600 dark:text-zinc-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Header */}
      <header className="bg-white dark:bg-zinc-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Claims Management</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Review and manage insurance claims</p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/admin/dashboard"
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md"
            >
              Dashboard
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md"
            >
              Home
            </Link>
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

        {/* Summary Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Total</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white">{stats.totalClaims || 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Pending</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.pendingClaims || 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Approved</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.approvedClaims || 0}</p>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Rejected</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.rejectedClaims || 0}</p>
            </div>
          </div>
        )}

        {/* Filters & Search */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by ID or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Risk Filter */}
            <select
              value={riskFilter}
              onChange={(e) => handleRiskFilterChange(e.target.value)}
              className="px-4 py-2 border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-700 text-zinc-900 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Levels</option>
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>

            {/* Clear Filters */}
            {(statusFilter || riskFilter || searchTerm) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Claims Table */}
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow overflow-hidden">
          {filteredClaims.length === 0 ? (
            <div className="p-12 text-center">
              <svg className="mx-auto h-12 w-12 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
                {searchTerm || statusFilter || riskFilter ? 'No claims match your filters' : 'No claims found'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Claim ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Risk
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-zinc-800 divide-y divide-zinc-200 dark:divide-zinc-700">
                  {filteredClaims.map((claim, index) => (
                    <tr key={claim._id || `claim-${index}`} className="hover:bg-zinc-50 dark:hover:bg-zinc-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-zinc-900 dark:text-white">
                          {claim._id ? claim._id.slice(-8).toUpperCase() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-zinc-900 dark:text-white max-w-xs truncate">
                          {claim.textDescription || 'No description'}
                        </div>
                        {claim.uploadedFiles?.length > 0 && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                            {claim.uploadedFiles.length} file(s)
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-zinc-900 dark:text-white">
                          {formatDate(claim.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(claim.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {claim.fraudAnalysis?.riskLevel ? (
                          <div className="flex flex-col gap-1">
                            {getRiskBadge(claim.fraudAnalysis.riskLevel)}
                            <span className="text-xs text-zinc-500 dark:text-zinc-400">
                              {(claim.fraudAnalysis.fraudProbability * 100).toFixed(1)}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-500 dark:text-zinc-400">Processing...</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Link
                          href={`/admin/claims/${claim._id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            Showing {filteredClaims.length} of {stats?.totalClaims || 0} claims
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300">
              Page {currentPage}
            </span>
            <button
              onClick={() => setCurrentPage(p => p + 1)}
              disabled={filteredClaims.length < itemsPerPage}
              className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
            >
              Next
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
