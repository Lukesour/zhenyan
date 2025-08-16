## MVP 构建分步计划

### 阶段 0: 环境搭建 (Setup)

**目标**: 创建项目结构和基本配置文件。

- **任务 S-1: 初始化项目结构**
  - **目标**: 创建 `frontend` 和 `backend` 文件夹，并分别初始化为Node.js项目。
  - **验收标准**:
    1. 根目录下存在 `frontend` 和 `backend` 文件夹。
    2. 每个文件夹内都有一个 `package.json` 文件。
- **任务 S-2: 安装后端核心依赖**
  - **目标**: 为后端服务器安装基础框架和TypeScript支持。
  - **验收标准**:
    1. `backend/package.json` 中包含 `express`, `cors`, `dotenv`。
    2. `backend/package.json` 的 `devDependencies` 中包含 `typescript`, `@types/express`, `@types/node`, `ts-node-dev`。
- **任务 S-3: 安装前端核心依赖**
  - **目标**: 使用Vite创建一个React + TypeScript项目，并安装UI库和HTTP客户端。
  - **验收标准**:
    1. `frontend` 目录是一个标准的Vite React TS项目。
    2. `frontend/package.json` 中包含 `react`, `react-dom`, `antd`, `axios`, `chart.js`, `react-chartjs-2`。
- **任务 S-4: 定义核心数据结构**
  - **目标**: 创建共享的 `types/index.ts` 文件，定义 `UserBackground` 和 `AnalysisReport` 接口。
  - **验收标准**:
    1. `backend/src/types/index.ts` 文件被创建。
    2. 文件内容与架构文档中定义的接口完全一致。
    3. 将此文件复制到 `frontend/src/types/index.ts`，确保前后端定义同步。

### 阶段 1: 后端骨架与模拟数据 (Backend Skeleton & Mocking)

**目标**: 建立一个能返回固定、有效的 `AnalysisReport` 模拟数据的API端点。

- **任务 BE-1: 创建基础Express服务器**
  - **目标**: 建立一个能监听端口并响应简单请求的HTTP服务器。
  - **验收标准**:
    1. 创建 `backend/src/server.ts`。
    2. 服务器能启动并监听一个端口（如3001）。
    3. 访问 `http://localhost:3001/health` 时，返回 `200 OK` 和 `{ status: 'ok' }`。
- **任务 BE-2: 创建 `/api/analyze` 路由**
  - **目标**: 添加一个接受POST请求的路由，但暂时不处理任何逻辑。
  - **验收标准**:
    1. 创建 `backend/src/api/routes/analysis.ts`。
    2. 向 `http://localhost:3001/api/analyze` 发送POST请求时，返回 `200 OK` 和 `{ message: 'received' }`。
- **任务 BE-3: 创建模拟报告数据**
  - **目标**: 创建一个符合 `AnalysisReport` 接口的静态JSON对象。
  - **验收标准**:
    1. 在 `analysis.ts` 路由文件中，创建一个名为 `mockReport` 的常量。
    2. 该对象的类型为 `AnalysisReport`，并包含所有必需字段，值为合理的假数据（例如，雷达图分数为`{ academic: 85, ... }`，优势文本为`"这是一个模拟的优势分析"`）。
- **任务 BE-4: `/api/analyze` 端点返回模拟报告**
  - **目标**: 修改路由，使其无论收到什么请求体，都返回完整的模拟报告。
  - **验收标准**:
    1. 向 `http://localhost:3001/api/analyze` 发送任何POST请求。
    2. 响应状态码为 `200 OK`。
    3. 响应体是 `mockReport` 这个JSON对象。

### 阶段 2: 前端UI与模拟数据 (Frontend UI with Mock Data)

**目标**: 构建完整的报告页面UI，并使用从后端获取的模拟数据进行填充。

- **任务 FE-1: 设置前端路由**
  - **目标**: 安装 `react-router-dom` 并设置三个页面路由：`/` (表单页), `/progress` (进度页), `/report` (报告页)。
  - **验收标准**:
    1. `react-router-dom` 已安装。
    2. 创建 `FormPage`, `ProgressPage`, `ReportPage` 三个空的组件。
    3. 在 `App.tsx` 中配置路由，确保可以通过URL访问这三个空页面。
