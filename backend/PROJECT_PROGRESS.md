# Strapi E-commerce Admin Panel - 项目进度总览

**最后更新**: 2026-01-27
**项目状态**: 功能完成 (100%)

---

## 一、已完成功能 ✅

### Phase 1: Dashboard 美化
- KPI 卡片增强（趋势指标、Sparkline 迷你图、动画数字）
- 图表美化（订单趋势、状态分布、分类统计）
- 低库存预警表格
- 用户增长图表

### Phase 2: 商品批量操作
- 商品列表管理页面
- 批量发布/取消发布
- 批量修改分类/价格/库存
- 批量删除

### Phase 3: 订单管理增强
- 订单列表和高级筛选
- 订单详情弹窗
- 订单导出 CSV ✅ (原 Excel，已改为 CSV)

### Phase 4: 分类树管理
- 分类树视图（rc-tree）
- CRUD 操作
- 循环引用防护

### Phase 5: Banner 管理
- Banner 列表页面
- 启用/禁用切换
- 批量操作
- 批量操作权限预检查 ✅

### Phase 6: 客户管理
- 客户列表页面
- 客户详情
- 订单历史查看

### Phase 7: 多商家权限系统 ✅
- **Content Manager 权限同步** - 插件自动读取 Content Manager 权限设置
- Super Admin 可以看到所有数据
- 普通商家只能看到自己创建的内容（当 Content Manager 配置了 "is creator" 条件时）
- Category 共享分类（读取全部，只能修改自己创建的）

### Phase 8: 导入导出功能 ✅ (2026-01-26 完成)
- 商品 CSV 导入/导出
- 订单 CSV 导出
- 导入时自动设置 createdBy

### Phase 9: 权限简化 ✅ (2026-01-26 完成)
- 将 11 个权限简化为 6 个 Access 权限
- 插件权限只控制菜单可见性
- 实际数据操作由 Content Manager 权限控制

### Phase 10: 安全与性能优化 ✅ (2026-01-27 完成)
- **安全加固**:
  - 批量操作输入验证 (validateIds, validatePriceOperation, validateStockOperation)
  - 文件上传验证 (大小限制 5MB, MIME 类型检查)
  - 价格边界检查 (0 ~ 999999.99, 保留2位小数)
- **性能优化**:
  - N+1 查询修复 (customer.js getCustomers)
- **用户体验**:
  - 统一通知组件 (Notification)
  - 商品搜索功能 (按名称/SKU)
  - 所有页面错误提示标准化

### Phase 11: 代码优化 ✅ (2026-01-27 完成)
- **代码重构**:
  - 提取公共方法到 `role-helper.js`:
    - `getMerchantProductIds()` - 获取商户产品ID
    - `getMerchantOrderIds()` - 获取商户订单ID
    - `getMerchantOrdersAndCustomers()` - 获取商户订单和客户
  - `order.js`, `customer.js`, `dashboard.js` 使用公共方法，消除重复代码
- **注释规范化**:
  - 所有文件添加 JSDoc 文件头 (`@fileoverview`, `@description`, `@module`)
  - 所有中文注释翻译为英文
  - 函数添加完整 JSDoc 文档
- **错误处理统一**:
  - 变量命名统一: `err` → `error`
  - 错误响应格式统一: `ctx.throw(500, error.message || 'Fallback message')`
- **用户认证检查**:
  - `order.js`, `customer.js` 添加 `ctx.state.user` 验证

---

## 二、今日完成 (2026-01-27)

### 1. 代码重构 ✅
- 提取 `getMerchantProductIds`, `getMerchantOrderIds`, `getMerchantOrdersAndCustomers` 到 `role-helper.js`
- 更新 `order.js`, `customer.js`, `dashboard.js` 使用公共方法

### 2. 注释规范化 ✅
- 13个后端文件 + 1个前端组件添加 JSDoc 文件头
- 所有中文注释翻译为英文

### 3. 错误处理统一 ✅
- 统一变量命名 (`error`)
- 统一错误响应格式 (带 fallback message)

### 4. Bug 修复 ✅
- **Dashboard API 500 错误**: 控制器传 `userId` 但服务需要 `adminUser` 对象
- **修复**: 直接传递 `adminUser` 对象

