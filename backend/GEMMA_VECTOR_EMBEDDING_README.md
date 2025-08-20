# GemmaService 向量嵌入功能说明

## 概述

`GemmaService` 现在支持将用户背景信息转换为向量表示，用于高效的相似度搜索和案例匹配。

## 新增功能

### `generateVectorEmbedding(background: UserBackground): Promise<number[]>`

将结构化的用户背景信息转换为数值向量，支持向量相似度搜索。

#### 参数
- `background`: 用户背景信息对象

#### 返回值
- `Promise<number[]>`: 64维向量数组

## 实现原理

### 1. 文本描述构建

系统将用户背景信息转换为结构化的文本描述：

```
Academic: 清华大学 (Tier 0), 计算机科学, GPA 3.8/4.0, graduated 2024
Language: TOEFL 100 (R:25 L:25 S:25 W:25)
GRE: 320 (W:4.0)
Target: Master in 计算机科学 at 美国
Research: 1 projects
Internship: 1 experiences
Competition: 1 competitions
Others: 1 activities
```

### 2. 向量生成策略

#### 主要方法：API调用
- 调用 Google 的 `embedding-001` 模型
- 将文本描述转换为高维向量
- 支持语义理解和上下文关联

#### 降级方法：数值特征向量
当API调用失败时，系统自动生成基于数值特征的向量：

| 特征 | 映射规则 | 示例 |
|------|----------|------|
| 院校等级 | Tier 0→1.0, Tier 1→0.8, Tier 2→0.6, Tier 3→0.4, Tier 4→0.2 | Tier 0 → 1.0 |
| GPA | 实际值/满分值 | 3.8/4.0 → 0.95 |
| 语言成绩 | 实际分数/满分 | TOEFL 100/120 → 0.833 |
| 标准化考试 | 实际分数/满分 | GRE 320/340 → 0.941 |
| 经历数量 | min(实际数量/10, 1.0) | 1个项目/10 → 0.1 |

### 3. 向量标准化

- **固定长度**: 所有向量都标准化为64维
- **数值范围**: 所有值都在0.0-1.0范围内
- **一致性**: 相同输入产生相同输出

## 使用示例

### 基本用法

```typescript
import { GemmaService } from './services/gemmaService';

const userBackground: UserBackground = {
  academic: {
    university: '清华大学',
    universityTier: 'Tier 0',
    major: '计算机科学',
    majorCategory: 'CS',
    gpa: 3.8,
    gpaScale: 4.0,
    graduationYear: 2024
  },
  // ... 其他字段
};

try {
  // 生成向量嵌入
  const vector = await GemmaService.generateVectorEmbedding(userBackground);
  console.log('向量维度:', vector.length); // 64
  console.log('向量值:', vector);
} catch (error) {
  console.error('向量生成失败:', error);
}
```

### 与SupabaseService集成

```typescript
import { GemmaService } from './services/gemmaService';
import { SupabaseService } from './services/supabaseService';

// 1. 生成用户向量
const userVector = await GemmaService.generateVectorEmbedding(userBackground);

// 2. 使用向量搜索相似案例
const similarCases = await SupabaseService.findSimilarCases(userVector, 10);

// 3. 处理搜索结果
similarCases.forEach(case => {
  console.log(`相似案例: ${case.admitted_university}`);
});
```

## 错误处理

### 自动降级机制

1. **API调用失败**: 自动切换到数值特征向量
2. **响应格式错误**: 使用降级向量生成
3. **网络问题**: 确保系统可用性

### 降级向量特点

- **确定性**: 相同输入产生相同输出
- **可解释性**: 基于明确的数值映射规则
- **一致性**: 64维固定长度，便于存储和比较

## 性能优化

### 向量生成效率

- **API优先**: 优先使用语义向量，质量更高
- **降级快速**: 本地生成，无网络延迟
- **缓存友好**: 相同输入可缓存结果

### 存储优化

- **固定维度**: 64维向量，存储空间一致
- **数值范围**: 0.0-1.0，支持高效索引
- **标准化**: 便于向量数据库优化

## 配置要求

### 环境变量

```bash
GEMMA_API_KEY=your_gemma_api_key
GEMMA_MODEL=gemma-3-27b  # 可选，默认值
```

### API端点

- **文本生成**: `https://generativelanguage.googleapis.com/v1beta/models/gemma-3-27b:generateContent`
- **向量嵌入**: `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedText`

## 测试覆盖

### 测试用例

- ✅ 成功生成向量嵌入
- ✅ API失败时的降级处理
- ✅ 响应格式错误的处理
- ✅ 可选字段的处理
- ✅ 降级向量的一致性

### 运行测试

```bash
npm test -- --testPathPatterns=gemmaService.test.ts
```

## 注意事项

### 向量质量

1. **API向量**: 语义理解更好，适合复杂背景
2. **降级向量**: 数值特征，适合简单比较
3. **混合使用**: 可根据需要选择策略

### 性能考虑

1. **网络延迟**: API调用有网络开销
2. **降级速度**: 本地生成几乎无延迟
3. **缓存策略**: 建议实现结果缓存

### 扩展性

1. **向量维度**: 当前64维，可根据需要调整
2. **特征映射**: 降级规则可配置化
3. **模型选择**: 支持不同的嵌入模型

## 未来改进

1. **批量处理**: 支持一次处理多个用户背景
2. **动态维度**: 根据数据复杂度调整向量维度
3. **混合策略**: 结合API和本地生成的混合向量
4. **缓存优化**: 实现智能缓存策略
5. **模型选择**: 支持多种嵌入模型选择




