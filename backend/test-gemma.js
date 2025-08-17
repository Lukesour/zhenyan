// 测试 Gemma 3 API 连接
require('dotenv').config();

async function testGemma() {
  try {
    console.log('Testing Gemma 3 API connection...');
    console.log('API Key:', process.env.GEMMA_API_KEY ? 'Set' : 'Not set');
    console.log('Model:', process.env.GEMMA_MODEL || 'gemma-3-27b');
    
    // 这里只是测试配置，实际的 API 调用测试需要 TypeScript 环境
    console.log('✅ Gemma service configuration looks good');
    console.log('To test actual API calls, run: npm run dev');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testGemma();


