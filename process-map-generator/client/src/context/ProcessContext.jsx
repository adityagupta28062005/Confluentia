import React, { createContext, useContext, useState } from 'react';

const ProcessContext = createContext();

export const useProcessContext = () => {
  const context = useContext(ProcessContext);
  if (!context) {
    throw new Error('useProcessContext must be used within a ProcessProvider');
  }
  return context;
};

export const ProcessProvider = ({ children }) => {
  const [processData, setProcessData] = useState(null);
  const [bpmnXml, setBpmnXml] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentDocument, setCurrentDocument] = useState(null);

  const clearData = () => {
    setProcessData(null);
    setBpmnXml(null);
    setError(null);
    setCurrentDocument(null);
  };

  const value = {
    processData,
    setProcessData,
    bpmnXml,
    setBpmnXml,
    isLoading,
    setIsLoading,
    error,
    setError,
    currentDocument,
    setCurrentDocument,
    clearData,
  };

  return (
    <ProcessContext.Provider value={value}>
      {children}
    </ProcessContext.Provider>
  );
};