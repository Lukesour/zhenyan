import { UserBackground } from '../types';

// Gemma 3 API 配置
const GEMMA_API_KEY = process.env.GEMMA_API_KEY || 'AIzaSyCoFTfqOUr9K8Lg4v-mSR_Ou63YqQyv-r0';
const GEMMA_MODEL = process.env.GEMMA_MODEL || 'gemma-3-27b';
const GEMMA_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b:generateContent';

// 向量嵌入API配置
const EMBEDDING_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedText';

export class GemmaService {
  /**
   * 调用 Gemma 3 API 获取 AI 评分
   * @param prompt 评估提示词
   * @returns 0-100 的分数
   */
  static async getAiScore(prompt: string): Promise<number> {
    try {
      const response = await fetch(GEMMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMMA_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `请评估以下内容的专业性和质量，只返回一个0-100的整数分数，不要其他任何文字：

${prompt}

分数：`
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 10
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Invalid response format from Gemma API');
      }

      // 提取数字分数
      const scoreMatch = text.match(/\d+/);
      if (!scoreMatch) {
        throw new Error('Could not extract score from API response');
      }

      const score = parseInt(scoreMatch[0], 10);
      return Math.max(0, Math.min(100, score)); // 确保分数在 0-100 范围内

    } catch (error) {
      console.error('Error calling Gemma API:', error);
      // 重新抛出错误，让调用者决定如何处理
      throw error;
    }
  }

  /**
   * 测试 Gemma 3 API 连接
   * @returns 测试结果
   */
  static async testConnection(): Promise<boolean> {
    try {
      const score = await this.getAiScore('这是一个测试文本，用于验证 API 连接。');
      console.log(`✅ Gemma API connection successful. Test score: ${score}`);
      return true;
    } catch (error) {
      console.error('❌ Gemma API connection failed:', error);
      return false;
    }
  }

