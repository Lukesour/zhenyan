import axios from 'axios';
import { AnalysisReport, UserBackground } from '../types';

const API_BASE_URL = 'http://localhost:3001';

export const fetchAnalysisReport = async (userBackground: UserBackground): Promise<AnalysisReport> => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/analyze`, userBackground);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(`API调用失败: ${error.response?.data?.message || error.message}`);
    }
    throw new Error('未知错误');
  }
};

