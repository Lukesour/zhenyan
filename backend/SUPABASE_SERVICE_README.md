# SupabaseService 重构说明

## 概述

`SupabaseService` 已经重构，从原来的全量数据拉取模式改为高效的向量相似度搜索模式。

## 主要变更

### 1. 新增功能

#### `findSimilarCases(userVector: number[], topN: number = 10)`
- **功能**: 使用向量搜索找到最相似的案例
- **参数**: 
  - `userVector`: 用户背景的向量表示
  - `topN`: 返回的相似案例数量（默认10）
- **返回**: `Promise<ProcessedCase[]>`

#### 向量搜索流程
1. 调用 Supabase RPC 函数 `match_cases` 进行向量相似度搜索
2. 如果向量搜索失败，自动降级到基本相似度搜索
3. 如果连降级搜索都失败，返回空数组

### 2. 废弃功能

#### `getAllProcessedCases()` - 已废弃
- **状态**: 已废弃，但仍保留以维持向后兼容性
- **警告**: 调用时会输出废弃警告
- **建议**: 使用 `findSimilarCases` 替代

### 3. 数据结构更新

#### `ProcessedCase` 接口
- 新增可选字段 `embedding?: number[]` 用于存储向量数据
- 其他字段保持不变

## 使用示例

### 基本用法

```typescript
import { SupabaseService } from './services/supabaseService';

// 使用向量搜索
const userVector = [0.1, 0.2, 0.3, 0.4, 0.5];
const similarCases = await SupabaseService.findSimilarCases(userVector, 5);

// 处理结果
similarCases.forEach(case => {
  console.log(`案例 ${case.id}: ${case.admitted_university}`);
});
```

### 错误处理

```typescript
try {
  const cases = await SupabaseService.findSimilarCases(userVector, 10);
  if (cases.length === 0) {
    console.log('未找到相似案例，可能需要调整搜索参数');
  }
} catch (error) {
  console.error('搜索失败:', error);
}
```

## 配置要求

### Supabase 设置

1. **环境变量**
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

2. **数据库函数**
   - 需要在 Supabase 中创建 `match_cases` RPC 函数
   - 该函数应使用 `pgvector` 扩展进行向量相似度搜索

3. **表结构**
   - `processed_cases` 表需要 `embedding` 字段（类型：`vector`）
   - 建议在 `embedding` 字段上创建向量索引

### 降级机制

如果向量搜索不可用，系统会自动降级：
1. 尝试基本的数据库查询
2. 限制返回结果数量（最多100条）
3. 让应用层处理相似度计算

## 性能优化

### 向量搜索优势
- **效率**: 避免全表扫描，直接使用向量索引
- **准确性**: 基于语义相似度，而非简单的数值比较
- **扩展性**: 支持大规模数据集的高效搜索

### 缓存策略
- 客户端连接复用
- 延迟初始化模式

## 测试

运行测试：
```bash
npm test -- --testPathPatterns=supabaseService.test.ts
```

测试覆盖：
- 接口完整性验证
- 方法签名检查
- 降级机制验证

## 注意事项

1. **向量维度**: 确保用户向量与数据库中的向量维度一致
2. **相似度阈值**: 当前设置为 0.7，可根据需要调整
3. **错误处理**: 系统设计为优雅降级，确保不会因单个功能失败而崩溃
4. **向后兼容**: 旧的方法仍然可用，但建议迁移到新的API

## 未来改进

1. **批量搜索**: 支持一次搜索多个用户向量
2. **动态阈值**: 根据数据分布动态调整相似度阈值
3. **混合搜索**: 结合向量搜索和传统SQL查询
4. **结果排序**: 支持多种排序策略




