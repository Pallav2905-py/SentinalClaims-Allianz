'use client';

import { useState } from 'react';

export default function EvidenceUpload({ files, onChange, onNext, onBack }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);

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
      onChange([...files, ...newFiles]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      onChange([...files, ...newFiles]);
    }
  };

  const removeFile = (index) => {
    onChange(files.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '📷';
    if (ext === 'pdf') return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['mp3', 'wav', 'm4a'].includes(ext)) return '🎵';
    return '📎';
  };

  return (
    <div className="min-h-[calc(100vh-180px)] flex flex-col">
      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 animate-fade-in">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Supporting evidence
            </h2>
            <p className="text-gray-600 mb-6">
              Upload photos, documents, or recordings that support your claim
            </p>

            {/* Upload Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-blue-400 bg-gray-50'
              }`}
            >
              <input
                id="file-upload"
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.mp3,.wav,.m4a"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>

                <div>
                  <label htmlFor="file-upload" className="text-blue-600 font-semibold cursor-pointer hover:text-blue-700">
                    Choose files
                  </label>
                  <span className="text-gray-600"> or drag and drop</span>
                </div>

                <p className="text-sm text-gray-500">
                  Photos, PDFs, Documents, Audio (Max 10MB each)
                </p>
              </div>
            </div>

            {/* File Categories */}
            {files.length === 0 && (
              <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label
                  htmlFor="file-upload"
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">📷</div>
                    <div className="text-sm font-semibold text-gray-900">Photos</div>
                    <div className="text-xs text-gray-500">JPG, PNG</div>
                  </div>
                </label>

                <label
                  htmlFor="file-upload"
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">📄</div>
                    <div className="text-sm font-semibold text-gray-900">Documents</div>
                    <div className="text-xs text-gray-500">PDF, DOC</div>
                  </div>
                </label>

                <label
                  htmlFor="file-upload"
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer"
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🎵</div>
                    <div className="text-sm font-semibold text-gray-900">Audio</div>
                    <div className="text-xs text-gray-500">MP3, WAV</div>
                  </div>
                </label>
              </div>
            )}

            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">
                    Uploaded files ({files.length})
                  </h3>
                  <label
                    htmlFor="file-upload"
                    className="text-sm text-blue-600 font-semibold cursor-pointer hover:text-blue-700"
                  >
                    + Add more
                  </label>
                </div>

                {files.map((file, index) => {
                  const isImage = file.type?.startsWith('image/');
                  const previewUrl = isImage ? URL.createObjectURL(file) : null;

                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      {isImage && previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-white border border-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 text-2xl">
                          {getFileIcon(file.name)}
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size)}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="flex-shrink-0 text-red-600 hover:text-red-800 transition-colors p-2"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            <p className="mt-6 text-xs text-gray-500 text-center">
              {files.length === 0
                ? "Don't have everything right now? You can continue without uploading."
                : 'You can add more evidence later if needed.'}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 shadow-lg">
        <div className="max-w-2xl mx-auto flex justify-between items-center gap-4">
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

          <button
            type="button"
            onClick={onNext}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg transform hover:scale-105 flex items-center"
          >
            Continue
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
