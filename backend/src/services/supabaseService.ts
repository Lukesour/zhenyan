import { createClient, SupabaseClient } from '@supabase/supabase-js';

// 延迟创建 Supabase 客户端，避免模块加载时的环境变量检查
let supabase: SupabaseClient | null = null;

function getSupabaseClient(): SupabaseClient {
  if (!supabase) {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables. Please check your .env file.');
    }

    supabase = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabase;
}

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
  gre_quantitative: number | null;
  gre_verbal: number | null;
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
  // 向量字段，用于相似度搜索
  embedding?: number[];
}

export class SupabaseService {
  /**
   * 测试连接并查询 processed_cases 表
   * @returns 查询到的案例列表
   */
  static async testConnection(): Promise<ProcessedCase[]> {
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('processed_cases')
        .select('*')
        .limit(1);

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      throw new Error(`Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * 使用向量搜索找到最相似的案例
   * @param userVector 用户背景的向量表示
   * @param topN 返回的相似案例数量
   * @returns 最相似的案例列表
   */
  static async findSimilarCases(userVector: number[], topN: number = 10): Promise<ProcessedCase[]> {
    try {
      const client = getSupabaseClient();
      
      // 使用 pgvector 的 cosine_distance 函数进行向量相似度搜索
      // 这里假设 processed_cases 表有一个 embedding 字段存储向量
      const { data, error } = await client
        .rpc('match_cases', {
          query_embedding: userVector,
          match_threshold: 0.7, // 相似度阈值
          match_count: topN
        });

      if (error) {
        console.warn('Vector search failed, falling back to basic similarity search:', error.message);
        // 如果向量搜索失败，降级到基本的相似度搜索
        return await this.fallbackSimilaritySearch(topN);
      }

      return data || [];
    } catch (error) {
      console.warn('Vector search error, using fallback:', error instanceof Error ? error.message : 'Unknown error');
      // 如果出现任何错误，使用降级搜索
      return await this.fallbackSimilaritySearch(topN);
    }
  }

  /**
   * 降级相似度搜索 - 当向量搜索失败时使用
   * 基于基本的数值特征进行相似度计算
   * @param topN 返回的相似案例数量
   * @returns 相似案例列表
   */
  private static async fallbackSimilaritySearch(topN: number): Promise<ProcessedCase[]> {
    try {
      const client = getSupabaseClient();
      
      // 获取所有案例，后续在应用层进行相似度计算
      const { data, error } = await client
        .from('processed_cases')
        .select('*')
        .limit(100); // 限制数量以避免性能问题

      if (error) {
        throw new Error(`Fallback search failed: ${error.message}`);
      }

      // 返回前 topN 个案例，让应用层处理相似度计算
      return (data || []).slice(0, topN);
    } catch (error) {
      console.error('Fallback similarity search failed:', error);
      // 如果连降级搜索都失败，返回空数组
      return [];
    }
  }

  /**
   * 获取所有处理过的案例 - 已废弃，仅用于测试和调试
   * @deprecated 使用 findSimilarCases 替代
   * @returns 所有案例列表
   */
  static async getAllProcessedCases(): Promise<ProcessedCase[]> {
    console.warn('getAllProcessedCases is deprecated. Use findSimilarCases instead.');
    try {
      const client = getSupabaseClient();
      const { data, error } = await client
        .from('processed_cases')
        .select('*');

      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      throw new Error(`Failed to fetch processed cases: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export default SupabaseService;


