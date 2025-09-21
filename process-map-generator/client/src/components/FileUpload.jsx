import React, { useState, useCallback, useRef } from 'react';
import { Upload, File, X, CheckCircle, AlertCircle, Zap, ArrowRight } from 'lucide-react';

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
        <div className="w-full max-w-4xl mx-auto">
            {/* Enhanced Upload Area */}
            {!selectedFile && (
                <div
                    className={`
                        relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer 
                        transition-all duration-500 transform hover:scale-[1.02] interactive-card
                        ${isDragOver
                            ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50 shadow-xl shadow-blue-500/25'
                            : 'border-gray-300 hover:border-blue-400 bg-gradient-to-br from-white to-gray-50 hover:shadow-lg'
                        }
                    `}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                >
                    {/* Upload icon */}
                    <div className="relative mb-6">
                        <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Upload className="h-10 w-10 text-white" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        Upload Your Document
                    </h3>
                    <p className="text-gray-600 mb-6 text-lg max-w-md mx-auto leading-relaxed">
                        Drag and drop your business document here, or click to browse
                    </p>

                    {/* Supported formats */}
                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                            PDF
                        </span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                            DOCX
                        </span>
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                            XLSX
                        </span>
                    </div>

                    {/* Upload button */}
                    <button className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center mx-auto">
                        <Zap className="w-5 h-5 mr-2" />
                        Choose File
                    </button>

                    <p className="text-sm text-gray-500 mt-4">
                        Maximum file size: 10MB
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

            {/* Enhanced Selected File Display */}
            {selectedFile && (
                <div className="bg-gradient-to-r from-white to-green-50 border-2 border-green-200 rounded-2xl p-8 shadow-lg animate-slide-in-from-top">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                                {getFileIcon(selectedFile)}
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 text-lg">{selectedFile.name}</h4>
                                <p className="text-green-600 font-medium">{formatFileSize(selectedFile.size)}</p>
                            </div>
                            <div className="flex items-center space-x-1 bg-green-100 px-3 py-1 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <span className="text-green-700 text-sm font-medium">Ready</span>
                            </div>
                        </div>
                        <button
                            onClick={handleRemoveFile}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                            disabled={isUploading}
                        >
                            <X className="h-5 w-5 text-gray-400 group-hover:text-red-500" />
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

                    {/* Enhanced Upload Button */}
                    {selectedFile && uploadStatus !== 'success' && (
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className={`
                w-full py-4 px-8 rounded-xl font-bold text-lg transition-all duration-300 flex items-center justify-center space-x-3 group
                ${isUploading
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105 hover:shadow-xl text-white'
                                }
              `}
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                    <span>Processing Your Document...</span>
                                </>
                            ) : (
                                <>
                                    <Upload className="h-6 w-6" />
                                    <span>Generate Process Map</span>
                                    <ArrowRight className="h-6 w-6" />
                                </>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default FileUpload;