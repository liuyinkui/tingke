# 听刻

> 把声音刻进脑子里

一款基于精听法的英语训练App。每天15分钟，盲听→听写→跟读，真正提升英语听力。

## 技术栈

- 前端：React Native (Expo) — iOS + Android
- 后端：Node.js + Express 5
- 数据库：PostgreSQL 16 + Redis 7
- AI：阿里云语音评测
- 部署：Docker + GitHub Actions → 阿里云 ECS

## 项目结构

```
tingke/
├── app/              # React Native 移动端 (Expo)
├── server/           # Node.js 后端 API
│   ├── src/
│   │   ├── routes/       # 路由
│   │   ├── controllers/  # 控制器
│   │   ├── models/       # 数据模型
│   │   ├── middleware/    # 中间件
│   │   └── db/           # 数据库迁移 & 种子
│   └── Dockerfile
├── scripts/          # 素材流水线脚本
├── docs/             # 文档
├── docker-compose.yml
├── Makefile
└── .github/workflows/  # CI/CD
```

## 本地开发

### 前置条件

- Docker Desktop（推荐）或 docker + docker compose
- Node.js 22+
- Expo CLI（前端开发）

### 一键启动后端环境

```bash
# 启动所有服务 (API + PostgreSQL + Redis)
make dev

# 初始化数据库
make migrate
make seed

# 查看日志
make logs

# 清理
make clean
```

后端运行在 http://localhost:3000

### 前端开发

```bash
cd app
npm start
```

### 其他常用命令

```bash
make lint           # ESLint 检查
make format         # 格式化代码
make shell          # 进入 API 容器终端
make db-reset       # 重置数据库
```

## 部署

CI/CD 通过 GitHub Actions 自动执行：

1. 代码 push 到 `main` 分支
2. 自动运行 lint + 数据库迁移测试
3. 构建并推送 Docker 镜像到阿里云容器镜像服务
4. SSH 部署到阿里云 ECS

### 所需 Secrets

| Secret | 说明 |
|--------|------|
| `ALIYUN_REGISTRY_USERNAME` | 容器镜像服务用户名 |
| `ALIYUN_REGISTRY_PASSWORD` | 容器镜像服务密码 |
| `ECS_HOST` | 服务器 IP |
| `ECS_USER` | SSH 用户名 |
| `ECS_SSH_KEY` | SSH 私钥 |

---

详见 GitHub Issues。
