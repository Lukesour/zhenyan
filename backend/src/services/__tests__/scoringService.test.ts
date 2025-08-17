import { ScoringService } from '../scoringService';
import { UserBackground } from '../../types';

describe('ScoringService', () => {
  describe('standardizeGPA', () => {
    it('should return GPA as is for 4.0 scale', () => {
      expect(ScoringService.standardizeGPA(3.5, 4.0)).toBe(3.5);
    });

    it('should convert 5.0 scale to 4.0 scale', () => {
      expect(ScoringService.standardizeGPA(4.0, 5.0)).toBe(3.2);
      expect(ScoringService.standardizeGPA(3.5, 5.0)).toBe(2.8);
    });

    it('should convert 100 scale to 4.0 scale', () => {
      expect(ScoringService.standardizeGPA(95, 100)).toBe(4.0);
      expect(ScoringService.standardizeGPA(85, 100)).toBe(3.0);
      expect(ScoringService.standardizeGPA(75, 100)).toBe(2.0);
      expect(ScoringService.standardizeGPA(65, 100)).toBe(1.0);
      expect(ScoringService.standardizeGPA(55, 100)).toBe(0.0);
    });

    it('should throw error for unsupported scale', () => {
      expect(() => ScoringService.standardizeGPA(3.5, 3.0 as any)).toThrow('Unsupported GPA scale: 3');
    });
  });

  describe('gpaToScore', () => {
    it('should convert 4.0 GPA to score', () => {
      expect(ScoringService.gpaToScore(4.0, 4.0)).toBe(100);
      expect(ScoringService.gpaToScore(3.0, 4.0)).toBe(75);
      expect(ScoringService.gpaToScore(2.0, 4.0)).toBe(50);
    });

    it('should convert 5.0 GPA to score', () => {
      expect(ScoringService.gpaToScore(5.0, 5.0)).toBe(100);
      expect(ScoringService.gpaToScore(4.0, 5.0)).toBe(80);
    });

    it('should convert 100 GPA to score', () => {
      expect(ScoringService.gpaToScore(90, 100)).toBe(100);
      expect(ScoringService.gpaToScore(80, 100)).toBe(75);
    });
  });

  describe('toeflToScore', () => {
    it('should convert TOEFL total score to 0-100', () => {
      expect(ScoringService.toeflToScore(120)).toBe(100);
      expect(ScoringService.toeflToScore(90)).toBe(75);
      expect(ScoringService.toeflToScore(60)).toBe(50);
    });

    it('should calculate weighted score with section scores', () => {
      const score = ScoringService.toeflToScore(100, 25, 25, 25, 25);
      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('ieltsToScore', () => {
    it('should convert IELTS total score to 0-100', () => {
      expect(ScoringService.ieltsToScore(9.0)).toBe(100);
      expect(ScoringService.ieltsToScore(7.0)).toBe(78);
      expect(ScoringService.ieltsToScore(6.0)).toBe(67);
    });

    it('should calculate weighted score with section scores', () => {
      const score = ScoringService.ieltsToScore(7.5, 7.0, 7.5, 8.0, 8.0);
      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('languageToScore', () => {
    it('should return 0 for undefined language', () => {
      expect(ScoringService.languageToScore(undefined)).toBe(0);
    });

    it('should convert TOEFL scores', () => {
      const toefl = {
        type: 'TOEFL' as const,
        total: 100,
        reading: 25,
        listening: 25,
        speaking: 25,
        writing: 25
      };
      expect(ScoringService.languageToScore(toefl)).toBeGreaterThan(0);
    });

    it('should convert IELTS scores', () => {
      const ielts = {
        type: 'IELTS' as const,
        total: 7.5,
        reading: 7.0,
        listening: 7.5,
        speaking: 8.0,
        writing: 8.0
      };
      expect(ScoringService.languageToScore(ielts)).toBeGreaterThan(0);
    });

    it('should throw error for unsupported language type', () => {
      const unsupported = {
        type: 'GRE' as any,
        total: 320,
        reading: 160,
        listening: 160,
        speaking: 4.0,
        writing: 4.0
      };
      expect(() => ScoringService.languageToScore(unsupported)).toThrow('Unsupported language test type: GRE');
    });
  });

  describe('universityTierToScore', () => {
    it('should return correct score for Tier 0 universities', () => {
      expect(ScoringService.universityTierToScore('清华大学')).toBe(99);
      expect(ScoringService.universityTierToScore('北京大学')).toBe(99);
    });

    it('should return correct score for Tier 1 universities', () => {
      expect(ScoringService.universityTierToScore('复旦大学')).toBe(96);
      expect(ScoringService.universityTierToScore('上海交通大学')).toBe(96);
      expect(ScoringService.universityTierToScore('浙江大学')).toBe(96);
      expect(ScoringService.universityTierToScore('中国科学技术大学')).toBe(96);
    });

    it('should return correct score for Tier 2 universities', () => {
      expect(ScoringService.universityTierToScore('中山大学')).toBe(89);
      expect(ScoringService.universityTierToScore('华南理工大学')).toBe(89);
      expect(ScoringService.universityTierToScore('武汉大学')).toBe(89);
      expect(ScoringService.universityTierToScore('华中科技大学')).toBe(89);
    });

    it('should return correct score for Tier 3 universities', () => {
      expect(ScoringService.universityTierToScore('北京交通大学')).toBe(79);
      expect(ScoringService.universityTierToScore('北京工业大学')).toBe(79);
      expect(ScoringService.universityTierToScore('苏州大学')).toBe(79);
      expect(ScoringService.universityTierToScore('福州大学')).toBe(79);
    });

    it('should return Tier 4 score for unknown universities', () => {
      expect(ScoringService.universityTierToScore('未知大学')).toBe(67);
      expect(ScoringService.universityTierToScore('不存在的大学')).toBe(67);
      expect(ScoringService.universityTierToScore('')).toBe(67);
    });

    it('should handle edge cases and special characters', () => {
      expect(ScoringService.universityTierToScore('清华大学 ')).toBe(67); // 带空格
      expect(ScoringService.universityTierToScore(' 北京大学')).toBe(67); // 带空格
      expect(ScoringService.universityTierToScore('清华')).toBe(67); // 部分名称
      expect(ScoringService.universityTierToScore('大学')).toBe(67); // 通用词
    });

    it('should verify all tier definitions are loaded correctly', () => {
      // 验证所有等级的定义都被正确加载
      const testUniversities = [
        { name: '清华大学', expectedTier: 'Tier 0', expectedScore: 99 },
        { name: '复旦大学', expectedTier: 'Tier 1', expectedScore: 96 },
        { name: '中山大学', expectedTier: 'Tier 2', expectedScore: 89 },
        { name: '北京交通大学', expectedTier: 'Tier 3', expectedScore: 79 }
      ];

      testUniversities.forEach(({ name, expectedTier, expectedScore }) => {
        const score = ScoringService.universityTierToScore(name);
        expect(score).toBe(expectedScore);
      });
    });
  });

  describe('calculateAcademicScore', () => {
    it('should calculate weighted academic score', () => {
      const academic = {
        university: '清华大学',
        universityTier: 'Tier 0',
        major: '计算机科学',
        majorCategory: 'CS',
        gpa: 3.8,
        gpaScale: 4.0 as const,
        graduationYear: 2024
      };

      const score = ScoringService.calculateAcademicScore(academic);
      expect(score).toBeGreaterThan(90);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateLanguageScore', () => {
    it('should return 0 for undefined language', () => {
      expect(ScoringService.calculateLanguageScore(undefined)).toBe(0);
    });

    it('should calculate language score', () => {
      const language = {
        type: 'TOEFL' as const,
        total: 100,
        reading: 25,
        listening: 25,
        speaking: 25,
        writing: 25
      };
      expect(ScoringService.calculateLanguageScore(language)).toBeGreaterThan(0);
    });
  });

  describe('calculateStandardTestScore', () => {
    it('should return 0 for no tests', () => {
      expect(ScoringService.calculateStandardTestScore({})).toBe(0);
    });

    it('should calculate GRE score', () => {
      const tests = {
        gre: { total: 320, writing: 4.0 }
      };
      const score = ScoringService.calculateStandardTestScore(tests);
      expect(score).toBeGreaterThan(90);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate GMAT score', () => {
      const tests = {
        gmat: { total: 700 }
      };
      const score = ScoringService.calculateStandardTestScore(tests);
      expect(score).toBeGreaterThan(85);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should calculate average for multiple tests', () => {
      const tests = {
        gre: { total: 320, writing: 4.0 },
        gmat: { total: 700 }
      };
      const score = ScoringService.calculateStandardTestScore(tests);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });
  });

  describe('calculateRadarChartScores', () => {
    it('should calculate all radar chart scores', () => {
      const userBackground: UserBackground = {
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
          research: [],
          internship: [],
          competition: [],
          others: []
        }
      };

      const scores = ScoringService.calculateRadarChartScores(userBackground);
      
      expect(scores.academic).toBeGreaterThan(0);
      expect(scores.language).toBeGreaterThan(0);
      expect(scores.research).toBe(0); // 暂时为0
      expect(scores.internship).toBe(0); // 暂时为0
      expect(scores.university).toBeGreaterThan(0);
      
      expect(scores.academic).toBeLessThanOrEqual(100);
      expect(scores.language).toBeLessThanOrEqual(100);
      expect(scores.university).toBeLessThanOrEqual(100);
    });
  });

  describe('university tier data loading', () => {
    it('should handle data loading gracefully', () => {
      // 测试数据加载的健壮性
      // 即使文件加载失败，系统也应该能正常工作
      const unknownUniversity = '测试大学';
      const score = ScoringService.universityTierToScore(unknownUniversity);
      
      // 应该返回Tier 4的分数
      expect(score).toBe(67);
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should maintain consistent scoring across multiple calls', () => {
      // 测试多次调用的结果一致性
      const university = '清华大学';
      const score1 = ScoringService.universityTierToScore(university);
      const score2 = ScoringService.universityTierToScore(university);
      const score3 = ScoringService.universityTierToScore(university);
      
      expect(score1).toBe(score2);
      expect(score2).toBe(score3);
      expect(score1).toBe(99); // Tier 0
    });
  });
});
