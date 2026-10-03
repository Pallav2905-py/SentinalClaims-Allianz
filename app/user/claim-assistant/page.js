'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { getRequiredDocuments } from '@/lib/demo-policies';

export default function ClaimAssistantPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const policyId = searchParams.get('policyId');
  
  const [policy, setPolicy] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [claimData, setClaimData] = useState({});
  const [documents, setDocuments] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [stage, setStage] = useState('chat'); // chat, documents, review, submitted
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!isPending && !session) {
      router.push('/login');
    } else if (session && policyId) {
      fetchPolicy();
    }
  }, [session, isPending, policyId, router]);

  useEffect(() => {
    if (policy && messages.length === 0) {
      const welcomeMessage = {
        role: 'assistant',
        content: `Hi! I'll help you file a claim for your ${policy.insuranceType} insurance policy (${policy.policyNumber}).\n\nTell me what happened, and I'll guide you through the process. Don't worry about providing everything at once - I'll ask for any additional information I need.`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [policy]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchPolicy = async () => {
    try {
      const response = await fetch(`/api/user/policies/${policyId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setPolicy(data.policy);
      }
    } catch (error) {
      console.error('Error fetching policy:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/claim-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          message: inputMessage.trim(),
          conversationHistory: messages,
          claimData: claimData,
          policyContext: {
            insuranceType: policy?.insuranceType,
            policyNumber: policy?.policyNumber,
            policyId: policy?._id,
          },
        }),
      });

      if (!response.ok) throw new Error('Failed to process message');

      const data = await response.json();

      setClaimData(data.claimData);
      setCurrentQuestion(data.nextQuestion);

      const assistantMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        question: data.nextQuestion,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If no more questions, move to documents stage
      if (!data.nextQuestion) {
        setTimeout(() => setStage('documents'), 1000);
      }
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again or continue manually.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickResponse = (value) => {
    setInputMessage(value);
    setTimeout(() => {
      const form = document.querySelector('form');
      form?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }, 100);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files || []);
    setDocuments(prev => [...prev, ...files]);
  };

  const removeDocument = (index) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  const handleReview = () => {
    setStage('review');
  };

  const handleSubmitClaim = async () => {
    setSubmitting(true);

    try {
      const formData = new FormData();
      
      // Build description from claim data
      const description = Object.entries(claimData)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n');
      
      formData.append('textDescription', description);
      formData.append('claimType', policy.insuranceType);
      formData.append('claimAnswers', JSON.stringify(claimData));
      formData.append('policyId', policyId);
      
      documents.forEach(file => {
        formData.append('files', file);
      });

      const response = await fetch('/api/user/submit-claim', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) throw new Error('Failed to submit claim');

      const data = await response.json();
      
      setStage('submitted');
      setClaimData({ ...claimData, claimId: data.claimId });

      // Redirect after 5 seconds
      setTimeout(() => {
        router.push('/user/claims');
      }, 5000);
    } catch (error) {
      alert('Failed to submit claim: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const requiredDocs = policy ? getRequiredDocuments(policy.insuranceType, claimData) : [];
  const progress = Math.min(Object.keys(claimData).length * 20, 80);

  if (isPending || !policy) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-blue-50 via-white to-gray-50">
        <div className="flex items-center space-x-3">
          <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-gray-700 font-medium">Loading...</span>
        </div>
      </div>
    );
  }

  // Submitted State
  if (stage === 'submitted') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Submitted Successfully!</h1>
          <p className="text-gray-600 mb-4">Your claim has been submitted and is being processed</p>
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-sm text-gray-600 mb-1">Claim ID</p>
            <p className="text-xl font-mono font-bold text-gray-900">
              {claimData.claimId?.slice(0, 12).toUpperCase()}
            </p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link
              href="/user/claims"
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700"
            >
              View My Claims
            </Link>
            <Link
              href="/user/policies"
              className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
            >
              Back to Policies
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Review State
  if (stage === 'review') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Review Your Claim</h1>
              <button
                onClick={() => setStage('documents')}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700"
              >
                ← Back
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h2 className="text-xl font-bold text-white">Claim Summary</h2>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Policy</h3>
                <p className="text-gray-900">{policy.insuranceType} - {policy.policyNumber}</p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Claim Details</h3>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  {Object.entries(claimData).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <span className="text-sm font-semibold text-gray-900">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-2">Documents ({documents.length})</h3>
                {documents.length > 0 ? (
                  <div className="space-y-2">
                    {documents.map((doc, idx) => (
                      <div key={idx} className="text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                        📎 {doc.name}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                )}
              </div>
            </div>

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex gap-3">
              <button
                onClick={() => setStage('documents')}
                className="flex-1 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleSubmitClaim}
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm & Submit Claim'}
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Documents State
  if (stage === 'documents') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-900">Upload Documents</h1>
              <button
                onClick={() => setStage('chat')}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700"
              >
                ← Back to Chat
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Required Documents</h2>
            
            <div className="space-y-3 mb-6">
              {requiredDocs.map(doc => {
                const uploaded = documents.some(d => d.name.toLowerCase().includes(doc.id));
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      {uploaded ? (
                        <span className="text-green-600 text-xl">✓</span>
                      ) : doc.required ? (
                        <span className="text-orange-600 text-xl">⚠</span>
                      ) : (
                        <span className="text-gray-400 text-xl">○</span>
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{doc.name}</p>
                        <p className="text-xs text-gray-500">{doc.required ? 'Required' : 'Optional'}</p>
                      </div>
                    </div>
                    {uploaded && <span className="text-xs text-green-600 font-semibold">Uploaded</span>}
                  </div>
                );
              })}
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700"
              >
                📷 Upload or Take Photo
              </button>
              <p className="text-xs text-gray-500 mt-2">Photos, PDFs, or documents</p>
            </div>

            {documents.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-900 mb-2">Uploaded ({documents.length})</h3>
                <div className="space-y-2">
                  {documents.map((doc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">📎 {doc.name}</span>
                      <button
                        onClick={() => removeDocument(idx)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleReview}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-green-700"
            >
              Continue to Review →
            </button>
          </div>
        </main>
      </div>
    );
  }

  // Chat State (Main)
  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link href="/user/policies" className="text-gray-600 hover:text-blue-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Claim Assistant</h1>
                <p className="text-xs text-gray-600 capitalize">{policy.insuranceType} Insurance Claim</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-2xl rounded-2xl px-4 py-3 ${
                    msg.role === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white shadow-md text-gray-900'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    
                    {msg.question && msg.question.inputType === 'boolean' && (
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => handleQuickResponse('Yes')}
                          className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm font-semibold hover:bg-green-600"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleQuickResponse('No')}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-semibold hover:bg-gray-600"
                        >
                          No
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl px-4 py-3 shadow-md">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Describe what happened..."
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Sidebar - Hidden on mobile */}
        <div className="hidden lg:block w-80 border-l border-gray-200 bg-white p-4 overflow-y-auto">
          <div className="space-y-4">
            {/* Progress */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Progress</h3>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">{progress}% complete</p>
            </div>

            {/* Collected Info */}
            {Object.keys(claimData).length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-gray-900 mb-2">Collected Information</h3>
                <div className="space-y-2">
                  {Object.entries(claimData).map(([key, value]) => (
                    <div key={key} className="text-xs">
                      <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span>
                      <p className="font-semibold text-gray-900">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Required Docs */}
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2">Required Documents</h3>
              <div className="space-y-1">
                {requiredDocs.slice(0, 5).map(doc => (
                  <div key={doc.id} className="flex items-center text-xs">
                    <span className={doc.required ? 'text-orange-500' : 'text-gray-400'}>
                      {doc.required ? '⚠' : '○'}
                    </span>
                    <span className="ml-2 text-gray-700">{doc.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Button */}
            {Object.keys(claimData).length > 2 && (
              <button
                onClick={() => setStage('documents')}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:from-blue-600 hover:to-blue-700"
              >
                Upload Documents →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
