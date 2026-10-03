'use client';

import { useState, useEffect, useRef } from 'react';
import AgentWorkflowGraph from './AgentWorkflowGraph';
import ClaimDetailsPanel from './ClaimDetailsPanel';
import ProcessingResults from './ProcessingResults';

export default function ClaimInvestigationConsole({ claim, onBack }) {
  const [processing, setProcessing] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [error, setError] = useState('');
  const [processedData, setProcessedData] = useState(null);
  const pollIntervalRef = useRef(null);

  // Check if claim has already been processed
  useEffect(() => {
    if (claim.agentWorkflow) {
      setWorkflow(claim.agentWorkflow);
      setProcessedData({
        fraudAnalysis: claim.fraudAnalysis,
        payoutDecision: claim.payoutDecision,
        auditSummary: claim.auditSummary,
        processingSummary: claim.processingSummary,
      });
    }
  }, [claim]);

  const handleProcessClaim = async () => {
    setProcessing(true);
    setError('');
    setWorkflow(null);
    setActiveStep(null);

    try {
      const response = await fetch(`/api/admin/claims/${claim._id}/process`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Processing failed');
      }

      const data = await response.json();
      
      if (data.success) {
        setWorkflow(data.claim.agentWorkflow);
        setProcessedData({
          fraudAnalysis: data.claim.fraudAnalysis,
          payoutDecision: data.claim.payoutDecision,
          auditSummary: data.claim.auditSummary,
          processingSummary: data.claim.processingSummary,
        });
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setProcessing(false);
    }
  };

  const canProcess = claim.status === 'AWAITING_PROCESSING' || claim.status === 'pending' || claim.status === 'ERROR';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Claim Investigation #{claim._id?.slice(-8).toUpperCase()}
                </h1>
                <p className="text-sm text-gray-600">AI-powered fraud detection & risk assessment</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {canProcess && (
                <button
                  onClick={handleProcessClaim}
                  disabled={processing}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-white shadow-md transition-all ${
                    processing
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                  }`}
                >
                  {processing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Process Claim
                    </span>
                  )}
                </button>
              )}
              
              {workflow && (
                <button
                  onClick={handleProcessClaim}
                  disabled={processing}
                  className="px-4 py-2.5 rounded-lg font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Reprocess
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Error Message */}
      {error && (
        <div className="max-w-[1800px] mx-auto px-6 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <svg className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Claim Details */}
          <div className="lg:col-span-1">
            <ClaimDetailsPanel claim={claim} />
          </div>

          {/* Right: Workflow & Results */}
          <div className="lg:col-span-2 space-y-6">
            {!workflow && !processing && (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-300 p-12 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Ready to Process</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
                  Click "Process Claim" to begin AI-powered fraud investigation and risk assessment. 
                  The system will analyze this claim through multiple specialized agents.
                </p>
                <button
                  onClick={handleProcessClaim}
                  className="px-6 py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
                >
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Start Investigation
                  </span>
                </button>
              </div>
            )}

            {processing && (
              <div className="bg-white rounded-xl border border-gray-200 p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <svg className="animate-spin h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Processing Claim</h3>
                  <p className="text-sm text-gray-600">Running AI agent workflow...</p>
                </div>
              </div>
            )}

            {workflow && (
              <>
                <AgentWorkflowGraph 
                  workflow={workflow} 
                  processing={processing}
                  onStepSelect={setActiveStep}
                  activeStep={activeStep}
                />
                
                {processedData && (
                  <ProcessingResults 
                    data={processedData}
                    claimId={claim._id}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
