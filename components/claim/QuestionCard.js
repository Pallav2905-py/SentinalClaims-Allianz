'use client';

import { useState, useEffect } from 'react';

export default function QuestionCard({
  question,
  value,
  onChange,
  onNext,
  onBack,
  isFirst,
  isLast,
  error,
}) {
  const [localValue, setLocalValue] = useState(value || '');
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  const handleChange = (newValue) => {
    setLocalValue(newValue);
    setTouched(true);
    onChange(newValue);
  };

  const handleNext = () => {
    setTouched(true);
    if (isValid()) {
      onNext();
    }
  };

  const isValid = () => {
    if (!question.required) return true;
    
    if (question.type === 'boolean') {
      return localValue === true || localValue === false;
    }
    
    if (question.type === 'multi-select') {
      return Array.isArray(localValue) && localValue.length > 0;
    }

    if (question.type === 'currency') {
      return localValue !== '' && localValue !== null && localValue >= 0;
    }
    
    if (question.minLength) {
      return localValue && localValue.toString().trim().length >= question.minLength;
    }
    
    return localValue !== '' && localValue !== null && localValue !== undefined;
  };

  const renderInput = () => {
    switch (question.type) {
      case 'textarea':
        return (
          <div>
            <textarea
              value={localValue}
              onChange={(e) => handleChange(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder={question.placeholder}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-base"
              autoFocus
            />
            {question.minLength && (
              <p className={`mt-2 text-sm ${
                localValue.length >= question.minLength ? 'text-green-600' : 'text-gray-500'
              }`}>
                {localValue.length}/{question.minLength} characters
                {localValue.length >= question.minLength && ' ✓'}
              </p>
            )}
          </div>
        );

      case 'text':
        return (
          <input
            type="text"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            placeholder={question.placeholder}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-base"
            autoFocus
          />
        );

      case 'date':
        const maxDate = question.maxDate === 'today' ? new Date().toISOString().split('T')[0] : question.maxDate;
        return (
          <input
            type="date"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            max={maxDate}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-base"
            autoFocus
          />
        );

      case 'time':
        return (
          <input
            type="time"
            value={localValue}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={() => setTouched(true)}
            className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-base"
            autoFocus
          />
        );

      case 'currency':
        return (
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 text-base font-medium">
              ₹
            </span>
            <input
              type="number"
              value={localValue}
              onChange={(e) => handleChange(parseFloat(e.target.value) || 0)}
              onBlur={() => setTouched(true)}
              placeholder={question.placeholder || '0'}
              min={question.min || 0}
              step="100"
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-900 text-base"
              autoFocus
            />
          </div>
        );

      case 'boolean':
        return (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => handleChange(true)}
              className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                localValue === true
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handleChange(false)}
              className={`p-4 rounded-xl border-2 font-semibold transition-all ${
                localValue === false
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }`}
            >
              No
            </button>
          </div>
        );

      case 'single-select':
        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange(option.value)}
                className={`w-full p-4 rounded-xl border-2 font-medium transition-all text-left flex items-center space-x-3 ${
                  localValue === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                {option.icon && (
                  <span className="text-2xl">{option.icon}</span>
                )}
                <span>{option.label}</span>
                {localValue === option.value && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        );

      case 'multi-select':
        const selectedValues = Array.isArray(localValue) ? localValue : [];
        const toggleOption = (optionValue) => {
          const newValues = selectedValues.includes(optionValue)
            ? selectedValues.filter((v) => v !== optionValue)
            : [...selectedValues, optionValue];
          handleChange(newValues);
        };

        return (
          <div className="space-y-3">
            {question.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => toggleOption(option.value)}
                className={`w-full p-4 rounded-xl border-2 font-medium transition-all text-left flex items-center space-x-3 ${
                  selectedValues.includes(option.value)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
                }`}
              >
                {option.icon && (
                  <span className="text-2xl">{option.icon}</span>
                )}
                <span>{option.label}</span>
                {selectedValues.includes(option.value) && (
                  <span className="ml-auto text-blue-600">✓</span>
                )}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              {question.question}
            </h2>
            
            {question.helper && (
              <p className="text-gray-600 mb-6">
                {question.helper}
              </p>
            )}

            {renderInput()}

            {touched && !isValid() && error && (
              <p className="mt-3 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
          {!isFirst ? (
            <button
              type="button"
              onClick={onBack}
              className="px-6 py-3 text-gray-700 font-semibold hover:bg-gray-100 rounded-xl transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={touched && !isValid()}
            className={`px-8 py-3 rounded-xl font-bold transition-all shadow-lg flex items-center ${
              touched && !isValid()
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transform hover:scale-105'
            }`}
          >
            {isLast ? 'Review' : 'Continue'}
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
