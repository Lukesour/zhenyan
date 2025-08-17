import React from 'react';
import { useAppContext } from '../contexts/AppContext';

const FormPage: React.FC = () => {
  const { isLoading, error, analysisReport } = useAppContext();
  
  return (
    <div>
      <h1>表单页</h1>
    </div>
  );
};

export default FormPage;

