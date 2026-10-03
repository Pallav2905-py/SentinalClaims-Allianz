'use client';

export default function ClaimReview({
  claimType,
  answers,
  files,
  questions,
  onEdit,
  onSubmit,
  onBack,
  submitting,
}) {
  const formatValue = (question, value) => {
    if (value === null || value === undefined || value === '') return 'Not provided';

    switch (question.type) {
      case 'boolean':
        return value ? 'Yes' : 'No';
      case 'currency':
        return `₹${parseFloat(value).toLocaleString('en-IN')}`;
      case 'multi-select':
        if (Array.isArray(value)) {
          return value
            .map((v) => {
              const option = question.options?.find((opt) => opt.value === v);
              return option ? option.label : v;
            })
            .join(', ');
        }
        return value;
      case 'single-select':
        const option = question.options?.find((opt) => opt.value === value);
        return option ? option.label : value;
      case 'date':
        return new Date(value).toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'time':
        return value;
      default:
        return value.toString();
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 md:px-8 py-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                Review your claim
              </h2>
              <p className="text-blue-100">
                Please verify all information before submitting
              </p>
            </div>

            {/* Claim Type */}
            <div className="px-6 md:px-8 py-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <span className="text-4xl">{claimType.icon}</span>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {claimType.title}
                  </h3>
                  <p className="text-sm text-gray-600">{claimType.description}</p>
                </div>
              </div>
            </div>

            {/* Answers */}
            <div className="px-6 md:px-8 py-6 space-y-6">
              {questions.map((question, index) => {
                const value = answers[question.id];
                
                // Skip if conditional and condition not met
                if (question.conditionalOn) {
                  const condValue = answers[question.conditionalOn.field];
                  if (condValue !== question.conditionalOn.value) {
                    return null;
                  }
                }

                return (
                  <div
                    key={question.id}
                    className="pb-6 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-semibold text-gray-700">
                        {question.question}
                      </h4>
                      <button
                        type="button"
                        onClick={() => onEdit(index)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {formatValue(question, value)}
                    </p>
                  </div>
                );
              })}

              {/* Files */}
              <div className="pb-6">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-semibold text-gray-700">
                    Supporting evidence
                  </h4>
                  <button
                    type="button"
                    onClick={() => onEdit(questions.length)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                  >
                    Edit
                  </button>
                </div>
                {files.length > 0 ? (
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center space-x-2 text-sm text-gray-900"
                      >
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z" clipRule="evenodd" />
                        </svg>
                        <span>{file.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No files uploaded</p>
                )}
              </div>
            </div>

            {/* Info Box */}
            <div className="px-6 md:px-8 py-4 bg-blue-50 border-t border-blue-100">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-blue-900">
                  <p className="font-semibold mb-1">What happens next?</p>
                  <p className="text-blue-800">
                    Your claim will be processed through our AI-powered workflow including coverage verification, fraud analysis, and payout calculation. You'll receive updates at each stage.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
          <button
            type="button"
            onClick={onBack}
            disabled={submitting}
            className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors flex items-center disabled:opacity-50"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold hover:from-green-600 hover:to-green-700 transition-all shadow-lg transform hover:scale-105 flex items-center disabled:opacity-50 disabled:transform-none"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit Claim
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
