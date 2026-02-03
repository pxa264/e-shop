# Strapi v4 Operator/Editor 定制后台管理界面实施方案

## 📋 项目概述

**项目名称**：电商系统后台管理界面定制
**Strapi 版本**：v4.25.0
**目标**：为 Operator 和 Editor 角色创建独立的、简化的后台管理界面，保持 Super Admin 使用原生界面

---

## 🎯 需求总结

### 目标用户
- **Operator（操作员）**：处理订单、管理产品、客户服务
- **Editor（编辑/作者）**：内容创作、产品描述编辑

### 核心功能
1. ✅ **可视化仪表盘**
   - 订单统计（状态分布、时间趋势）
   - 产品数据（库存预警、销量排行、分类占比）
   - 用户数据（注册增长、活跃度）
   - 系统 KPI（总订单、总用户、总销售额）

2. ✅ **简化内容管理**
   - 隐藏技术字段（如 createdAt、updatedAt、publishedAt）
   - 友好的字段标签（中文显示）
   - 优化表单布局

3. ✅ **自定义导航**
   - 基于角色的菜单显示
   - 隐藏不必要的功能模块

### 技术约束
- ❌ 不修改原生 Strapi Admin
- ✅ 使用 Strapi v4 插件机制
- ✅ 兼容 Docker 部署环境
- ✅ 需要添加图表库依赖

---

## 🏗️ 技术架构设计

### 插件命名
**插件名称**：`ops-dashboard`（Operations Dashboard）
**插件路径**：`src/plugins/ops-dashboard/`

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                    Strapi Admin Panel                    │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Super Admin     │         │  Operator/Editor │     │
│  │                  │         │                  │     │
│  │  原生 Admin UI   │         │  ops-dashboard   │     │
│  │  - Content Mgr   │         │  - 仪表盘        │     │
│  │  - Settings      │         │  - 订单管理      │     │
│  │  - Plugins       │         │  - 产品管理      │     │
│  │  - 完整权限      │         │  - 简化界面      │     │
│  └──────────────────┘         └──────────────────┘     │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

### 插件目录结构

```
src/plugins/ops-dashboard/
├── admin/                          # 前端代码
│   └── src/
│       ├── index.jsx              # 插件注册入口
│       ├── pluginId.js            # 插件 ID 定义
│       │
│       ├── pages/                 # 页面组件
│       │   ├── App/               # 路由容器
│       │   │   └── index.jsx
│       │   ├── Dashboard/         # 仪表盘主页
│       │   │   └── index.jsx
│       │   ├── OrderManagement/   # 订单管理
│       │   │   └── index.jsx
│       │   └── ProductManagement/ # 产品管理
│       │       └── index.jsx
│       │
│       ├── components/            # UI 组件
│       │   ├── PluginIcon/        # 插件图标
│       │   ├── Charts/            # 图表组件
│       │   │   ├── OrderChart.jsx
│       │   │   ├── ProductChart.jsx
│       │   │   ├── UserChart.jsx
│       │   │   └── KPICard.jsx
│       │   └── SimplifiedForm/    # 简化表单
│       │       └── index.jsx
│       │
│       ├── api/                   # API 请求
│       │   └── dashboard.js
│       │
│       ├── utils/                 # 工具函数
│       │   └── permissions.js
│       │
│       └── translations/          # 国际化
│           ├── en.json
│           └── zh.json
│
├── server/                        # 后端代码
│   ├── controllers/               # 控制器
│   │   └── dashboard.js
│   ├── services/                  # 业务逻辑
│   │   ├── dashboard.js
│   │   ├── order-stats.js
│   │   ├── product-stats.js
│   │   └── user-stats.js
│   ├── routes/                    # 路由定义
│   │   └── index.js
│   ├── policies/                  # 权限策略
│   │   └── is-operator-or-editor.js
│   └── register.js                # 权限注册
│
├── strapi-admin.js                # Admin 入口
├── strapi-server.js               # Server 入口
└── package.json                   # 插件配置
```

---

## 📊 数据可视化方案

### 图表库选择

**推荐：Recharts**

**理由**：
- ✅ React 原生支持，无需额外配置
- ✅ 声明式 API，易于使用
- ✅ 与 Strapi Design System 样式兼容
- ✅ 体积适中（~400KB）
- ✅ 支持响应式设计
- ✅ 活跃维护，社区成熟

**安装命令**：
```bash
npm install recharts
```

**备选方案**：
- Chart.js + react-chartjs-2（更轻量，但配置复杂）
- ECharts（功能强大，但体积较大）

### 图表组件设计

