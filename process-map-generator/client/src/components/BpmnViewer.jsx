import React, { useEffect, useRef, useState } from 'react';
import BpmnJS from 'bpmn-js/lib/Viewer';
import { Download, ZoomIn, ZoomOut, RotateCcw, Maximize2 } from 'lucide-react';

const BpmnViewer = ({ bpmnXml, processData, onExport, className = '' }) => {
  const containerRef = useRef(null);
  const viewerRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Initialize BPMN viewer
    const viewer = new BpmnJS({
      container: containerRef.current,
      width: '100%',
      height: '100%',
    });

    viewerRef.current = viewer;

    // Add event listeners
    viewer.on('import.done', ({ error }) => {
      if (error) {
        console.error('BPMN import failed:', error);
        setError('Failed to load BPMN diagram');
      } else {
        setError(null);
        // Fit diagram to viewport
        viewer.get('canvas').zoom('fit-viewport');
      }
      setIsLoading(false);
    });

    return () => {
      viewer.destroy();
    };
  }, []);

  useEffect(() => {
    if (bpmnXml && viewerRef.current) {
      setIsLoading(true);
      setError(null);
      
      viewerRef.current.importXML(bpmnXml).catch((err) => {
        console.error('Failed to import BPMN XML:', err);
        setError('Failed to display BPMN diagram');
        setIsLoading(false);
      });
    }
  }, [bpmnXml]);

  const handleZoomIn = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom(canvas.zoom() * 1.2);
    }
  };

  const handleZoomOut = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom(canvas.zoom() / 1.2);
    }
  };

  const handleResetZoom = () => {
    if (viewerRef.current) {
      const canvas = viewerRef.current.get('canvas');
      canvas.zoom('fit-viewport');
    }
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleExportSVG = async () => {
    if (!viewerRef.current) return;

    try {
      const { svg } = await viewerRef.current.saveSVG();
      const blob = new Blob([svg], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'process-map.svg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export SVG:', error);
      alert('Failed to export diagram');
    }
  };

  const handleExportJSON = () => {
    if (onExport && processData) {
      onExport(processData);
    }
  };

  if (!bpmnXml) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-400 mb-2">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Process Map</h3>
          <p className="text-gray-500">Upload and process a document to view the generated BPMN diagram</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative bg-white border border-gray-200 rounded-lg overflow-hidden ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-lg font-medium text-gray-900">Process Map</h3>
        
        <div className="flex items-center space-x-2">
          {/* Zoom Controls */}
          <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-100 rounded-l-md"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 hover:bg-gray-100 border-x border-gray-300"
              title="Fit to Screen"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-100 rounded-r-md"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>

          {/* Export Controls */}
          <div className="flex items-center space-x-1">
            <button
              onClick={handleExportSVG}
              className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              title="Export as SVG"
            >
              <Download className="h-4 w-4" />
              <span className="text-sm">SVG</span>
            </button>
            
            {processData && (
              <button
                onClick={handleExportJSON}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                title="Export Process Data"
              >
                <Download className="h-4 w-4" />
                <span className="text-sm">JSON</span>
              </button>
            )}
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={handleFullscreen}
            className="p-2 border border-gray-300 rounded-md hover:bg-gray-100"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* BPMN Container */}
      <div className="relative" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '500px' }}>
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Loading diagram...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50">
            <div className="text-center p-4">
              <div className="text-red-400 mb-2">
                <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-red-600 font-medium">{error}</p>
            </div>
          </div>
        )}

        <div
          ref={containerRef}
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Process Info Panel */}
      {processData && (
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Activities:</span>
              <span className="ml-2 text-gray-600">{processData.activities?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Risks:</span>
              <span className="ml-2 text-gray-600">{processData.risks?.length || 0}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Controls:</span>
              <span className="ml-2 text-gray-600">{processData.controls?.length || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BpmnViewer;