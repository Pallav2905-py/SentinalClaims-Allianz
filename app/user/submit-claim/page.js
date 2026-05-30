'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function SubmitClaimPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 via-blue-50 to-gray-50">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

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

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const loadLauraStormDemo = () => {
    setDescription('A severe storm in Adelaide caused a 20-hour power outage at my home. I lost approximately AUD 250 worth of refrigerated and frozen food due to spoilage. I am claiming reimbursement for the spoiled food items.');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(null);
    setLoading(true);

    try {
      if (description.trim().length < 10) {
        throw new Error('Description must be at least 10 characters long');
      }

      const formData = new FormData();
      formData.append('textDescription', description);
      
      files.forEach((file) => {
        formData.append('files', file);
      });

      const response = await fetch('/api/user/submit-claim', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit claim');
      }

      setSuccess({
        message: data.message,
        claimId: data.claimId,
      });

      // Reset form
      setDescription('');
      setFiles([]);

      // Redirect to claims page after 3 seconds
      setTimeout(() => {
        router.push('/user/claims');
      }, 3000);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Submit Claim</h1>
              <p className="text-sm text-gray-600">File a new insurance claim</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link
              href="/user/claims"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              My Claims
            </Link>
            <Link
              href="/user/policy"
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Policies
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium bg-[#003781] text-white hover:bg-[#002455] rounded-lg transition-colors"
            >
              Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {success ? (
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-200">
            <div className="flex items-start">
              <div className="flex-shrink-0 bg-green-100 rounded-full p-3">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-xl font-bold text-green-800">Claim Submitted Successfully!</h3>
                <p className="mt-2 text-base text-green-700">{success.message}</p>
                <p className="mt-1 text-sm font-medium text-green-600">Claim ID: {success.claimId}</p>
                <p className="mt-3 text-sm text-gray-600">Redirecting to your claims...</p>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-red-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
              </div>
            )}

            {/* Description */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="description" className="block text-sm font-semibold text-gray-900">
                  Incident Description *
                </label>
                <button
                  type="button"
                  onClick={loadLauraStormDemo}
                  className="text-xs px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  Load Laura Storm Demo
                </button>
              </div>
              <textarea
                id="description"
                rows={6}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-[#003781] focus:border-[#003781] bg-white text-gray-900 transition-all"
                placeholder="Describe the incident in detail. Include date, time, location, and what happened..."
                required
                minLength={10}
              />
              <p className={`mt-2 text-sm ${description.trim().length >= 10 ? 'text-green-600' : 'text-gray-500'}`}>
                {description.trim().length}/10 characters {description.trim().length >= 10 ? '✓' : '(required)'}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Your claim will run through Nemo agents: planner, cyber, coverage, weather, fraud, payout, and audit before human review.
              </p>
            </div>

            {/* File Upload */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Supporting Documents (Optional)
              </label>
              <p className="text-sm text-gray-600 mb-4">
                Upload photos, PDFs, documents, or audio recordings related to your claim
              </p>

              {/* Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-[#003781] bg-blue-50'
                    : 'border-gray-300 hover:border-[#003781]'
                }`}
              >
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-600">
                  Drag and drop files here, or{' '}
                  <label htmlFor="file-upload" className="text-[#003781] hover:text-[#002455] cursor-pointer font-semibold">
                    browse
                  </label>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Images, PDFs, Documents, Audio (Max 10MB each)
                </p>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp3,.wav,.m4a"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* File List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-sm font-semibold text-gray-900">
                    Selected Files ({files.length})
                  </p>
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-3 flex-1 min-w-0">
                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="ml-4 text-red-600 hover:text-red-800 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/user/claims"
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
              >
                Cancel
              </Link>
              <div className="flex flex-col items-end">
                <button
                  type="submit"
                  disabled={loading || description.trim().length < 10}
                  className="px-6 py-3 bg-[#003781] text-white rounded-lg hover:bg-[#002455] disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-colors shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </span>
                  ) : 'Submit Claim'}
                </button>
                {!loading && description.trim().length < 10 && (
                  <p className="text-xs text-red-600 mt-1">
                    Description must be at least 10 characters ({description.trim().length}/10)
                  </p>
                )}
              </div>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}
