import { UserBackground } from '../types';

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

// 加载院校等级数据
const universityTiers: UniversityTiers = {
  tier_definitions: {
    "Tier 0": { score_range: [99, 100], fixed_score: 99, description: "顶尖院校" },
    "Tier 1": { score_range: [95, 98], fixed_score: 96, description: "一流院校" },
    "Tier 2": { score_range: [85, 94], fixed_score: 89, description: "优秀院校" },
    "Tier 3": { score_range: [75, 84], fixed_score: 79, description: "良好院校" },
    "Tier 4": { score_range: [60, 74], fixed_score: 67, description: "普通院校" }
  },
  university_tiers: {
    "Tier 0": ["清华大学", "北京大学"],
    "Tier 1": [
      "北京航空航天大学", "北京理工大学", "中国人民大学", "哈尔滨工业大学",
      "复旦大学", "南京大学", "浙江大学", "中国科学技术大学", "上海交通大学", "西安交通大学"
    ],
    "Tier 2": [
      "中国农业大学", "南开大学", "北京师范大学", "天津大学", "吉林大学", "大连理工大学",
      "同济大学", "东北大学", "华东师范大学", "东南大学", "厦门大学", "山东大学",
      "中国海洋大学", "武汉大学", "华中科技大学", "湖南大学", "中南大学",
      "国防科学技术大学", "中山大学", "华南理工大学", "四川大学", "电子科技大学",
      "重庆大学", "西北工业大学", "西北农林科技大学", "兰州大学", "中央民族大学",
      "南方科技大学", "深圳大学", "上海财经大学", "对外经济贸易大学", "中央财经大学",
      "中国政法大学", "西安电子科技大学", "北京邮电大学", "南京航空航天大学",
      "南京理工大学", "西南财经大学", "华中师范大学", "中国科学院大学", "首都医科大学",
      "东北财经大学", "上海科技大学"
    ],
    "Tier 3": [
      "北京交通大学", "北京工业大学", "北京科技大学", "北京化工大学", "北京林业大学",
      "中国传媒大学", "华北电力大学", "中国石油大学", "河北工业大学", "太原理工大学",
      "内蒙古大学", "辽宁大学", "大连海事大学", "延边大学", "东北师范大学",
      "东北林业大学", "东北农业大学", "华东理工大学", "东华大学", "上海外国语大学",
      "上海大学", "苏州大学", "南京师范大学", "中国矿业大学", "河海大学",
      "江南大学", "南京农业大学", "中国药科大学", "南京邮电大学", "浙江工业大学",
      "安徽大学", "合肥工业大学", "福州大学", "南昌大学", "郑州大学",
      "中南财经政法大学", "华中农业大学", "湖南师范大学", "暨南大学", "华南师范大学",
      "广西大学", "海南大学", "西南大学", "西南交通大学", "四川农业大学",
      "贵州大学", "云南大学", "西北大学", "长安大学", "陕西师范大学",
      "青海大学", "宁夏大学", "新疆大学", "石河子大学", "西藏大学",
      "北京中医药大学", "天津医科大学", "中国音乐学院", "中央美术学院",
      "中央戏剧学院", "北京体育大学", "上海音乐学院", "上海体育学院",
      "南京艺术学院", "中国美术学院", "西南政法大学", "第二军医大学",
      "第四军医大学", "武汉理工大学"
    ]
  }
};

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
    // 查找院校所属的等级
    for (const [tier, universities] of Object.entries(universityTiers.university_tiers)) {
      if (universities.includes(university)) {
        return universityTiers.tier_definitions[tier].fixed_score;
      }
    }
    
    // 如果找不到匹配的院校，返回Tier 4的分数
    return universityTiers.tier_definitions["Tier 4"].fixed_score;
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
