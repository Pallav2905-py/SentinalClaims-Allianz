'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function PolicyCopilotPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
    if (session) {
      fetchPolicies();
    }
  }, [session, isPending, router]);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('/api/policy/upload');
      const data = await response.json();
      if (response.ok) {
        setPolicies(data.policies || []);
      }
    } catch (err) {
      console.error('Error fetching policies:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file || !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('files', file);
      formData.append('policyType', 'general');

      const response = await fetch('/api/policy/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload policy');
      }

      setSuccess(data.message);
      fetchPolicies();
      
      // Redirect to policy details after 2 seconds
      setTimeout(() => {
        router.push(`/user/policy/${data.policyId}`);
      }, 2000);

    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      active: 'bg-green-100 text-green-800 border-green-200',
      error: 'bg-red-100 text-red-800 border-red-200',
      archived: 'bg-gray-100 text-gray-800 border-gray-200',
    };

    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full border ${styles[status] || styles.processing}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isPending || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-3 border-[#003781] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/user/submit-claim" className="text-gray-600 hover:text-[#003781]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Policy Copilot</h1>
                <p className="text-sm text-gray-600">AI-powered policy assistant</p>
              </div>
            </div>
            <Link
              href="/"
              className="px-4 py-2 text-gray-700 hover:text-[#003781] font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Policy Document</h2>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
              dragActive
                ? 'border-[#003781] bg-blue-50'
                : 'border-gray-300 hover:border-[#003781]'
            }`}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-[#e6f0ff] rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-[#003781]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {uploading ? 'Uploading and analyzing...' : 'Upload your insurance policy'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Drag and drop your PDF policy document, or{' '}
                <label htmlFor="file-upload" className="text-[#003781] font-medium cursor-pointer hover:underline">
                  browse files
                </label>
              </p>
              <p className="text-xs text-gray-500">PDF format only (Max 10MB)</p>
              <input
                id="file-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
        </div>

        {/* Policies List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Policies</h2>
          </div>

          {policies.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600 mb-2">No policies uploaded yet</p>
              <p className="text-sm text-gray-500">Upload your first policy document to get started</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {policies.map((policy) => (
                <Link
                  key={policy._id}
                  href={`/user/policy/${policy._id}`}
                  className="block p-6 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{policy.policyNumber}</h3>
                        {getStatusBadge(policy.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{policy.fileName}</p>
                      {policy.summary && (
                        <p className="text-sm text-gray-700 line-clamp-2">{policy.summary}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Uploaded {new Date(policy.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
