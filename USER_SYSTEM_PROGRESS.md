# 用户系统和订单管理 - 实施进度报告

**日期**: 2026-01-09
**项目**: Strapi 电商平台 - 用户系统和订单管理功能

---

## 项目概述

本次实施为 Strapi 电商平台添加完整的用户系统和订单管理功能，包括：

- 用户认证系统（注册、登录、JWT 管理）
- 个人中心（资料、地址、收藏夹）
- 用户订单查询和操作
- 前端路由保护
- Header 用户状态显示

---

## 当前进度总览

**总体完成度**: 后端 95%，前端 0%

---

## Part 1: 后端扩展（Strapi）

### ✅ 1.1 数据模型设计（已完成）

#### 新增 Content Types

**User Address（用户地址）** - ✅ 完成
- 文件：`backend/src/api/user-address/` 完整套件
- 字段：
  - receiverName: 收货人姓名
  - receiverPhone: 收货人电话
  - province: 省
  - city: 市
  - district: 区
  - detailAddress: 详细地址
  - postalCode: 邮政编码
  - isDefault: 是否默认地址
- 关联：user (manyToOne to plugin::users-permissions.user)

**Wishlist（收藏夹）** - ✅ 完成
- 文件：`backend/src/api/wishlist/` 完整套件
- 关联：
  - user (manyToOne to plugin::users-permissions.user)
  - product (manyToOne to api::product.product)

**Order 模型修改** - ✅ 完成
- 文件：`backend/src/api/order/content-types/order/schema.json`
- 添加：user (manyToOne relation)
- ⚠️ 注意：移除了 inversedBy，因为 User 是内置模型

### ✅ 1.2 自定义 Controller（已完成）

**User Controller 扩展** - ✅ 完成
- 文件：`backend/src/extensions/users-permissions/controllers/user.js`
- 方法：
  - `me(ctx)` - 获取当前用户详细信息
  - `updateProfile(ctx)` - 更新用户资料
  - `changePassword(ctx)` - 修改密码
  - `getMyOrders(ctx)` - 获取用户订单列表
  - `getMyStatistics(ctx)` - 获取用户统计信息

**User Address Controller** - ✅ 完成
- 文件：`backend/src/api/user-address/controllers/user-address.js`
- 方法：
  - `find(ctx)` - 获取用户地址列表
  - `findOne(ctx)` - 查找单个地址
  - `create(ctx)` - 创建地址（处理默认地址逻辑）
  - `update(ctx)` - 更新地址（处理默认地址逻辑）
  - `delete(ctx)` - 删除地址
  - `setDefault(ctx)` - 设置默认地址

**Wishlist Controller** - ✅ 完成
- 文件：`backend/src/api/wishlist/controllers/wishlist.js`
- 方法：
  - `find(ctx)` - 获取收藏列表
  - `create(ctx)` - 添加收藏（检查重复）
  - `delete(ctx)` - 移除收藏
  - `toggle(ctx)` - 切换收藏状态
  - `check(ctx)` - 检查收藏状态

**Order Controller 扩展** - ✅ 完成
- 文件：`backend/src/api/order/controllers/order.js`
- 添加方法：
  - `cancelOrder(ctx)` - 用户取消订单
  - `getMyOrderDetail(ctx)` - 获取用户订单详情

### ✅ 1.3 自定义 Routes（已完成）

**User Routes** - ✅ 完成
- 文件：`backend/src/extensions/users-permissions/routes/user.js`
- 路由：
  - GET /users/me - 获取当前用户
  - PUT /users/me - 更新资料
  - POST /users/me/change-password - 修改密码
  - GET /users/me/orders - 获取用户订单
  - GET /users/me/statistics - 获取用户统计

**User Address Routes** - ✅ 完成
- 文件：`backend/src/api/user-address/routes/user-address.js`
- 路由：
  - GET /user-addresses - 获取地址列表
  - GET /user-addresses/:id - 获取单个地址
  - POST /user-addresses - 创建地址
  - PUT /user-addresses/:id - 更新地址
  - DELETE /user-addresses/:id - 删除地址
  - POST /user-addresses/:id/set-default - 设置默认地址

**Wishlist Routes** - ✅ 完成
- 文件：`backend/src/api/wishlist/routes/wishlist.js`
- 路由：
  - GET /wishlists - 获取收藏列表
  - GET /wishlists/:id - 获取单个收藏
  - POST /wishlists - 添加收藏
  - DELETE /wishlists/:id - 移除收藏
  - POST /wishlists/toggle - 切换收藏状态
  - GET /wishlists/check/:productId - 检查收藏状态

**Order Routes（扩展）** - ✅ 完成
- 文件：`backend/src/api/order/routes/order.js`
- 添加：
  - POST /orders/:orderNumber/cancel - 取消订单
  - GET /orders/:orderNumber/detail - 订单详情

### ✅ 1.4 权限策略（已完成）

**Policy** - ✅ 创建完成
- 文件：`backend/src/policies/is-authenticated.js`
- 功能：检查 JWT token 是否有效

