#!/bin/bash

# 部署脚本 - 构建 AMD64 镜像并传输到服务器
# 使用方法: ./deploy-to-server.sh

set -e  # 遇到错误立即退出

# 配置
SERVER_USER="admin_zaas"
SERVER_HOST="192.168.88.151"
SERVER_PATH="~/www/strapi_project"
SSH_KEY="~/.ssh/id_ed25519_strapi"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Strapi 项目部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"

# 步骤 1: 检查环境
echo -e "\n${YELLOW}[1/6] 检查本地环境...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker 已安装${NC}"

# 步骤 2: 构建 AMD64 镜像
echo -e "\n${YELLOW}[2/6] 构建 AMD64 Docker 镜像...${NC}"
echo "这可能需要几分钟时间..."

# 构建 Strapi 后端镜像
echo -e "\n构建 Strapi 后端镜像..."
docker buildx build --platform linux/amd64 \
  -t strapi_project-strapi:latest \
  -f backend/Dockerfile.prod \
  --target production \
  --load \
  backend/

# 构建前端镜像
echo -e "\n构建前端镜像..."
docker buildx build --platform linux/amd64 \
  -t strapi_project-frontend:latest \
  -f frontend/Dockerfile.prod \
  --target production \
  --load \
  frontend/

echo -e "${GREEN}✓ 镜像构建完成${NC}"

# 步骤 3: 导出镜像为 tar 文件
echo -e "\n${YELLOW}[3/6] 导出 Docker 镜像...${NC}"
mkdir -p ./docker-images

echo "导出 Strapi 镜像..."
docker save strapi_project-strapi:latest -o ./docker-images/strapi-amd64.tar

echo "导出前端镜像..."
docker save strapi_project-frontend:latest -o ./docker-images/frontend-amd64.tar

echo -e "${GREEN}✓ 镜像导出完成${NC}"
ls -lh ./docker-images/

# 步骤 4: 传输文件到服务器
echo -e "\n${YELLOW}[4/6] 传输文件到服务器...${NC}"

# 传输镜像文件
echo "传输 Strapi 镜像 (这可能需要几分钟)..."
scp -i $SSH_KEY ./docker-images/strapi-amd64.tar ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

echo "传输前端镜像..."
scp -i $SSH_KEY ./docker-images/frontend-amd64.tar ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 传输配置文件
echo "传输配置文件..."
scp -i $SSH_KEY .env ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
scp -i $SSH_KEY docker-compose.prod.yml ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/
scp -i $SSH_KEY nginx/nginx.conf ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/nginx/

echo -e "${GREEN}✓ 文件传输完成${NC}"

# 步骤 5: 在服务器上加载镜像
echo -e "\n${YELLOW}[5/6] 在服务器上加载 Docker 镜像...${NC}"
ssh -i $SSH_KEY ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd ~/www/strapi_project

echo "加载 Strapi 镜像..."
docker load -i strapi-amd64.tar

echo "加载前端镜像..."
docker load -i frontend-amd64.tar

echo "清理 tar 文件..."
rm -f strapi-amd64.tar frontend-amd64.tar

echo "✓ 镜像加载完成"
docker images | grep strapi_project
ENDSSH

# 步骤 6: 部署
echo -e "\n${YELLOW}[6/6] 部署应用...${NC}"
echo -e "${YELLOW}注意: 这将停止旧容器并启动新容器${NC}"
read -p "是否继续? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh -i $SSH_KEY ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
cd ~/www/strapi_project/e-shop

echo "停止旧容器..."
docker-compose down

echo "启动新容器..."
docker-compose -f docker-compose.prod.yml up -d

echo "等待服务启动..."
sleep 10

echo "检查容器状态..."
docker-compose -f docker-compose.prod.yml ps

echo "查看日志..."
docker-compose -f docker-compose.prod.yml logs --tail=50
ENDSSH

    echo -e "\n${GREEN}========================================${NC}"
    echo -e "${GREEN}  部署完成！${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo -e "访问地址: ${YELLOW}http://192.168.88.151:8089${NC}"
    echo -e "管理后台: ${YELLOW}http://192.168.88.151:8089/admin${NC}"
else
    echo -e "${YELLOW}部署已取消${NC}"
fi

# 清理本地临时文件
echo -e "\n清理本地临时文件..."
rm -rf ./docker-images

echo -e "\n${GREEN}完成！${NC}"
