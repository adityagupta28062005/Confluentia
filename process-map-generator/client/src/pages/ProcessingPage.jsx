import React from 'react';
import { useParams } from 'react-router-dom';

const ProcessingPage = () => {
    const { documentId } = useParams();

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-medium text-gray-900 mb-4">
                        Processing Document
                    </h2>
                    <p className="text-gray-600 mb-4">
                        Our AI is analyzing your document and extracting process information...
                    </p>
                    <p className="text-sm text-gray-500">
                        Document ID: {documentId}
                    </p>
                    <div className="mt-8 text-sm text-gray-500">
                        This usually takes 30-60 seconds depending on document complexity.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProcessingPage;