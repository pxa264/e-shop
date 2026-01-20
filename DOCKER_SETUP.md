# Docker Compose 配置使用指南

本项目现在包含两套独立的 Docker Compose 配置：

## 📁 文件结构

```
strapi_project/
├── docker-compose.dev.yml          # 开发环境配置
├── docker-compose.prod.yml         # 生产环境配置
├── docker-compose.old.yml          # 原配置备份（待创建）
├── Makefile                        # 便捷命令
├── .env.dev.example                # 开发环境变量模板
├── .env.prod.example               # 生产环境变量模板
├── backend/
│   ├── Dockerfile                  # 开发环境 Dockerfile
│   ├── Dockerfile.prod             # 生产环境 Dockerfile
│   ├── .dockerignore               # Docker 忽略文件
│   └── src/api/health/             # 健康检查端点
│       ├── controllers/health.js
│       └── routes/health.js
└── frontend/
    ├── Dockerfile                  # 开发环境 Dockerfile
    ├── Dockerfile.prod             # 生产环境 Dockerfile
    ├── .dockerignore               # Docker 忽略文件
    └── app/api/health/route.ts     # 健康检查端点
```

## 🚀 快速开始

### 开发环境

```bash
# 启动开发环境
make dev-up

# 查看日志
make dev-logs

# 停止开发环境
make dev-down
```

访问：
- 前端：http://localhost:8089
- Strapi 管理后台：http://localhost:8089/admin
- 数据库：localhost:5438 (使用 Navicat 连接)

### 生产环境

```bash
# 构建生产镜像
make prod-build

# 启动生产环境
make prod-up

# 查看日志
make prod-logs

# 停止生产环境
make prod-down
```

## 📋 详细说明

### 开发环境特性

- ✅ 源代码热重载（修改代码立即生效）
- ✅ 所有服务端口暴露便于调试
- ✅ 使用 Navicat 连接数据库（localhost:5438）
- ✅ 快速失败，便于发现问题
- ✅ 无资源限制

**适用场景**：本地开发、调试、测试

### 生产环境特性

- ✅ 多阶段构建，镜像体积优化
- ✅ 健康检查和服务依赖管理
- ✅ 资源限制（保守配置）：
  - PostgreSQL: 0.5 CPU / 512MB
  - Strapi: 1 CPU / 1GB
  - Frontend: 0.75 CPU / 768MB
  - Nginx: 0.25 CPU / 128MB
- ✅ 安全加固（只读文件系统、非 root 用户）
- ✅ 自动重启策略
- ✅ 日志轮转配置

**适用场景**：生产部署、预发布环境

## 🔧 环境变量配置

### 开发环境

```bash
# 复制开发环境模板
cp .env.dev.example .env

# 编辑 .env 文件，使用简单的开发配置即可
```

### 生产环境

```bash
# 复制生产环境模板
cp .env.prod.example .env

# 编辑 .env 文件，替换所有 CHANGE_ME 为实际值
# 特别注意：
# - APP_KEYS: 使用强随机字符串
# - 数据库密码
# - AWS S3 凭证
# - 邮件服务器配置
```

## 📊 健康检查端点

两套配置都包含健康检查功能：

- **Strapi**: `http://localhost:1337/_health`
- **Frontend**: `http://localhost:3000/api/health`

生产环境会自动使用这些端点进行健康检查。

## 🔄 迁移步骤

如果您正在从旧配置迁移：

```bash
# 1. 备份数据库
make backup

# 2. 停止当前服务
docker-compose down

# 3. 备份旧配置
mv docker-compose.yml docker-compose.old.yml

# 4. 使用新配置启动开发环境
make dev-up
```

## 💡 常用命令

```bash
# 查看所有可用命令
make help

# 重启服务
make dev-restart    # 开发环境
make prod-restart   # 生产环境

# 备份数据库
make backup

# 清理所有容器和卷
make clean
```

## ⚠️ 注意事项

1. **数据隔离**：开发和生产使用不同的卷名称，数据不会互相影响
2. **端口冲突**：确保 8089、5438 端口未被占用
3. **环境变量**：生产环境的 .env 文件不要提交到版本控制
4. **首次构建**：生产镜像首次构建需要较长时间（5-10分钟）
5. **健康检查**：生产环境启动后需要等待健康检查通过（约1-2分钟）

## 🐛 故障排查

### 服务无法启动

```bash
# 查看详细日志
make dev-logs  # 或 make prod-logs

# 检查容器状态
docker ps -a

# 重新构建镜像
make prod-build
```

### 数据库连接失败

```bash
# 检查数据库容器是否运行
docker ps | grep postgres

# 查看数据库日志
docker logs ecommerce-postgres-dev
```

### 健康检查失败

```bash
# 手动测试健康检查端点
curl http://localhost:1337/_health
curl http://localhost:3000/api/health

# 查看服务日志
docker logs ecommerce-strapi-prod
docker logs ecommerce-frontend-prod
```

## 📚 更多信息

详细的实施计划和架构设计请参考：
`~/.claude/plans/async-percolating-octopus.md`