  /**
   * 将用户背景转换为向量表示
   * @param background 用户背景信息
   * @returns 向量数组
   */
  static async generateVectorEmbedding(background: UserBackground): Promise<number[]> {
    try {
      // 构建用于向量化的文本描述
      const textDescription = this.buildBackgroundDescription(background);
      
      // 调用嵌入API
      const response = await fetch(EMBEDDING_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMMA_API_KEY}`
        },
        body: JSON.stringify({
          text: textDescription
        })
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      const embedding = data.embedding?.values;
      
      if (!embedding || !Array.isArray(embedding)) {
        throw new Error('Invalid embedding response format');
      }

      return embedding;

    } catch (error) {
      console.error('Error generating vector embedding:', error);
      // 如果向量生成失败，返回一个基于数值特征的简单向量
      return this.generateFallbackVector(background);
    }
  }

  /**
   * 构建用户背景的文本描述，用于向量化
   * @param background 用户背景信息
   * @returns 文本描述
   */
  private static buildBackgroundDescription(background: UserBackground): string {
    const parts = [
      // 学术背景
      `Academic: ${background.academic.university} (${background.academic.universityTier}), ${background.academic.major}, GPA ${background.academic.gpa}/${background.academic.gpaScale}, graduated ${background.academic.graduationYear}`,
      
      // 语言成绩
      background.language ? `Language: ${background.language.type} ${background.language.total} (R:${background.language.reading || 0} L:${background.language.listening || 0} S:${background.language.speaking || 0} W:${background.language.writing || 0})` : 'Language: Not provided',
      
      // 标准化考试
      background.standardTests?.gre ? `GRE: ${background.standardTests.gre.total} (W:${background.standardTests.gre.writing || 0})` : '',
      background.standardTests?.gmat ? `GMAT: ${background.standardTests.gmat.total}` : '',
      
      // 申请意向
      `Target: ${background.applicationIntent.degree} in ${background.applicationIntent.majors.join(', ')} at ${background.applicationIntent.countries.join(', ')}`,
      
      // 经历
      `Research: ${background.experience.research.length} projects`,
      `Internship: ${background.experience.internship.length} experiences`,
      `Competition: ${background.experience.competition.length} competitions`,
      `Others: ${background.experience.others.length} activities`
    ].filter(Boolean); // 过滤空字符串

    return parts.join('. ');
  }

  /**
   * 生成降级向量 - 当向量API失败时使用
   * 基于数值特征生成一个简单的向量表示
   * @param background 用户背景信息
   * @returns 降级向量
   */
  private static generateFallbackVector(background: UserBackground): number[] {
    const vector: number[] = [];
    
    // 院校等级向量化 (0-4 -> 0.0-1.0)
    const tierMap: Record<string, number> = {
      'Tier 0': 1.0,
      'Tier 1': 0.8,
      'Tier 2': 0.6,
      'Tier 3': 0.4,
      'Tier 4': 0.2
    };
    vector.push(tierMap[background.academic.universityTier] || 0.2);
    
    // GPA标准化 (转换为0-1范围)
    const gpaScore = Math.min(background.academic.gpa / (background.academic.gpaScale === 100 ? 100 : background.academic.gpaScale), 1.0);
    vector.push(gpaScore);
    
    // 语言成绩标准化
    if (background.language) {
      const maxScore = background.language.type === 'TOEFL' ? 120 : 9;
      const languageScore = background.language.total / maxScore;
      vector.push(languageScore);
    } else {
      vector.push(0.0);
    }
    
    // 标准化考试成绩
    let testScore = 0.0;
    if (background.standardTests?.gre) {
      testScore = background.standardTests.gre.total / 340; // GRE满分340
    } else if (background.standardTests?.gmat) {
      testScore = background.standardTests.gmat.total / 800; // GMAT满分800
    }
    vector.push(testScore);
    
    // 经历数量标准化
    const maxExperiences = 10; // 假设最大经历数量为10
    const researchScore = Math.min(background.experience.research.length / maxExperiences, 1.0);
    const internshipScore = Math.min(background.experience.internship.length / maxExperiences, 1.0);
    const competitionScore = Math.min(background.experience.competition.length / maxExperiences, 1.0);
    
    vector.push(researchScore);
    vector.push(internshipScore);
    vector.push(competitionScore);
    
    // 填充到固定长度 (确保向量长度一致)
    const targetLength = 64; // 目标向量长度
    while (vector.length < targetLength) {
      vector.push(0.0);
    }
    
    // 如果超过目标长度，截断
    return vector.slice(0, targetLength);
  }

  /**
   * 生成优势分析文本
   * @param background 用户背景信息
   * @returns 优势分析文本
   */
  static async generateStrengths(background: UserBackground): Promise<string> {
    const prompt = `基于以下用户背景，生成一段优势分析文本，突出用户的强项和优势：

学术背景：
- 院校：${background.academic.university} (${background.academic.universityTier})
- 专业：${background.academic.major} (${background.academic.majorCategory})
- GPA：${background.academic.gpa} (${background.academic.gpaScale}制)
- 毕业年份：${background.academic.graduationYear}

语言成绩：${background.language ? `${background.language.type}: ${background.language.total}` : '未提供'}

标准化考试：${background.standardTests?.gre ? `GRE: ${background.standardTests.gre.total}` : background.standardTests?.gmat ? `GMAT: ${background.standardTests.gmat.total}` : '未提供'}

申请意向：${background.applicationIntent.degree} in ${background.applicationIntent.majors.join(', ')} at ${background.applicationIntent.countries.join(', ')}

科研经历：${background.experience.research.length} 项
实习经历：${background.experience.internship.length} 项
竞赛经历：${background.experience.competition.length} 项

请生成一段200-300字的中文优势分析，突出用户的核心竞争力。`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating strengths:', error);
      return this.getFallbackStrengths(background);
    }
  }

  /**
   * 生成劣势分析文本
   * @param background 用户背景信息
   * @returns 劣势分析文本
   */
  static async generateWeaknesses(background: UserBackground): Promise<string> {
    const prompt = `基于以下用户背景，生成一段劣势分析文本，客观分析用户的短板和需要改进的地方：

学术背景：
- 院校：${background.academic.university} (${background.academic.universityTier})
- 专业：${background.academic.major} (${background.academic.majorCategory})
- GPA：${background.academic.gpa} (${background.academic.gpaScale}制)

语言成绩：${background.language ? `${background.language.type}: ${background.language.total}` : '未提供'}

标准化考试：${background.standardTests?.gre ? `GRE: ${background.standardTests.gre.total}` : background.standardTests?.gmat ? `GMAT: ${background.standardTests.gmat.total}` : '未提供'}

科研经历：${background.experience.research.length} 项
实习经历：${background.experience.internship.length} 项

请生成一段200-300字的中文劣势分析，客观指出需要改进的地方，并给出改进建议。`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating weaknesses:', error);
      return this.getFallbackWeaknesses(background);
    }
  }

  /**
   * 生成综合评价文本
   * @param background 用户背景信息
   * @returns 综合评价文本
   */
  static async generateSummary(background: UserBackground): Promise<string> {
    const prompt = `基于以下用户背景，生成一段综合评价文本，全面分析用户的申请竞争力：

学术背景：
- 院校：${background.academic.university} (${background.academic.universityTier})
- 专业：${background.academic.major} (${background.academic.majorCategory})
- GPA：${background.academic.gpa} (${background.academic.gpaScale}制)

语言成绩：${background.language ? `${background.language.type}: ${background.language.total}` : '未提供'}

标准化考试：${background.standardTests?.gre ? `GRE: ${background.standardTests.gre.total}` : background.standardTests?.gmat ? `GMAT: ${background.standardTests.gmat.total}` : '未提供'}

申请意向：${background.applicationIntent.degree} in ${background.applicationIntent.majors.join(', ')} at ${background.applicationIntent.countries.join(', ')}

科研经历：${background.experience.research.length} 项
实习经历：${background.experience.internship.length} 项

请生成一段300-400字的中文综合评价，分析用户的整体竞争力，并给出申请建议。`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating summary:', error);
      return this.getFallbackSummary(background);
    }
  }

  /**
   * 生成学校推荐理由
   * @param background 用户背景信息
   * @param university 目标大学
   * @param major 目标专业
   * @returns 推荐理由文本
   */
  static async generateRecommendationReason(background: UserBackground, university: string, major: string): Promise<string> {
    const prompt = `基于以下用户背景，为申请 ${university} 的 ${major} 专业生成推荐理由：

用户背景：
- 院校：${background.academic.university} (${background.academic.universityTier})
- 专业：${background.academic.major} (${background.academic.majorCategory})
- GPA：${background.academic.gpa} (${background.academic.gpaScale}制)
- 语言成绩：${background.language ? `${background.language.type}: ${background.language.total}` : '未提供'}

科研经历：${background.experience.research.length} 项
实习经历：${background.experience.internship.length} 项

请生成一段200-300字的中文推荐理由，说明为什么该用户适合申请这所大学和专业。`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating recommendation reason:', error);
      return this.getFallbackRecommendationReason(background, university, major);
    }
  }

  /**
   * 生成对比分析文本
   * @param background 用户背景信息
   * @param caseBackground 案例背景信息
   * @returns 对比分析文本
   */
  static async generateComparison(background: UserBackground, caseBackground: any): Promise<string> {
    const prompt = `基于以下信息，生成一段对比分析文本：

用户背景：
- 院校：${background.academic.university} (${background.academic.universityTier})
- GPA：${background.academic.gpa} (${background.academic.gpaScale}制)
- 语言成绩：${background.language ? `${background.language.type}: ${background.language.total}` : '未提供'}

案例背景：
- 院校等级：${caseBackground.universityTier}
- GPA：${caseBackground.gpa}
- 语言成绩：${caseBackground.language.type} ${caseBackground.language.score}

请生成一段200-300字的中文对比分析，客观比较用户与案例的异同点。`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating comparison:', error);
      return this.getFallbackComparison(background, caseBackground);
    }
  }

  /**
   * 生成可借鉴经验文本
   * @param background 用户背景信息
   * @param caseBackground 案例背景信息
   * @returns 可借鉴经验文本
   */
  static async generateTakeaways(background: UserBackground, caseBackground: any): Promise<string> {
    const prompt = `基于以下信息，生成一段可借鉴经验文本：

用户背景：
- 院校：${background.academic.university} (${background.academic.universityTier})
- GPA：${background.academic.gpa} (${background.academic.gpaScale}制)

案例背景：
- 院校等级：${caseBackground.universityTier}
- GPA：${caseBackground.gpa}
- 语言成绩：${caseBackground.language.type} ${caseBackground.language.score}

请生成一段200-300字的中文可借鉴经验，说明用户可以从该案例中学到什么。`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating takeaways:', error);
      return this.getFallbackTakeaways(background, caseBackground);
    }
  }

  /**
   * 生成总体策略文本
   * @param background 用户背景信息
   * @returns 总体策略文本
   */
  static async generateStrategySummary(background: UserBackground): Promise<string> {
    const prompt = `基于以下用户背景，生成一段总体策略文本：

学术背景：
- 院校：${background.academic.university} (${background.academic.universityTier})
- 专业：${background.academic.major} (${background.academic.majorCategory})
- GPA：${background.academic.gpa} (${background.academic.gpaScale}制)

语言成绩：${background.language ? `${background.language.type}: ${background.language.total}` : '未提供'}

标准化考试：${background.standardTests?.gre ? `GRE: ${background.standardTests.gre.total}` : background.standardTests?.gmat ? `GMAT: ${background.standardTests.gmat.total}` : '未提供'}

申请意向：${background.applicationIntent.degree} in ${background.applicationIntent.majors.join(', ')} at ${background.applicationIntent.countries.join(', ')}

科研经历：${background.experience.research.length} 项
实习经历：${background.experience.internship.length} 项

请生成一段300-400字的中文总体策略，为用户的申请提供全面的指导建议。`;

    try {
      return await this.generateText(prompt);
    } catch (error) {
      console.error('Error generating strategy summary:', error);
      return this.getFallbackStrategySummary(background);
    }
  }

  /**
   * 通用文本生成方法
   * @param prompt 生成提示词
   * @returns 生成的文本
   */
  private static async generateText(prompt: string): Promise<string> {
    try {
      const response = await fetch(GEMMA_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GEMMA_API_KEY}`
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemma API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json() as any;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        throw new Error('Invalid response format from Gemma API');
      }

      return text.trim();

    } catch (error) {
      console.error('Error calling Gemma API for text generation:', error);
      throw error;
    }
  }

  /**
   * 获取优势分析的备用文本
   */
  private static getFallbackStrengths(background: UserBackground): string {
    return `基于您的背景分析，您具备以下优势：

在学术方面，您来自${background.academic.universityTier}的${background.academic.university}，专业为${background.academic.major}，GPA达到${background.academic.gpa}，展现了扎实的学术基础。

您拥有${background.experience.research.length}项科研经历和${background.experience.internship.length}项实习经历，这些实践经验为您的申请提供了强有力的支撑。

在申请目标方面，您计划攻读${background.applicationIntent.degree}学位，专业方向为${background.applicationIntent.majors.join('、')}，目标国家包括${background.applicationIntent.countries.join('、')}，体现了明确的职业规划。

总体而言，您的学术背景扎实，实践经验丰富，申请目标明确，具备申请目标院校的基本条件。`;
  }

  /**
   * 获取劣势分析的备用文本
   */
  private static getFallbackWeaknesses(background: UserBackground): string {
    return `基于您的背景分析，以下方面还有提升空间：

在语言成绩方面，${background.language ? `您的${background.language.type}成绩为${background.language.total}分，` : '您尚未提供语言成绩，'}这可能影响您的申请竞争力，建议进一步提升语言能力。

在标准化考试方面，${background.standardTests?.gre ? `您的GRE成绩为${background.standardTests.gre.total}分，` : background.standardTests?.gmat ? `您的GMAT成绩为${background.standardTests.gmat.total}分，` : '您尚未提供标准化考试成绩，'}建议重新备考以获得更好的分数。

此外，您的科研和实习经历数量相对较少，建议在申请前增加相关经验，提升整体竞争力。`;
  }

  /**
   * 获取综合评价的备用文本
   */
  private static getFallbackSummary(background: UserBackground): string {
    return `基于您的完整背景分析，您的申请竞争力评估如下：

在学术背景方面，您来自${background.academic.universityTier}的${background.academic.university}，专业为${background.academic.major}，GPA达到${background.academic.gpa}，展现了良好的学术能力。您的专业背景与目标专业${background.applicationIntent.majors.join('、')}高度匹配。

在语言和标准化考试方面，${background.language ? `您的${background.language.type}成绩为${background.language.total}分，` : '您尚未提供语言成绩，'}${background.standardTests?.gre ? `GRE成绩为${background.standardTests.gre.total}分，` : background.standardTests?.gmat ? `GMAT成绩为${background.standardTests.gmat.total}分，` : '尚未提供标准化考试成绩，'}这些成绩需要进一步提升。

在实践经验方面，您拥有${background.experience.research.length}项科研经历和${background.experience.internship.length}项实习经历，为申请提供了有力支撑。

总体而言，您具备申请目标院校的基本条件，但在某些方面还有提升空间。建议重点关注语言成绩和标准化考试的提升，同时增加科研和实习经验。`;
  }

  /**
   * 获取推荐理由的备用文本
   */
  private static getFallbackRecommendationReason(background: UserBackground, university: string, major: string): string {
    return `基于您的背景，我推荐您申请${university}的${major}专业，理由如下：

您的学术背景与该校要求高度匹配。您来自${background.academic.universityTier}的${background.academic.university}，专业为${background.academic.major}，GPA达到${background.academic.gpa}，展现了扎实的学术基础。

您的专业背景与${major}专业高度相关，专业匹配度良好。同时，您拥有${background.experience.research.length}项科研经历和${background.experience.internship.length}项实习经历，这些实践经验为您的申请提供了强有力的支撑。

在申请目标方面，您计划攻读${background.applicationIntent.degree}学位，这与该校的学位设置完全匹配。总体而言，您的背景与该校要求高度契合，具备较强的申请竞争力。`;
  }

  /**
   * 获取对比分析的备用文本
   */
  private static getFallbackComparison(background: UserBackground, caseBackground: any): string {
    return `通过对比分析，您与该案例的异同点如下：

在院校背景方面，您来自${background.academic.universityTier}的${background.academic.university}，案例来自${caseBackground.universityTier}院校，两者在院校等级上${background.academic.universityTier === caseBackground.universityTier ? '相当' : '存在差异'}。

在GPA方面，您的成绩为${background.academic.gpa}，案例为${caseBackground.gpa}，${Math.abs(background.academic.gpa - caseBackground.gpa) < 0.3 ? '两者相近' : '存在一定差距'}。

在语言成绩方面，${background.language ? `您的${background.language.type}成绩为${background.language.total}分，` : '您尚未提供语言成绩，'}案例为${caseBackground.language.type} ${caseBackground.language.score}分。

总体而言，您与该案例在多个维度上具有相似性，这为您的申请提供了积极的参考。`;
  }

  /**
   * 获取可借鉴经验的备用文本
   */
  private static getFallbackTakeaways(background: UserBackground, caseBackground: any): string {
    return `基于该案例的成功经验，您可以借鉴以下几点：

首先，该案例来自${caseBackground.universityTier}院校，GPA达到${caseBackground.gpa}，语言成绩为${caseBackground.language.type} ${caseBackground.language.score}分，这些成绩为成功申请奠定了坚实基础。

其次，该案例的成功表明，即使在某些方面存在不足，通过合理的申请策略和充分的准备，仍然有机会获得录取。

对于您而言，建议重点关注语言成绩的提升，${background.language ? `争取将${background.language.type}成绩提升到${caseBackground.language.score}分以上` : '尽快获得合格的标准化语言成绩'}。

同时，建议增加科研和实习经验，提升整体竞争力。该案例的成功经验证明，全面的背景提升是申请成功的关键。`;
  }

  /**
   * 获取总体策略的备用文本
   */
  private static getFallbackStrategySummary(background: UserBackground): string {
    return `基于您的背景分析，我为您制定以下申请策略：

在学术准备方面，您来自${background.academic.universityTier}的${background.academic.university}，专业为${background.academic.major}，GPA达到${background.academic.gpa}，学术基础扎实。建议继续保持学术优势，同时关注专业相关课程的学习。

在语言提升方面，${background.language ? `您的${background.language.type}成绩为${background.language.total}分，` : '您尚未获得语言成绩，'}建议制定详细的备考计划，${background.language ? `争取提升到更高分数` : '尽快获得合格成绩'}。

在标准化考试方面，${background.standardTests?.gre ? `您的GRE成绩为${background.standardTests.gre.total}分，` : background.standardTests?.gmat ? `您的GMAT成绩为${background.standardTests.gmat.total}分，` : '您尚未提供标准化考试成绩，'}建议重新备考以获得更好的分数。

在经验积累方面，建议增加科研项目参与，提升实习质量，参加相关竞赛，丰富个人背景。

总体而言，建议您按照时间轴逐步提升各项指标，重点关注语言成绩和科研经历的提升，同时提前准备申请材料，确保申请过程的顺利进行。`;
  }

  /**
   * 并行生成所有文本分析
   * 使用 Promise.allSettled 并发处理所有文本生成，内置降级逻辑
   * @param background 用户背景信息
   * @returns 包含所有文本分析的对象
   */
  static async generateAllTextAnalyses(background: UserBackground): Promise<{
    strengths: string;
    weaknesses: string;
    summary: string;
    strategySummary: string;
  }> {
    // 定义所有需要生成的文本类型及其对应的生成函数
    const textGenerators = [
      {
        key: 'strengths' as const,
        generator: () => this.generateStrengths(background),
        fallback: () => this.getFallbackStrengths(background)
      },
      {
        key: 'weaknesses' as const,
        generator: () => this.generateWeaknesses(background),
        fallback: () => this.getFallbackWeaknesses(background)
      },
      {
        key: 'summary' as const,
        generator: () => this.generateSummary(background),
        fallback: () => this.getFallbackSummary(background)
      },
      {
        key: 'strategySummary' as const,
        generator: () => this.generateStrategySummary(background),
        fallback: () => this.getFallbackStrategySummary(background)
      }
    ];

    // 并发执行所有文本生成
    const results = await Promise.allSettled(
      textGenerators.map(async ({ generator }) => generator())
    );

    // 处理结果，对失败的使用降级函数
    const finalResults: any = {};
    
    results.forEach((result, index) => {
      const { key, fallback } = textGenerators[index];
      
      if (result.status === 'fulfilled') {
        finalResults[key] = result.value;
      } else {
        console.warn(`Failed to generate ${key}, using fallback:`, result.reason);
        finalResults[key] = fallback();
      }
    });

    return finalResults;
  }
}
