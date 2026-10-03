'use client';

import { useState } from 'react';

export default function ClaimDetailsPanel({ claim }) {
  const [activeTab, setActiveTab] = useState('overview');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      AWAITING_PROCESSING: 'bg-purple-100 text-purple-800 border-purple-200',
      PROCESSING: 'bg-blue-100 text-blue-800 border-blue-200',
      AWAITING_REVIEW: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      pending: 'bg-gray-100 text-gray-800 border-gray-200',
      ERROR: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const claimAnswers = claim.claimAnswers || {};

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-24">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'evidence'
              ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-600'
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          Evidence
        </button>
      </div>

      <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Status */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Status</label>
              <div className="mt-2">
                <span className={`inline-block px-3 py-1.5 text-xs font-bold rounded-lg border ${getStatusColor(claim.status)}`}>
                  {claim.status?.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Claim ID */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Claim ID</label>
              <p className="mt-1 text-sm font-mono font-bold text-gray-900">
                {claim._id?.slice(-12).toUpperCase()}
              </p>
            </div>

            {/* Submitted */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Submitted</label>
              <p className="mt-1 text-sm text-gray-900">{formatDate(claim.createdAt)}</p>
            </div>

            {/* Claim Type */}
            {claim.claimType && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Claim Type</label>
                <p className="mt-1 text-sm text-gray-900 capitalize">{claim.claimType.replace('-', ' ')}</p>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {claim.textDescription || 'No description provided'}
                </p>
              </div>
            </div>

            {/* Claim Details from Form */}
            {Object.keys(claimAnswers).length > 0 && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Claim Details
                </label>
                <div className="space-y-2">
                  {Object.entries(claimAnswers).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-xs">
                      <span className="text-gray-600 font-medium capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-900 font-semibold">
                        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : 
                         Array.isArray(value) ? value.join(', ') : 
                         value || 'N/A'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* User ID */}
            {claim.userId && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">User ID</label>
                <p className="mt-1 text-xs font-mono text-gray-700">
                  {claim.userId.toString()}
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'evidence' && (
          <div className="space-y-4">
            {/* Uploaded Files */}
            {claim.uploadedFiles && claim.uploadedFiles.length > 0 ? (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
                  Uploaded Documents ({claim.uploadedFiles.length})
                </label>
                <div className="space-y-2">
                  {claim.uploadedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.filePath ? file.filePath.split('/').pop() : `Document ${index + 1}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {file.fileType || 'Unknown type'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">No evidence files uploaded</p>
              </div>
            )}

            {/* Audio Evidence */}
            {claim.audioPath && (
              <div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Audio Recording
                </label>
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Voice Description</p>
                    <p className="text-xs text-gray-600">{claim.audioPath}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
