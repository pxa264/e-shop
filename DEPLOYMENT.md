# 服务器部署指南

## 服务器 Nginx 配置

在服务器上创建配置文件：`/etc/nginx/sites-available/strapi.mulink.link`

```nginx
server {
    listen 80;
    server_name strapi.mulink.link;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name strapi.mulink.link;

    # SSL证书（如果有Let's Encrypt证书）
    ssl_certificate /etc/letsencrypt/live/strapi.mulink.link/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/strapi.mulink.link/privkey.pem;

    # 如果没有SSL证书，使用自签名证书（需要先生成）
    # ssl_certificate /etc/nginx/ssl/cert.pem;
    # ssl_certificate_key /etc/nginx/ssl/key.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    client_max_body_size 100M;

    # 直接代理到项目内 Nginx (端口8080)
    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_buffering off;
    }
}
```

## 部署步骤

### 1. 在服务器上准备环境

```bash
# 安装Docker和Docker Compose（如果还没安装）
sudo apt update
sudo apt install docker.io docker-compose git -y

# 启动Docker服务
sudo systemctl start docker
sudo systemctl enable docker
```

### 2. 克隆项目代码

```bash
# 进入你的项目目录
cd /home/your-username  # 根据你的实际路径调整

# 克隆项目（使用你的git仓库地址）
git clone <你的git仓库地址> strapi_project
cd strapi_project
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

修改以下关键配置：
```
HOST=0.0.0.0
PORT=1337
DATABASE_HOST=postgres
FRONTEND_URL=https://strapi.mulink.link

# 修改数据库密码
DATABASE_PASSWORD=<你的强密码>

# 修改JWT密钥（生成强密钥）
JWT_SECRET=<生成的强密钥>
APP_KEYS=<生成的强密钥>
```

生成强密钥：
```bash
# 生成JWT密钥
openssl rand -base64 32

# 生成APP_KEYS（需要4个，用逗号分隔）
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32
openssl rand -base64 32
```

### 4. 配置服务器 Nginx

```bash
# 创建Nginx配置
sudo nano /etc/nginx/sites-available/strapi.mulink.link

# 粘贴上面的Nginx配置内容

# 启用站点
sudo ln -s /etc/nginx/sites-available/strapi.mulink.link /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl reload nginx
```

### 5. 启动Docker项目

```bash
# 确保在项目根目录
cd /path/to/strapi_project

# 启动所有服务
sudo docker-compose up -d

# 查看容器状态
sudo docker-compose ps

# 查看日志
sudo docker-compose logs -f
```

### 6. 初始化 Strapi

```bash
# 等待Strapi启动完成（大约1-2分钟）
# 访问 https://strapi.mulink.link/admin 创建管理员账户
```

### 7. 配置 Strapi 权限

登录 Strapi Admin 后：
1. 进入 Settings → Users & Permissions → Roles → Public
2. 为以下内容类型开启权限：
   - Product: `find`, `findOne`
   - Category: `find`, `findOne`
   - Banner: `find`, `findOne`

### 8. 验证部署

访问测试：
- https://strapi.mulink.link → 前端电商网站
- https://strapi.mulink.link/admin → Strapi管理后台
- https://strapi.mulink.link/api/products → API测试

## 常用命令

```bash
# 查看容器状态
sudo docker-compose ps

# 查看日志
sudo docker-compose logs -f nginx
sudo docker-compose logs -f strapi
sudo docker-compose logs -f frontend

# 重启服务
sudo docker-compose restart

# 停止服务
sudo docker-compose stop

# 重新构建并启动
sudo docker-compose up -d --build

# 进入容器
sudo docker exec -it ecommerce-strapi sh
```

## 故障排查

### 问题1：容器无法启动
```bash
# 查看详细日志
sudo docker-compose logs

# 检查端口占用
sudo netstat -tulpn | grep 8080
```

### 问题2：无法访问网站
```bash
# 检查Nginx状态
sudo systemctl status nginx

# 检查容器状态
sudo docker-compose ps

# 测试本地访问
curl http://localhost:8080
```

### 问题3：数据库连接失败
```bash
# 进入Strapi容器检查
sudo docker exec -it ecommerce-strapi sh
npm run strapi version
```

## 生产环境优化建议

1. **使用生产模式启动**
   - 修改 docker-compose.yml 中的 `npm run develop` 为 `npm run start`
   - 需要先运行 `npm run build`

2. **数据备份**
   ```bash
   # 备份数据库
   sudo docker exec ecommerce-postgres pg_dump -U strapi strapi_ecommerce > backup.sql

   # 备份上传文件
   sudo tar -czf uploads-backup.tar.gz backend/public/uploads
   ```

3. **配置自动重启**
   - docker-compose.yml 中已配置 `restart: unless-stopped`

4. **监控日志**
   ```bash
   # 设置日志轮转
   sudo nano /etc/docker/daemon.json
   ```
   添加：
   ```json
   {
     "log-driver": "json-file",
     "log-opts": {
       "max-size": "10m",
       "max-file": "3"
     }
   }
   ```

## 总结

部署流程：
1. ✅ 服务器安装Docker
2. ✅ 克隆项目代码
3. ✅ 配置环境变量
4. ✅ 配置服务器Nginx
5. ✅ 启动Docker Compose
6. ✅ 初始化Strapi管理员
7. ✅ 配置API权限

访问地址：
- 前端：https://strapi.mulink.link
- 管理后台：https://strapi.mulink.link/admin
- API：https://strapi.mulink.link/api
