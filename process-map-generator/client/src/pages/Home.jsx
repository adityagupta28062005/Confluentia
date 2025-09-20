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

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setError(null);
    // Clear previous results
    setProcessData(null);
    setBpmnXml(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setError(null);
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      // Step 1: Upload the file
      const uploadResponse = await processService.uploadDocument(file);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.message || 'Upload failed');
      }

      const documentId = uploadResponse.data.documentId;

      // Step 2: Process the document
      const processResponse = await processService.processDocument(documentId);
      
      if (!processResponse.success) {
        throw new Error(processResponse.message || 'Processing failed');
      }

      // Step 3: Get the results
      const resultsResponse = await processService.getResults(processResponse.data.processId);
      
      if (!resultsResponse.success) {
        throw new Error('Failed to retrieve results');
      }

      // Update context with results
      setProcessData(resultsResponse.data.processData);
      setBpmnXml(resultsResponse.data.bpmnXml);

    } catch (error) {
      console.error('Processing error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportJSON = (data) => {
    console.log('Exporting JSON:', data);
    // Additional export logic can be added here
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Automated Process Map Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Transform your business documents into interactive BPMN process maps with AI-powered risk and control identification.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Processing Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* BPMN Viewer */}
              <div className="space-y-4">
                <BpmnViewer
                  bpmnXml={bpmnXml}
                  processData={processData}
                  onExport={handleExportJSON}
                  className="h-96"
                />
              </div>

              {/* Results Panel */}
              <div className="space-y-4">
                <ResultsPanel
                  processData={processData}
                  onExportJSON={handleExportJSON}
                  onExportBPMN={handleExportBPMN}
                  className="h-96"
                />
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Processing Document</h3>
                <p className="text-gray-600">
                  AI is analyzing your document and generating the process map...
                </p>
                <div className="mt-4 text-sm text-gray-500">
                  This may take 30-60 seconds depending on document complexity.
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
      </div>
    </div>
  );
};

export default Home;