# 项目架构分析文档

## 整体架构

本项目采用前后端分离的架构，使用 Docker 容器化部署：

```
┌─────────────────────────────────────────────────────────┐
│                    Docker Network                        │
│                                                          │
│  ┌──────────────┐    ┌──────────────┐   ┌───────────┐  │
│  │   Frontend   │───▶│   Strapi     │──▶│PostgreSQL │  │
│  │   Next.js    │    │   Backend    │   │ Database  │  │
│  │   :3000      │    │   :1337      │   │  :5432    │  │
│  └──────────────┘    └──────────────┘   └───────────┘  │
│         │                    │                           │
└─────────┼────────────────────┼───────────────────────────┘
          │                    │
          ▼                    ▼
     用户浏览器          Strapi Admin Panel
```

## 技术选型理由

### 1. Strapi (Headless CMS)

**选择理由**:
- **快速开发**: 自动生成 CRUD API，无需手写
- **灵活的数据建模**: Content Type Builder 可视化定义数据结构
- **内置管理后台**: 开箱即用的管理界面
- **权限系统**: 完善的 RBAC 权限控制
- **插件生态**: 丰富的插件支持（上传、国际化等）
- **API 优先**: 原生支持 REST 和 GraphQL

**适用场景**:
- 电商、博客、CMS 等内容管理系统
- 需要快速搭建后台管理的项目
- 前后端分离架构

### 2. Next.js (React 框架)

**选择理由**:
- **服务端渲染**: 提升 SEO 和首屏加载速度
- **文件路由**: 基于文件系统的路由，简化开发
- **API Routes**: 可以在前端项目中编写 API
- **优化性能**: 自动代码分割、图片优化
- **TypeScript 支持**: 完善的类型支持

**适用场景**:
- 需要 SEO 的电商网站
- 高性能的 Web 应用
- 现代化的前端项目

### 3. PostgreSQL (关系型数据库)

**选择理由**:
- **ACID 事务**: 保证数据一致性（订单场景重要）
- **关系模型**: 适合电商的关联数据（商品-分类-订单）
- **性能优秀**: 支持复杂查询和索引
- **开源免费**: 无许可成本
- **Strapi 官方推荐**: 生产环境首选

### 4. Docker (容器化)

**选择理由**:
- **环境一致性**: 开发、测试、生产环境完全一致
- **快速部署**: 一键启动所有服务
- **隔离性**: 各服务独立运行，互不干扰
- **易于扩展**: 可以轻松添加新服务（Redis、Nginx 等）

## 数据模型设计

### ER 图

```
┌─────────────┐         ┌──────────────┐
│  Category   │◀────────│   Product    │
│             │ 1     * │              │
│ - id        │         │ - id         │
│ - name      │         │ - name       │
│ - parent_id │         │ - price      │
└─────────────┘         │ - stock      │
                        │ - category_id│
                        └──────────────┘
                               │
                               │ *
                               ▼
                        ┌──────────────┐
                        │  OrderItem   │
                        │              │
                        │ - product_id │
                        │ - quantity   │
                        │ - price      │
                        └──────────────┘
                               │
                               │ *
                               ▼
                        ┌──────────────┐
                        │    Order     │
                        │              │
                        │ - id         │
                        │ - customer   │
                        │ - total      │
                        │ - status     │
                        └──────────────┘
```

### 关系说明

1. **Category ↔ Product**: 一对多
   - 一个分类可以有多个商品
   - 一个商品属于一个分类

2. **Category ↔ Category**: 自关联（树形结构）
   - 支持多级分类
   - parent_id 指向父分类

3. **Product ↔ OrderItem**: 一对多
   - 一个商品可以在多个订单中
   - 订单项记录快照数据（价格、名称）

4. **Order ↔ OrderItem**: 一对多
   - 一个订单包含多个订单项
   - 订单项不能独立存在

## API 设计

### RESTful API 规范

```
GET    /api/products          # 获取商品列表
GET    /api/products/:id      # 获取单个商品
POST   /api/products          # 创建商品（需认证）
PUT    /api/products/:id      # 更新商品（需认证）
DELETE /api/products/:id      # 删除商品（需认证）
```

### 查询参数

Strapi 支持强大的查询参数：

```javascript
// 分页
GET /api/products?pagination[page]=1&pagination[pageSize]=10

// 排序
GET /api/products?sort=price:desc

// 筛选
GET /api/products?filters[category][id][$eq]=1

// 关联查询
GET /api/products?populate=*
GET /api/products?populate[category][fields][0]=name

// 搜索
GET /api/products?filters[name][$contains]=iPhone
```

## 前端架构

### 目录结构

