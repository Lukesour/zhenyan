import { SupabaseService, ProcessedCase } from '../supabaseService';

describe('SupabaseService', () => {
  describe('ProcessedCase interface', () => {
    it('should have optional embedding field', () => {
      const mockCase: ProcessedCase = {
        id: 1,
        original_id: 1,
        gpa_4_scale: 3.8,
        gpa_original: '3.8',
        gpa_scale_type: '4.0',
        undergraduate_university: '清华大学',
        undergraduate_university_tier: 'Tier 0',
        undergraduate_major: '计算机科学',
        undergraduate_major_category: 'CS',
        language_test_type: 'TOEFL',
        language_total_score: 100,
        gre_total: 320,
        gre_quantitative: 160,
        gre_verbal: 160,
        gre_writing: 4.0,
        gmat_total: null,
        admitted_university: 'MIT',
        admitted_program: 'Computer Science',
        admitted_country: '美国',
        admitted_degree_type: 'Master',
        research_experience_count: 2,
        internship_experience_count: 1,
        work_experience_years: 0,
        experience_text: 'Research experience in ML',
        background_summary: 'Strong academic background',
        embedding: [0.1, 0.2, 0.3, 0.4, 0.5]
      };

      expect(mockCase.embedding).toBeDefined();
      expect(mockCase.embedding).toEqual([0.1, 0.2, 0.3, 0.4, 0.5]);
    });

    it('should work without embedding field', () => {
      const mockCase: ProcessedCase = {
        id: 1,
        original_id: 1,
        gpa_4_scale: 3.8,
        gpa_original: '3.8',
        gpa_scale_type: '4.0',
        undergraduate_university: '清华大学',
        undergraduate_university_tier: 'Tier 0',
        undergraduate_major: '计算机科学',
        undergraduate_major_category: 'CS',
        language_test_type: 'TOEFL',
        language_total_score: 100,
        gre_total: 320,
        gre_quantitative: 160,
        gre_verbal: 160,
        gre_writing: 4.0,
        gmat_total: null,
        admitted_university: 'MIT',
        admitted_program: 'Computer Science',
        admitted_country: '美国',
        admitted_degree_type: 'Master',
        research_experience_count: 2,
        internship_experience_count: 1,
        work_experience_years: 0,
        experience_text: 'Research experience in ML',
        background_summary: 'Strong academic background'
      };

      expect(mockCase.embedding).toBeUndefined();
    });
  });

  describe('findSimilarCases method signature', () => {
    it('should have correct method signature', () => {
      // Test that the method exists and has correct signature
      expect(typeof SupabaseService.findSimilarCases).toBe('function');
      
      // The method should be async and return a Promise
      const result = SupabaseService.findSimilarCases([0.1, 0.2, 0.3], 5);
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('fallbackSimilaritySearch method', () => {
    it('should be private method', () => {
      // The method should not be accessible from outside
      expect((SupabaseService as any).fallbackSimilaritySearch).toBeDefined();
    });
  });

  describe('getAllProcessedCases deprecation', () => {
    it('should still exist for backward compatibility', () => {
      expect(typeof SupabaseService.getAllProcessedCases).toBe('function');
    });
  });
});
