'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ClaimSubmitted({ claimId, claimType }) {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push('/user/claims');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const stages = [
    { id: 'received', label: 'Claim information received', status: 'completed' },
    { id: 'documents', label: 'Documents uploaded', status: 'completed' },
    { id: 'planner', label: 'Planning analysis', status: 'processing' },
    { id: 'coverage', label: 'Coverage verification', status: 'pending' },
    { id: 'fraud', label: 'Fraud screening', status: 'pending' },
    { id: 'payout', label: 'Payout calculation', status: 'pending' },
    { id: 'review', label: 'Human review', status: 'pending' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 flex items-center justify-center px-4 py-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden animate-fade-in">
          {/* Success Header */}
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 md:px-8 py-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4 shadow-lg">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Claim submitted!
            </h1>
            <p className="text-green-100 text-lg">
              We're reviewing your claim
            </p>
          </div>

          {/* Claim Details */}
          <div className="px-6 md:px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Claim ID</p>
                <p className="text-lg font-bold text-gray-900 font-mono">
                  #{claimId.slice(0, 8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Claim Type</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{claimType.icon}</span>
                  <span className="text-lg font-bold text-gray-900">
                    {claimType.title}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Processing Timeline */}
          <div className="px-6 md:px-8 py-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Processing Status
            </h3>
            <div className="space-y-4">
              {stages.map((stage, index) => (
                <div key={stage.id} className="flex items-start space-x-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 mt-1">
                    {stage.status === 'completed' ? (
                      <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    ) : stage.status === 'processing' ? (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-200 rounded-full" />
                    )}
                  </div>

                  {/* Stage Info */}
                  <div className="flex-1">
                    <p
                      className={`text-sm font-semibold ${
                        stage.status === 'completed'
                          ? 'text-green-700'
                          : stage.status === 'processing'
                          ? 'text-blue-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {stage.label}
                    </p>
                  </div>

                  {/* Status Badge */}
                  {stage.status === 'processing' && (
                    <span className="flex-shrink-0 text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                      In Progress
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* What's Next */}
          <div className="px-6 md:px-8 py-6 bg-blue-50 border-t border-blue-100">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-sm font-bold text-blue-900 mb-2">What happens next?</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Our AI agents will analyze your claim</li>
                  <li>• You'll receive updates via email and app notifications</li>
                  <li>• Most claims are processed within 24-48 hours</li>
                  <li>• You can track progress in the "My Claims" section</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 md:px-8 py-6 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => router.push('/user/claims')}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md"
              >
                View My Claims
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
            <p className="text-center text-sm text-gray-500 mt-4">
              Redirecting to your claims in {countdown} seconds...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
