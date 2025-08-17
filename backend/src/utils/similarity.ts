import { UserBackground } from '../types';
import ScoringService from '../services/scoringService';

// 案例数据结构（基于 Supabase 的实际数据）
export interface ProcessedCase {
  id: number;
  original_id: number;
  gpa_4_scale: number;
  gpa_original: string;
  gpa_scale_type: string;
  undergraduate_university: string;
  undergraduate_university_tier: string;
  undergraduate_major: string;
  undergraduate_major_category: string;
  language_test_type: string;
  language_total_score: number;
  gre_total: number | null;
  gre_verbal: number | null;
  gre_quantitative: number | null;
  gre_writing: number | null;
  gmat_total: number | null;
  admitted_university: string;
  admitted_program: string;
  admitted_country: string;
  admitted_degree_type: string;
  research_experience_count: number;
  internship_experience_count: number;
  work_experience_years: number;
  experience_text: string;
  background_summary: string;
}

// 相似度计算结果
export interface SimilarityResult {
  caseId: number;
  similarity: number; // 0-1
  admissionResult: {
    university: string;
    major: string;
  };
  background: {
    gpa: number;
    language: { type: string; score: number };
    universityTier: string;
  };
}

// 权重配置
const WEIGHTS = {
  gpa: 0.25,           // GPA相似度权重
  university: 0.20,     // 院校背景权重
  major: 0.15,          // 专业匹配权重
  language: 0.15,       // 语言成绩权重
  experience: 0.15,     // 经历权重
  standardTest: 0.10    // 标准化考试权重
};