#### 1. KPI 卡片组件
```jsx
<KPICard
  title="总订单数"
  value={1234}
  trend="+12%"
  icon={<ShoppingCart />}
  color="primary"
/>
```

#### 2. 订单趋势图
```jsx
<OrderChart
  data={orderStats}
  type="line"
  xAxis="date"
  yAxis="count"
/>
```

#### 3. 产品分类饼图
```jsx
<ProductChart
  data={categoryStats}
  type="pie"
  dataKey="count"
  nameKey="category"
/>
```

#### 4. 用户增长柱状图
```jsx
<UserChart
  data={userGrowth}
  type="bar"
  xAxis="month"
  yAxis="newUsers"
/>
```

---

## 🔐 RBAC 权限控制方案

### 角色权限矩阵

| 功能模块 | Super Admin | Operator | Editor |
|---------|-------------|----------|--------|
| 原生 Content Manager | ✅ | ❌ | ❌ |
| 原生 Settings | ✅ | ❌ | ❌ |
| ops-dashboard 仪表盘 | ✅ | ✅ | ✅ |
| 订单管理 | ✅ | ✅ | ❌ |
| 产品管理 | ✅ | ✅ | ✅ |
| 用户数据查看 | ✅ | ✅ | ❌ |

### 权限注册（server/register.js）

```javascript
module.exports = ({ strapi }) => {
  // 注册插件权限
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access Dashboard',
      uid: 'dashboard.read',
      pluginName: 'ops-dashboard',
    },
    {
      section: 'plugins',
      displayName: 'Manage Orders',
      uid: 'orders.manage',
      pluginName: 'ops-dashboard',
    },
    {
      section: 'plugins',
      displayName: 'Manage Products',
      uid: 'products.manage',
      pluginName: 'ops-dashboard',
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
};
```

### 前端菜单权限控制

```javascript
// admin/src/index.jsx
export default {
  register(app) {
    app.addMenuLink({
      to: '/plugins/ops-dashboard',
      icon: PluginIcon,
      intlLabel: {
        id: 'ops-dashboard.plugin.name',
        defaultMessage: '运营仪表盘',
      },
      permissions: [
        {
          action: 'plugin::ops-dashboard.dashboard.read',
          subject: null,
        },
      ],
    });
  }
};
```

### 后端策略文件

```javascript
// server/policies/is-operator-or-editor.js
module.exports = async (policyContext) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  const allowedRoles = ['operator', 'editor', 'admin'];
  const userRole = user.role?.type || user.role?.name?.toLowerCase();

  return allowedRoles.includes(userRole);
};
```

---

## 📅 分阶段实施计划

### 阶段 1：环境准备与基础搭建（预计 1-2 天）

#### 1.1 安装依赖
```bash
# 在项目根目录执行
npm install recharts
```

#### 1.2 创建插件基础结构
```bash
mkdir -p src/plugins/ops-dashboard/{admin/src,server}
mkdir -p src/plugins/ops-dashboard/admin/src/{pages,components,api,utils,translations}
mkdir -p src/plugins/ops-dashboard/server/{controllers,services,routes,policies}
```

#### 1.3 创建核心配置文件

**关键文件列表**：
- `src/plugins/ops-dashboard/package.json` - 插件元信息
- `src/plugins/ops-dashboard/strapi-admin.js` - Admin 入口
- `src/plugins/ops-dashboard/strapi-server.js` - Server 入口
- `src/plugins/ops-dashboard/admin/src/pluginId.js` - 插件 ID
- `src/plugins/ops-dashboard/admin/src/index.jsx` - 前端注册

#### 1.4 配置插件启用

在 `config/plugins.js` 中添加：
```javascript
'ops-dashboard': {
  enabled: true,
  resolve: './src/plugins/ops-dashboard'
}
```

#### 1.5 验证插件加载

```bash
# Docker 环境
docker exec ecommerce-strapi-dev npm run build
docker restart ecommerce-strapi-dev
```

**预期结果**：Admin 左侧菜单出现 "运营仪表盘" 菜单项

---

### 阶段 2：后端 API 开发（预计 2-3 天）

#### 2.1 创建数据统计服务

**文件**：`server/services/order-stats.js`
- 订单状态分布统计
- 订单时间趋势分析
- 订单金额统计

**文件**：`server/services/product-stats.js`
- 产品库存统计
- 产品销量排行
- 分类占比分析

**文件**：`server/services/user-stats.js`
- 用户注册增长
- 用户活跃度统计

#### 2.2 创建控制器