```
frontend/
├── app/                    # Next.js 13+ App Router
│   ├── layout.tsx         # 根布局
│   ├── page.tsx           # 首页
│   ├── products/          # 商品相关页面
│   │   ├── page.tsx       # 商品列表
│   │   └── [slug]/        # 商品详情（动态路由）
│   ├── cart/              # 购物车
│   └── checkout/          # 结算页
├── components/            # 可复用组件
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── ProductCard.tsx
├── lib/                   # 工具库
│   ├── api.ts            # API 调用封装
│   └── utils.ts          # 工具函数
└── styles/               # 样式文件
```

### 状态管理

**当前方案**: React Hooks (useState, useContext)

**未来可选方案**:
- **Zustand**: 轻量级状态管理（推荐用于购物车）
- **React Query**: 服务端状态管理（API 数据缓存）
- **Redux Toolkit**: 复杂应用状态管理

### 数据流

```
用户操作 → React Component → API 调用 (lib/api.ts)
                                      ↓
                              Strapi REST API
                                      ↓
                              PostgreSQL Database
                                      ↓
                              返回 JSON 数据
                                      ↓
                              更新组件状态
                                      ↓
                              重新渲染 UI
```

## 后端架构

### Strapi 核心概念

1. **Content Types**: 数据模型定义
2. **Controllers**: 处理 HTTP 请求
3. **Services**: 业务逻辑层
4. **Routes**: 路由配置
5. **Policies**: 权限策略
6. **Middlewares**: 中间件

### 请求处理流程

```
HTTP Request
    ↓
Middlewares (CORS, Body Parser, etc.)
    ↓
Routes (路由匹配)
    ↓
Policies (权限检查)
    ↓
Controllers (请求处理)
    ↓
Services (业务逻辑)
    ↓
Database (数据操作)
    ↓
Response (JSON 响应)
```

### 自定义扩展点

1. **Lifecycle Hooks**: 数据生命周期钩子
   ```javascript
   // beforeCreate, afterCreate, beforeUpdate, etc.
   ```

2. **Custom Controllers**: 自定义控制器逻辑
   ```javascript
   // 自定义搜索、统计等功能
   ```

3. **Custom Routes**: 自定义路由
   ```javascript
   // 添加特殊的 API 端点
   ```

4. **Plugins**: 插件开发
   ```javascript
   // 开发自定义插件扩展功能
   ```

## 安全考虑

### 1. 认证与授权

- **JWT Token**: 用户认证
- **RBAC**: 基于角色的权限控制
- **API Token**: 服务间调用

### 2. 数据验证

- **Schema 验证**: Strapi 自动验证
- **自定义验证**: 在 Controller 中添加

### 3. 安全配置

- **CORS**: 限制跨域访问
- **Rate Limiting**: 防止 API 滥用
- **SQL Injection**: ORM 自动防护
- **XSS**: React 自动转义

### 4. 环境变量

- 敏感信息存储在 `.env` 文件
- 生产环境使用强密码
- 定期更新密钥

## 性能优化

### 前端优化

1. **代码分割**: Next.js 自动分割
2. **图片优化**: next/image 组件
3. **缓存策略**: SWR 或 React Query
4. **懒加载**: 动态 import

### 后端优化

1. **数据库索引**: 为常查询字段添加索引
2. **查询优化**: 使用 populate 减少请求
3. **缓存**: Redis 缓存热点数据
4. **CDN**: 静态资源使用 CDN

### Docker 优化

1. **多阶段构建**: 减小镜像体积
2. **缓存层**: 利用 Docker 缓存
3. **资源限制**: 限制容器资源使用

## 扩展性设计

### 水平扩展

```
                    ┌─────────────┐
                    │Load Balancer│
                    └──────┬──────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
    ┌─────────┐      ┌─────────┐     ┌─────────┐
    │Strapi 1 │      │Strapi 2 │     │Strapi 3 │
    └────┬────┘      └────┬────┘     └────┬────┘
         │                │                │
         └────────────────┼────────────────┘
                          ▼
                   ┌─────────────┐
                   │ PostgreSQL  │
                   │  (Master)   │
                   └─────────────┘
```

### 微服务拆分

未来可以拆分为：
- **商品服务**: 商品管理
- **订单服务**: 订单处理
- **用户服务**: 用户认证
- **支付服务**: 支付集成

## 总结

本架构设计具有以下优势：

1. **快速开发**: Strapi 提供开箱即用的功能
2. **易于维护**: 清晰的分层架构
3. **可扩展性**: 支持水平扩展和微服务拆分
4. **现代化**: 使用最新的技术栈
5. **容器化**: Docker 简化部署流程

适合中小型电商项目快速搭建和迭代开发。
