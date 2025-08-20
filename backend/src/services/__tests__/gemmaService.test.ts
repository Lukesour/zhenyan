import { GemmaService } from '../gemmaService';
import { UserBackground } from '../../types';

// Mock fetch globally
global.fetch = jest.fn();

describe('GemmaService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAiScore', () => {
    it('should return a score when API call is successful', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '分数：85'
              }]
            }
          }]
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const score = await GemmaService.getAiScore('test prompt');
      expect(score).toBe(85);
    });

    it('should throw error when API call fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(GemmaService.getAiScore('test prompt')).rejects.toThrow('Gemma API error: 500 Internal Server Error');
    });

    it('should throw error when response format is invalid', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: []
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(GemmaService.getAiScore('test prompt')).rejects.toThrow('Invalid response format from Gemma API');
    });

    it('should ensure score is within 0-100 range', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '分数：150'
              }]
            }
          }]
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const score = await GemmaService.getAiScore('test prompt');
      expect(score).toBe(100); // Should be capped at 100
    });
  });

  describe('testConnection', () => {
    it('should return true when connection test is successful', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          candidates: [{
            content: {
              parts: [{
                text: '分数：80'
              }]
            }
          }]
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.testConnection();
      expect(result).toBe(true);
    });

    it('should return false when connection test fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.testConnection();
      expect(result).toBe(false);
    });
  });

  describe('generateVectorEmbedding', () => {
    const mockUserBackground: UserBackground = {
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
        competition: [
          { name: 'ACM竞赛', award: '金奖', role: '队长', description: '算法竞赛' }
        ],
        others: [
          { name: '开源项目', role: '贡献者', description: '参与开源项目开发' }
        ]
      }
    };

    it('should generate vector embedding when API call is successful', async () => {
      const mockEmbedding = Array.from({ length: 64 }, (_, i) => Math.random());
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          embedding: {
            values: mockEmbedding
          }
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const vector = await GemmaService.generateVectorEmbedding(mockUserBackground);
      
      expect(vector).toEqual(mockEmbedding);
      expect(vector).toHaveLength(64);
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('embedding-001:embedText'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Bearer')
          }),
          body: expect.stringContaining('Academic: 清华大学 (Tier 0)')
        })
      );
    });

    it('should fallback to generated vector when API call fails', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const vector = await GemmaService.generateVectorEmbedding(mockUserBackground);
      
      // Should return fallback vector
      expect(vector).toHaveLength(64);
      expect(vector[0]).toBe(1.0); // Tier 0 should map to 1.0
      expect(vector[1]).toBe(0.95); // GPA 3.8/4.0 should be 0.95
      expect(vector[2]).toBeCloseTo(0.833, 2); // TOEFL 100/120 should be 0.833
      expect(vector[3]).toBeCloseTo(0.941, 2); // GRE 320/340 should be 0.941
      expect(vector[4]).toBe(0.1); // 1 research project / 10 should be 0.1
      expect(vector[5]).toBe(0.1); // 1 internship / 10 should be 0.1
      expect(vector[6]).toBe(0.1); // 1 competition / 10 should be 0.1
    });

    it('should fallback to generated vector when response format is invalid', async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          embedding: null // Invalid format
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const vector = await GemmaService.generateVectorEmbedding(mockUserBackground);
      
      // Should return fallback vector
      expect(vector).toHaveLength(64);
      expect(vector[0]).toBe(1.0); // Tier 0 should map to 1.0
    });

    it('should handle user background without optional fields', async () => {
      const minimalBackground: UserBackground = {
        academic: {
          university: '未知大学',
          universityTier: 'Tier 4',
          major: '未知专业',
          majorCategory: 'Unknown',
          gpa: 3.0,
          gpaScale: 4.0,
          graduationYear: 2024
        },
        applicationIntent: {
          countries: ['中国'],
          majors: ['未知专业'],
          degree: 'Master'
        },
        experience: {
          research: [],
          internship: [],
          competition: [],
          others: []
        }
      };

      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const vector = await GemmaService.generateVectorEmbedding(minimalBackground);
      
      // Should return fallback vector
      expect(vector).toHaveLength(64);
      expect(vector[0]).toBe(0.2); // Tier 4 should map to 0.2
      expect(vector[1]).toBe(0.75); // GPA 3.0/4.0 should be 0.75
      expect(vector[2]).toBe(0.0); // No language score should be 0.0
      expect(vector[3]).toBe(0.0); // No test score should be 0.0
      expect(vector[4]).toBe(0.0); // No research should be 0.0
      expect(vector[5]).toBe(0.0); // No internship should be 0.0
      expect(vector[6]).toBe(0.0); // No competition should be 0.0
    });

    it('should generate consistent fallback vectors for same input', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const vector1 = await GemmaService.generateVectorEmbedding(mockUserBackground);
      const vector2 = await GemmaService.generateVectorEmbedding(mockUserBackground);
      
      // Fallback vectors should be deterministic
      expect(vector1).toEqual(vector2);
    });
  });

  describe('generateAllTextAnalyses', () => {
    const mockUserBackground: UserBackground = {
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

    it('should generate all text analyses when all API calls are successful', async () => {
      const mockTextResponses = [
        '这是优势分析文本',
        '这是劣势分析文本', 
        '这是综合评价文本',
        '这是总体策略文本'
      ];

      let callCount = 0;
      // Mock successful API responses with different responses for each call
      const mockResponse = {
        ok: true,
        json: jest.fn().mockImplementation(() => {
          const responseIndex = callCount % mockTextResponses.length;
          callCount++;
          return Promise.resolve({
            candidates: [{
              content: {
                parts: [{
                  text: mockTextResponses[responseIndex]
                }]
              }
            }]
          });
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.generateAllTextAnalyses(mockUserBackground);

      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('strategySummary');
      expect(result.strengths).toBe('这是优势分析文本');
      expect(result.weaknesses).toBe('这是劣势分析文本');
      expect(result.summary).toBe('这是综合评价文本');
      expect(result.strategySummary).toBe('这是总体策略文本');
    });

    it('should use fallback text when some API calls fail', async () => {
      // Mock failed API responses
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.generateAllTextAnalyses(mockUserBackground);

      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('strategySummary');
      
      // Should use fallback text
      expect(result.strengths).toContain('基于您的背景分析');
      expect(result.weaknesses).toContain('基于您的背景分析');
      expect(result.summary).toContain('基于您的完整背景分析');
      expect(result.strategySummary).toContain('基于您的背景分析');
    });

    it('should handle mixed success and failure scenarios', async () => {
      let callCount = 0;
      const mockResponse = {
        ok: true,
        json: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            // First call succeeds
            return Promise.resolve({
              candidates: [{
                content: {
                  parts: [{
                    text: '成功的优势分析'
                  }]
                }
              }]
            });
          } else {
            // Other calls fail
            throw new Error('API Error');
          }
        })
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await GemmaService.generateAllTextAnalyses(mockUserBackground);

      expect(result.strengths).toBe('成功的优势分析');
      expect(result.weaknesses).toContain('基于您的背景分析'); // Fallback
      expect(result.summary).toContain('基于您的完整背景分析'); // Fallback
      expect(result.strategySummary).toContain('基于您的背景分析'); // Fallback
    });

    it('should generate consistent results for same input', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      (fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result1 = await GemmaService.generateAllTextAnalyses(mockUserBackground);
      const result2 = await GemmaService.generateAllTextAnalyses(mockUserBackground);

      expect(result1).toEqual(result2);
    });
  });
});
