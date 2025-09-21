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
        viewer.on('import.done', ({ error, warnings }) => {
            if (error) {
                console.error('BPMN import failed:', error);
                setError('Failed to load BPMN diagram: ' + error.message);
                setIsLoading(false);
            } else {
                console.log('BPMN import successful', warnings ? `with ${warnings.length} warnings` : '');
                if (warnings && warnings.length > 0) {
                    console.warn('BPMN import warnings:', warnings);
                }
                setError(null);
                setIsLoading(false);
                // Fit diagram to viewport after successful import
                setTimeout(() => {
                    try {
                        viewer.get('canvas').zoom('fit-viewport');
                    } catch (zoomError) {
                        console.warn('Could not zoom to fit viewport:', zoomError);
                    }
                }, 100);
            }
        });

        return () => {
            if (viewer) {
                viewer.destroy();
            }
        };
    }, []);

    useEffect(() => {
        if (bpmnXml && viewerRef.current) {
            console.log('BpmnViewer: Starting to import XML for process');
            console.log('BPMN XML length:', bpmnXml?.length);
            console.log('BPMN XML preview:', bpmnXml?.substring(0, 200));

            setIsLoading(true);
            setError(null);

            // Add a small delay to ensure viewer is ready
            setTimeout(() => {
                if (viewerRef.current) {
                    viewerRef.current.importXML(bpmnXml)
                        .then(() => {
                            console.log('BPMN XML imported successfully');
                            setIsLoading(false);
                        })
                        .catch((err) => {
                            console.error('Failed to import BPMN XML:', err);
                            console.error('BPMN XML that failed:', bpmnXml);
                            setError('Failed to display BPMN diagram');
                            setIsLoading(false);
                        });
                } else {
                    console.error('Viewer not available after delay');
                    setError('BPMN viewer not ready');
                    setIsLoading(false);
                }
            }, 100);
        } else {
            console.log('BpmnViewer: No XML or viewer available', {
                hasXml: !!bpmnXml,
                hasViewer: !!viewerRef.current,
                xmlLength: bpmnXml?.length
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
            {/* Compact Toolbar */}
            <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                    <h4 className="font-medium text-gray-900">Interactive BPMN Diagram</h4>
                    <span className="text-sm text-gray-500">
                        {processData?.processName || 'Process Map'}
                    </span>
                </div>

                <div className="flex items-center space-x-2">
                    {/* Zoom Controls */}
                    <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
                        <button
                            onClick={handleZoomOut}
                            className="p-1.5 hover:bg-gray-100 rounded-l-md"
                            title="Zoom Out"
                        >
                            <ZoomOut className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleResetZoom}
                            className="p-1.5 hover:bg-gray-100 border-x border-gray-300"
                            title="Fit to Screen"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handleZoomIn}
                            className="p-1.5 hover:bg-gray-100 rounded-r-md"
                            title="Zoom In"
                        >
                            <ZoomIn className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Export Buttons */}
                    <button
                        onClick={handleExportSVG}
                        className="flex items-center space-x-1 px-2 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                        title="Export as SVG"
                    >
                        <Download className="h-3 w-3" />
                        <span>SVG</span>
                    </button>

                    <button
                        onClick={handleExportJSON}
                        className="flex items-center space-x-1 px-2 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                        title="Export process data as JSON"
                    >
                        <Download className="h-3 w-3" />
                        <span>JSON</span>
                    </button>

                    {/* Fullscreen Toggle */}
                    <button
                        onClick={handleFullscreen}
                        className="p-1.5 border border-gray-300 rounded-md hover:bg-gray-100"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                    >
                        <Maximize2 className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {/* BPMN Container */}
            <div className="relative" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : 'calc(100% - 60px)' }}>
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
                />
            </div>
        </div>
    );
};

export default BpmnViewer;