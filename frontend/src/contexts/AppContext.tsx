import React, { createContext, useContext, useState, ReactNode } from 'react';
import { AnalysisReport } from '../types';

interface AppContextType {
  isLoading: boolean;
  error: string | null;
  analysisReport: AnalysisReport | null;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setAnalysisReport: (report: AnalysisReport | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisReport, setAnalysisReport] = useState<AnalysisReport | null>(null);

  const value = {
    isLoading,
    error,
    analysisReport,
    setIsLoading,
    setError,
    setAnalysisReport,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};



