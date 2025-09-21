import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
        return Promise.reject(new Error(errorMessage));
    }
);

// Process service
export const processService = {
    // Upload document
    uploadDocument: async (file) => {
        const formData = new FormData();
        formData.append('document', file);

        return api.post('/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },

    // Process document
    processDocument: async (documentId) => {
        return api.post('/process', { documentId });
    },

    // Get processing status
    getProcessingStatus: async (documentId) => {
        return api.get(`/upload/status/${documentId}`);
    },

    // Get results
    getResults: async (processId) => {
        return api.get(`/results/${processId}`);
    },

    // Export data
    exportData: async (processId, format = 'json') => {
        return api.get(`/export/${processId}`, {
            params: { format },
        });
    },

    // Export document results in target format
    exportDocumentResults: async (documentId) => {
        return api.get(`/export/document/${documentId}`);
    },

    // Get document results in target format (new endpoint)
    getDocumentResults: async (documentId) => {
        return api.get(`/document-results/${documentId}`);
    },

    // Get all processes for a document
    getAllProcesses: async (documentId) => {
        return api.get(`/process/document/${documentId}`);
    },

    // Health check
    healthCheck: async () => {
        return api.get('/health');
    },
};

export default api;