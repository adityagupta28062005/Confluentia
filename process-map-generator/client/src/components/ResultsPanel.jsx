import React, { useState } from 'react';
import { Download, ChevronDown, ChevronRight, AlertTriangle, Shield, Activity } from 'lucide-react';

const ResultsPanel = ({ processData, onExportJSON, onExportBPMN, className = '' }) => {
    const [expandedSections, setExpandedSections] = useState({
        overview: true,
        activities: false,
        risks: false,
        controls: false
    });

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleExportJSON = () => {
        if (!processData) return;

        const dataStr = JSON.stringify(processData, null, 2);
        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `process-data-${Date.now()}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        if (onExportJSON) onExportJSON(processData);
    };

    const handleExportBPMN = () => {
        if (onExportBPMN) onExportBPMN();
    };

    const getRiskLevelColor = (level) => {
        const colors = {
            'High': 'bg-red-100 text-red-800 border-red-200',
            'Medium': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Low': 'bg-green-100 text-green-800 border-green-200'
        };
        return colors[level] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getControlTypeColor = (type) => {
        const colors = {
            'Preventive': 'bg-blue-100 text-blue-800 border-blue-200',
            'Detective': 'bg-purple-100 text-purple-800 border-purple-200',
            'Corrective': 'bg-orange-100 text-orange-800 border-orange-200'
        };
        return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    if (!processData) {
        return (
            <div className={`bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${className}`}>
                <div className="text-gray-400 mb-2">
                    <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No Results</h3>
                <p className="text-gray-500">Process a document to view extracted data and analysis</p>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg overflow-hidden ${className}`}>
            {/* Header */}
            <div className="border-b border-gray-200 p-6 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-semibold text-gray-900">Process Analysis Results</h3>
                        <p className="text-sm text-gray-600 mt-1">Risk assessment and control identification</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={handleExportJSON}
                            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                            <Download className="h-4 w-4" />
                            <span>Export JSON</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="overflow-y-auto" style={{ maxHeight: 'none' }}>
                {/* Overview Section */}
                <div className="border-b border-gray-100">
                    <button
                        onClick={() => toggleSection('overview')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left"
                    >
                        <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-900">Process Overview</span>
                        </div>
                        {expandedSections.overview ?
                            <ChevronDown className="h-5 w-5 text-gray-400" /> :
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        }
                    </button>

                    {expandedSections.overview && (
                        <div className="px-4 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-blue-600">{processData.activities?.length || 0}</div>
                                    <div className="text-sm text-blue-800">Activities</div>
                                </div>
                                <div className="bg-red-50 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-red-600">{processData.risks?.length || 0}</div>
                                    <div className="text-sm text-red-800">Risks Identified</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-lg">
                                    <div className="text-2xl font-bold text-green-600">{processData.controls?.length || 0}</div>
                                    <div className="text-sm text-green-800">Controls</div>
                                </div>
                            </div>

                            {processData.processName && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Process Name</h4>
                                    <p className="text-gray-700 bg-gray-50 p-2 rounded">{processData.processName}</p>
                                </div>
                            )}

                            {processData.description && (
                                <div className="mt-4">
                                    <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                                    <p className="text-gray-700 bg-gray-50 p-2 rounded">{processData.description}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Activities Section */}
                <div className="border-b border-gray-100">
                    <button
                        onClick={() => toggleSection('activities')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left"
                    >
                        <div className="flex items-center space-x-2">
                            <Activity className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-gray-900">Activities ({processData.activities?.length || 0})</span>
                        </div>
                        {expandedSections.activities ?
                            <ChevronDown className="h-5 w-5 text-gray-400" /> :
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        }
                    </button>

                    {expandedSections.activities && (
                        <div className="px-4 pb-4">
                            {processData.activities && processData.activities.length > 0 ? (
                                <div className="space-y-3">
                                    {processData.activities.map((activity, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">{activity.name}</h4>
                                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                    {activity.type || 'Task'}
                                                </span>
                                            </div>
                                            {activity.description && (
                                                <p className="text-gray-600 text-sm">{activity.description}</p>
                                            )}
                                            {activity.performer && (
                                                <p className="text-xs text-gray-500 mt-1">Performer: {activity.performer}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No activities identified</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Risks Section */}
                <div className="border-b border-gray-100">
                    <button
                        onClick={() => toggleSection('risks')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left"
                    >
                        <div className="flex items-center space-x-2">
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                            <span className="font-medium text-gray-900">Risks ({processData.risks?.length || 0})</span>
                        </div>
                        {expandedSections.risks ?
                            <ChevronDown className="h-5 w-5 text-gray-400" /> :
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        }
                    </button>

                    {expandedSections.risks && (
                        <div className="px-4 pb-4">
                            {processData.risks && processData.risks.length > 0 ? (
                                <div className="space-y-3">
                                    {processData.risks.map((risk, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">{risk.name}</h4>
                                                <span className={`text-xs px-2 py-1 rounded border ${getRiskLevelColor(risk.level)}`}>
                                                    {risk.level} Risk
                                                </span>
                                            </div>
                                            {risk.description && (
                                                <p className="text-gray-600 text-sm mb-2">{risk.description}</p>
                                            )}
                                            {risk.category && (
                                                <p className="text-xs text-gray-500">Category: {risk.category}</p>
                                            )}
                                            {risk.impact && (
                                                <p className="text-xs text-gray-500">Impact: {risk.impact}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No risks identified</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Controls Section */}
                <div>
                    <button
                        onClick={() => toggleSection('controls')}
                        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 text-left"
                    >
                        <div className="flex items-center space-x-2">
                            <Shield className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-gray-900">Controls ({processData.controls?.length || 0})</span>
                        </div>
                        {expandedSections.controls ?
                            <ChevronDown className="h-5 w-5 text-gray-400" /> :
                            <ChevronRight className="h-5 w-5 text-gray-400" />
                        }
                    </button>

                    {expandedSections.controls && (
                        <div className="px-4 pb-4">
                            {processData.controls && processData.controls.length > 0 ? (
                                <div className="space-y-3">
                                    {processData.controls.map((control, index) => (
                                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-medium text-gray-900">{control.name}</h4>
                                                <span className={`text-xs px-2 py-1 rounded border ${getControlTypeColor(control.type)}`}>
                                                    {control.type}
                                                </span>
                                            </div>
                                            {control.description && (
                                                <p className="text-gray-600 text-sm mb-2">{control.description}</p>
                                            )}
                                            {control.frequency && (
                                                <p className="text-xs text-gray-500">Frequency: {control.frequency}</p>
                                            )}
                                            {control.owner && (
                                                <p className="text-xs text-gray-500">Owner: {control.owner}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">No controls identified</p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsPanel;