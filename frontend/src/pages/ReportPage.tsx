import React, { useEffect } from 'react';
import { Tabs, Spin, Alert } from 'antd';
import { useAppContext } from '../contexts/AppContext';
import { fetchAnalysisReport } from '../api/analysisAPI';
import RadarChart from '../components/report/RadarChart';

const { TabPane } = Tabs;

const ReportPage: React.FC = () => {
  const { isLoading, error, analysisReport, setIsLoading, setError, setAnalysisReport } = useAppContext();

  useEffect(() => {
    const loadAnalysisReport = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // 创建一个模拟的 UserBackground 用于测试
        const mockUserBackground = {
          academic: {
            university: "清华大学",
            universityTier: "Tier 0",
            major: "计算机科学与技术",
            majorCategory: "CS",
            gpa: 3.8,
            graduationYear: 2024
          },
          applicationIntent: {
            countries: ["美国"],
            majors: ["计算机科学"],
            degree: "Master"
          },
          experience: {
            research: [],
            internship: [],
            competition: [],
            others: []
          }
        };
        
        const report = await fetchAnalysisReport(mockUserBackground);
        setAnalysisReport(report);
      } catch (err) {
        setError(err instanceof Error ? err.message : '加载失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalysisReport();
  }, [setIsLoading, setError, setAnalysisReport]);

  if (isLoading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spin size="large" />
        <p>正在加载分析报告...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert
          message="加载失败"
          description={error}
          type="error"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>分析报告</h1>
      <Tabs defaultActiveKey="1" size="large">
        <TabPane tab="综合评估" key="1">
          <h3>综合评估</h3>
          {analysisReport && (
            <div>
              <h4>竞争力雷达图</h4>
              <RadarChart data={analysisReport.competitiveness.radarChart} />
              
              <div style={{ marginTop: '24px' }}>
                <h4>优势分析</h4>
                <p style={{ 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f', 
                  borderRadius: '6px', 
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  {analysisReport.competitiveness.strengths}
                </p>
                
                <h4>劣势分析</h4>
                <p style={{ 
                  background: '#fff2e8', 
                  border: '1px solid #ffbb96', 
                  borderRadius: '6px', 
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  {analysisReport.competitiveness.weaknesses}
                </p>
                
                <h4>综合评价</h4>
                <p style={{ 
                  background: '#e6f7ff', 
                  border: '1px solid #91d5ff', 
                  borderRadius: '6px', 
                  padding: '16px'
                }}>
                  {analysisReport.competitiveness.summary}
                </p>
              </div>
            </div>
          )}
        </TabPane>
        <TabPane tab="选校建议" key="2">
          <h3>选校建议</h3>
          {analysisReport && (
            <div>
              {analysisReport.schoolRecommendations.map((school, index) => (
                <div key={index} style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  background: '#fff'
                }}>
                  <h4 style={{ color: '#1890ff', marginBottom: '8px' }}>
                    {school.university} - {school.major}
                  </h4>
                  <p style={{ 
                    color: '#666', 
                    lineHeight: '1.6',
                    marginBottom: '12px'
                  }}>
                    {school.reason}
                  </p>
                  <div style={{ fontSize: '14px', color: '#999' }}>
                    <strong>支持案例:</strong> {school.supportingCases.length} 个相似案例
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabPane>
        <TabPane tab="相似案例" key="3">
          <h3>相似案例</h3>
          {analysisReport && (
            <div>
              {analysisReport.similarCases.map((case_, index) => (
                <div key={index} style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px',
                  background: '#fff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ color: '#1890ff', margin: 0 }}>
                      案例 #{case_.caseId}
                    </h4>
                    <span style={{
                      background: '#52c41a',
                      color: 'white',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      相似度: {(case_.similarity * 100).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <strong>录取结果:</strong> {case_.admissionResult.university} - {case_.admissionResult.major}
                  </div>
                  
                  <div style={{ marginBottom: '12px' }}>
                    <strong>背景对比:</strong> GPA {case_.background.gpa}, {case_.background.language.type} {case_.background.language.score}, {case_.background.universityTier}
                  </div>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <strong>对比分析:</strong>
                    <p style={{ color: '#666', margin: '8px 0 0 0' }}>{case_.comparison}</p>
                  </div>
                  
                  <div>
                    <strong>可借鉴经验:</strong>
                    <p style={{ color: '#666', margin: '8px 0 0 0' }}>{case_.takeaways}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabPane>
        <TabPane tab="背景提升" key="4">
          <h3>背景提升</h3>
          {analysisReport && (
            <div>
              <h4>时间轴计划</h4>
              <div style={{ marginBottom: '20px' }}>
                {analysisReport.improvementPlan.timeline.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: '16px',
                    padding: '16px',
                    border: '1px solid #d9d9d9',
                    borderRadius: '8px',
                    background: '#fff'
                  }}>
                    <div style={{
                      background: '#1890ff',
                      color: 'white',
                      padding: '8px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      marginRight: '16px',
                      minWidth: '80px',
                      textAlign: 'center'
                    }}>
                      {item.timeframe}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h5 style={{ margin: '0 0 8px 0', color: '#1890ff' }}>
                        {item.action}
                      </h5>
                      <p style={{ margin: 0, color: '#666' }}>
                        {item.goal}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <h4>总体策略</h4>
              <div style={{
                background: '#f0f8ff',
                border: '1px solid #91d5ff',
                borderRadius: '6px',
                padding: '16px'
              }}>
                <p style={{ margin: 0, lineHeight: '1.6' }}>
                  {analysisReport.improvementPlan.strategySummary}
                </p>
              </div>
            </div>
          )}
        </TabPane>
        <TabPane tab="原始数据" key="5">
          <h3>原始数据</h3>
          {analysisReport && (
            <pre style={{ 
              background: '#f5f5f5', 
              padding: '16px', 
              borderRadius: '4px',
              overflow: 'auto',
              maxHeight: '500px'
            }}>
              {JSON.stringify(analysisReport, null, 2)}
            </pre>
          )}
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReportPage;

