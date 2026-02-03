# 部署前配置检查清单

## ⚠️ 部署前必须完成的配置

### 1. 修改 .env 文件

```bash
# 打开 .env 文件
nano .env
```

**必须修改的配置项：**

```env
# 1. 环境模式
NODE_ENV=production

# 2. 前端 URL（根据实际情况选择）
# 选项 A: 使用域名（需要配置 DNS）
NEXT_PUBLIC_STRAPI_API_URL=https://strapi.mulink.link
FRONTEND_URL=https://strapi.mulink.link

# 选项 B: 使用服务器 IP（临时测试）
# NEXT_PUBLIC_STRAPI_API_URL=http://192.168.88.151:8089
# FRONTEND_URL=http://192.168.88.151:8089

# 3. 数据库密码（强烈建议更换）
DATABASE_PASSWORD=使用强密码替换_strapi_password

# 4. 安全密钥（生产环境必须更换！）
# 使用以下命令生成新密钥：
# node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
APP_KEYS=生成新密钥1,生成新密钥2,生成新密钥3,生成新密钥4
API_TOKEN_SALT=生成新salt
ADMIN_JWT_SECRET=生成新secret
JWT_SECRET=生成新secret
```

### 2. 修改 nginx/nginx.conf

```bash
nano nginx/nginx.conf
```

**修改 server_name：**

```nginx
server {
    listen 80;
    server_name strapi.mulink.link;  # 改为您的域名，或使用 _ 作为通配符
    # ...
}
```

### 3. 检查 docker-compose.prod.yml

确认端口映射是否正确：

```yaml
nginx:
  ports:
    - "8089:80"  # 外部端口:内部端口
```

## 🚀 部署步骤

### 方式一：使用自动化脚本（推荐）

```bash
# 1. 确保已完成上述配置修改

# 2. 运行部署脚本
./deploy-to-server.sh
```

### 方式二：手动部署

#### 步骤 1: 本地构建 AMD64 镜像

```bash
# 构建 Strapi 后端
docker buildx build --platform linux/amd64 \
  -t strapi_project-strapi:latest \
  -f backend/Dockerfile.prod \
  --target production \
  --load \
  backend/

# 构建前端
docker buildx build --platform linux/amd64 \
  -t strapi_project-frontend:latest \
  -f frontend/Dockerfile.prod \
  --target production \
  --load \
  frontend/
```

#### 步骤 2: 导出镜像

```bash
mkdir -p docker-images
docker save strapi_project-strapi:latest -o docker-images/strapi-amd64.tar
docker save strapi_project-frontend:latest -o docker-images/frontend-amd64.tar
```

#### 步骤 3: 传输到服务器

```bash
# 传输镜像
scp -i ~/.ssh/id_ed25519_strapi docker-images/strapi-amd64.tar admin_zaas@192.168.88.151:~/www/strapi_project/
scp -i ~/.ssh/id_ed25519_strapi docker-images/frontend-amd64.tar admin_zaas@192.168.88.151:~/www/strapi_project/

# 传输配置文件
scp -i ~/.ssh/id_ed25519_strapi .env admin_zaas@192.168.88.151:~/www/strapi_project/e-shop/
scp -i ~/.ssh/id_ed25519_strapi docker-compose.prod.yml admin_zaas@192.168.88.151:~/www/strapi_project/e-shop/
scp -i ~/.ssh/id_ed25519_strapi nginx/nginx.conf admin_zaas@192.168.88.151:~/www/strapi_project/e-shop/nginx/
```

#### 步骤 4: 在服务器上部署

```bash
# 连接到服务器
ssh -i ~/.ssh/id_ed25519_strapi admin_zaas@192.168.88.151

# 进入项目目录
cd ~/www/strapi_project

# 加载镜像
docker load -i strapi-amd64.tar
docker load -i frontend-amd64.tar

# 进入旧项目目录
cd e-shop

# 停止旧容器
docker-compose down

# 启动新容器
docker-compose -f docker-compose.prod.yml up -d

# 查看状态
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

## ✅ 部署后检查

```bash
# 1. 检查容器状态
docker ps | grep ecommerce

# 2. 检查日志
docker logs ecommerce-strapi-prod --tail 100
docker logs ecommerce-frontend-prod --tail 100
docker logs ecommerce-nginx-prod --tail 100

# 3. 测试访问
curl http://localhost:8089
curl http://localhost:8089/api/products

# 4. 从本地测试
curl http://192.168.88.151:8089
```

## 🔧 常见问题

### 问题 1: buildx 不可用

```bash
# 创建 buildx builder
docker buildx create --name mybuilder --use
docker buildx inspect --bootstrap
```

### 问题 2: 镜像构建失败

```bash
# 检查 Dockerfile.prod 是否存在
ls backend/Dockerfile.prod
ls frontend/Dockerfile.prod

# 如果不存在，需要创建生产环境 Dockerfile
```

### 问题 3: 服务器容器启动失败

```bash
# 查看详细日志
docker-compose -f docker-compose.prod.yml logs

# 检查端口占用
netstat -tulpn | grep 8089

# 检查数据库连接
docker exec ecommerce-strapi-prod npm run strapi version
```

## 📝 回滚方案

如果新版本有问题，可以快速回滚：

```bash
# 在服务器上
cd ~/www/strapi_project/e-shop

# 停止新容器
docker-compose -f docker-compose.prod.yml down

# 启动旧容器
docker-compose up -d
```

## 🎯 下一步

部署成功后：

1. 配置域名 DNS 解析
2. 配置 SSL 证书（Let's Encrypt）
3. 设置自动备份
4. 配置监控和日志
