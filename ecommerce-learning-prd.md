# 电商学习项目 - 产品需求文档 (PRD)

## 项目目标

使用 **Drupal** 和 **Strapi** 分别实现同一个电商项目，对比学习两个主流 CMS 框架的特点、开发模式和实践差异。

---

## 功能需求（两套系统实现相同功能）

### 1. Web 前台（面向用户）

#### 1.1 首页
- 轮播 Banner 展示促销活动
- 热门/推荐商品展示（4-6个）
- 商品分类导航
- 页脚信息

#### 1.2 商品列表页
- 按分类筛选商品
- 商品搜索（按名称/SKU）
- 排序（价格升序/降序、名称）
- 分页显示

#### 1.3 商品详情页
- 商品图集（主图+缩略图切换）
- 商品名称、描述、价格
- 库存状态显示
- 规格选择（颜色、尺寸）
- 加入购物车
- 相关商品推荐

#### 1.4 购物车页
- 商品列表展示
- 数量增减修改
- 删除商品
- 小计/总计计算
- 结算按钮

#### 1.5 结算页
- 收货信息表单（姓名、邮箱、电话、地址）
- 订单商品摘要
- 总金额确认
- 提交订单

#### 1.6 订单确认页
- 订单编号
- 订单详情摘要
- 感谢信息

---

### 2. 管理后台（Backoffice）

#### 2.1 仪表盘
- 订单总数、待处理数量
- 商品总数、库存预警
- 最近 5 条订单
- 简单统计图表（可选）

#### 2.2 商品管理
| 功能 | 说明 |
|------|------|
| 商品列表 | 表格展示，支持搜索筛选 |
| 新增商品 | 表单录入，图片上传 |
| 编辑商品 | 修改信息、库存、价格 |
| 删除商品 | 软删除/硬删除 |
| 批量操作 | 批量上架/下架/删除 |

#### 2.3 分类管理
| 功能 | 说明 |
|------|------|
| 分类列表 | 树形结构展示 |
| 新增/编辑 | 名称、描述、排序、父级分类 |
| 删除 | 检查关联后删除 |

#### 2.4 订单管理
| 功能 | 说明 |
|------|------|
| 订单列表 | 搜索、状态筛选、日期范围 |
| 订单详情 | 商品信息、客户信息、订单状态 |
| 状态流转 | 待处理 → 已发货 → 已完成 / 已取消 |
| 订单导出 | CSV 导出（可选） |

#### 2.5 内容管理
| 功能 | 说明 |
|------|------|
| Banner 管理 | 图片、标题、链接、排序 |
| 静态页面 | 关于我们、隐私政策等 |

#### 2.6 用户管理
| 功能 | 说明 |
|------|------|
| 管理员列表 | 查看、新增、编辑、删除 |
| 角色权限 | 角色 CRUD、权限分配 |

---

## 数据模型设计

### 核心实体

```
Product (商品)
├── id, name, slug, description
├── price, stock, sku
├── images (多图)
├── category (分类关联)
├── variants (规格: 颜色/尺寸)
└── status (发布状态)

Category (分类)
├── id, name, slug, description
├── parent (父分类)
└── products (商品关联)

Order (订单)
├── id, order_number
├── customer_info (姓名/邮箱/电话/地址)
├── items (订单商品明细)
├── total_amount
├── status (待处理/已发货/已完成/已取消)
└── created_at, updated_at

OrderItem (订单明细)
├── product_id, product_name
├── price, quantity
└── subtotal

Banner (轮播图)
├── id, title
├── image, link
└── sort_order
```

---

## 页面结构

### 前台页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | / | Banner + 热门商品 |
| 商品列表 | /products | 分类浏览、搜索、排序 |
| 商品详情 | /product/:slug | 商品详情 |
| 购物车 | /cart | 购物车管理 |
| 结算 | /checkout | 订单填写 |
| 订单成功 | /order/success | 下单成功确认 |
| 关于我们 | /about | 静态页 |

### 后台页面

| 页面 | 路由 | 说明 |
|------|------|------|
| 后台首页 | /admin | 仪表盘 |
| 商品列表 | /admin/products | 商品管理 |
| 分类管理 | /admin/categories | 分类 CRUD |
| 订单管理 | /admin/orders | 订单列表/详情 |
| Banner管理 | /admin/banners | 轮播图配置 |
| 用户管理 | /admin/users | 管理员用户 |
| 系统设置 | /admin/settings | 基础配置 |

---

## 功能对比矩阵

学习时重点关注以下对比点：

| 对比维度 | Drupal | Strapi |
|----------|--------|--------|
| **安装方式** | Composer + Drupal Console | npx create-strapi-app |
| **数据建模** | Content Type / Entity 系统 | Content Type Builder |
| **后台界面** | 内置管理界面 + 视图配置 | 自动生成的 Admin Panel |
| **前端渲染** | PHP Template / Twig | 需要单独前端框架 |
| **API 能力** | REST/JSON:API 模块 | 原生 REST + GraphQL |
| **权限系统** | Hook 权限 + 角色 | RBAC + Users-Permissions |
| **扩展方式** | Module / Hook / Theme | Plugin / Lifecycle Hooks |
| **主题开发** | Twig 模板 | N/A (无前端) |
| **学习曲线** | 较陡峭，概念多 | 较平缓，JavaScript 友好 |

---



## 项目 B：Strapi 实现方案

### 技术栈
- **Strapi v4** - Headless CMS
- **PostgreSQL** - 数据库
- **React/Vue/Next.js** - 前端（自选）
- **npm/yarn** - 依赖管理

### 核心插件
| 插件/功能 | 用途 |
|----------|------|
| Content Manager | 内容管理后台 |
| Content Type Builder | 数据结构定义 |
| Users & Permissions | 用户权限 |
| i18n | 国际化（可选）|
| Webhooks | 外部系统通知 |

### 开发重点
1. Content Type Builder 定义数据模型
2. Lifecycle Hooks 实现业务逻辑
3. 自定义 Admin Panel 组件
4. REST API 配置与权限设置
5. 前端框架独立开发调用 API

### 文件结构建议
```
strapi-project/
├── src/
│   ├── api/
│   │   ├── product/
│   │   ├── category/
│   │   ├── order/
│   │   └── banner/
│   ├── extensions/
│   │   └── users-permissions/
│   ├── middleware/
│   └── plugins/
├── config/
└── public/
    └── uploads/

frontend/
├── pages/
├── components/
├── services/
│   └── api.js
└── styles/
```

---

## 验收标准

| 功能 | 验收点 |
|------|--------|
| 商品管理 | 能在后台添加/编辑商品，前台正确展示 |
| 购物车 | 添加/修改/删除商品，计算正确 |
| 订单流程 | 提交订单成功，后台订单状态可流转 |
| 后台管理 | 商品/分类/订单基础 CRUD 可用 |
| 代码质量 | 代码可运行，有基础注释 |

---

*文档版本: v1.0*
*创建日期: 2026-01-08*