**文件**：`server/controllers/dashboard.js`
```javascript
module.exports = {
  async getStats(ctx) {
    // 返回综合统计数据
  },
  async getOrderStats(ctx) {
    // 返回订单统计
  },
  async getProductStats(ctx) {
    // 返回产品统计
  },
  async getUserStats(ctx) {
    // 返回用户统计
  }
};
```

#### 2.3 配置路由和权限

**文件**：`server/routes/index.js`
- 定义 API 路由
- 配置权限策略
- 设置认证范围

#### 2.4 测试 API 端点

```bash
# 测试统计 API
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:1337/ops-dashboard/dashboard/stats
```

---

### 阶段 3：前端仪表盘开发（预计 3-4 天）

#### 3.1 创建图表组件

**文件**：`admin/src/components/Charts/KPICard.jsx`
- 使用 Strapi Design System 的 Box、Typography 组件
- 显示数值、趋势、图标

**文件**：`admin/src/components/Charts/OrderChart.jsx`
- 使用 Recharts 的 LineChart
- 显示订单时间趋势

**文件**：`admin/src/components/Charts/ProductChart.jsx`
- 使用 Recharts 的 PieChart
- 显示产品分类占比

**文件**：`admin/src/components/Charts/UserChart.jsx`
- 使用 Recharts 的 BarChart
- 显示用户增长趋势

#### 3.2 创建仪表盘页面

**文件**：`admin/src/pages/Dashboard/index.jsx`
```jsx
- 使用 Grid 布局
- 顶部显示 4 个 KPI 卡片
- 中间显示订单趋势图和产品分类图
- 底部显示用户增长图
- 使用 useFetchClient Hook 获取数据
- 实现加载状态和错误处理
```

#### 3.3 创建 API 请求服务

**文件**：`admin/src/api/dashboard.js`
```javascript
import { fetchClient } from '@strapi/helper-plugin';

export const dashboardApi = {
  getStats: () => fetchClient.get('/ops-dashboard/dashboard/stats'),
  getOrderStats: () => fetchClient.get('/ops-dashboard/orders/stats'),
  // ...
};
```

---

### 阶段 4：简化内容管理界面（预计 2-3 天）

#### 4.1 创建订单管理页面

**文件**：`admin/src/pages/OrderManagement/index.jsx`
- 使用 Strapi Design System 的 Table 组件
- 显示订单列表（简化字段）
- 实现筛选和搜索功能
- 订单状态更新操作

#### 4.2 创建产品管理页面

**文件**：`admin/src/pages/ProductManagement/index.jsx`
- 简化的产品列表视图
- 隐藏技术字段（createdAt、updatedAt 等）
- 中文字段标签
- 快速编辑功能

#### 4.3 创建简化表单组件

**文件**：`admin/src/components/SimplifiedForm/index.jsx`
- 封装常用表单字段
- 自动处理验证
- 友好的错误提示

---

### 阶段 5：权限配置与测试（预计 1-2 天）

#### 5.1 配置角色权限

在 `src/index.js` 的 Bootstrap 函数中添加：
```javascript
// 为 Operator 和 Editor 角色分配插件权限
const operatorPermissions = [
  'plugin::ops-dashboard.dashboard.read',
  'plugin::ops-dashboard.orders.manage',
  'plugin::ops-dashboard.products.manage'
];

const editorPermissions = [
  'plugin::ops-dashboard.dashboard.read',
  'plugin::ops-dashboard.products.manage'
];
```

#### 5.2 测试权限隔离

- 使用 Super Admin 账号：应能看到原生 Admin 和 ops-dashboard
- 使用 Operator 账号：只能看到 ops-dashboard
- 使用 Editor 账号：只能看到 ops-dashboard（部分功能）

#### 5.3 国际化配置

**文件**：`admin/src/translations/zh.json`
```json
{
  "plugin.name": "运营仪表盘",
  "dashboard.title": "数据概览",
  "orders.title": "订单管理",
  "products.title": "产品管理"
}
```

---

## 🚀 开发和部署流程

### 本地开发环境

#### 1. 启动开发模式
```bash
# Docker 环境
docker-compose up -d

# 进入容器
docker exec -it ecommerce-strapi-dev /bin/sh

# 开发模式（带 watch-admin）
npm run develop -- --watch-admin
```

#### 2. 实时重新构建
```bash
# 每次修改前端代码后
docker exec ecommerce-strapi-dev npm run build
docker restart ecommerce-strapi-dev
```

### Docker 构建和部署

#### 1. 构建流程
```bash
# 安装依赖（如果 package.json 有变动）
docker exec ecommerce-strapi-dev npm install

# 重新构建 admin 面板
docker exec ecommerce-strapi-dev npm run build

# 重启服务
docker restart ecommerce-strapi-dev
```

