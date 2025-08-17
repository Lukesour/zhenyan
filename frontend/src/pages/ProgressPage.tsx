import React, { useEffect } from 'react';
import { Spin, Card, Typography, Progress } from 'antd';
import { useAppContext } from '../contexts/AppContext';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const ProgressPage: React.FC = () => {
  const { analysisReport } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    // 如果已经有分析报告，直接跳转到报告页
    if (analysisReport) {
      navigate('/report');
    }
  }, [analysisReport, navigate]);

  return (
    <div style={{ 
      padding: '40px 20px', 
      maxWidth: '600px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <Card>
        <Title level={2} style={{ marginBottom: '30px' }}>
          正在分析您的申请背景
        </Title>
        
        <div style={{ marginBottom: '30px' }}>
          <Spin size="large" />
        </div>
        
        <Text type="secondary" style={{ fontSize: '16px' }}>
          我们正在分析您的学术背景、语言成绩、标准化考试和各类经历...
        </Text>
        
        <div style={{ marginTop: '30px' }}>
          <Progress 
            percent={75} 
            status="active"
            strokeColor={{
              '0%': '#108ee9',
              '100%': '#87d068',
            }}
          />
        </div>
        
        <div style={{ marginTop: '20px' }}>
          <Text type="secondary">
            预计需要 1-2 分钟完成分析
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default ProgressPage;

