// 简单的 Supabase 连接测试脚本
require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing Supabase connection...');
console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Attempting to connect to Supabase...');
    
    const { data, error } = await supabase
      .from('processed_cases')
      .select('*')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Connection successful!');
    console.log('Data:', data);
    console.log('Count:', data ? data.length : 0);
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();








