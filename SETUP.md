# 项目搭建详细指南

## 环境准备

### 必需软件

1. **Docker Desktop**
   - macOS: 从 [Docker 官网](https://www.docker.com/products/docker-desktop) 下载安装
   - 确保 Docker Desktop 正在运行

2. **代码编辑器**
   - 推荐 VS Code

## 详细搭建步骤

### 步骤 1: 配置环境变量

#### 1.1 根目录环境变量

创建 `.env` 文件（已有 `.env.example` 模板）：

```bash
cp .env.example .env
```

#### 1.2 后端环境变量

创建 `backend/.env` 文件：

```bash
cp backend/.env.example backend/.env
```

编辑 `backend/.env`，生成并替换安全密钥：

```bash
# 生成 4 个随机密钥用于 APP_KEYS
openssl rand -base64 32  # 密钥1
openssl rand -base64 32  # 密钥2
openssl rand -base64 32  # 密钥3
openssl rand -base64 32  # 密钥4

# 生成其他密钥
openssl rand -base64 32  # API_TOKEN_SALT
openssl rand -base64 32  # ADMIN_JWT_SECRET
openssl rand -base64 32  # JWT_SECRET
```

将生成的密钥填入 `backend/.env`：

```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=密钥1,密钥2,密钥3,密钥4
API_TOKEN_SALT=生成的密钥
ADMIN_JWT_SECRET=生成的密钥
JWT_SECRET=生成的密钥

DATABASE_CLIENT=postgres
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_NAME=strapi_ecommerce
DATABASE_USERNAME=strapi
DATABASE_PASSWORD=strapi_password
DATABASE_SSL=false
```

#### 1.3 前端环境变量

创建 `frontend/.env.local` 文件：

```bash
cp frontend/.env.local.example frontend/.env.local
```

内容：
```env
NEXT_PUBLIC_STRAPI_API_URL=http://localhost:1337
```

### 步骤 2: 启动 Docker 服务

在项目根目录执行：

```bash
docker-compose up -d
```

这个命令会：
1. 拉取 PostgreSQL 和 Node.js 镜像
2. 创建 3 个容器：postgres、strapi、frontend
3. 自动安装依赖
4. 启动所有服务

**首次启动需要 3-5 分钟**，可以查看日志：

```bash
docker-compose logs -f
```

### 步骤 3: 验证服务状态

检查所有服务是否正常运行：

```bash
docker-compose ps
```

应该看到 3 个服务都是 `Up` 状态：
- ecommerce-postgres
- ecommerce-strapi
- ecommerce-frontend

### 步骤 4: 初始化 Strapi 管理员

1. 打开浏览器访问: http://localhost:1337/admin
2. 首次访问会显示管理员注册页面
3. 填写信息：
   - First name: Admin
   - Last name: User
   - Email: admin@example.com
   - Password: 设置强密码（至少 8 位）
4. 点击 "Let's start"

### 步骤 5: 配置 API 权限

登录 Strapi 后台后：

1. 点击左侧菜单 **Settings**
2. 在 USERS & PERMISSIONS PLUGIN 部分，点击 **Roles**
3. 点击 **Public** 角色
4. 展开以下内容类型，勾选权限：
   - **Banner**: find, findOne
   - **Category**: find, findOne
   - **Product**: find, findOne
5. 点击右上角 **Save** 按钮

**注意**: Order 和 OrderItem 保持默认（不开放公开访问）

### 步骤 6: 添加测试数据

#### 6.1 创建分类

1. 点击左侧 **Content Manager**
2. 点击 **Category**
3. 点击 **Create new entry**
4. 填写：
   - Name: 电子产品
   - Description: 各类电子产品
5. 点击 **Save** 并 **Publish**

重复以上步骤创建更多分类（如：服装配饰、家居生活）

#### 6.2 创建商品

1. 点击 **Product**
2. 点击 **Create new entry**
3. 填写：
   - Name: iPhone 15 Pro
   - Description: 最新款 iPhone
   - Price: 7999
   - Stock: 100
   - SKU: IP15PRO001
   - Category: 选择"电子产品"
   - Featured: 勾选（显示在首页）
4. 点击 **Save** 并 **Publish**

#### 6.3 创建轮播图

1. 点击 **Banner**
2. 点击 **Create new entry**
3. 填写：
   - Title: 新年促销
   - Link: /products
   - Sort Order: 1
   - Is Active: 勾选
4. 上传图片（可选）
5. 点击 **Save** 并 **Publish**

### 步骤 7: 访问前端网站

打开浏览器访问: http://localhost:3000

应该能看到：
- 导航栏
- 首页 Banner 区域
- 热门商品展示（如果添加了 Featured 商品）

## 常见问题

### Q1: Docker 容器启动失败

**解决方案**:
```bash
# 停止所有容器
docker-compose down

# 清理并重新启动
docker-compose up -d --build
```

### Q2: Strapi 无法连接数据库

**检查**:
- PostgreSQL 容器是否正常运行: `docker-compose ps`
- 查看 Strapi 日志: `docker-compose logs strapi`

**解决方案**:
```bash
# 重启服务
docker-compose restart strapi
```

### Q3: 前端无法获取数据

**检查**:
1. Strapi API 是否可访问: http://localhost:1337/api/products
2. API 权限是否已配置（参考步骤 5）
3. 数据是否已发布（Published 状态）

### Q4: 端口被占用

如果 1337 或 3000 端口被占用，修改 `docker-compose.yml`：

```yaml
services:
  strapi:
    ports:
      - "1338:1337"  # 改为其他端口
  
  frontend:
    ports:
      - "3001:3000"  # 改为其他端口
```

### Q5: 依赖安装失败

**解决方案**:
```bash
# 进入容器手动安装
docker-compose exec strapi npm install
docker-compose exec frontend npm install
```

## 开发工作流

### 修改后端代码

1. 编辑 `backend/src/api/` 下的文件
2. Strapi 会自动重启（热重载）
3. 刷新浏览器查看效果

### 修改前端代码

1. 编辑 `frontend/app/` 下的文件
2. Next.js 会自动重新编译
3. 浏览器自动刷新

### 查看日志

```bash
# 实时查看所有日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f strapi
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### 进入容器

```bash
# 进入 Strapi 容器
docker-compose exec strapi sh

# 进入前端容器
docker-compose exec frontend sh

# 进入数据库容器
docker-compose exec postgres psql -U strapi -d strapi_ecommerce
```

## 下一步

项目已成功搭建！接下来可以：

1. 完善商品详情页
2. 实现购物车功能
3. 开发订单结算流程
4. 添加搜索和筛选功能
5. 优化 UI 设计

参考 `ecommerce-learning-prd.md` 了解完整功能需求。
