import { SimilarityService } from '../similarity';
import { UserBackground } from '../../types';
import { ProcessedCase } from '../similarity';

describe('SimilarityService', () => {
  // 测试用的用户背景数据
  const testUserBackground: UserBackground = {
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

  // 测试用的案例数据
  const testCase: ProcessedCase = {
    id: 1,
    original_id: 100,
    gpa_4_scale: 3.7,
    gpa_original: '88',
    gpa_scale_type: '100',
    undergraduate_university: '北京大学',
    undergraduate_university_tier: 'Tier 0',
    undergraduate_major: '计算机科学与技术',
    undergraduate_major_category: 'CS',
    language_test_type: 'TOEFL',
    language_total_score: 105,
    gre_total: 320,
    gre_verbal: 160,
    gre_quantitative: 160,
    gre_writing: 4.0,
    gmat_total: null,
    admitted_university: '卡内基梅隆大学',
    admitted_program: '计算机科学硕士',
    admitted_country: '美国',
    admitted_degree_type: 'Master',
    research_experience_count: 1,
    internship_experience_count: 2,
    work_experience_years: 0,
    experience_text: '科研项目经历',
    background_summary: '优秀学生，有科研经历'
  };

  describe('_calculate_gpa_similarity', () => {
    it('should calculate high similarity for close GPAs', () => {
      const similarity = SimilarityService._calculate_gpa_similarity(3.8, 3.7);
      expect(similarity).toBeGreaterThan(0.8);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should calculate low similarity for distant GPAs', () => {
      const similarity = SimilarityService._calculate_gpa_similarity(3.8, 2.0);
      expect(similarity).toBeLessThan(0.5);
    });

    it('should return 1 for identical GPAs', () => {
      const similarity = SimilarityService._calculate_gpa_similarity(3.8, 3.8);
      expect(similarity).toBe(1);
    });
  });

  describe('_calculate_university_tier_similarity', () => {
    it('should calculate high similarity for same tier universities', () => {
      const similarity = SimilarityService._calculate_university_tier_similarity('清华大学', '北京大学');
      expect(similarity).toBe(1); // 都是 Tier 0
    });

    it('should calculate medium similarity for adjacent tier universities', () => {
      const similarity = SimilarityService._calculate_university_tier_similarity('清华大学', '复旦大学');
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThan(1);
    });

    it('should calculate low similarity for distant tier universities', () => {
      const similarity = SimilarityService._calculate_university_tier_similarity('清华大学', '普通大学');
      expect(similarity).toBeLessThan(0.5);
    });
  });

  describe('_calculate_major_similarity', () => {
    it('should return high similarity for exact major match', () => {
      const similarity = SimilarityService._calculate_major_similarity(
        '计算机科学', 'CS',
        '计算机科学', 'CS'
      );
      expect(similarity).toBe(1);
    });

    it('should return medium similarity for major category match', () => {
      const similarity = SimilarityService._calculate_major_similarity(
        '计算机科学', 'CS',
        '软件工程', 'CS'
      );
      expect(similarity).toBe(0.4);
    });

    it('should return low similarity for no match', () => {
      const similarity = SimilarityService._calculate_major_similarity(
        '计算机科学', 'CS',
        '机械工程', 'ME'
      );
      expect(similarity).toBe(0);
    });
  });

  describe('_calculate_language_similarity', () => {
    it('should calculate similarity for same language type', () => {
      const similarity = SimilarityService._calculate_language_similarity(
        testUserBackground.language,
        'TOEFL',
        105
      );
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should return reduced similarity for different language types', () => {
      const similarity = SimilarityService._calculate_language_similarity(
        testUserBackground.language,
        'IELTS',
        7.5
      );
      expect(similarity).toBeLessThan(0.8);
    });

    it('should return medium similarity for undefined language', () => {
      const similarity = SimilarityService._calculate_language_similarity(
        undefined,
        'TOEFL',
        100
      );
      expect(similarity).toBe(0.5);
    });
  });

  describe('_calculate_standard_test_similarity', () => {
    it('should calculate GRE similarity', () => {
      const similarity = SimilarityService._calculate_standard_test_similarity(
        testUserBackground.standardTests,
        320,
        null
      );
      expect(similarity).toBeGreaterThan(0.9);
    });

    it('should return medium similarity for no tests', () => {
      const similarity = SimilarityService._calculate_standard_test_similarity(
        undefined,
        null,
        null
      );
      expect(similarity).toBe(0.5);
    });
  });

  describe('_calculate_experience_similarity', () => {
    it('should calculate experience similarity based on counts', () => {
      const similarity = SimilarityService._calculate_experience_similarity(
        testUserBackground.experience,
        1,
        2
      );
      expect(similarity).toBeGreaterThan(0.5);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should handle zero experience counts', () => {
      const similarity = SimilarityService._calculate_experience_similarity(
        { research: [], internship: [], competition: [], others: [] },
        0,
        0
      );
      expect(similarity).toBe(1); // 都是0，完全相似
    });
  });

  describe('_calculate_score_similarity', () => {
    it('should return 1 for identical scores', () => {
      const similarity = SimilarityService._calculate_score_similarity(100, 100);
      expect(similarity).toBe(1);
    });

    it('should return 0.5 for scores with 50 difference', () => {
      const similarity = SimilarityService._calculate_score_similarity(100, 50);
      expect(similarity).toBe(0.5);
    });

    it('should return 0 for maximum difference', () => {
      const similarity = SimilarityService._calculate_score_similarity(100, 0);
      expect(similarity).toBe(0);
    });
  });

  describe('_calculate_count_similarity', () => {
    it('should return 1 for identical counts', () => {
      const similarity = SimilarityService._calculate_count_similarity(5, 5);
      expect(similarity).toBe(1);
    });

    it('should handle zero counts', () => {
      const similarity = SimilarityService._calculate_count_similarity(0, 0);
      expect(similarity).toBe(1);
    });

    it('should calculate similarity for different counts', () => {
      const similarity = SimilarityService._calculate_count_similarity(5, 3);
      expect(similarity).toBe(0.6); // (5-3)/5 = 0.4, 1-0.4 = 0.6
    });
  });

  describe('calculateOverallSimilarity', () => {
    it('should calculate overall similarity between user and case', () => {
      const similarity = SimilarityService.calculateOverallSimilarity(testUserBackground, testCase);
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThanOrEqual(1);
    });

    it('should return weighted combination of all factors', () => {
      const similarity = SimilarityService.calculateOverallSimilarity(testUserBackground, testCase);
      // 由于是加权计算，结果应该在合理范围内
      expect(similarity).toBeGreaterThan(0.5);
    });
  });

  describe('findTopSimilarCases', () => {
    it('should return top N similar cases', () => {
      const cases: ProcessedCase[] = [
        { ...testCase, id: 1, gpa_4_scale: 3.8 }, // 最相似
        { ...testCase, id: 2, gpa_4_scale: 3.5 }, // 中等相似
        { ...testCase, id: 3, gpa_4_scale: 3.0 }  // 较低相似
      ];

      const results = SimilarityService.findTopSimilarCases(testUserBackground, cases, 2);
      
      expect(results).toHaveLength(2);
      expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
      expect(results[0].caseId).toBe(1);
    });

    it('should return empty array for empty cases', () => {
      const results = SimilarityService.findTopSimilarCases(testUserBackground, [], 10);
      expect(results).toHaveLength(0);
    });
  });

  describe('getWeights', () => {
    it('should return copy of weights configuration', () => {
      const weights = SimilarityService.getWeights();
      expect(weights).toHaveProperty('gpa');
      expect(weights).toHaveProperty('university');
      expect(weights).toHaveProperty('major');
      expect(weights).toHaveProperty('language');
      expect(weights).toHaveProperty('experience');
      expect(weights).toHaveProperty('standardTest');
      
      // 验证权重总和为1
      const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
      expect(totalWeight).toBeCloseTo(1, 2);
    });
  });
});
