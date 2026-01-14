# 电商学习项目 - Strapi 实现

基于 Strapi v4 + Next.js + PostgreSQL 的全栈电商项目，使用 Docker 部署。

## 项目架构

```
strapi_project/
├── backend/              # Strapi 后端 (Headless CMS)
│   ├── src/api/         # API 端点和数据模型
│   ├── config/          # Strapi 配置
│   └── public/          # 静态资源和上传文件
├── frontend/            # Next.js 前端
│   ├── app/            # Next.js 13+ App Router
│   └── lib/            # API 工具库
├── docker-compose.yml  # Docker 编排配置
└── README.md
```

## 技术栈

**后端**: Strapi v4.25.0 + PostgreSQL 15 + Node.js 18  
**前端**: Next.js 14 + React 18 + TailwindCSS 3 + TypeScript  
**部署**: Docker & Docker Compose

## 快速开始

### 1. 配置环境变量

```bash
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local
```

**重要**: 编辑 `backend/.env`，修改安全密钥（使用 `openssl rand -base64 32` 生成）

### 2. 启动项目

```bash
docker-compose up -d
```

### 3. 访问应用

- **Strapi 管理后台**: http://localhost:1337/admin
- **前端网站**: http://localhost:3000
- **Strapi API**: http://localhost:1337/api

### 4. 初始化

1. 访问 http://localhost:1337/admin 创建管理员账户
2. 进入 Settings → Users & Permissions → Roles → Public
3. 为 Product、Category、Banner 开启 `find` 和 `findOne` 权限

## 常用命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose stop

# 重启服务
docker-compose restart

# 完全停止并删除容器
docker-compose down

# 停止并删除所有数据
docker-compose down -v
```

## 数据模型

- **Product**: 商品信息（名称、价格、库存、图片、分类）
- **Category**: 商品分类（支持树形结构）
- **Order**: 订单信息（客户信息、订单状态）
- **OrderItem**: 订单明细
- **Banner**: 首页轮播图

## 开发指南

### 后端开发

编辑 `backend/src/api/{content-type}/` 下的文件来自定义 API 逻辑。

### 前端开发

在 `frontend/app/` 下创建新页面，使用 `frontend/lib/api.ts` 调用 API。

## 项目状态

✅ Docker 容器化部署  
✅ Strapi 后端架构  
✅ 数据模型定义  
✅ Next.js 前端架构  
✅ 基础页面布局  

待实现: 商品详情、购物车功能、订单流程、搜索筛选等

## 参考文档

- [Strapi 文档](https://docs.strapi.io/)
- [Next.js 文档](https://nextjs.org/docs)
- [TailwindCSS 文档](https://tailwindcss.com/docs)