### 5. API 测试验证 ✅
| API 端点 | 状态 | 结果 |
|---------|------|------|
| `/ops-dashboard/stats` | ✓ | KPI 数据正常 |
| `/ops-dashboard/products` | ✓ | 18 个产品 |
| `/ops-dashboard/orders` | ✓ | 订单正常 |
| `/ops-dashboard/categories/tree` | ✓ | 5 分类 |
| `/ops-dashboard/banners` | ✓ | 4 Banner |
| `/ops-dashboard/customers` | ✓ | 客户正常 |

---

## 三、历史修复 (2026-01-26 ~ 2026-01-27)

### UI 和功能修复
- 前端 UI 适配 CSV 格式 ✅
- 商品批量导入修复 ✅
- 订单导出格式修复 ✅
- 分页 UI 添加 ✅
- Add Product 按钮启用 ✅
- 分类导入功能修复 ✅
- Dashboard 权限过滤修复 ✅
- 分类树层级显示修复 ✅

### 核心修复
- Category createdBy 问题 ✅
- 订单/客户过滤逻辑 ✅ (两步查询)
- Banner 批量操作权限 ✅
- 导出格式改为 CSV ✅

---

## 四、权限架构

### 插件权限 (6个)
| UID | 作用 |
|-----|------|
| `plugin::ops-dashboard.read` | 访问 Dashboard |
| `plugin::ops-dashboard.products` | 访问商品管理 |
| `plugin::ops-dashboard.orders` | 访问订单管理 |
| `plugin::ops-dashboard.categories` | 访问分类管理 |
| `plugin::ops-dashboard.banners` | 访问 Banner 管理 |
| `plugin::ops-dashboard.customers` | 访问客户管理 |

### 权限控制流程
```
用户访问 ops-dashboard
    ↓
插件权限 → 控制菜单可见性 (Access Products, Access Orders, etc.)
    ↓
Content Manager 权限 → 控制数据操作 (CRUD, is-creator 过滤)
```

### 订单/客户过滤逻辑
```
Author 角色访问订单管理
    ↓
getMerchantProductIds() → 获取作者创建的商品 ID (基于 Content Manager is-creator)
    ↓
getMerchantOrderIds() →
    1. 查询 order-items: productId IN 商家产品ID
    2. 提取 order ID 列表
    ↓
过滤订单: id IN 商家相关订单ID
    ↓
过滤客户: 从这些订单中提取 user ID
```

---

## 五、数据可见性规则

| 模块 | Super Admin | 普通商家（配置 is-creator 后） |
|------|-------------|-----------------------------|
| Product | 看到所有 | 只看到自己创建的 |
| Banner | 看到所有 | 只看到自己创建的 |
| Order | 看到所有 | 只看到**包含自己产品**的订单 |
| Customer | 看到所有 | 只看到**购买过自己产品**的客户 |
| Category | 看到所有，可修改所有 | 看到所有，只能修改自己创建的 |
| Dashboard | 全局统计 | 自己相关的统计 |

---

## 六、关键文件清单

### 权限与工具
| 文件 | 描述 |
|------|------|
| `server/utils/permission-sync.js` | 权限同步核心 (读取 Content Manager 权限) |
| `server/utils/role-helper.js` | 导出权限函数 + 公共查询方法 |
| `server/utils/validators.js` | 输入验证工具 |
| `server/bootstrap.js` | 注册 6 个 Access 权限 |
| `admin/src/index.js` | 菜单权限配置 |

### 控制器
| 文件 | 关键功能 |
|------|---------|
| `server/controllers/order.js` | 订单管理，两步查询 |
| `server/controllers/customer.js` | 客户管理，两步查询 |
| `server/controllers/category.js` | 分类 CRUD，createdBy 设置 |
| `server/controllers/banner.js` | Banner 管理，权限预检查 |
| `server/controllers/product.js` | 商品管理，CSV 导入导出 |
| `server/controllers/dashboard.js` | Dashboard 统计 |

### 服务
| 文件 | 描述 |
|------|------|
| `server/services/dashboard.js` | Dashboard KPI 统计服务 |
| `server/services/product-bulk.js` | 商品批量操作服务 |
| `server/services/product-import.js` | CSV 解析、验证、导入、导出 |
| `server/services/category-tree.js` | 分类树操作服务 |

### 前端组件
| 文件 | 描述 |
|------|------|
| `admin/src/components/Notification/index.js` | 统一通知组件 |
| `admin/src/components/KPICard/index.js` | KPI 卡片组件 |

---

## 七、待完善项目 📋

### 优先级高
1. **测试验证** - 用 Author 角色完整测试所有权限场景
2. **错误国际化** - 错误消息支持多语言

