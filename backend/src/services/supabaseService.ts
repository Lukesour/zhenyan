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
   * 获取所有处理过的案例
   * @returns 所有案例列表
   */
  static async getAllProcessedCases(): Promise<ProcessedCase[]> {
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


