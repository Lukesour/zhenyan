# 设计文档: 留学申请分析系统 MVP 核心功能

## 1. 概述

本文档为留学申请分析系统 MVP 核心功能改进提供技术设计方案。该设计旨在将系统从一个依赖模拟数据的原型，转变为一个由 Supabase 真实案例数据和 Gemma 3 大语言模型驱动的、具备核心分析能力的应用。设计重点在于**性能、健壮性**和**可维护性**。

## 2. 架构

整体架构保持前后端分离。核心变更在于后端与外部服务的交互方式，特别是引入了向量数据库查询和并行的 AI API 调用。

### 2.1. 数据流

下面的序列图展示了处理一次 `/api/analyze` 请求的核心数据流。

```
sequenceDiagram
    participant Client as 客户端 (React)
    participant Server as 后端服务器 (Node.js)
    participant Supabase as Supabase (pgvector)
    participant Gemma as Gemma 3 API

    Client->>+Server: POST /api/analyze (携带 UserBackground)
    Server->>Server: 1. 验证和预处理用户数据
    Server->>Gemma: 2. (异步) 将用户背景转换为向量 (Embedding)
    Gemma-->>Server: 返回用户向量
    
    par
        Server->>+Supabase: 3a. 使用用户向量查询相似案例
        Supabase-->>-Server: 返回 Top 10 相似案例
    and
        Server->>+Gemma: 3b. (并行) 请求所有分析文本 (优势, 劣势, 总结...)
        Gemma-->>-Server: 返回生成的文本内容
    end

    Server->>Server: 4. 组装 AnalysisReport
    Server-->>-Client: 5. 返回完整的 AnalysisReport JSON
```

**设计决策**:

- **向量化查询**: 步骤 `2` 和 `3a` 是核心优化。通过将相似度计算的重任交给 Supabase 的 `pgvector`，我们避免了在后端加载整个数据库，极大地提升了性能和可扩展性。
- **并行处理**: 步骤 `3a` 和 `3b` 并行执行。查询数据库和请求 AI 分析是整个流程中最耗时的部分，并行化可以显著缩短用户的等待时间。

## 3. 组件和接口

### 3.1. 后端服务 (`backend/src/services/`)

#### **`supabaseService.ts`**

- **`getAllProcessedCases()`**: **废弃**。此函数将被移除，以避免全表扫描。
- **`findSimilarCases(userVector: number[], topN: number): Promise<ProcessedCase[]>` (新增)**:
  - **职责**: 接受一个用户背景的向量表示，并使用 `pgvector` 的 `cosine_distance` 或类似函数在 `processed_cases` 表中执行向量相似度搜索。
  - **实现**: 调用 Supabase 的 RPC (Remote Procedure Call) 来执行一个自定义的 SQL 函数，该函数负责向量匹配和排序。
  - **返回**: 返回数据库中与用户最相似的 `topN` 个案例。

#### **`gemmaService.ts`**

- **`generateText(prompt: string): Promise<string>`**: 保持不变，作为基础的 API 调用单元。内部应包含简单的重试逻辑（例如，重试1-2次）。
- **`generateVectorEmbedding(background: UserBackground): Promise<number[]>` (新增)**:
  - **职责**: 调用 Gemma 或其他专门的嵌入模型，将结构化的 `UserBackground` 对象转换为一个向量。
  - **实现**: 构建一个用于嵌入的特定 prompt，发送给模型，并解析返回的向量数据。
- **`generateAllTextAnalyses(background: UserBackground, similarCases: ProcessedCase[]): Promise<AnalysisTexts>` (新增)**:
  - **职责**: 作为所有文本生成任务的入口点。
  - **实现**:
    1. 为优势、劣势、总结、推荐理由等每一个文本项构建独立的 prompt。
    2. 使用 `Promise.allSettled` 并发调用 `generateText`。
    3. 处理 `allSettled` 的结果，对成功的结果返回值，对失败的结果调用相应的 `getFallback...` 降级函数。
  - **返回**: 一个包含所有文本字段的对象。

