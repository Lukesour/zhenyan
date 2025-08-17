# Supabase 设置说明

## 1. 环境变量配置

在 `backend` 目录下创建 `.env` 文件，包含以下配置：

```bash
# Supabase Configuration
SUPABASE_URL=https://pyrtujfivpyfftgkqsbi.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB5cnR1amZpdnB5ZmZ0Z2txc2JpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUzMzAzNjksImV4cCI6MjA3MDkwNjM2OX0.HLPXm0EgIR_Ul5b1qxkKJ4yi-Xh39VsBAGgPC6-LA2M

# Server Configuration
PORT=3001
```

## 2. 获取 Supabase 凭据

1. 登录 [Supabase](https://supabase.com)
2. 选择或创建项目
3. 进入 Settings > API
4. 复制 Project URL 和 anon public key

## 3. 数据库状态

✅ **数据库已配置完成**
- Supabase 项目已激活
- `processed_cases` 表已存在
- 表中包含大量留学申请案例数据
- 数据库权限设置为只读模式（仅允许查询，不允许插入、删除、修改）

⚠️ **重要说明**
- 不需要创建表或插入数据
- 所有数据操作都是只读的
- 现有的 `processed_cases` 表包含完整的留学申请案例库

## 4. 测试连接

✅ **环境已配置完成，可以直接测试**

启动后端服务器后，可以通过以下方式测试：

1. 检查服务器启动日志，确认 Supabase 连接成功
2. 查看控制台输出，确认能成功查询到 `processed_cases` 表中的数据
3. 通过 API 端点测试：`GET /api/test-supabase`

## 5. 故障排除

✅ **主要配置已完成，如果遇到问题请检查：**

- 网络连接是否正常
- 防火墙设置是否阻止了连接
- 如果出现权限错误，请联系数据库管理员确认 anon key 的读取权限

## 6. 下一步

现在可以启动后端服务器测试 Supabase 连接：

```bash
cd backend
npm run dev
```

服务器启动后会自动测试 Supabase 连接，并在控制台显示连接状态。