#### 2. 验证部署
```bash
# 检查容器状态
docker ps | grep strapi

# 查看日志
docker logs -f ecommerce-strapi-dev

# 验证插件加载
# 访问 http://localhost:1337/admin
# 检查左侧菜单是否出现 "运营仪表盘"
```

### 测试和验证

#### 1. 功能测试清单
- [ ] Super Admin 可以看到原生 Admin 所有功能
- [ ] Operator 只能看到 ops-dashboard 菜单
- [ ] Editor 只能看到 ops-dashboard 菜单（部分功能）
- [ ] 仪表盘数据正确显示
- [ ] 图表正常渲染
- [ ] 订单管理功能正常
- [ ] 产品管理功能正常
- [ ] 权限控制生效

#### 2. 性能测试
- 统计数据查询响应时间 < 2秒
- 图表渲染流畅
- 大数据量下分页正常

---

## ⚠️ 风险和注意事项

### 版本兼容性

#### Strapi v4 vs v5 差异
- ✅ 本项目使用 Strapi v4.25.0
- ❌ 不能使用 v5 的 API 和特性
- ⚠️ 插件示例需确认是 v4 版本

#### 关键依赖版本要求
```json
{
  "@strapi/strapi": "4.25.0",
  "@strapi/design-system": "^1.19.0",
  "@strapi/helper-plugin": "^4.25.0",
  "react": "^18.0.0",
  "react-router-dom": "^5.3.4",
  "recharts": "^2.x"
}
```

### 开发注意事项

#### 1. import 和 require 混用问题
- **问题**：前端文件中不能混用 ES6 import 和 CommonJS require
- **解决**：统一使用 import，require 只用于 CommonJS 模块
- **示例**：参考 custom-api 插件的修复经验

#### 2. 路径问题
- **前端路径**：使用相对路径 `../../utils/xxx`
- **API 路径**：使用 `/ops-dashboard/xxx`（前端自动添加 `/admin` 前缀）
- **避免**：硬编码绝对路径

#### 3. 权限配置时机
- 必须在 `src/index.js` 的 `bootstrap` 函数中配置
- 必须在 `server/register.js` 中注册权限动作
- 前端菜单和后端路由都需要配置权限

### 性能优化

#### 1. 数据查询优化
```javascript
// 使用分页
const orders = await strapi.entityService.findMany('api::order.order', {
  start: 0,
  limit: 100,
  populate: ['items']  // 只populate 需要的关联
});

// 使用缓存（可选）
const cacheKey = `stats:orders:${date}`;
let stats = await strapi.cache.get(cacheKey);
if (!stats) {
  stats = await calculateOrderStats();
  await strapi.cache.set(cacheKey, stats, 3600); // 1小时缓存
}
```

#### 2. 前端性能
- 使用 React.memo 避免不必要的重渲染
- 图表数据采样（大数据集）
- 使用虚拟列表（大量列表项）

### 安全考虑

#### 1. 权限验证
- **前端权限**：仅用于 UI 显示/隐藏，不能依赖
- **后端权限**：必须在每个 API 路由上验证
- **双重验证**：前端 + 后端都需要检查

#### 2. 数据过滤
```javascript
// 确保用户只能看到自己权限范围内的数据
const userRole = ctx.state.user.role.type;
if (userRole === 'operator') {
  // 只返回特定状态的订单
  filters = { ...filters, status: { $in: ['pending', 'processing'] } };
}
```

### 常见问题和解决方案

#### 问题 1：插件菜单不显示
**原因**：
- 权限配置错误
- 插件未正确注册
- 构建缓存问题

**解决**：
```bash
# 清除缓存并重新构建
rm -rf build/.cache
docker exec ecommerce-strapi-dev npm run build
docker restart ecommerce-strapi-dev
```

#### 问题 2：页面一直 loading
**原因**：
- 前端路由配置错误
- Component 返回 undefined
- import/export 不匹配

**解决**：
- 检查 `admin/src/index.jsx` 中的 Component 配置
- 确保页面组件有 default export
- 使用浏览器开发者工具查看 Console 错误

#### 问题 3：API 返回 403
**原因**：
- 权限未正确配置
- 用户角色不匹配
- Token 过期

**解决**：
- 检查 `server/routes/index.js` 中的 policies 配置
- 检查 `src/index.js` 中的权限分配
- 检查用户的角色类型

---

## 📝 总结

### 技术可行性评估

✅ **完全可行**

- Strapi v4 提供完整的插件开发 API
- 已有 custom-api 插件作为成功参考
- 项目架构支持插件扩展
- Docker 环境配置完善

### 核心优势