**⚠️ 待配置** - 权限配置
- 在 Strapi Admin → Settings → Users & Permissions → Roles → Authenticated
- 需要配置权限：
  - User Address: find, create, update, delete, setDefault
  - Wishlist: find, create, delete, toggle, check
  - Order: find, findOne (仅自己的订单)

---

## Part 2: 前端用户认证系统（未开始）

### ❌ 2.1 认证上下文

**AuthContext** - ❌ 未创建
- 文件：`frontend/contexts/AuthContext.tsx`
- 待实现功能：
  - 全局用户状态管理
  - JWT Token 存储（localStorage）
  - 登录、注册、登出方法
  - 自动检查 token 并获取用户信息

### ❌ 2.2 路由保护

**ProtectedRoute 组件** - ❌ 未创建
- 文件：`frontend/components/ProtectedRoute.tsx`
- 待实现功能：
  - 包装需要登录的页面
  - 未登录自动跳转到登录页
  - 加载状态显示

### ❌ 2.3 根布局更新

**修改文件**：`frontend/app/layout.tsx` - ❌ 未修改
- 待添加：`AuthProvider` 包裹所有子组件

### ❌ 2.4 API 工具扩展

**修改文件**：`frontend/lib/api.ts` - ❌ 未扩展
- 待添加认证 API：login, register, getCurrentUser, updateProfile, changePassword
- 待添加地址管理 API：getAddresses, createAddress, updateAddress, deleteAddress, setDefaultAddress
- 待添加收藏夹 API：getWishlists, addToWishlist, removeFromWishlist, toggleWishlist
- 待添加用户订单 API：getMyOrders, cancelOrder, getMyOrderDetail

---

## Part 3: 认证页面（未开始）

### ❌ 3.1 登录页面
- 文件：`frontend/app/login/page.tsx` - ❌ 未创建

### ❌ 3.2 注册页面
- 文件：`frontend/app/register/page.tsx` - ❌ 未创建

### ❌ 3.3 忘记密码页面
- 文件：`frontend/app/forgot-password/page.tsx` - ❌ 未创建

---

## Part 4: 个人中心系统（未开始）

### ❌ 4.1 个人中心布局
- 文件：`frontend/app/account/layout.tsx` - ❌ 未创建

### ❌ 4.2 个人中心首页
- 文件：`frontend/app/account/page.tsx` - ❌ 未创建

### ❌ 4.3 个人资料页面
- 文件：`frontend/app/account/profile/page.tsx` - ❌ 未创建

### ❌ 4.4 地址管理页面
- 文件：`frontend/app/account/addresses/page.tsx` - ❌ 未创建

### ❌ 4.5 收藏夹页面
- 文件：`frontend/app/account/favorites/page.tsx` - ❌ 未创建

---

## Part 5: 订单管理系统（未开始）

### ❌ 5.1 订单列表页面
- 文件：`frontend/app/account/orders/page.tsx` - ❌ 未创建

### ❌ 5.2 订单详情页面
- 文件：`frontend/app/account/orders/[orderNumber]/page.tsx` - ❌ 未创建

### ❌ 5.3 Header 组件升级

**修改文件**：`frontend/components/Header.tsx` - ❌ 未修改
- 待添加：
  - 登录/注册按钮（未登录状态）
  - 用户下拉菜单（已登录状态）
  - 个人中心、我的订单、退出登录入口

---

## 已创建文件清单

### 后端文件（共 15 个）

**User Address（5 个）**
1. ✅ `backend/src/api/user-address/content-types/user-address/schema.json`
2. ✅ `backend/src/api/user-address/controllers/user-address.js`
3. ✅ `backend/src/api/user-address/services/user-address.js`
4. ✅ `backend/src/api/user-address/routes/user-address.js`

**Wishlist（4 个）**
5. ✅ `backend/src/api/wishlist/content-types/wishlist/schema.json`
6. ✅ `backend/src/api/wishlist/controllers/wishlist.js`
7. ✅ `backend/src/api/wishlist/services/wishlist.js`
8. ✅ `backend/src/api/wishlist/routes/wishlist.js`

**Policy（1 个）**
9. ✅ `backend/src/policies/is-authenticated.js`

**User 扩展（2 个）**
10. ✅ `backend/src/extensions/users-permissions/controllers/user.js`
11. ✅ `backend/src/extensions/users-permissions/routes/user.js`

**Order 扩展（2 个，修改现有文件）**
12. ✅ `backend/src/api/order/content-types/order/schema.json` - 添加 user 关联
13. ✅ `backend/src/api/order/controllers/order.js` - 添加用户端方法
14. ✅ `backend/src/api/order/routes/order.js` - 添加用户端路由

---

## 待创建文件清单

### 前端文件（共 13 个）

**认证系统（3 个）**
1. ❌ `frontend/contexts/AuthContext.tsx`
2. ❌ `frontend/components/ProtectedRoute.tsx`
3. ❌ `frontend/app/login/page.tsx`
4. ❌ `frontend/app/register/page.tsx`
5. ❌ `frontend/app/forgot-password/page.tsx`

