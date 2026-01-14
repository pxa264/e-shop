FROM node:18-alpine

WORKDIR /app

RUN apk add --no-cache \
    build-base \
    gcc \
    autoconf \
    automake \
    zlib-dev \
    libpng-dev \
    vips-dev \
    git

ENV NODE_ENV=development

# 配置 npm 使用淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 1337

CMD ["npm", "run", "develop"]
