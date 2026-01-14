FROM node:18-alpine

WORKDIR /app

# 配置 npm 使用淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
