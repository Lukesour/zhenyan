import { Router } from 'express';
import { AnalysisReport, UserBackground } from '../../types';
import SupabaseService from '../../services/supabaseService';
import ScoringService from '../../services/scoringService';
import SimilarityService, { ProcessedCase } from '../../utils/similarity';
import { GemmaService } from '../../services/gemmaService';

const router = Router();

// 模拟报告数据
const mockReport: AnalysisReport = {
  competitiveness: {
    radarChart: {
      academic: 85,
      language: 78,
      research: 92,
      internship: 88,
      university: 89
    },
    strengths: "这是一个模拟的优势分析。您在学术背景方面表现优秀，GPA较高，专业匹配度良好。科研经历丰富，有多个项目经验，这为您的申请提供了强有力的支撑。",
    weaknesses: "这是一个模拟的短板分析。语言成绩相对较低，可能需要进一步提升。标准化考试成绩有待提高，建议重新备考以获得更好的分数。",
    summary: "这是一个模拟的综合评价。总体而言，您具备申请目标院校的基本条件，但在某些方面还有提升空间。建议重点关注语言成绩和标准化考试的提升。"
  },
  schoolRecommendations: [
    {
      university: "卡内基梅隆大学",
      major: "计算机科学",
      reason: "这是一个模拟的推荐理由。基于您的背景，该校在计算机科学领域排名靠前，且录取标准与您的条件匹配。",
      supportingCases: [
        { caseId: "case_001", similarity: 0.87 },
        { caseId: "case_002", similarity: 0.82 }
      ]
    },
    {
      university: "哥伦比亚大学",
      major: "数据科学",
      reason: "这是一个模拟的推荐理由。该校在数据科学领域有很强的实力，且您的背景与该专业要求高度匹配。",
      supportingCases: [
        { caseId: "case_003", similarity: 0.79 },
        { caseId: "case_004", similarity: 0.76 }
      ]
    }
  ],
  similarCases: [
    {
      caseId: "case_001",
      similarity: 0.87,
      admissionResult: {
        university: "卡内基梅隆大学",
        major: "计算机科学"
      },
      background: {
        gpa: 3.8,
        language: { type: "TOEFL", score: 105 },
        universityTier: "Tier 1"
      },
      comparison: "这是一个模拟的对比分析。该案例与您的背景非常相似，GPA相近，科研经历丰富，最终成功录取。",
      takeaways: "这是一个模拟的可借鉴经验。建议重点关注科研项目的深度和质量，同时提升语言成绩。"
    },
    {
      caseId: "case_002",
      similarity: 0.82,
      admissionResult: {
        university: "斯坦福大学",
        major: "人工智能"
      },
      background: {
        gpa: 3.7,
        language: { type: "TOEFL", score: 108 },
        universityTier: "Tier 1"
      },
      comparison: "这是一个模拟的对比分析。该案例在语言成绩方面略优于您，但整体背景相似度很高。",
      takeaways: "这是一个模拟的可借鉴经验。语言成绩是申请顶尖院校的重要因素，建议重点提升。"
    }
  ],
  improvementPlan: {
    timeline: [
      {
        timeframe: "3个月内",
        action: "提升语言成绩",
        goal: "TOEFL达到105分以上或IELTS达到7.5分以上"
      },
      {
        timeframe: "6个月内",
        action: "加强科研项目",
        goal: "完成1-2个高质量的科研项目，获得导师推荐信"
      },
      {
        timeframe: "9个月内",
        action: "准备申请材料",
        goal: "完善个人陈述、简历等申请材料，联系推荐人"
      }
    ],
    strategySummary: "这是一个模拟的总体策略。建议您按照时间轴逐步提升各项指标，重点关注语言成绩和科研经历的提升。同时，建议提前准备申请材料，确保申请过程的顺利进行。"
  }
};