- **任务 FE-2: 创建全局Context**
  - **目标**: 建立 `AppContext` 来存储 `isLoading`, `error`, 和 `analysisReport`。
  - **验收标准**:
    1. `frontend/src/contexts/AppContext.ts` 文件被创建。
    2. Context Provider被添加到 `App.tsx` 的顶层。
    3. Context提供 `analysisReport` 状态及其更新函数。
- **任务 FE-3: 搭建报告页 (ReportPage) 布局**
  - **目标**: 使用Ant Design的 `Tabs` 组件构建报告页的5个标签页框架。
  - **验收标准**:
    1. `ReportPage.tsx` 中渲染了一个 `Tabs` 组件。
    2. 包含5个 `TabPane`，标题分别为 "综合评估", "选校建议", "相似案例", "背景提升", "原始数据" (最后一个用于调试)。
    3. 每个标签页内暂时只显示其标题。
- **任务 FE-4: 实现API调用服务**
  - **目标**: 在 `analysisAPI.ts` 中创建一个函数，用于调用后端的 `/api/analyze` 端点。
  - **验收标准**:
    1. `frontend/src/api/analysisAPI.ts` 中有一个异步函数 `fetchAnalysisReport`。
    2. 该函数使用 `axios.post` 调用 `http://localhost:3001/api/analyze`。
    3. 函数返回一个Promise，其解析值为 `AnalysisReport` 类型。
- **任务 FE-5: 在报告页加载并显示模拟数据**
  - **目标**: 在 `ReportPage` 加载时，调用API获取模拟报告，并将其存储在 `AppContext` 中。
  - **验收标准**:
    1. 在 `ReportPage.tsx` 中使用 `useEffect`，在组件首次加载时调用 `fetchAnalysisReport`。
    2. 成功获取数据后，将其设置到 `AppContext` 的 `analysisReport` 状态中。
    3. 在 "原始数据" 标签页中，使用 `<pre>{JSON.stringify(analysisReport, null, 2)}</pre>` 将获取到的数据显示出来。验证数据是否为后端返回的 `mockReport`。
- **任务 FE-6: 渲染雷达图**
  - **目标**: 创建 `RadarChart` 组件，并使用 `AppContext` 中的模拟数据渲染图表。
  - **验收标准**:
    1. 创建一个 `components/report/RadarChart.tsx` 组件。
    2. 在 "综合评估" 标签页中使用该组件。
    3. 图表正确显示5个维度，并且数据点与 `mockReport.competitiveness.radarChart` 的值匹配。
- **任务 FE-7: 渲染报告页的其余部分**
  - **目标**: 创建并填充所有报告页的组件，用模拟数据显示所有内容。
  - **验收标准**:
    1. "综合评估" 标签页显示优势、劣势和总结的文本。
    2. "选校建议" 标签页显示一个学校卡片列表。
    3. "相似案例" 标签页显示一个案例卡片列表。
    4. "背景提升" 标签页显示时间轴计划。
    5. 所有显示的数据都来自 `AppContext` 中的 `mockReport`。

### 阶段 3: 前后端连接 (Connecting the Pipes)

**目标**: 构建用户输入表单，并实现从提交表单到显示（仍然是模拟的）报告的完整用户流程。

- **任务 FE-8: 构建学术背景表单**
  - **目标**: 在 `FormPage.tsx` 中创建第一部分的表单（本科院校、专业、GPA等）。
  - **验收标准**:
    1. 页面上渲染出所有学术背景相关的 Ant Design 表单项。
    2. AutoComplete 和 Select 组件的数据源来自 `frontend_data.json`。
    3. 必填项和数值范围的验证规则已添加。
- **任务 FE-9: 构建完整的用户表单**
  - **目标**: 完成 `FormPage.tsx` 中所有部分的表单，包括动态增删的经历部分。
  - **验收标准**:
    1. 所有在需求文档中描述的表单项都已实现。
    2. "添加科研经历" 等按钮可以正常工作，能动态添加和删除表单项。
    3. 表单具有响应式布局。
- **任务 FE-10: 实现表单提交逻辑**
  - **目标**: 将表单的 `onFinish` 事件与API调用连接起来。
  - **验收标准**:
    1. 创建一个 `hooks/useAnalysis.ts` 自定义Hook，包含一个 `submitAnalysis` 函数和 `isLoading` 状态。
    2. 在 `FormPage.tsx` 中，点击提交按钮时，调用 `submitAnalysis` 并传入表单数据。
    3. `submitAnalysis` 函数会调用 `fetchAnalysisReport`，并将返回的报告存入 `AppContext`。
    4. 在API调用期间，`isLoading` 状态为 `true`。
    5. 提交按钮在 `isLoading` 期间应显示加载状态。
