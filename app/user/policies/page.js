'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { getInsuranceTypeInfo } from '@/lib/demo-policies';

export default function YourPoliciesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    } else if (session) {
      fetchPolicies();
    }
  }, [session, isPending, router]);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/user/policies', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch policies');
      }

      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDemoData = async () => {
    setLoadingDemo(true);
    setError('');
    
    try {
      const response = await fetch('/api/user/policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action: 'load_demo' }),
      });

      if (!response.ok) {
        throw new Error('Failed to load demo data');
      }

      await fetchPolicies();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDemo(false);
    }
  };

  const getStatusBadge = (status, expiryDate) => {
    const isExpired = new Date(expiryDate) < new Date();
    const actualStatus = isExpired ? 'expired' : status;
    
    const styles = {
      active: 'bg-green-100 text-green-800 border-green-200',
      expired: 'bg-red-100 text-red-800 border-red-200',
      cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`px-3 py-1 text-xs font-bold rounded-full border ${styles[actualStatus] || styles.active}`}>
        {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
      </span>
    );
  };

  const getInsuranceIcon = (type) => {
    const typeInfo = getInsuranceTypeInfo();
    return typeInfo[type]?.icon || '📄';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-gray-50">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <span className="text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Your Policies</h1>
                <p className="text-sm text-gray-600">Manage your insurance policies</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Link
                href="/user/claims"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Claims
              </Link>
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 animate-fade-in">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {policies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
              <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No policies yet</h3>
            <p className="text-gray-600 mb-8">Add your insurance policies to get started</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={loadDemoData}
                disabled={loadingDemo}
                className="inline-flex items-center px-6 py-3 border-2 border-blue-500 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all disabled:opacity-50"
              >
                {loadingDemo ? (
                  <>
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✨</span>
                    Load Demo Policies
                  </>
                )}
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg transform hover:scale-105"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Policy
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-sm text-gray-600">
                {policies.length} {policies.length === 1 ? 'policy' : 'policies'} found
              </div>
              <div className="flex gap-3">
                {policies.length < 4 && (
                  <button
                    onClick={loadDemoData}
                    disabled={loadingDemo}
                    className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors disabled:opacity-50"
                  >
                    {loadingDemo ? 'Loading...' : '✨ Load Demo Policies'}
                  </button>
                )}
                <button
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
                >
                  + Add Policy
                </button>
              </div>
            </div>

            {/* Policy Cards Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {policies.map((policy) => (
                <div
                  key={policy._id}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all overflow-hidden"
                >
                  {/* Policy Header */}
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-4xl">{getInsuranceIcon(policy.insuranceType)}</span>
                      {getStatusBadge(policy.status, policy.expiryDate)}
                    </div>
                    <h3 className="text-lg font-bold text-white capitalize">
                      {policy.insuranceType} Insurance
                    </h3>
                    <p className="text-sm text-blue-100">{policy.provider}</p>
                  </div>

                  {/* Policy Details */}
                  <div className="px-6 py-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Policy Number</p>
                      <p className="text-sm font-bold text-gray-900 font-mono">
                        {policy.policyNumber}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Coverage</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(policy.coverageAmount)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Premium</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatCurrency(policy.premium)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
                      <div>
                        <span className="font-semibold">Start:</span> {formatDate(policy.startDate)}
                      </div>
                      <div>
                        <span className="font-semibold">Expiry:</span> {formatDate(policy.expiryDate)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-2">
                    <Link
                      href={`/user/policies/${policy._id}`}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-center"
                    >
                      View Details
                    </Link>
                    <Link
                      href={`/user/claim-assistant?policyId=${policy._id}`}
                      className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all text-center"
                    >
                      File Claim
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