1. **非侵入性**：不修改原生 Admin，Super Admin 体验不受影响
2. **可维护性**：插件化架构，易于更新和扩展
3. **灵活性**：基于 RBAC 的权限控制，可精细配置
4. **可扩展性**：后续可轻松添加新功能和图表

### 预期成果

**对于 Operator/Editor**：
- 简洁、专注的工作界面
- 一目了然的数据概览
- 简化的操作流程
- 友好的中文界面

**对于 Super Admin**：
- 保持原生 Strapi Admin 的完整功能
- 可选择使用 ops-dashboard 查看统计
- 完全控制权限分配

### 估算工作量

**总计**：约 10-14 个工作日

- 阶段 1：环境准备（1-2天）
- 阶段 2：后端 API（2-3天）
- 阶段 3：前端仪表盘（3-4天）
- 阶段 4：内容管理（2-3天）
- 阶段 5：权限测试（1-2天）

---

## 📂 关键文件清单

### 需要创建的文件（按优先级）

#### 🔴 高优先级（核心功能）

1. `src/plugins/ops-dashboard/package.json`
2. `src/plugins/ops-dashboard/strapi-admin.js`
3. `src/plugins/ops-dashboard/strapi-server.js`
4. `src/plugins/ops-dashboard/admin/src/pluginId.js`
5. `src/plugins/ops-dashboard/admin/src/index.jsx`
6. `src/plugins/ops-dashboard/server/register.js`
7. `src/plugins/ops-dashboard/server/routes/index.js`
8. `src/plugins/ops-dashboard/server/policies/is-operator-or-editor.js`
9. `src/plugins/ops-dashboard/server/controllers/dashboard.js`
10. `src/plugins/ops-dashboard/server/services/dashboard.js`

#### 🟡 中优先级（UI 组件）

11. `src/plugins/ops-dashboard/admin/src/pages/App/index.jsx`
12. `src/plugins/ops-dashboard/admin/src/pages/Dashboard/index.jsx`
13. `src/plugins/ops-dashboard/admin/src/components/Charts/KPICard.jsx`
14. `src/plugins/ops-dashboard/admin/src/components/Charts/OrderChart.jsx`
15. `src/plugins/ops-dashboard/admin/src/components/Charts/ProductChart.jsx`
16. `src/plugins/ops-dashboard/admin/src/components/Charts/UserChart.jsx`
17. `src/plugins/ops-dashboard/admin/src/api/dashboard.js`

#### 🟢 低优先级（优化和扩展）

18. `src/plugins/ops-dashboard/admin/src/pages/OrderManagement/index.jsx`
19. `src/plugins/ops-dashboard/admin/src/pages/ProductManagement/index.jsx`
20. `src/plugins/ops-dashboard/admin/src/components/SimplifiedForm/index.jsx`
21. `src/plugins/ops-dashboard/admin/src/translations/zh.json`
22. `src/plugins/ops-dashboard/admin/src/translations/en.json`

### 需要修改的文件

1. `config/plugins.js` - 添加 ops-dashboard 配置
2. `src/index.js` - 配置 Operator/Editor 角色权限（Bootstrap）
3. `package.json` - 添加 recharts 依赖

---

## 🎯 下一步行动

### 立即开始

如果你确认这个方案，我们可以按照以下顺序开始实施：

1. **安装 Recharts 依赖**
   ```bash
   npm install recharts
   ```

2. **创建插件基础结构**
   ```bash
   mkdir -p src/plugins/ops-dashboard/{admin/src,server}
   ```

3. **创建最小可用版本（MVP）**
   - 基础插件配置
   - 简单的仪表盘页面
   - 一个 KPI 卡片
   - 验证插件加载和权限

4. **逐步迭代**
   - 添加更多图表
   - 完善统计 API
   - 优化 UI 体验
   - 扩展功能模块

---

## 📖 参考资源

### Strapi v4 官方文档
- [Plugin Development](https://docs.strapi.io/dev-docs/plugins-development)
- [Admin Panel API](https://docs.strapi.io/dev-docs/admin-panel-customization)
- [RBAC](https://docs.strapi.io/dev-docs/backend-customization/routes#policies)

### 项目内参考
- `src/plugins/custom-api/` - 完整的插件示例
- `src/extensions/users-permissions/` - 扩展示例
- `src/admin/app.js` - Admin 自定义配置

### 技术栈文档
- [Strapi Design System](https://design-system.strapi.io/)
- [Recharts](https://recharts.org/)
- [React](https://react.dev/)

---

**方案完成时间**：2026-01-20
**项目版本**：Strapi v4.25.0
**方案状态**：✅ 已完成，等待实施