**个人中心（6 个）**
6. ❌ `frontend/app/account/layout.tsx`
7. ❌ `frontend/app/account/page.tsx`
8. ❌ `frontend/app/account/profile/page.tsx`
9. ❌ `frontend/app/account/addresses/page.tsx`
10. ❌ `frontend/app/account/favorites/page.tsx`

**订单管理（2 个）**
11. ❌ `frontend/app/account/orders/page.tsx`
12. ❌ `frontend/app/account/orders/[orderNumber]/page.tsx`

---

## 待修改文件清单（前端）

1. ❌ `frontend/app/layout.tsx` - 添加 AuthProvider
2. ❌ `frontend/components/Header.tsx` - 添加用户菜单
3. ❌ `frontend/lib/api.ts` - 扩展 API 函数

---

## 当前问题与解决

### 🐛 问题 1: Schema 关联配置错误

**问题描述**:
在 Order、User Address、Wishlist 的 schema.json 中设置了 `inversedBy` 属性，但目标模型中没有对应的反向关联字段。

**错误信息**:
```
Error: inversedBy attribute orders not found target plugin::users-permissions.user
```

**解决方案**:
- ✅ 移除了 Order schema 中的 `inversedBy: "orders"`
- ✅ 移除了 User Address schema 中的 `inversedBy: "addresses"`
- ✅ 移除了 Wishlist schema 中的 `inversedBy: "wishlists"`

**原因**:
- User 模型是 Strapi 内置的，不能通过 schema.json 直接添加反向关联
- Product 模型中也没有定义 wishlists 反向关联

### 🐛 问题 2: Policy 未注册

**问题描述**:
在 routes 中引用了 `is-authenticated` policy，但 Strapi 无法找到该 policy。

**错误信息**:
```
Error: Could not find policy "is-authenticated"
```

**解决方案**:
- ⚠️ 需要在 Strapi Admin 中配置权限
- ⚠️ 或者修改 policy 路径引用方式

**状态**: 待解决

### 🐛 问题 3: Node.js 版本兼容性

**问题描述**:
本地 Node.js v24.11.1 与 better-sqlite3 不兼容。

**解决方案**:
- ✅ 使用 Docker 运行 Strapi，避免本地 Node 版本问题

---

## 下一步工作计划

### 立即任务（优先级：最高）

1. **解决 Policy 注册问题**
   - 修改 policy 引用路径
   - 确保 policy 正确加载

2. **重启 Strapi 验证后端**
   - 确保 Strapi 成功启动
   - 在 Admin Panel 中配置权限

3. **创建前端认证系统**
   - AuthContext
   - ProtectedRoute
   - 登录/注册页面

### 后续任务（优先级：高）

4. **扩展 API 工具**
   - lib/api.ts 添加所有新 API

5. **创建个人中心**
   - layout 和所有子页面

6. **实现订单管理**
   - 订单列表和详情页面

7. **升级 Header**
   - 添加用户菜单

---

## API 端点清单（后端已实现）

### 认证相关

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/local | 用户登录 | 公开 |
| POST | /api/auth/local/register | 用户注册 | 公开 |
| GET | /api/users/me | 获取当前用户 | 已认证 |
| PUT | /api/users/me | 更新用户资料 | 已认证 |
| POST | /api/users/me/change-password | 修改密码 | 已认证 |
| GET | /api/users/me/orders | 获取用户订单 | 已认证 |
| GET | /api/users/me/statistics | 获取用户统计 | 已认证 |

### 地址管理

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/user-addresses | 获取地址列表 | 已认证 |
| GET | /api/user-addresses/:id | 获取单个地址 | 已认证 |
| POST | /api/user-addresses | 创建地址 | 已认证 |
| PUT | /api/user-addresses/:id | 更新地址 | 已认证 |
| DELETE | /api/user-addresses/:id | 删除地址 | 已认证 |
| POST | /api/user-addresses/:id/set-default | 设置默认地址 | 已认证 |

### 收藏夹

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/wishlists | 获取收藏列表 | 已认证 |
| POST | /api/wishlists | 添加收藏 | 已认证 |
| DELETE | /api/wishlists/:id | 移除收藏 | 已认证 |
| POST | /api/wishlists/toggle | 切换收藏状态 | 已认证 |
| GET | /api/wishlists/check/:productId | 检查收藏状态 | 已认证 |

### 订单（用户端）

| 方法 | 端点 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/orders/:orderNumber/detail | 获取订单详情 | 已认证 |
| POST | /api/orders/:orderNumber/cancel | 取消订单 | 已认证 |

---

## 总结

### 已完成 ✅
- 后端数据模型完整创建
- 后端 Controller 和 Service 完整实现
- 后端 Routes 配置完成
- Policy 文件创建（待配置）

### 待完成 ⚠️
- Policy 注册和权限配置
- 前端认证系统（0%）
- 前端个人中心（0%）
- 前端订单管理（0%）
- Header 升级（0%）

### 预计剩余工作量
- Policy 配置: 0.5 小时
- 前端认证系统: 6-8 小时
- 个人中心: 8-10 小时
- 订单管理: 6-8 小时
- Header 升级: 2-3 小时
- **总计**: 约 23-30 小时
