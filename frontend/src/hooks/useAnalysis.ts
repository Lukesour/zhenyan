import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { fetchAnalysisReport } from '../api/analysisAPI';
import { UserBackground } from '../types';

export const useAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { setAnalysisReport, setError } = useAppContext();

  const submitAnalysis = async (formData: UserBackground) => {
    try {
      setIsLoading(true);
      setError(null);

      // 先跳转到进度页
      navigate('/progress');

      // 调用API获取分析报告
      const report = await fetchAnalysisReport(formData);
      
      // 将报告存入AppContext
      setAnalysisReport(report);
      
      // 获取数据成功后跳转到报告页
      navigate('/report');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '提交失败，请重试';
      setError(errorMessage);
      // 出错时跳转回表单页
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    submitAnalysis
  };
};
