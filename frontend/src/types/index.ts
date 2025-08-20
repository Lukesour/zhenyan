// types/index.ts

// 1. 用户提交的完整背景信息
export interface UserBackground {
  academic: {
    university: string;
    universityTier?: string; // Tier 0-4, 由后端根据university填充
    major: string;
    majorCategory?: string; // 专业大类, 由后端填充
    gpa: number;
    gpaScale: 4.0 | 5.0 | 100;
    graduationYear: number;
  };
  language?: {
    type: 'TOEFL' | 'IELTS';
    total: number;
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
  };
  standardTests?: {
    gre?: {
      total: number;
      writing: number;
    };
    gmat?: {
      total: number;
    };
  };
  applicationIntent: {
    countries: string[];
    majors: string[];
    degree: 'Master' | 'PhD';
  };
  experience: {
    research: Array<{ title: string; role: string; description: string }>;
    internship: Array<{ company: string; position: string; description:string }>;
    competition: Array<{ name: string; award: string; role: string; description: string }>;
    others: Array<{ name: string; role: string; description: string }>;
  };
}

// 2. 后端返回的完整分析报告
export interface AnalysisReport {
  competitiveness: {
    radarChart: {
      academic: number;
      language: number;
      research: number;
      internship: number;
      university: number;
    };
    strengths: string; // AI生成的优势分析
    weaknesses: string; // AI生成的短板分析
    summary: string; // AI生成的综合评价
  };
  schoolRecommendations: Array<{
    university: string;
    major: string;
    reason: string; // AI生成的推荐理由
    supportingCases: Array<{
      caseId: string;
      similarity: number; // 0-1
    }>;
  }>;
  similarCases: Array<{
    caseId: string;
    similarity: number;
    admissionResult: {
      university: string;
      major: string;
    };
    background: {
      gpa: number;
      language: { type: string; score: number };
      universityTier: string;
    };
    comparison: string; // AI生成的对比分析
    takeaways: string; // AI生成的可借鉴经验
  }>;
  improvementPlan: {
    timeline: Array<{
      timeframe: string; // e.g., "3个月内"
      action: string;
      goal: string;
    }>;
    strategySummary: string; // AI生成的总体策略
  };
}
