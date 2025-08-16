import { Router } from 'express';
import { AnalysisReport } from '../../types';

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
router.post('/analyze', (req, res) => {
  res.status(200).json(mockReport);
});

export default router;