- **任务 FE-11: 实现页面跳转和加载状态**
  - **目标**: 在表单成功提交后，显示进度页，然后在获取到数据后跳转到报告页。
  - **验收标准**:
    1. 提交表单后，立即使用 `react-router-dom` 的 `navigate` 函数跳转到 `/progress` 页面。
    2. `ProgressPage.tsx` 显示一个加载指示器（例如 Ant Design 的 `Spin` 组件）。
    3. `useAnalysis` hook 在成功获取数据后，将用户导航到 `/report` 页面。

### 阶段 4: 实现真实后端逻辑 (Real Backend Logic)

**目标**: 逐一替换后端中的模拟逻辑为真实的计算和AI调用。

- **任务 BE-5: 连接 Supabase**
  - **目标**: 在后端设置 Supabase 客户端并能成功查询数据。
  - **验收标准**:
    1. 安装 `@supabase/supabase-js`。
    2. 在 `.env` 文件中配置 Supabase URL 和 anon key。
    3. 创建 `backend/src/services/supabaseService.ts`。
    4. 该服务中有一个函数能成功连接并从 `processed_cases` 表中查询出至少一条记录。
- **任务 BE-6: 实现评分服务 (ScoringService) - 非AI部分**
  - **目标**: 实现雷达图中不依赖AI的评分逻辑。
  - **验收标准**:
    1. 创建 `backend/src/services/scoringService.ts`。
    2. 实现GPA分数标准化函数。
    3. 实现TOEFL/IELTS分数转换函数。
    4. 实现基于 `university_tiers.json` 的院校背景评分函数。
    5. 为这些函数编写单元测试。
- **任务 BE-7: 实现相似度计算服务**
  - **目标**: 实现基于多维度加权的案例相似度计算。
  - **验收标准**:
    1. 创建 `backend/src/utils/similarity.ts`。
    2. 实现需求文档中描述的 `_calculate_gpa_similarity`, `_calculate_university_tier_similarity` 等所有子函数。
    3. 实现最终的加权总分计算函数。
    4. 在 `analysis.ts` 路由中，调用此服务，能根据输入的 `UserBackground` 和从 Supabase 获取的案例列表，计算出Top 10相似案例的ID和分数。
- **任务 BE-8: 集成 Gemma 3 - 单次调用**
  - **目标**: 建立一个可以调用 Gemma 3 API 并获取结果的基础服务。
  - **验收标准**:
    1. 创建 `backend/src/services/gemmaService.ts`。
    2. 在 `.env` 中配置 Gemma 3 的 API Key。
    3. 创建一个函数，例如 `getAiScore(prompt: string)`，它能向 Gemma 3 发送一个简单的请求（例如，评估一段科研经历的文本），并返回一个解析后的分数。
- **任务 BE-9: 实现评分服务 (ScoringService) - AI部分**
  - **目标**: 将Gemma调用集成到评分服务中，以评估文本类背景。
  - **验收标准**:
    1. 在 `scoringService.ts` 中，为科研和实习背景评分的函数现在会调用 `gemmaService.ts`。
    2. 能根据用户提交的经历描述文本，返回一个0-100的分数。
- **任务 BE-10: 实现AI文本生成**
  - **目标**: 在 `gemmaService.ts` 中创建用于生成报告中长文本内容的函数。
  - **验收标准**:
    1. 创建一个 `generateStrengths(background: UserBackground)` 函数，它能生成一段优势分析文本。
    2. 为所有需要AI生成的文本（劣势、总结、推荐理由等）创建类似的函数。
- **任务 BE-11: 组装完整的真实报告**
  - **目标**: 修改 `/api/analyze` 路由，将所有真实服务（Scoring, Supabase, Similarity, Gemma）的输出组装成最终的 `AnalysisReport`。
  - **验收标准**:
    1. 路由不再使用 `mockReport`。
    2. 它按顺序调用所有服务，并将结果填充到 `AnalysisReport` 对象中。
    3. 向该端点发送一个完整的 `UserBackground` 请求体，能返回一个结构正确且内容由真实逻辑生成的报告。
    4. **这是最后一步，也是最重要的一步。完成这一步，MVP就完成了。**