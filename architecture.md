## 留学定位产品架构设计 (Architecture Design)

### 1. 总体架构 (Overall Architecture)

这是一个经典的前后端分离架构。

```
+----------------+      +------------------------+      +---------------------+
|                |      |                        |      |                     |
|   React App    |----->|   Backend API Server   |----->|      Supabase       |
|  (Frontend)    |      | (e.g., Next.js / Node) |      | (Database & Auth)   |
|                |      |                        |      |                     |
+----------------+      +------------------------+      +----------+----------+
                                 |                                 |
                                 |                                 |
                                 v                                 v
                        +------------------+             +-------------------+
                        |                  |             |                   |
                        |   Gemma 3 LLM    |             |  processed_cases  |
                        | (AI Analysis)    |             |       (Table)     |
                        |                  |             |                   |
                        +------------------+             +-------------------+
```

- **前端 (Frontend)**: 一个纯粹的React SPA（单页应用）。负责UI展示和用户交互。它不包含任何业务逻辑或敏感密钥。
- **后端 (Backend API)**: 一个无状态的服务。它是前端和外部服务（数据库、LLM）之间的唯一中间人。所有业务逻辑、评分计算、数据查询都在这里。
- **数据库 (Database)**: Supabase。用于用户认证和存储核心的 `processed_cases` 数据。
- **大语言模型 (LLM)**: Gemma 3。用于所有需要自然语言处理和评估的“智能”部分。

### 2. 文件夹结构 (Folder Structure)

建议使用一个简单的 `frontend` 和 `backend` 分离的结构。

```
study-abroad-app/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── analysisAPI.ts      # 封装对后端 /api/analyze 的调用
│   │   ├── assets/                 # 图片、字体等静态资源
│   │   ├── components/             # 可复用的UI组件 (e.g., RadarChart, ExperienceForm)
│   │   │   ├── common/             # 基础组件 (Button, Card)
│   │   │   └── report/             # 报告页的组件 (CompetitivenessTab, SchoolsTab)
│   │   ├── contexts/
│   │   │   └── AppContext.ts       # React Context 用于全局状态管理
│   │   ├── data/
│   │   │   └── frontend_data.json  # 前端静态数据 (专业、学校列表)
│   │   ├── hooks/
│   │   │   └── useAnalysis.ts      # 调用API并管理分析结果状态的Hook
│   │   ├── pages/
│   │   │   ├── FormPage.tsx        # 用户信息填写页
│   │   │   ├── ProgressPage.tsx    # 进度展示页
│   │   │   └── ReportPage.tsx      # 分析报告页
│   │   ├── types/
│   │   │   └── index.ts            # 核心TypeScript接口 (与后端共享)
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── tsconfig.json
│
└── backend/
    ├── src/
    │   ├── api/
    │   │   └── routes/
    │   │       └── analysis.ts     # /api/analyze 路由和控制器
    │   ├── services/
    │   │   ├── supabaseService.ts  # 与Supabase交互的逻辑
    │   │   ├── gemmaService.ts     # 调用Gemma 3 LLM的逻辑
    │   │   └── scoringService.ts   # 所有评分和计算逻辑
    │   ├── utils/
    │   │   └── similarity.ts       # 相似度计算算法
    │   ├── types/
    │   │   └── index.ts            # 核心TypeScript接口 (与前端共享)
    │   └── server.ts               # 服务器入口
    ├── .env                        # 环境变量 (API密钥、数据库URL)
    ├── package.json
    └── tsconfig.json
```

### 3. 核心数据结构 (Core Data Structures)

这是整个项目的基石。把这个文件 (`types/index.ts`) 定义好，放在前后端都能引用的地方。

```
// types/index.ts

// 1. 用户提交的完整背景信息
export interface UserBackground {
  academic: {
    university: string;
    universityTier: string; // Tier 0-4, 由后端根据university填充
    major: string;
    majorCategory: string; // 专业大类, 由后端填充
    gpa: number;
    gpaScale: 4.0 | 5.0 | 100;
    graduationYear: number;
  };
  language?: {
    type: 'TOEFL' | 'IELTS';
    total: number;
    reading: number;
    listening: number;
    speaking: number;
    writing: number;
  };
  standardTests?: {
    gre?: {
      total: number;
      writing: number;
    };
    gmat?: {
      total: number;
    };
  };
  applicationIntent: {
    countries: string[];
    majors: string[];
    degree: 'Master' | 'PhD';
  };
  experience: {
    research: Array<{ title: string; role: string; description: string }>;
    internship: Array<{ company: string; position: string; description:string }>;
    competition: Array<{ name: string; award: string; role: string; description: string }>;
    others: Array<{ name: string; role: string; description: string }>;
  };
}

// 2. 后端返回的完整分析报告
export interface AnalysisReport {
  competitiveness: {
    radarChart: {
      academic: number;
      language: number;
      research: number;
      internship: number;
      university: number;
    };
    strengths: string; // AI生成的优势分析
    weaknesses: string; // AI生成的短板分析
    summary: string; // AI生成的综合评价
  };
  schoolRecommendations: Array<{
    university: string;
    major: string;
    reason: string; // AI生成的推荐理由
    supportingCases: Array<{
      caseId: string;
      similarity: number; // 0-1
    }>;
  }>;
  similarCases: Array<{
    caseId: string;
    similarity: number;
    admissionResult: {
      university: string;
      major: string;
    };
    background: {
      gpa: number;
      language: { type: string; score: number };
      universityTier: string;
    };
    comparison: string; // AI生成的对比分析
    takeaways: string; // AI生成的可借鉴经验
  }>;
  improvementPlan: {
    timeline: Array<{
      timeframe: string; // e.g., "3个月内"
      action: string;
      goal: string;
    }>;
    strategySummary: string; // AI生成的总体策略
  };
}
```

