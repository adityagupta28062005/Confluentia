import React, { createContext, useContext, useReducer } from 'react';

const AppContext = createContext();

const initialState = {
    currentDocument: null,
    currentProcess: null,
    uploadProgress: 0,
    processingStatus: 'idle', // idle, uploading, processing, completed, error
    error: null,
    user: {
        session: null,
        preferences: {
            theme: 'light',
            autoExtract: true
        }
    }
};

function appReducer(state, action) {
    switch (action.type) {
        case 'SET_DOCUMENT':
            return {
                ...state,
                currentDocument: action.payload,
                error: null
            };

        case 'SET_PROCESS':
            return {
                ...state,
                currentProcess: action.payload,
                error: null
            };

        case 'SET_UPLOAD_PROGRESS':
            return {
                ...state,
                uploadProgress: action.payload
            };

        case 'SET_PROCESSING_STATUS':
            return {
                ...state,
                processingStatus: action.payload,
                error: action.payload === 'error' ? state.error : null
            };

        case 'SET_ERROR':
            return {
                ...state,
                error: action.payload,
                processingStatus: 'error'
            };

        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null
            };

        case 'RESET_UPLOAD':
            return {
                ...state,
                currentDocument: null,
                uploadProgress: 0,
                processingStatus: 'idle',
                error: null
            };

        case 'UPDATE_PREFERENCES':
            return {
                ...state,
                user: {
                    ...state.user,
                    preferences: {
                        ...state.user.preferences,
                        ...action.payload
                    }
                }
            };

        default:
            return state;
    }
}

export function AppProvider({ children }) {
    const [state, dispatch] = useReducer(appReducer, initialState);

    const actions = {
        setDocument: (document) => dispatch({ type: 'SET_DOCUMENT', payload: document }),
        setProcess: (process) => dispatch({ type: 'SET_PROCESS', payload: process }),
        setUploadProgress: (progress) => dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: progress }),
        setProcessingStatus: (status) => dispatch({ type: 'SET_PROCESSING_STATUS', payload: status }),
        setError: (error) => dispatch({ type: 'SET_ERROR', payload: error }),
        clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
        resetUpload: () => dispatch({ type: 'RESET_UPLOAD' }),
        updatePreferences: (preferences) => dispatch({ type: 'UPDATE_PREFERENCES', payload: preferences })
    };

    const value = {
        ...state,
        ...actions
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
}

export default AppContext;