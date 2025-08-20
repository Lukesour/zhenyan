import express from 'express';
import request from 'supertest';

// 先 mock 外部服务，再导入路由
jest.mock('../../services/gemmaService', () => {
  return {
    GemmaService: {
      generateVectorEmbedding: jest.fn(),
      generateAllTextAnalyses: jest.fn(),
      generateRecommendationReason: jest.fn(),
      generateComparison: jest.fn(),
      generateTakeaways: jest.fn()
    }
  };
});

jest.mock('../../services/supabaseService', () => {
  return {
    __esModule: true,
    default: {
      findSimilarCases: jest.fn()
    }
  };
});

import analysisRoutes from '../routes/analysis';
import SupabaseService from '../../services/supabaseService';
import { GemmaService } from '../../services/gemmaService';

const buildApp = () => {
  const app = express();
  app.use(express.json());
  app.use('/api', analysisRoutes);
  return app;
};

const buildUserBackground = () => ({
  academic: {
    university: '清华大学',
    universityTier: 'Tier 0',
    major: '计算机科学',
    majorCategory: 'CS',
    gpa: 3.8,
    gpaScale: 4.0,
    graduationYear: 2024
  },
  language: {
    type: 'TOEFL',
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
    degree: 'Master'
  },
  experience: {
    research: [ { title: 'ML', role: '研究员', description: 'DL' } ],
    internship: [ { company: 'X', position: 'Engineer', description: 'Y' } ],
    competition: [],
    others: []
  }
});

describe('/api/analyze integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 200 and valid report when services succeed', async () => {
    const app = buildApp();

    (GemmaService.generateVectorEmbedding as jest.Mock).mockResolvedValue(new Array(64).fill(0));
    (GemmaService.generateAllTextAnalyses as jest.Mock).mockResolvedValue({
      strengths: 'S',
      weaknesses: 'W',
      summary: 'SUM',
      strategySummary: 'STRAT'
    });
    (GemmaService.generateRecommendationReason as jest.Mock).mockResolvedValue('reason');
    (GemmaService.generateComparison as jest.Mock).mockResolvedValue('cmp');
    (GemmaService.generateTakeaways as jest.Mock).mockResolvedValue('tks');

    (SupabaseService.findSimilarCases as jest.Mock).mockResolvedValue([
      {
        id: 1,
        original_id: 1,
        gpa_4_scale: 3.8,
        gpa_original: '3.8/4.0',
        gpa_scale_type: '4.0',
        undergraduate_university: '清华大学',
        undergraduate_university_tier: 'Tier 0',
        undergraduate_major: '计算机科学',
        undergraduate_major_category: 'CS',
        language_test_type: 'TOEFL',
        language_total_score: 100,
        gre_total: 320,
        gre_quantitative: null,
        gre_verbal: null,
        gre_writing: null,
        gmat_total: null,
        admitted_university: 'CMU',
        admitted_program: 'CS',
        admitted_country: '美国',
        admitted_degree_type: 'Master',
        research_experience_count: 1,
        internship_experience_count: 1,
        work_experience_years: 0,
        experience_text: '',
        background_summary: ''
      }
    ]);

    const res = await request(app)
      .post('/api/analyze')
      .send(buildUserBackground())
      .expect(200);

    expect(res.body).toHaveProperty('competitiveness.radarChart.academic');
    expect(res.body).toHaveProperty('competitiveness.strengths', 'S');
    expect(res.body).toHaveProperty('competitiveness.weaknesses', 'W');
    expect(res.body).toHaveProperty('similarCases');
    expect(Array.isArray(res.body.similarCases)).toBe(true);
    expect(res.body.similarCases.length).toBeGreaterThan(0);
    expect(res.body).toHaveProperty('improvementPlan.strategySummary', 'STRAT');
  });

  it('falls back to mock similarCases when Supabase fails', async () => {
    const app = buildApp();

    (GemmaService.generateVectorEmbedding as jest.Mock).mockResolvedValue(new Array(64).fill(0));
    (GemmaService.generateAllTextAnalyses as jest.Mock).mockResolvedValue({
      strengths: 'S',
      weaknesses: 'W',
      summary: 'SUM',
      strategySummary: 'STRAT'
    });
    (GemmaService.generateRecommendationReason as jest.Mock).mockResolvedValue('reason');
    (GemmaService.generateComparison as jest.Mock).mockResolvedValue('cmp');
    (GemmaService.generateTakeaways as jest.Mock).mockResolvedValue('tks');

    (SupabaseService.findSimilarCases as jest.Mock).mockRejectedValue(new Error('db down'));

    const res = await request(app)
      .post('/api/analyze')
      .send(buildUserBackground())
      .expect(200);

    expect(Array.isArray(res.body.similarCases)).toBe(true);
    expect(res.body.similarCases.length).toBeGreaterThan(0);
    expect(res.body.similarCases[0]).toHaveProperty('caseId', 'case_001');
    expect(res.body.similarCases[0]).toHaveProperty('similarity');
  });
});