### 4. 数据流与状态管理 (Data Flow & State Management)

**流程:**

1. **`FormPage.tsx`**:
   - 用户填写表单。所有表单数据由 Ant Design 的 `Form` 组件管理。
   - 点击“提交”后，调用 `onFinish` 回调，获得一个不完整的 `UserBackground` 对象。
2. **`useAnalysis.ts` (自定义Hook)**:
   - `FormPage` 调用这个 hook 里的 `submitAnalysis(formData)` 函数。
   - 这个 hook 负责管理加载状态 (`isLoading`)、错误状态 (`error`) 和最终的分析结果 (`analysisReport`)。
   - 它会调用 `api/analysisAPI.ts` 中的函数。
3. **`api/analysisAPI.ts` (前端)**:
   - 使用 Axios 向后端 `POST /api/analyze` 发送 `UserBackground` 数据。
   - 返回一个 Promise，其中包含完整的 `AnalysisReport` 对象。
4. **`analysis.ts` (后端路由)**:
   - 接收到请求，验证数据。
   - **调用 `scoringService.ts`**：
     - 根据学校名称从 `university_tiers.json` 确定 `universityTier`。
     - 计算所有雷达图分数。
     - 对于科研/实习等文本描述，**调用 `gemmaService.ts`** 获取评分。
   - **调用 `supabaseService.ts`**：
     - 获取所有 `processed_cases`。
   - **调用 `utils/similarity.ts`**：
     - 将用户背景与所有案例进行比较，计算相似度，选出Top 10。
   - **并行调用 `gemmaService.ts`**：
     - 为报告的每个Tab页生成AI分析文本（优势、劣势、推荐理由、对比分析等）。这是一个耗时的操作，应该并行处理。
   - 将所有结果组装成一个巨大的 `AnalysisReport` JSON对象，返回给前端。
5. **`AppContext.ts` (React Context)**:
   - `useAnalysis` hook在获取到 `analysisReport` 后，会更新全局 Context。
   - 同时，触发页面跳转到 `/report`。
6. **`ReportPage.tsx`**:
   - 页面从 `AppContext` 中读取 `analysisReport` 数据。
   - 它包含多个Tab，每个Tab（如 `CompetitivenessTab`, `SchoolsTab`）都从 Context 中获取自己需要的数据进行渲染。
   - **数据是单向的**：所有Tab只读取数据，不修改数据。这让状态变得极其简单。

**状态存储位置:**

- **表单临时状态**: Ant Design Form 实例内部，组件级别。
- **全局应用状态**:
  - `isLoading` (boolean): 是否正在等待后端分析。
  - `error` (string | null): API调用是否出错。
  - `analysisReport` (AnalysisReport | null): 后端返回的完整报告。
  - 这些都应该放在一个顶层的 `AppContext` 中。对于这个规模的应用，你不需要 Redux 或 Zustand 这种更复杂的库，`useState` + `useContext` 就够了。

### 5. 关于进度显示

你提到了一个非常详细的进度条。这在用户体验上很好，但实现起来很复杂。

- **简单方案 (我推荐的)**:
  - 前端提交后，只显示一个通用的加载动画（Spin），提示“分析中，预计需要1-2分钟...”。后端完成所有计算后一次性返回结果。这是最简单、最可靠的实现。
- **复杂方案 (如果你非要这么做)**:
  - 后端需要把一个大的分析任务拆分成多个步骤。
  - 前端提交请求后，后端立即返回一个 `task_id`。
  - 前端页面轮询（Polling）一个 `GET /api/status/{task_id}` 接口，或者使用 WebSocket 建立长连接。
  - 后端在完成每个步骤后（例如，“查找相似案例完成”），更新该 `task_id` 的状态。
  - 前端根据返回的状态更新进度条。
  - **警告**: 这会显著增加系统复杂性。除非你确定这是产品的核心卖点，否则不要在第一版就这样做。

**结论**: 先把核心功能做对。UI上的花活儿永远是次要的。一个能给出准确报告的、加载慢一点的系统，远比一个进度条酷炫但结果是垃圾的系统有价值。