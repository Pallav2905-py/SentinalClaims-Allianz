'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

export default function PolicyDetailPage({ params }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [policy, setPolicy] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const chatEndRef = useRef(null);
  const [policyId, setPolicyId] = useState(null);

  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setPolicyId(resolved.id);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    }
    if (session && policyId) {
      fetchPolicy();
      fetchChatHistory();
    }
  }, [session, isPending, router, policyId]);

  const fetchPolicy = async () => {
    try {
      const response = await fetch(`/api/policy/${policyId}`);
      const data = await response.json();
      if (response.ok) {
        setPolicy(data.policy);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Failed to load policy');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const response = await fetch(`/api/policy/${policyId}/chat`);
      const data = await response.json();
      if (response.ok) {
        setChatHistory(data.chatHistory || []);
      }
    } catch (err) {
      console.error('Error fetching chat:', err);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim() || sending) return;

    setSending(true);
    setError('');

    try {
      const response = await fetch(`/api/policy/${policyId}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer');
      }

      // Add user message and AI response to chat
      setChatHistory(prev => [
        ...prev,
        { role: 'user', content: question.trim(), timestamp: new Date() },
        { role: 'assistant', content: data.answer, timestamp: new Date() },
      ]);

      setQuestion('');
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);

    } catch (err) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  if (isPending || loading || !policy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-3 border-[#003781] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading policy...</span>
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
              <Link href="/user/policy" className="text-gray-600 hover:text-[#003781]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{policy.policyNumber}</h1>
                <p className="text-sm text-gray-600">{policy.fileName}</p>
              </div>
            </div>
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
              policy.status === 'active' ? 'bg-green-100 text-green-800' :
              policy.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
            </span>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#003781] text-[#003781]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'chat'
                  ? 'border-[#003781] text-[#003781]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Ask Questions
              {chatHistory.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-[#003781] text-white text-xs rounded-full">
                  {Math.floor(chatHistory.length / 2)}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            {/* Summary */}
            {policy.summary && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Policy Summary</h2>
                <p className="text-gray-700 leading-relaxed">{policy.summary}</p>
              </div>
            )}

            {/* Coverage Details */}
            {policy.coverageDetails && Object.keys(policy.coverageDetails).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Coverage Details</h2>
                <div className="space-y-3">
                  {Object.entries(policy.coverageDetails).map(([key, value]) => (
                    <div key={key} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-700 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                      <span className="text-gray-900">{typeof value === 'object' ? JSON.stringify(value) : value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Limits */}
            {policy.limits && Object.keys(policy.limits).length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Coverage Limits</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {Object.entries(policy.limits).map(([key, value]) => (
                    <div key={key} className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                      <p className="text-sm text-gray-600 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                      <p className="text-lg font-semibold text-[#003781]">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Exclusions */}
            {policy.exclusions && policy.exclusions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Exclusions</h2>
                <ul className="space-y-2">
                  {policy.exclusions.map((exclusion, idx) => (
                    <li key={idx} className="flex items-start">
                      <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{exclusion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Key Terms */}
            {policy.keyTerms && policy.keyTerms.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Terms & Definitions</h2>
                <div className="space-y-4">
                  {policy.keyTerms.map((item, idx) => (
                    <div key={idx} className="border-l-4 border-[#003781] pl-4 py-2">
                      <h3 className="font-semibold text-gray-900 mb-1">{item.term}</h3>
                      <p className="text-sm text-gray-700">{item.definition}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Chat Interface */
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 300px)' }}>
            <div className="flex flex-col h-full">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-[#e6f0ff] rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-[#003781]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ask me anything about your policy</h3>
                    <p className="text-gray-600 text-sm">I can help you understand coverage, limits, exclusions, and more</p>
                  </div>
                ) : (
                  <>
                    {chatHistory.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-3xl rounded-lg px-4 py-3 ${
                          msg.role === 'user'
                            ? 'bg-[#003781] text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <div className="flex items-start space-x-2">
                            {msg.role === 'assistant' && (
                              <svg className="w-5 h-5 text-[#003781] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                              </svg>
                            )}
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="px-6 py-3 bg-red-50 border-t border-red-200">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              {/* Input Form */}
              <form onSubmit={handleAskQuestion} className="border-t border-gray-200 p-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask a question about your policy..."
                    disabled={sending || policy.status !== 'active'}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003781] focus:border-[#003781] disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    type="submit"
                    disabled={sending || !question.trim() || policy.status !== 'active'}
                    className="px-6 py-3 bg-[#003781] text-white font-medium rounded-lg hover:bg-[#002455] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {sending ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Asking...</span>
                      </div>
                    ) : (
                      'Ask'
                    )}
                  </button>
                </div>
                {policy.status !== 'active' && (
                  <p className="text-xs text-gray-500 mt-2">
                    Policy is currently {policy.status}. Chat will be available once analysis is complete.
                  </p>
                )}
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
