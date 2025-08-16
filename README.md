# 真言 (Zhenyan) - 留学申请分析系统

一个基于AI的留学申请背景分析和选校建议系统，帮助申请者评估自己的竞争力并获得个性化的申请建议。

## 项目结构

```
zhenyan/
├── frontend/          # React + TypeScript 前端应用
├── backend/           # Node.js + Express 后端服务
├── data/              # 静态数据文件
├── architecture.md    # 系统架构文档
└── task.md           # 开发任务计划
```

## 技术栈

### 前端
- React 19 + TypeScript
- Vite 构建工具
- Ant Design UI组件库
- Chart.js 图表库
- Axios HTTP客户端

### 后端
- Node.js + Express
- TypeScript
- CORS支持
- 环境变量配置

## 功能特性

- 🎯 **综合评估**: 基于多维度数据的竞争力分析
- 🏫 **选校建议**: 智能匹配适合的院校
- 📊 **相似案例**: 基于历史数据的案例对比
- 📈 **背景提升**: 个性化的提升建议和时间规划
- 🤖 **AI分析**: 集成Gemma 3模型进行智能分析

## 快速开始

### 前端开发
```bash
cd frontend
npm install
npm run dev
```

### 后端开发
```bash
cd backend
npm install
npm run dev
```

## 开发状态

当前项目处于MVP开发阶段，已完成：
- ✅ 项目基础架构搭建
- ✅ 前后端依赖配置
- ✅ 核心数据结构定义
- 🔄 后端API开发中
- 🔄 前端UI开发中

## 贡献指南

欢迎提交Issue和Pull Request来帮助改进项目。

## 许可证

MIT License
