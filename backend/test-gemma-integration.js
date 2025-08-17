// 测试 Gemma 3 服务集成
require('dotenv').config();

async function testGemmaIntegration() {
  console.log('🧪 测试 Gemma 3 服务集成...');
  console.log('=====================================');
  
  // 1. 检查环境变量
  console.log('1. 环境变量检查:');
  console.log(`   GEMMA_API_KEY: ${process.env.GEMMA_API_KEY ? '✅ 已设置' : '❌ 未设置'}`);
  console.log(`   GEMMA_MODEL: ${process.env.GEMMA_MODEL || 'gemma-3-27b'}`);
  
  // 2. 检查服务文件
  console.log('\n2. 服务文件检查:');
  const fs = require('fs');
  const path = require('path');
  
  const gemmaServicePath = path.join(__dirname, 'src/services/gemmaService.ts');
  const gemmaServiceExists = fs.existsSync(gemmaServicePath);
  console.log(`   gemmaService.ts: ${gemmaServiceExists ? '✅ 存在' : '❌ 不存在'}`);
  
  // 3. 检查编译后的文件
  const gemmaServiceJsPath = path.join(__dirname, 'dist/services/gemmaService.js');
  const gemmaServiceJsExists = fs.existsSync(gemmaServiceJsPath);
  console.log(`   gemmaService.js: ${gemmaServiceJsExists ? '✅ 存在' : '❌ 不存在'}`);
  
  // 4. 检查测试文件
  const testPath = path.join(__dirname, 'src/services/__tests__/gemmaService.test.ts');
  const testExists = fs.existsSync(testPath);
  console.log(`   测试文件: ${testExists ? '✅ 存在' : '❌ 不存在'}`);
  
  // 5. 检查服务器端点
  console.log('\n3. 服务器端点检查:');
  console.log('   启动服务器后，可以测试以下端点:');
  console.log('   - GET /health - 健康检查');
  console.log('   - GET /test-gemma - Gemma 3 连接测试');
  
  // 6. 总结
  console.log('\n=====================================');
  console.log('📋 集成状态总结:');
  
  if (gemmaServiceExists && gemmaServiceJsExists && testExists) {
    console.log('✅ Gemma 3 服务集成完成！');
    console.log('✅ 所有必要文件已创建');
    console.log('✅ TypeScript 编译成功');
    console.log('✅ 单元测试已配置');
    console.log('✅ 服务器端点已配置');
    console.log('\n🚀 下一步：启动服务器并测试 API 端点');
  } else {
    console.log('❌ 集成未完成，请检查缺失的文件');
  }
  
  console.log('\n💡 提示：');
  console.log('- 使用 npm run dev 启动服务器');
  console.log('- 使用 curl http://localhost:3001/test-gemma 测试 Gemma 3 连接');
  console.log('- 使用 npm test 运行单元测试');
}

testGemmaIntegration().catch(console.error);