### 优先级中
3. **性能优化** - 两步查询可能在大数据量时变慢，考虑缓存或索引
4. **导出字段选择** - 允许用户选择导出哪些字段
5. **批量导入增强** - 支持更新已有商品 (通过 SKU 匹配)

### 优先级低
6. **审计日志** - 记录重要操作的审计日志
7. **国际化** - 插件界面多语言支持
8. **数据备份** - 添加数据导出备份功能

---

## 八、技术注意事项

### Strapi v4 限制
1. **嵌套过滤不支持**: `orderItems.productId` 这种深度过滤不工作
   - 解决方案: 两步查询
2. **entityService.create 不设置 createdBy**: 需要用 `db.query().create()`
3. **权限查询格式**: `action: 'plugin::content-manager.explorer.read'`, `subject: 'api::product.product'`

### Docker 开发
```bash
# 启动开发环境
docker-compose -f docker-compose.dev.yml up -d

# 重启 Strapi (代码修改后)
docker-compose -f docker-compose.dev.yml restart strapi

# 查看日志
docker-compose -f docker-compose.dev.yml logs --tail 50 strapi
```

### 数据库查询
```sql
-- 查看权限配置
SELECT action, subject, conditions FROM admin_permissions
WHERE action LIKE '%content-manager%' AND subject LIKE '%product%';
```

---

## 九、API 路由总览

### Product Management
| Method | Path | Handler | 描述 |
|--------|------|---------|------|
| GET | /products | product.getProducts | 获取商品列表 |
| GET | /products/export | product.exportProducts | 导出商品 CSV |
| GET | /products/import/template | product.downloadTemplate | 下载 CSV 模板 |
| POST | /products/import/preview | product.previewImport | 预览导入数据 |
| POST | /products/import | product.importProducts | 导入商品 |
| POST | /products/bulk/* | product.bulk* | 批量操作 |

### Order Management
| Method | Path | Handler | 描述 |
|--------|------|---------|------|
| GET | /orders | order.getOrders | 获取订单列表 |
| GET | /orders/stats | order.getOrderStats | 订单统计 |
| POST | /orders/export | order.exportOrders | 导出订单 CSV |

### Customer Management
| Method | Path | Handler | 描述 |
|--------|------|---------|------|
| GET | /customers | customer.getCustomers | 获取客户列表 |
| GET | /customers/stats | customer.getCustomerStats | 客户统计 |
| GET | /customers/:id | customer.getCustomer | 客户详情 |
| GET | /customers/:id/orders | customer.getCustomerOrders | 客户订单 |

### Category Management
| Method | Path | Handler | 描述 |
|--------|------|---------|------|
| GET | /categories/tree | category.getCategoryTree | 获取分类树 |
| POST | /categories | category.createCategory | 创建分类 |
| PUT | /categories/:id | category.updateCategory | 更新分类 |
| DELETE | /categories/:id | category.deleteCategory | 删除分类 |
| POST | /categories/move | category.moveCategory | 移动分类 |
| POST | /categories/reorder | category.reorderCategories | 重排序分类 |

### Banner Management
| Method | Path | Handler | 描述 |
|--------|------|---------|------|
| GET | /banners | banner.getBanners | 获取 Banner 列表 |
| PUT | /banners/:id | banner.updateBanner | 更新 Banner |
| POST | /banners/reorder | banner.reorderBanners | 重排序 |
| POST | /banners/bulk-toggle | banner.bulkToggle | 批量启用/禁用 |
| POST | /banners/bulk-delete | banner.bulkDelete | 批量删除 |

### Dashboard
| Method | Path | Handler | 描述 |
|--------|------|---------|------|
| GET | /stats | dashboard.getStats | 获取 Dashboard 统计 |

---

## 十、版本历史

| 日期 | 版本 | 主要变更 |
|------|------|---------|
| 2026-01-27 | v1.1.0 | **Phase 11**: 代码优化 (重构、注释规范、错误处理统一) |
| 2026-01-27 | v1.0.0 | 分页UI、分类导入、Dashboard两步查询、分类树CSS |
| 2026-01-26 | v0.9.8 | 修复订单/客户过滤、CSV 导入导出、权限简化 |
| 2026-01-25 | v0.9.5 | Phase 7 权限同步完成 |
| 2026-01-24 | v0.9.0 | Phase 1-6 功能完成 |

---

**项目状态**: 所有核心功能已完成，代码已优化，API 测试通过。
