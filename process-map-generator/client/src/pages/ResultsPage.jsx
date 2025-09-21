import React from 'react';
import { useParams } from 'react-router-dom';

const ResultsPage = () => {
    const { processId } = useParams();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">
                        Process Analysis Results
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Results for process: {processId}
                    </p>
                    <div className="text-center py-12">
                        <p className="text-gray-500">
                            Results page implementation - coming soon!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResultsPage;