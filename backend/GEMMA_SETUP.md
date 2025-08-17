# Gemma 3 API 集成说明

## 概述

本项目已集成 Google 的 Gemma 3 大语言模型 API，用于智能分析用户背景和生成分析报告。

## 配置

### 环境变量

在 `backend/.env` 文件中配置以下变量：

```bash
GEMMA_API_KEY=AIzaSyCoFTfqOUr9K8Lg4v-mSR_Ou63YqQyv-r0
GEMMA_MODEL=gemma-3-27b
```

### API 端点

- **测试连接**: `GET /test-gemma`
- **AI 评分**: 通过 `GemmaService.getAiScore()` 方法调用

## 使用方法

### 1. 基础 AI 评分

```typescript
import { GemmaService } from './services/gemmaService';

// 评估科研经历
const score = await GemmaService.getAiScore('参与机器学习项目，使用Python实现神经网络算法');
console.log('科研经历评分:', score); // 输出: 85
```

### 2. 测试 API 连接

```typescript
// 测试 Gemma 3 API 连接
const isConnected = await GemmaService.testConnection();
if (isConnected) {
  console.log('✅ Gemma 3 API 连接成功');
} else {
  console.log('❌ Gemma 3 API 连接失败');
}
```

### 3. 在 Express 路由中使用

```typescript
app.post('/api/analyze', async (req, res) => {
  try {
    const userBackground = req.body;
    
    // 使用 AI 评估科研经历
    const researchScore = await GemmaService.getAiScore(
      userBackground.experience.research.map(r => r.description).join(' ')
    );
    
    res.json({ researchScore });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 测试

### 运行单元测试

```bash
npm test -- --testPathPatterns=gemmaService.test.ts
```

### 测试 API 端点

```bash
# 启动服务器
npm run dev

# 测试 Gemma 3 连接
curl http://localhost:3001/test-gemma
```

## 注意事项

1. **API 密钥安全**: 确保 `.env` 文件不被提交到版本控制系统
2. **错误处理**: API 调用失败时会抛出错误，请妥善处理
3. **响应格式**: API 返回的文本需要解析才能提取分数
4. **速率限制**: 注意 Google API 的调用频率限制

## 故障排除

### 常见问题

1. **API 密钥无效**: 检查 `.env` 文件中的 `GEMMA_API_KEY` 是否正确
2. **网络错误**: 检查网络连接和防火墙设置
3. **响应解析失败**: 检查 API 返回的数据格式是否符合预期

### 调试模式

在开发环境中，可以查看控制台输出来调试 API 调用：

```typescript
// 启用详细日志
console.log('API 请求:', requestBody);
console.log('API 响应:', responseData);
```


