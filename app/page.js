'use client';

import { useRouter } from 'next/navigation';
import { useSession, signOut } from '@/lib/auth-client';
import Link from 'next/link';

export default function Home() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (isPending) {
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
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-[#003781] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#003781]">SentinelClaims</h1>
              <p className="text-xs text-gray-600">Powered by AI</p>
            </div>
          </div>
          
          <nav className="flex items-center space-x-6">
            {session?.user ? (
              <>
                <span className="text-sm text-gray-700">
                  {session.user.name}
                </span>
                <button
                  onClick={handleSignOut}
                  className="text-sm text-gray-600 hover:text-[#003781] font-medium"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm text-gray-700 hover:text-[#003781] font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 bg-[#003781] text-white text-sm font-medium rounded-lg hover:bg-[#002455] transition-all shadow-sm"
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {session?.user ? (
          <div className="text-center mb-12 animate-fade-in">
            <div className="mb-8">
              <div className="inline-block px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                ✓ Successfully Authenticated
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome back, {session.user.name}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose your workspace to continue managing insurance claims with AI-powered fraud detection
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mt-12">
              {/* User Dashboard Card */}
              <Link
                href="/user/submit-claim"
                className="group p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-[#003781] hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#003781] transition-all">
                  <svg className="w-8 h-8 text-[#003781] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">User Portal</h3>
                <p className="text-gray-600 mb-4">Submit and track your insurance claims</p>
                <div className="flex items-center justify-center text-[#003781] font-medium group-hover:gap-2 transition-all">
                  Go to Portal
                  <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>

              {/* Admin Dashboard Card */}
              <Link
                href="/admin/dashboard"
                className="group p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-[#003781] hover:shadow-xl transition-all"
              >
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#003781] transition-all">
                  <svg className="w-8 h-8 text-[#003781] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Admin Dashboard</h3>
                <p className="text-gray-600 mb-4">Review claims and manage fraud detection</p>
                <div className="flex items-center justify-center text-[#003781] font-medium group-hover:gap-2 transition-all">
                  Go to Dashboard
                  <svg className="w-5 h-5 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center max-w-4xl mx-auto animate-fade-in">
            <div className="mb-8">
              <div className="inline-block px-4 py-2 bg-[#e6f0ff] text-[#003781] rounded-full text-sm font-medium mb-6">
                AI-Powered Insurance Platform
              </div>
              <h2 className="text-5xl font-bold text-gray-900 mb-6">
                Intelligent Claims Processing
                <br />
                <span className="text-[#003781]">Powered by AI</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Advanced fraud detection, automated document analysis, and streamlined claims processing for insurance professionals
              </p>
              <div className="flex items-center justify-center space-x-4">
                <Link
                  href="/signup"
                  className="px-8 py-4 bg-[#003781] text-white font-semibold rounded-lg hover:bg-[#002455] transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 border-2 border-[#003781] text-[#003781] font-semibold rounded-lg hover:bg-[#003781] hover:text-white transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mt-16">
              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#e6f0ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#003781]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Fraud Detection</h3>
                <p className="text-gray-600 text-sm">
                  AI-powered multi-angle fraud analysis with leading and lagging indicators
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#e6f0ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#003781]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Document Analysis</h3>
                <p className="text-gray-600 text-sm">
                  Automatic PDF parsing and intelligent policy document understanding
                </p>
              </div>

              <div className="p-6 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="w-12 h-12 bg-[#e6f0ff] rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#003781]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Policy Copilot</h3>
                <p className="text-gray-600 text-sm">
                  AI assistant for policy questions and claims decision support
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-sm text-gray-600">
            <p className="mb-2">© 2026 SentinelClaims. All rights reserved.</p>
            <p className="text-xs text-gray-500">AI-powered insurance fraud detection and claims processing platform</p>
          </div>
        </div>
      </footer>    </div>
  );
}