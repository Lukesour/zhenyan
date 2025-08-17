import { UserBackground } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// 院校等级评分配置
interface TierConfig {
  score_range: [number, number];
  fixed_score: number;
  description: string;
}

interface UniversityTiers {
  tier_definitions: Record<string, TierConfig>;
  university_tiers: Record<string, string[]>;
}

// 从文件加载院校等级数据
function loadUniversityTiers(): UniversityTiers {
  try {
    // 从项目根目录的 data 文件夹读取
    const dataPath = path.join(__dirname, '../../../data/university_tiers.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Failed to load university_tiers.json, using fallback data:', error);
    // 降级数据，确保服务不会崩溃
    return {
      tier_definitions: {
        "Tier 0": { score_range: [99, 100], fixed_score: 99, description: "顶尖院校" },
        "Tier 1": { score_range: [95, 98], fixed_score: 96, description: "一流院校" },
        "Tier 2": { score_range: [85, 94], fixed_score: 89, description: "优秀院校" },
        "Tier 3": { score_range: [75, 84], fixed_score: 79, description: "良好院校" },
        "Tier 4": { score_range: [60, 74], fixed_score: 67, description: "普通院校" }
      },
      university_tiers: {}
    };
  }
}

// 懒加载数据，避免启动时的文件读取错误
let universityTiersData: UniversityTiers | null = null;

function getUniversityTiers(): UniversityTiers {
  if (!universityTiersData) {
    universityTiersData = loadUniversityTiers();
  }
  return universityTiersData;
}

export class ScoringService {
  /**
   * GPA分数标准化函数
   * 将不同制式的GPA转换为4.0制标准分数
   */
  static standardizeGPA(gpa: number, scale: 4.0 | 5.0 | 100): number {
    switch (scale) {
      case 4.0:
        return gpa;
      case 5.0:
        // 5.0制转换为4.0制
        return (gpa / 5.0) * 4.0;
      case 100:
        // 100分制转换为4.0制 (90-100=4.0, 80-89=3.0, 70-79=2.0, 60-69=1.0, <60=0)
        if (gpa >= 90) return 4.0;
        if (gpa >= 80) return 3.0;
        if (gpa >= 70) return 2.0;
        if (gpa >= 60) return 1.0;
        return 0.0;
      default:
        throw new Error(`Unsupported GPA scale: ${scale}`);
    }
  }

  /**
   * GPA转换为0-100的评分
   */
  static gpaToScore(gpa: number, scale: 4.0 | 5.0 | 100): number {
    const standardizedGPA = this.standardizeGPA(gpa, scale);
    // 4.0制GPA转换为0-100分
    return Math.round(standardizedGPA * 25);
  }

  /**
   * TOEFL分数转换函数
   * 将TOEFL分数转换为0-100的评分
   */
  static toeflToScore(total: number, reading?: number, listening?: number, speaking?: number, writing?: number): number {
    // TOEFL总分120分，转换为0-100分
    let score = (total / 120) * 100;
    
    // 如果有单项分数，进行加权计算
    if (reading !== undefined && listening !== undefined && speaking !== undefined && writing !== undefined) {
      const readingScore = (reading / 30) * 100;
      const listeningScore = (listening / 30) * 100;
      const speakingScore = (speaking / 30) * 100;
      const writingScore = (writing / 30) * 100;
      
      // 加权平均：总分40%，单项各15%
      score = (total / 120) * 40 + (readingScore + listeningScore + speakingScore + writingScore) * 0.15;
    }
    
    return Math.round(score);
  }

  /**
   * IELTS分数转换函数
   * 将IELTS分数转换为0-100的评分
   */
  static ieltsToScore(total: number, reading?: number, listening?: number, speaking?: number, writing?: number): number {
    // IELTS总分9分，转换为0-100分
    let score = (total / 9) * 100;
    
    // 如果有单项分数，进行加权计算
    if (reading !== undefined && listening !== undefined && speaking !== undefined && writing !== undefined) {
      const readingScore = (reading / 9) * 100;
      const listeningScore = (listening / 9) * 100;
      const speakingScore = (speaking / 9) * 100;
      const writingScore = (writing / 9) * 100;
      
      // 加权平均：总分40%，单项各15%
      score = (total / 9) * 40 + (readingScore + listeningScore + speakingScore + writingScore) * 0.15;
    }
    
    return Math.round(score);
  }

  /**
   * 语言分数转换函数
   * 根据考试类型调用相应的转换函数
   */
  static languageToScore(language: UserBackground['language']): number {
    if (!language) return 0;
    
    switch (language.type) {
      case 'TOEFL':
        return this.toeflToScore(
          language.total,
          language.reading,
          language.listening,
          language.speaking,
          language.writing
        );
      case 'IELTS':
        return this.ieltsToScore(
          language.total,
          language.reading,
          language.listening,
          language.speaking,
          language.writing
        );
      default:
        throw new Error(`Unsupported language test type: ${language.type}`);
    }
  }

  /**
   * 基于university_tiers.json的院校背景评分函数
   */
  static universityTierToScore(university: string): number {
    const tiers = getUniversityTiers();
    // 查找院校所属的等级
    for (const [tier, universities] of Object.entries(tiers.university_tiers)) {
      if (universities.includes(university)) {
        return tiers.tier_definitions[tier].fixed_score;
      }
    }
    
    // 如果找不到匹配的院校，返回Tier 4的分数
    return tiers.tier_definitions["Tier 4"].fixed_score;
  }

  /**
   * 计算学术背景综合评分
   */
  static calculateAcademicScore(academic: UserBackground['academic']): number {
    const gpaScore = this.gpaToScore(academic.gpa, academic.gpaScale);
    const universityScore = this.universityTierToScore(academic.university);
    
    // 加权计算：GPA 60%，院校背景 40%
    return Math.round(gpaScore * 0.6 + universityScore * 0.4);
  }

  /**
   * 计算语言能力评分
   */
  static calculateLanguageScore(language: UserBackground['language']): number {
    if (!language) return 0;
    return this.languageToScore(language);
  }

  /**
   * 计算标准化考试评分
   */
  static calculateStandardTestScore(standardTests: UserBackground['standardTests']): number {
    let score = 0;
    let count = 0;
    
    if (standardTests?.gre) {
      // GRE总分340分，转换为0-100分
      score += (standardTests.gre.total / 340) * 100;
      count++;
    }
    
    if (standardTests?.gmat) {
      // GMAT总分800分，转换为0-100分
      score += (standardTests.gmat.total / 800) * 100;
      count++;
    }
    
    return count > 0 ? Math.round(score / count) : 0;
  }

  /**
   * 计算雷达图所有维度的评分
   */
  static calculateRadarChartScores(userBackground: UserBackground): {
    academic: number;
    language: number;
    research: number;
    internship: number;
    university: number;
  } {
    return {
      academic: this.calculateAcademicScore(userBackground.academic),
      language: this.calculateLanguageScore(userBackground.language),
      research: 0, // 暂时设为0，后续AI部分实现
      internship: 0, // 暂时设为0，后续AI部分实现
      university: this.universityTierToScore(userBackground.academic.university)
    };
  }
}

export default ScoringService;
