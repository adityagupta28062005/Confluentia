import React, { useState } from 'react';
import { useProcessContext } from '../context/ProcessContext';
import { processService } from '../services/api';
import FileUpload from '../components/FileUpload';
import BpmnViewer from '../components/BpmnViewer';
import ResultsPanel from '../components/ResultsPanel';

const Home = () => {
    const {
        processData,
        bpmnXml,
        setProcessData,
        setBpmnXml,
        isLoading,
        setIsLoading,
        error,
        setError
    } = useProcessContext();

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState(null);
    const [documentId, setDocumentId] = useState(null);
    const [allProcesses, setAllProcesses] = useState([]);
    const [selectedProcessIndex, setSelectedProcessIndex] = useState(0);

    const handleFileSelect = (file) => {
        setSelectedFile(file);
        setError(null);
        setUploadStatus(null);
        setDocumentId(null);
        // Clear previous results
        setProcessData(null);
        setBpmnXml(null);
        setAllProcesses([]);
        setSelectedProcessIndex(0);
    };

    const handleFileRemove = () => {
        setSelectedFile(null);
        setUploadStatus(null);
        setDocumentId(null);
        setError(null);
    };

    const handleFileUpload = async (file) => {
        if (!file) return;

        setIsLoading(true);
        setError(null);
        setUploadStatus('processing');

        try {
            // Step 1: Upload the file
            const uploadResponse = await processService.uploadDocument(file);

            if (!uploadResponse.success) {
                throw new Error(uploadResponse.message || 'Upload failed');
            }

            const documentId = uploadResponse.data.documentId;
            setDocumentId(documentId);

            // Step 2: Wait for processing to complete by polling status
            let processingComplete = false;
            let attempts = 0;
            const maxAttempts = 60; // 60 attempts = 5 minutes max

            while (!processingComplete && attempts < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, 2000)); // Reduced to 2 seconds

                try {
                    const statusResponse = await processService.getProcessingStatus(documentId);

                    if (statusResponse.success) {
                        const status = statusResponse.data.status;

                        if (status === 'completed') {
                            processingComplete = true;
                            // Get all processes for the document
                            const allProcessesResponse = await processService.getAllProcesses(documentId);

                            if (allProcessesResponse.success && allProcessesResponse.data.processes.length > 0) {
                                const processes = allProcessesResponse.data.processes;
                                console.log('Loaded processes:', processes.length);
                                console.log('First process BPMN XML length:', processes[0]?.bpmnXml?.length);
                                console.log('First process BPMN XML preview:', processes[0]?.bpmnXml?.substring(0, 200));

                                setAllProcesses(processes);

                                // Set the first process as default
                                console.log('Setting first process as default');
                                setProcessData(processes[0]);
                                setBpmnXml(processes[0].bpmnXml);
                                setSelectedProcessIndex(0);
                                setUploadStatus('success');
                            } else {
                                throw new Error('Failed to retrieve processes');
                            }
                        } else if (status === 'failed') {
                            throw new Error('Document processing failed');
                        }
                        // Continue polling if status is 'uploaded', 'parsing', 'parsed', 'extracting'
                    }
                } catch (statusError) {
                    console.warn('Status check failed:', statusError);
                    // Continue polling even if status check fails
                }

                attempts++;
            }

            if (!processingComplete) {
                throw new Error('Processing timeout - please try again');
            }

        } catch (error) {
            console.error('Processing error:', error);
            setError(error.message || 'An unexpected error occurred');
            setUploadStatus('error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportJSON = async (data) => {
        console.log('Exporting JSON:', data);

        if (!documentId) {
            console.error('No document ID available for export');
            return;
        }

        try {
            // Create the export URL
            const exportUrl = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/export/document/${documentId}`;

            // Create a temporary link and trigger download
            const link = document.createElement('a');
            link.href = exportUrl;
            link.download = `json_output_${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Export failed:', error);
            setError('Failed to export JSON data');
        }
    };

    const handleExportBPMN = () => {
        if (!bpmnXml) return;

        const blob = new Blob([bpmnXml], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `process-map-${Date.now()}.bpmn`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleProcessSelect = (index) => {
        console.log('Selecting process at index:', index);
        console.log('Available processes:', allProcesses.length);

        if (allProcesses[index]) {
            console.log('Process selected:', allProcesses[index].name);
            console.log('BPMN XML length:', allProcesses[index].bpmnXml?.length);

            setSelectedProcessIndex(index);
            setProcessData(allProcesses[index]);
            setBpmnXml(allProcesses[index].bpmnXml);
        } else {
            console.error('Process not found at index:', index);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Hero Section */}
                <div className="text-center mb-12">
                    <div className="relative">
                        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent mb-6">
                            Automated Process Map Generator
                        </h1>
                    </div>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Transform your business documents into interactive{' '}
                        <span className="text-blue-600 font-semibold">BPMN process maps</span> with{' '}
                        <span className="text-purple-600 font-semibold">AI-powered</span> risk and control identification.
                    </p>
                </div>

                {/* Enhanced Error Alert */}
                {error && (
                    <div className="mb-8 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-lg animate-in slide-in-from-top-4 duration-500">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-full">
                                    <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            </div>
                            <div className="ml-4 flex-1">
                                <h3 className="text-lg font-semibold text-red-800 mb-1">Processing Error</h3>
                                <div className="text-red-700">
                                    <p className="leading-relaxed">{error}</p>
                                </div>
                                <button
                                    onClick={() => setError(null)}
                                    className="mt-3 text-sm font-medium text-red-600 hover:text-red-500 underline decoration-2 underline-offset-2"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-8">
                    {/* File Upload Section */}
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <FileUpload
                            onFileSelect={handleFileSelect}
                            onFileRemove={handleFileRemove}
                            onUpload={handleFileUpload}
                            isUploading={isLoading}
                        />
                    </div>

                    {/* Results Section - Only show if we have data */}
                    {(processData || bpmnXml) && (
                        <div className="space-y-6">
                            {/* Enhanced Process Selector - Only show if multiple processes */}
                            {allProcesses.length > 1 && (
                                <div className="bg-gradient-to-r from-white to-blue-50 rounded-xl shadow-lg p-6 border border-blue-100">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                        <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                            Found {allProcesses.length} Processes
                                        </h3>
                                        <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                                    </div>
                                    <p className="text-gray-600 mb-4 text-sm">
                                        Select a process below to view its detailed analysis and interactive diagram
                                    </p>
                                    <div className="flex flex-wrap gap-3">
                                        {allProcesses.map((process, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleProcessSelect(index)}
                                                className={`group relative px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${selectedProcessIndex === index
                                                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                                                    : 'bg-white text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-gray-200 hover:border-blue-300 shadow-sm hover:shadow-md'
                                                    }`}
                                            >
                                                <span className="relative z-10">{process.processName}</span>
                                                {selectedProcessIndex === index && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20"></div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Process Map Section - Full Width */}
                            <div className="space-y-8">
                                {/* BPMN Viewer - Large Display */}
                                <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-8 border border-blue-100">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-3 h-3 bg-green-400 rounded-full shadow-lg"></div>
                                            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                                Process Map Visualization
                                            </h3>
                                        </div>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={handleExportBPMN}
                                                className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/25 text-sm font-medium rounded-lg transition-all duration-300 transform hover:scale-105"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Export BPMN
                                            </button>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <BpmnViewer
                                            bpmnXml={bpmnXml}
                                            processData={processData}
                                            onExport={handleExportJSON}
                                            className="h-[700px] border-2 border-blue-200 rounded-xl shadow-inner bg-white"
                                        />

                                    </div>
                                </div>

                                {/* Enhanced Results Panel - Below Process Map */}
                                <div className="bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-xl border border-purple-100">
                                    <ResultsPanel
                                        processData={processData}
                                        onExportJSON={handleExportJSON}
                                        onExportBPMN={handleExportBPMN}
                                        className="min-h-96"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Loading State */}
                    {isLoading && (
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl shadow-xl p-12 border border-blue-200">
                            <div className="text-center">
                                {/* Simple loader */}
                                <div className="relative mb-8">
                                    <div className="w-16 h-16 mx-auto bg-blue-600 rounded-full flex items-center justify-center">
                                        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                                    Processing Document
                                </h3>
                                <p className="text-lg text-gray-600 mb-6 max-w-md mx-auto">
                                    Our AI is analyzing your document and generating the interactive process map...
                                </p>

                                {/* Progress steps */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                                    <div className="text-center">
                                        <div className="bg-blue-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                            <span className="text-blue-600 font-bold text-lg">1</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">Document Parsing</h4>
                                        <p className="text-gray-600 text-sm">
                                            Extracting text and structure from your document
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className="bg-purple-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                            <span className="text-purple-600 font-bold text-lg">2</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">AI Analysis</h4>
                                        <p className="text-gray-600 text-sm">
                                            Identifying processes, risks, and controls using AI
                                        </p>
                                    </div>

                                    <div className="text-center">
                                        <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-3 flex items-center justify-center">
                                            <span className="text-green-600 font-bold text-lg">3</span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">BPMN Generation</h4>
                                        <p className="text-gray-600 text-sm">
                                            Creating interactive process diagrams
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-8 text-sm text-gray-500 bg-gray-50 rounded-lg p-4">
                                    ⏱️ This may take 30-60 seconds depending on document complexity.
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Instructions */}
                    {!selectedFile && !processData && !isLoading && (
                        <div className="bg-white rounded-lg shadow-sm p-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">How it works</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="text-center">
                                    <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">1</span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-2">Upload Document</h4>
                                    <p className="text-gray-600 text-sm">
                                        Upload your business process document (PDF, DOCX, or XLSX)
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">2</span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-2">AI Analysis</h4>
                                    <p className="text-gray-600 text-sm">
                                        Our AI extracts processes, identifies risks, and detects controls
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                                        <span className="text-blue-600 font-bold">3</span>
                                    </div>
                                    <h4 className="font-medium text-gray-900 mb-2">Get Results</h4>
                                    <p className="text-gray-600 text-sm">
                                        View interactive BPMN diagrams and export structured data
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;