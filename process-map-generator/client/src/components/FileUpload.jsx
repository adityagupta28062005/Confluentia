import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react';

const FileUpload = ({ onFileSelect, onFileRemove, onUpload, isUploading = false, acceptedFileTypes = ['.pdf', '.docx', '.xlsx'] }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', null
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only PDF, DOCX, and XLSX files are allowed' };
    }

    return { valid: true };
  };

  const handleFileSelect = useCallback((file) => {
    const validation = validateFile(file);
    
    if (!validation.valid) {
      setUploadStatus('error');
      alert(validation.error);
      return;
    }

    setSelectedFile(file);
    setUploadStatus(null);
    setUploadProgress(0);
    
    if (onFileSelect) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadStatus(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (onFileRemove) {
      onFileRemove();
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !onUpload) return;

    try {
      setUploadProgress(0);
      setUploadStatus(null);
      
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await onUpload(selectedFile);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      setUploadStatus('success');
    } catch (error) {
      setUploadStatus('error');
      setUploadProgress(0);
      console.error('Upload failed:', error);
    }
  };

  const getFileIcon = (file) => {
    return <File className="h-8 w-8" />;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Upload Area */}
      {!selectedFile && (
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${isDragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Upload your document
          </h3>
          <p className="text-gray-500 mb-4">
            Drag and drop your file here, or click to browse
          </p>
          <p className="text-sm text-gray-400">
            Supports PDF, DOCX, XLSX files up to 10MB
          </p>
          
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept={acceptedFileTypes.join(',')}
            onChange={handleFileInputChange}
          />
        </div>
      )}

      {/* Selected File Display */}
      {selectedFile && (
        <div className="border rounded-lg p-6 bg-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getFileIcon(selectedFile)}
              <div>
                <h4 className="font-medium text-gray-900">{selectedFile.name}</h4>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            </div>
            <button
              onClick={handleRemoveFile}
              className="p-1 hover:bg-gray-100 rounded"
              disabled={isUploading}
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* Progress Bar */}
          {(isUploading || uploadProgress > 0) && (
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Status Messages */}
          {uploadStatus === 'success' && (
            <div className="flex items-center space-x-2 text-green-600 mb-4">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm">File uploaded successfully!</span>
            </div>
          )}

          {uploadStatus === 'error' && (
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm">Upload failed. Please try again.</span>
            </div>
          )}

          {/* Upload Button */}
          {selectedFile && uploadStatus !== 'success' && (
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className={`
                w-full py-2 px-4 rounded-md font-medium transition-colors duration-200
                ${isUploading
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {isUploading ? 'Processing...' : 'Process Document'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUpload;