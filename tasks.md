# 实施计划: 留学申请分析系统 MVP

## 阶段一: 后端核心逻辑重构 (Backend Core Logic Refactoring)

### 1. 升级评分与数据服务

- [ ] **1.1. 修改 `scoringService.ts` 以实现院校层次自动匹配**
  - **目标**: 移除对前端 `universityTier` 字段的依赖，改为后端自动查询。
  - 修改 `universityTierToScore` 函数，使其从 `data/university_tiers.json` 文件中读取数据来匹配院校并返回分数。
  - 确保对于文件中不存在的院校，能默认返回 "Tier 4" 的分数。
  - *需求引用: R3.1, R3.2, R3.3*
- [ ] **1.2. 为 `scoringService.ts` 编写单元测试**
  - **目标**: 验证院校层次匹配逻辑的正确性。
  - 在 `src/services/__tests__/scoringService.test.ts` 中，添加新的测试用例，覆盖以下场景：
    - 能够正确匹配 Tier 0, 1, 2, 3 中的院校。
    - 对于不在列表中的院校，能够正确返回 Tier 4 的分数。
  - *需求引用: R3.1, R3.2, R3.3*
- [ ] **1.3. 重构 `supabaseService.ts` 以使用向量搜索**
  - **目标**: 废弃全量数据拉取，改为高效的向量相似度查询。
  - 删除 `getAllProcessedCases` 函数。
  - 新增 `findSimilarCases(userVector: number[], topN: number)` 函数。此函数将调用一个预先在 Supabase 中创建好的 RPC 函数（例如 `match_cases`），传递用户向量并获取最相似的 `topN` 个案例。
  - *需求引用: R1.1, R1.3*

### 2. 实现 Gemma 3 AI 服务

- [ ] **2.1. 在 `gemmaService.ts` 中实现向量嵌入功能**
  - **目标**: 创建一个能将用户背景数据转换为向量表示的函数。
  - 新增 `generateVectorEmbedding(background: UserBackground): Promise<number[]>` 函数。
  - 该函数需要构建一个合适的 prompt，将 `UserBackground` 的关键信息序列化为文本，然后调用 Gemma API (或专门的嵌入模型 API) 获取向量。
  - *需求引用: R1.3 (设计决策)*
- [ ] **2.2. 在 `gemmaService.ts` 中实现并行的文本分析生成**
  - **目标**: 创建一个统一的入口点来并发处理所有 AI 文本生成，并内置降级逻辑。
  - 新增 `generateAllTextAnalyses(...)` 函数。
  - 内部使用 `Promise.allSettled` 并发调用 `generateText` 来生成所有报告文本（优势、劣劣、总结等）。
  - 对 `allSettled` 返回的结果进行处理，如果某个调用失败 (`status === 'rejected'`)，则调用对应的 `getFallback...` 函数来生成备用文本。
  - *需求引用: R2.1, R2.2, R2.3*
- [ ] **2.3. 为 `gemmaService.ts` 编写单元测试**
  - **目标**: 验证新增的向量生成和并行文本生成功能的健壮性。
  - 在 `src/services/__tests__/gemmaService.test.ts` 中，通过 mock `fetch` API 来测试：
    - `generateVectorEmbedding` 是否能正确构造请求。
    - `generateAllTextAnalyses` 在所有 promise 都成功时是否能返回所有 AI 生成的文本。
    - `generateAllTextAnalyses` 在部分 promise 失败时是否能正确返回成功的结果和降级生成的文本。
  - *需求引用: R2.3*

### 3. 组装最终 API 端点

- [ ] **3.1. 重构 `/api/analyze` 路由控制器**
  - **目标**: 将所有新服务按照设计文档中的数据流进行编排。
  - 修改 `backend/src/api/routes/analysis.ts` 中的 `POST /analyze` 处理器。
  - 实现新的逻辑流：接收请求 -> 计算基础分数 -> 生成用户向量 -> **并行**查询相似案例和生成分析文本 -> 组装完整报告 -> 返回响应。
  - 实现对 `findSimilarCases` 的 `try...catch` 降级逻辑，在数据库查询失败时使用固定的模拟案例数据。
  - *需求引用: R1.2*
- [ ] **3.2. 编写 `/api/analyze` 的集成测试**
  - **目标**: 确保整个后端流程在服务协同工作时能够正确运行。
  - 创建一个新的测试文件，或修改 `test-real-report.js`，用于测试 `/api/analyze` 端点。
  - 使用 `jest.mock` 来 mock `supabaseService` 和 `gemmaService`，专注于测试控制器本身的逻辑是否正确、数据是否被正确组装。
  - *需求引用: R1.1, R1.2, R1.3, R2.1, R2.3*

## 阶段二: 前端界面调整 (Frontend UI Adjustments)

### 4. 优化表单输入体验

- [ ] **4.1. 修改 `frontend/src/types/index.ts`**
  - **目标**: 使类型定义与新的后端数据契约保持一致。
  - 将 `UserBackground.academic.majorCategory` 字段标记为可选 (`?`)。
  - `UserBackground.academic.universityTier` 字段可以被移除或标记为可选，因为它不再由前端提供。
  - *需求引用: R4.2*
- [ ] **4.2. 更新 `FormPage.tsx` 组件**
  - **目标**: 实现表单的精简和清晰化。
  - 移除 "院校等级" (`universityTier`) 和 "专业大类" (`majorCategory`) 的 `Form.Item` 组件。
  - 为所有非必填项的 `Form.Item` 或其所在的 `Card` 组件添加 "(选填)" 标识。
  - *需求引用: R3.4, R4.1, R5.1, R5.2, R5.3*
- [ ] **4.3. 编写 `FormPage.tsx` 的组件测试**
  - **目标**: 验证 UI 更改是否正确应用。
  - 使用 React Testing Library 编写测试，断言：
    - "院校等级" 和 "专业大类" 两个输入框不存在于文档中。
    - "语言成绩"、"GRE总分" 等字段的标签文本包含 "(选填)"。
  - *需求引用: R3.4, R4.1, R5.1*