// POST /api/analyze - 分析用户背景
router.post('/analyze', async (req, res) => {
  try {
    const userBackground: UserBackground = req.body;
    
    console.log('🚀 开始生成真实分析报告...');
    console.log('用户背景:', JSON.stringify(userBackground, null, 2));
    
    // 1. 计算雷达图分数
    console.log('📊 计算雷达图分数...');
    const radarChartScores = ScoringService.calculateRadarChartScores(userBackground);
    
    // 2. 获取相似案例
    console.log('🔍 查找相似案例...');
    let similarCases = [];
    try {
      const cases = await SupabaseService.testConnection();
      if (cases && cases.length > 0) {
        similarCases = SimilarityService.findTopSimilarCases(userBackground, cases, 10);
        console.log(`✅ 找到 ${similarCases.length} 个相似案例`);
      } else {
        console.log('⚠️ 未找到案例数据，使用模拟数据');
        similarCases = [
          {
            caseId: "case_001",
            similarity: 0.87,
            admissionResult: { university: "卡内基梅隆大学", major: "计算机科学" },
            background: { gpa: 3.8, language: { type: "TOEFL", score: 105 }, universityTier: "Tier 0" }
          }
        ];
      }
    } catch (error) {
      console.log('⚠️ Supabase 连接失败，使用模拟案例数据');
      similarCases = [
        {
          caseId: "case_001",
          similarity: 0.87,
          admissionResult: { university: "卡内基梅隆大学", major: "计算机科学" },
          background: { gpa: 3.8, language: { type: "TOEFL", score: 105 }, universityTier: "Tier 0" }
        }
      ];
    }
    
    // 3. 生成 AI 文本内容
    console.log('🤖 生成 AI 文本内容...');
    const [strengths, weaknesses, summary, strategySummary] = await Promise.allSettled([
      GemmaService.generateStrengths(userBackground),
      GemmaService.generateWeaknesses(userBackground),
      GemmaService.generateSummary(userBackground),
      GemmaService.generateStrategySummary(userBackground)
    ]);
    
    // 4. 生成学校推荐
    console.log('🎓 生成学校推荐...');
    const schoolRecommendations = [
      {
        university: "卡内基梅隆大学",
        major: "计算机科学",
        reason: await GemmaService.generateRecommendationReason(userBackground, "卡内基梅隆大学", "计算机科学").catch(() => 
          "基于您的背景，我推荐您申请卡内基梅隆大学的计算机科学专业。您的学术背景与该校要求高度匹配。"
        ),
        supportingCases: similarCases.slice(0, 2).map(c => ({ caseId: String(c.caseId), similarity: c.similarity }))
      },
      {
        university: "哥伦比亚大学",
        major: "数据科学",
        reason: await GemmaService.generateRecommendationReason(userBackground, "哥伦比亚大学", "数据科学").catch(() => 
          "基于您的背景，我推荐您申请哥伦比亚大学的数据科学专业。该校在数据科学领域有很强的实力。"
        ),
        supportingCases: similarCases.slice(2, 4).map(c => ({ caseId: String(c.caseId), similarity: c.similarity }))
      }
    ];
    
    // 5. 生成相似案例的详细分析
    console.log('📋 生成相似案例分析...');
    const detailedSimilarCases = await Promise.all(
      similarCases.map(async (caseItem) => {
        const [comparison, takeaways] = await Promise.allSettled([
          GemmaService.generateComparison(userBackground, caseItem.background),
          GemmaService.generateTakeaways(userBackground, caseItem.background)
        ]);
        
        return {
          caseId: String(caseItem.caseId),
          similarity: caseItem.similarity,
          admissionResult: caseItem.admissionResult,
          background: caseItem.background,
          comparison: comparison.status === 'fulfilled' ? comparison.value : 
            `该案例与您的背景在多个维度上具有相似性，为您的申请提供了积极的参考。`,
          takeaways: takeaways.status === 'fulfilled' ? takeaways.value :
            `该案例的成功经验表明，通过合理的申请策略和充分的准备，仍然有机会获得录取。`
        };
      })
    );
    
    // 6. 组装完整的分析报告
    console.log('🔧 组装分析报告...');
    const analysisReport: AnalysisReport = {
      competitiveness: {
        radarChart: radarChartScores,
        strengths: strengths.status === 'fulfilled' ? strengths.value : 
          `基于您的背景分析，您具备申请目标院校的基本条件。`,
        weaknesses: weaknesses.status === 'fulfilled' ? weaknesses.value :
          `在语言成绩和标准化考试方面还有提升空间，建议重点关注。`,
        summary: summary.status === 'fulfilled' ? summary.value :
          `总体而言，您具备申请目标院校的基本条件，但在某些方面还有提升空间。`
      },
      schoolRecommendations: schoolRecommendations,
      similarCases: detailedSimilarCases,
      improvementPlan: {
        timeline: [
          {
            timeframe: "3个月内",
            action: "提升语言成绩",
            goal: "TOEFL达到105分以上或IELTS达到7.5分以上"
          },
          {
            timeframe: "6个月内",
            action: "加强科研项目",
            goal: "完成1-2个高质量的科研项目，获得导师推荐信"
          },
          {
            timeframe: "9个月内",
            action: "准备申请材料",
            goal: "完善个人陈述、简历等申请材料，联系推荐人"
          }
        ],
        strategySummary: strategySummary.status === 'fulfilled' ? strategySummary.value :
          "建议您按照时间轴逐步提升各项指标，重点关注语言成绩和科研经历的提升。"
      }
    };
    
    console.log('✅ 分析报告生成完成！');
    res.status(200).json(analysisReport);
    
  } catch (error) {
    console.error('❌ 生成分析报告失败:', error);
    res.status(500).json({
      success: false,
      message: '生成分析报告失败',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/test-supabase - 测试 Supabase 连接
router.get('/test-supabase', async (req, res) => {
  try {
    const cases = await SupabaseService.testConnection();
    res.status(200).json({
      success: true,
      message: 'Supabase connection successful',
      data: cases,
      count: cases.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Supabase connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/test-scoring - 测试评分服务
router.get('/test-scoring', (req, res) => {
  try {
    // 测试数据
    const testUserBackground = {
      academic: {
        university: '清华大学',
        universityTier: 'Tier 0',
        major: '计算机科学',
        majorCategory: 'CS',
        gpa: 3.8,
        gpaScale: 4.0 as const,
        graduationYear: 2024
      },
      language: {
        type: 'TOEFL' as const,
        total: 100,
        reading: 25,
        listening: 25,
        speaking: 25,
        writing: 25
      },
      standardTests: {
        gre: { total: 320, writing: 4.0 }
      },
      applicationIntent: {
        countries: ['美国'],
        majors: ['计算机科学'],
        degree: 'Master' as const
      },
      experience: {
        research: [],
        internship: [],
        competition: [],
        others: []
      }
    };

    const scores = ScoringService.calculateRadarChartScores(testUserBackground);
    
    res.status(200).json({
      success: true,
      message: 'Scoring service test successful',
      testData: testUserBackground,
      scores: scores,
      details: {
        gpaScore: ScoringService.gpaToScore(testUserBackground.academic.gpa, testUserBackground.academic.gpaScale),
        universityScore: ScoringService.universityTierToScore(testUserBackground.academic.university),
        languageScore: ScoringService.languageToScore(testUserBackground.language),
        standardTestScore: ScoringService.calculateStandardTestScore(testUserBackground.standardTests)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Scoring service test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/test-similarity - 测试相似度计算服务
router.get('/test-similarity', async (req, res) => {
  try {
    // 测试用户背景
    const testUserBackground = {
      academic: {
        university: '清华大学',
        universityTier: 'Tier 0',
        major: '计算机科学',
        majorCategory: 'CS',
        gpa: 3.8,
        gpaScale: 4.0 as const,
        graduationYear: 2024
      },
      language: {
        type: 'TOEFL' as const,
        total: 100,
        reading: 25,
        listening: 25,
        speaking: 25,
        writing: 25
      },
      standardTests: {
        gre: { total: 320, writing: 4.0 }
      },
      applicationIntent: {
        countries: ['美国'],
        majors: ['计算机科学'],
        degree: 'Master' as const
      },
      experience: {
        research: [
          { title: '机器学习项目', role: '研究员', description: '深度学习算法研究' }
        ],
        internship: [
          { company: '腾讯', position: '算法工程师', description: '推荐系统开发' }
        ],
        competition: [],
        others: []
      }
    };

    // 获取所有案例数据
    const allCases = await SupabaseService.getAllProcessedCases();
    
    // 计算相似度
    const similarCases = SimilarityService.findTopSimilarCases(testUserBackground, allCases, 5);
    
    // 获取权重配置
    const weights = SimilarityService.getWeights();
    
    res.status(200).json({
      success: true,
      message: 'Similarity service test successful',
      testData: testUserBackground,
      totalCases: allCases.length,
      similarCases: similarCases,
      weights: weights,
      details: {
        // 计算一个具体案例的详细相似度
        sampleCaseSimilarity: allCases.length > 0 ? 
          SimilarityService.calculateOverallSimilarity(testUserBackground, allCases[0]) : null,
        sampleCase: allCases.length > 0 ? allCases[0] : null
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Similarity service test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;
