'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import ClaimTypeSelector from '@/components/claim/ClaimTypeSelector';
import ClaimProgress from '@/components/claim/ClaimProgress';
import QuestionCard from '@/components/claim/QuestionCard';
import EvidenceUpload from '@/components/claim/EvidenceUpload';
import ClaimReview from '@/components/claim/ClaimReview';
import ClaimSubmitted from '@/components/claim/ClaimSubmitted';
import { getAllClaimTypes, getClaimFlow, getDemoData } from '@/lib/claim-flows';

const STAGES = {
  TYPE_SELECT: 'type-select',
  QUESTIONS: 'questions',
  EVIDENCE: 'evidence',
  REVIEW: 'review',
  SUBMITTED: 'submitted',
};

export default function SubmitClaimPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  // State
  const [stage, setStage] = useState(STAGES.TYPE_SELECT);
  const [claimTypeId, setClaimTypeId] = useState(null);
  const [claimFlow, setClaimFlow] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedClaimId, setSubmittedClaimId] = useState(null);
  const [error, setError] = useState('');

  // Auto-save draft
  useEffect(() => {
    if (claimTypeId && Object.keys(answers).length > 0) {
      const draft = {
        claimTypeId,
        answers,
        files: files.map(f => f.name),
        timestamp: Date.now(),
      };
      localStorage.setItem('claim_draft', JSON.stringify(draft));
    }
  }, [claimTypeId, answers, files]);

  // Load draft on mount
  useEffect(() => {
    const draft = localStorage.getItem('claim_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Only restore if less than 24 hours old
        if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          // Could prompt user to restore
        }
      } catch (e) {
        // Ignore invalid draft
      }
    }
  }, []);

  if (isPending) {
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

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleClaimTypeSelect = (typeId) => {
    const flow = getClaimFlow(typeId);
    setClaimTypeId(typeId);
    setClaimFlow(flow);
    setStage(STAGES.QUESTIONS);
    setCurrentQuestionIndex(0);
    setAnswers({});
  };

  const loadDemoData = () => {
    const demo = getDemoData(claimTypeId);
    if (demo) {
      setAnswers(demo);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const getVisibleQuestions = () => {
    if (!claimFlow) return [];
    
    return claimFlow.questions.filter(question => {
      if (!question.conditionalOn) return true;
      
      const condValue = answers[question.conditionalOn.field];
      return condValue === question.conditionalOn.value;
    });
  };

  const handleQuestionNext = () => {
    const visibleQuestions = getVisibleQuestions();
    if (currentQuestionIndex < visibleQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setStage(STAGES.EVIDENCE);
    }
  };

  const handleQuestionBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    } else {
      setStage(STAGES.TYPE_SELECT);
      setClaimTypeId(null);
      setClaimFlow(null);
    }
  };

  const handleEvidenceNext = () => {
    setStage(STAGES.REVIEW);
  };

  const handleEvidenceBack = () => {
    const visibleQuestions = getVisibleQuestions();
    setCurrentQuestionIndex(visibleQuestions.length - 1);
    setStage(STAGES.QUESTIONS);
  };

  const handleReviewEdit = (questionIndex) => {
    setCurrentQuestionIndex(questionIndex);
    if (questionIndex < getVisibleQuestions().length) {
      setStage(STAGES.QUESTIONS);
    } else {
      setStage(STAGES.EVIDENCE);
    }
  };

  const handleReviewBack = () => {
    setStage(STAGES.EVIDENCE);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError('');

    try {
      // Build text description from answers
      const visibleQuestions = getVisibleQuestions();
      const description = visibleQuestions
        .map(q => {
          const value = answers[q.id];
          if (value === null || value === undefined || value === '') return null;
          
          let formattedValue = value;
          if (q.type === 'boolean') formattedValue = value ? 'Yes' : 'No';
          if (q.type === 'multi-select' && Array.isArray(value)) {
            formattedValue = value.join(', ');
          }
          
          return `${q.question}\n${formattedValue}`;
        })
        .filter(Boolean)
        .join('\n\n');

      const formData = new FormData();
      formData.append('textDescription', description);
      formData.append('claimType', claimTypeId);
      formData.append('claimAnswers', JSON.stringify(answers));
      
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

      setSubmittedClaimId(data.claimId);
      setStage(STAGES.SUBMITTED);
      
      // Clear draft
      localStorage.removeItem('claim_draft');

    } catch (err) {
      setError(err.message);
      setSubmitting(false);
    }
  };

  const visibleQuestions = getVisibleQuestions();
  const totalSteps = visibleQuestions.length + 2; // questions + evidence + review
  const currentStep = stage === STAGES.QUESTIONS 
    ? currentQuestionIndex 
    : stage === STAGES.EVIDENCE 
    ? visibleQuestions.length 
    : visibleQuestions.length + 1;

  // Submitted state
  if (stage === STAGES.SUBMITTED && submittedClaimId) {
    return (
      <ClaimSubmitted 
        claimId={submittedClaimId} 
        claimType={claimFlow}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Submit Claim</h1>
                {claimFlow && (
                  <p className="text-xs text-gray-600">{claimFlow.title}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {stage !== STAGES.TYPE_SELECT && stage !== STAGES.SUBMITTED && claimTypeId && (
                <button
                  onClick={loadDemoData}
                  className="hidden sm:flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
                >
                  <span className="mr-2">✨</span>
                  Load Demo
                </button>
              )}
              
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      {stage !== STAGES.TYPE_SELECT && stage !== STAGES.SUBMITTED && (
        <ClaimProgress 
          currentStep={currentStep} 
          totalSteps={totalSteps}
          steps={['Details', 'Evidence', 'Review']}
        />
      )}

      {/* Error Message */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {stage === STAGES.TYPE_SELECT && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            <ClaimTypeSelector 
              claimTypes={getAllClaimTypes()} 
              onSelect={handleClaimTypeSelect}
            />
          </div>
        )}

        {stage === STAGES.QUESTIONS && visibleQuestions[currentQuestionIndex] && (
          <QuestionCard
            question={visibleQuestions[currentQuestionIndex]}
            value={answers[visibleQuestions[currentQuestionIndex].id]}
            onChange={(value) => handleAnswerChange(visibleQuestions[currentQuestionIndex].id, value)}
            onNext={handleQuestionNext}
            onBack={handleQuestionBack}
            isFirst={currentQuestionIndex === 0}
            isLast={currentQuestionIndex === visibleQuestions.length - 1}
            error={visibleQuestions[currentQuestionIndex].required ? 'This field is required' : ''}
          />
        )}

        {stage === STAGES.EVIDENCE && (
          <EvidenceUpload
            files={files}
            onChange={setFiles}
            onNext={handleEvidenceNext}
            onBack={handleEvidenceBack}
          />
        )}

        {stage === STAGES.REVIEW && (
          <ClaimReview
            claimType={claimFlow}
            answers={answers}
            files={files}
            questions={visibleQuestions}
            onEdit={handleReviewEdit}
            onSubmit={handleSubmit}
            onBack={handleReviewBack}
            submitting={submitting}
          />
        )}
      </main>
    </div>
  );
}