export class SimilarityService {
  /**
   * 计算GPA相似度
   * 基于标准化后的GPA分数计算相似度
   */
  static _calculate_gpa_similarity(userGpa: number, caseGpa: number): number {
    const difference = Math.abs(userGpa - caseGpa);
    
    // 使用高斯函数计算相似度，差异越大相似度越低
    // 标准差设为0.5，这样差异0.5时相似度约为0.6
    const sigma = 0.5;
    const similarity = Math.exp(-(difference * difference) / (2 * sigma * sigma));
    
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * 计算院校等级相似度
   * 基于院校等级计算相似度
   */
  static _calculate_university_tier_similarity(userUniversity: string, caseUniversity: string): number {
    const userScore = ScoringService.universityTierToScore(userUniversity);
    const caseScore = ScoringService.universityTierToScore(caseUniversity);
    
    const difference = Math.abs(userScore - caseScore);
    const maxDifference = 99 - 67; // Tier 0 到 Tier 4 的最大差异
    
    // 相似度 = 1 - 标准化差异
    const similarity = 1 - (difference / maxDifference);
    
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * 计算专业匹配相似度
   * 基于专业名称和大类计算相似度
   */
  static _calculate_major_similarity(userMajor: string, userMajorCategory: string, caseMajor: string, caseMajorCategory: string): number {
    let similarity = 0;
    
    // 处理空值
    if (!userMajor || !caseMajor || !userMajorCategory || !caseMajorCategory) {
      return 0.5; // 返回中等相似度
    }
    
    // 完全匹配专业名称
    if (userMajor === caseMajor) {
      similarity += 0.6;
    }
    
    // 匹配专业大类
    if (userMajorCategory === caseMajorCategory) {
      similarity += 0.4;
    }
    
    // 部分匹配专业名称（包含关系）
    if (userMajor.includes(caseMajor) || caseMajor.includes(userMajor)) {
      similarity += 0.3;
    }
    
    return Math.min(1, similarity);
  }

  /**
   * 计算语言成绩相似度
   * 基于标准化后的语言分数计算相似度
   */
  static _calculate_language_similarity(userLanguage: UserBackground['language'], caseLanguageType: string, caseLanguageScore: number): number {
    if (!userLanguage) {
      // 用户没有语言成绩，返回中等相似度
      return 0.5;
    }
    
    // 处理空值
    if (!caseLanguageType || caseLanguageScore === null || caseLanguageScore === undefined) {
      return 0.5; // 返回中等相似度
    }
    
    const userScore = ScoringService.languageToScore(userLanguage);
    
    // 如果语言类型不同，降低相似度
    if (userLanguage.type !== caseLanguageType) {
      const typeSimilarity = 0.7; // 语言类型不同时的基础相似度
      const scoreSimilarity = this._calculate_score_similarity(userScore, caseLanguageScore);
      return typeSimilarity * scoreSimilarity;
    }
    
    return this._calculate_score_similarity(userScore, caseLanguageScore);
  }

  /**
   * 计算标准化考试相似度
   * 基于GRE/GMAT分数计算相似度
   */
  static _calculate_standard_test_similarity(userStandardTests: UserBackground['standardTests'], caseGreTotal: number | null, caseGmatTotal: number | null): number {
    if (!userStandardTests) {
      // 用户没有标准化考试成绩，返回中等相似度
      return 0.5;
    }
    
    let maxSimilarity = 0;
    
    // 计算GRE相似度
    if (userStandardTests.gre && caseGreTotal !== null && caseGreTotal !== undefined) {
      const userGreScore = (userStandardTests.gre.total / 340) * 100;
      const caseGreScore = (caseGreTotal / 340) * 100;
      const greSimilarity = this._calculate_score_similarity(userGreScore, caseGreScore);
      maxSimilarity = Math.max(maxSimilarity, greSimilarity);
    }
    
    // 计算GMAT相似度
    if (userStandardTests.gmat && caseGmatTotal !== null && caseGmatTotal !== undefined) {
      const userGmatScore = (userStandardTests.gmat.total / 800) * 100;
      const caseGmatScore = (caseGmatTotal / 800) * 100;
      const gmatSimilarity = this._calculate_score_similarity(userGmatScore, caseGmatScore);
      maxSimilarity = Math.max(maxSimilarity, gmatSimilarity);
    }
    
    return maxSimilarity > 0 ? maxSimilarity : 0.5;
  }

  /**
   * 计算经历相似度
   * 基于科研、实习等经历数量计算相似度
   */
  static _calculate_experience_similarity(userExperience: UserBackground['experience'], caseResearchCount: number, caseInternshipCount: number): number {
    const userResearchCount = userExperience.research.length;
    const userInternshipCount = userExperience.internship.length;
    
    // 计算科研经历相似度
    const researchSimilarity = this._calculate_count_similarity(userResearchCount, caseResearchCount);
    
    // 计算实习经历相似度
    const internshipSimilarity = this._calculate_count_similarity(userInternshipCount, caseInternshipCount);
    
    // 加权平均
    return (researchSimilarity * 0.6 + internshipSimilarity * 0.4);
  }

  /**
   * 计算分数相似度（通用函数）
   * 基于两个分数计算相似度
   */
  static _calculate_score_similarity(score1: number, score2: number): number {
    const difference = Math.abs(score1 - score2);
    const maxDifference = 100; // 分数范围0-100
    
    // 相似度 = 1 - 标准化差异
    const similarity = 1 - (difference / maxDifference);
    
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * 计算数量相似度（通用函数）
   * 基于两个数量计算相似度
   */
  static _calculate_count_similarity(count1: number, count2: number): number {
    const difference = Math.abs(count1 - count2);
    const maxCount = Math.max(count1, count2, 1); // 避免除零
    
    // 相似度 = 1 - 标准化差异
    const similarity = 1 - (difference / maxCount);
    
    return Math.max(0, Math.min(1, similarity));
  }

  /**
   * 计算综合相似度
   * 基于多维度加权计算最终相似度
   */
  static calculateOverallSimilarity(userBackground: UserBackground, caseData: ProcessedCase): number {
    // 计算各维度相似度
    const gpaSimilarity = this._calculate_gpa_similarity(
      userBackground.academic.gpa,
      caseData.gpa_4_scale
    );
    
    const universitySimilarity = this._calculate_university_tier_similarity(
      userBackground.academic.university,
      caseData.undergraduate_university
    );
    
    const majorSimilarity = this._calculate_major_similarity(
      userBackground.academic.major,
      userBackground.academic.majorCategory,
      caseData.undergraduate_major,
      caseData.undergraduate_major_category
    );
    
    const languageSimilarity = this._calculate_language_similarity(
      userBackground.language,
      caseData.language_test_type,
      caseData.language_total_score
    );
    
    const standardTestSimilarity = this._calculate_standard_test_similarity(
      userBackground.standardTests,
      caseData.gre_total,
      caseData.gmat_total
    );
    
    const experienceSimilarity = this._calculate_experience_similarity(
      userBackground.experience,
      caseData.research_experience_count,
      caseData.internship_experience_count
    );
    
    // 加权计算总相似度
    const overallSimilarity = 
      gpaSimilarity * WEIGHTS.gpa +
      universitySimilarity * WEIGHTS.university +
      majorSimilarity * WEIGHTS.major +
      languageSimilarity * WEIGHTS.language +
      standardTestSimilarity * WEIGHTS.standardTest +
      experienceSimilarity * WEIGHTS.experience;
    
    return Math.max(0, Math.min(1, overallSimilarity));
  }

  /**
   * 查找Top N相似案例
   * 计算用户背景与所有案例的相似度，返回最相似的N个
   */
  static findTopSimilarCases(userBackground: UserBackground, allCases: ProcessedCase[], topN: number = 10): SimilarityResult[] {
    // 计算所有案例的相似度
    const similarities = allCases.map(caseData => ({
      caseData,
      similarity: this.calculateOverallSimilarity(userBackground, caseData)
    }));
    
    // 按相似度降序排序
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // 返回Top N结果
    return similarities.slice(0, topN).map(item => ({
      caseId: item.caseData.id,
      similarity: item.similarity,
      admissionResult: {
        university: item.caseData.admitted_university,
        major: item.caseData.admitted_program
      },
      background: {
        gpa: item.caseData.gpa_4_scale,
        language: {
          type: item.caseData.language_test_type,
          score: item.caseData.language_total_score
        },
        universityTier: item.caseData.undergraduate_university_tier
      }
    }));
  }

  /**
   * 获取相似度计算的权重配置
   */
  static getWeights(): typeof WEIGHTS {
    return { ...WEIGHTS };
  }
}

export default SimilarityService;