#### **`analysis.ts` (路由控制器)**

- **`POST /api/analyze`**:
  - **职责**: 编排整个分析流程，是所有服务的协调者。
  - **逻辑重构**:
    1. 接收 `UserBackground` 数据。
    2. 调用 `scoringService` 计算**非 AI**部分的雷达图分数（如 GPA, 语言）。
    3. 调用 `gemmaService.generateVectorEmbedding` 获取用户向量。
    4. **并行执行**以下任务:
       - `supabaseService.findSimilarCases(userVector, 10)`
       - `gemmaService.generateAllTextAnalyses(background, ...)`
    5. 等待并行任务完成。
    6. 组装最终的 `AnalysisReport` 对象，并返回给客户端。

### 3.2. 前端 (`frontend/src/`)

#### **`FormPage.tsx`**

- **移除字段**: 删除 "院校等级" (`universityTier`) 和 "专业大类" (`majorCategory`) 的 `Form.Item`。
- **增加标签**:
  - 在 `Card` 的 `title` 属性或 `Form.Item` 的 `label` 属性中为非必填项添加 "(选填)" 文本。
  - 例如：`<Card title="语言成绩 (选填)">` 或 `<Form.Item label="GRE总分 (选填)">`。

## 4. 数据模型

核心数据结构 `UserBackground` 和 `AnalysisReport` 在 `types/index.ts` 中已定义，本次修改无需变更其结构，只需调整其填充方式。

- **`UserBackground.academic.universityTier`**: 此字段将由后端根据 `university` 名称和 `data/university_tiers.json` 文件自动填充。前端不再提交此字段。
- **`UserBackground.academic.majorCategory`**: 此字段将由后端逻辑处理（例如，基于一个简单的映射或 AI 判断），前端不再提交。

## 5. 错误处理

健壮性是本次设计的核心。

- **Gemma API 失败**:
  - **策略**: 单点降级。
  - **实现**: 在 `gemmaService.generateAllTextAnalyses` 中，`Promise.allSettled` 会捕获每一次单独的 API 调用失败。如果生成 "优势分析" 的调用失败，但其他调用成功，则只有 "优势分析" 字段会使用 `getFallbackStrengths` 函数生成的内容，报告的其余部分仍然由 AI 生成。这保证了报告的完整性和最大化的 AI 内容。
- **Supabase 查询失败**:
  - **策略**: 关键路径降级。
  - **实现**: 在 `analysis.ts` 控制器中，`try...catch` 块将捕获 `findSimilarCases` 的失败。如果失败，将使用一个或两个硬编码的、通用的模拟案例来填充 `similarCases` 和 `schoolRecommendations` 部分。这可以防止因数据库问题导致整个报告生成失败。
- **前端错误**:
  - **策略**: 清晰的用户反馈。
  - **实现**: `analysisAPI.ts` 中的 `catch` 块应保持不变，它会将后端返回的错误信息（或一个通用错误信息）传递给 `useAppContext`，`ReportPage` 会显示一个 `Alert` 组件来通知用户。

## 6. 测试策略

- **单元测试**:
  - **`supabaseService`**: Mock Supabase 客户端，测试 `findSimilarCases` 是否能正确构造 RPC 调用。
  - **`gemmaService`**: Mock `fetch` API，测试 `generateVectorEmbedding` 和 `generateAllTextAnalyses` 是否能正确处理成功和失败的 promise，并验证降级逻辑是否被触发。
  - **`scoringService`**: 验证 `university_tiers.json` 的查找逻辑，包括命中和未命中的情况。
- **集成测试**:
  - 编写一个端到端的测试脚本（类似现有的 `test-real-report.js`），模拟一次完整的 `/api/analyze` 请求。
  - 需要设置一个测试用的 Supabase 数据库（或 mock 其响应）和 mock Gemma API 的响应，以验证整个后端的编排逻辑是否正确。
- **前端测试**:
  - 使用 React Testing Library 验证 `FormPage.tsx` 中相关字段是否已移除，以及选填标签是否正确显示。