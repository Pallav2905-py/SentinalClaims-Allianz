'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function PolicyDetailsPage({ params }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [policy, setPolicy] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [policyId, setPolicyId] = useState(null);

  useEffect(() => {
    // Unwrap params Promise in Next.js 15+
    const unwrapParams = async () => {
      const unwrapped = await params;
      setPolicyId(unwrapped.id);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    } else if (session && policyId) {
      fetchPolicy();
    }
  }, [session, isPending, policyId, router]);

  const fetchPolicy = async () => {
    try {
      const response = await fetch(`/api/user/policies/${policyId}`, {
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to fetch policy');

      const data = await response.json();
      setPolicy(data.policy);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
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
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error || !policy) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 p-8">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-red-600">{error || 'Policy not found'}</p>
          <Link href="/user/policies" className="mt-4 inline-block text-blue-600 font-semibold">
            ← Back to Policies
          </Link>
        </div>
      </div>
    );
  }

  const isExpired = new Date(policy.expiryDate) < new Date();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Link href="/user/policies" className="text-gray-600 hover:text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 capitalize">{policy.insuranceType} Insurance</h1>
              <p className="text-sm text-gray-600">Policy Details</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">{policy.policyNumber}</h2>
                    <p className="text-blue-100">{policy.provider}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${
                    isExpired 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Policy Holder</p>
                    <p className="text-lg font-semibold text-gray-900">{policy.policyHolder}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Insurance Type</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{policy.insuranceType}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Coverage Amount</p>
                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(policy.coverageAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Annual Premium</p>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(policy.premium)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(policy.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Expiry Date</p>
                    <p className="text-base font-semibold text-gray-900">{formatDate(policy.expiryDate)}</p>
                  </div>
                </div>

                {/* Type-specific fields */}
                {policy.specificFields && Object.keys(policy.specificFields).length > 0 && (
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Additional Details</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(policy.specificFields).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-gray-600 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                          <p className="text-sm font-semibold text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : String(value)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  href={`/user/claim-assistant?policyId=${policy._id}`}
                  className="block w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-center font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 transform hover:scale-105 transition-all shadow-lg"
                >
                  🎯 File a Claim
                </Link>
                <Link
                  href="/user/claims"
                  className="block w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 text-center font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  View Claims
                </Link>
                <Link
                  href="/user/policies"
                  className="block w-full px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 text-center font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  All Policies
                </Link>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="text-sm font-bold text-blue-900 mb-2">Need Help?</h3>
              <p className="text-sm text-blue-800 mb-4">
                Our AI assistant can help you understand your coverage and file claims quickly.
              </p>
              <Link
                href={`/user/claim-assistant?policyId=${policy._id}`}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700"
              >
                Start AI Assistant →
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
