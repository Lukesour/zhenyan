import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import analysisRoutes from './api/routes/analysis';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// API路由
app.use('/api', analysisRoutes);

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

