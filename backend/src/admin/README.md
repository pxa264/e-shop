# Strapi 后台管理界面自定义

## 📍 后台源代码位置

Strapi 的后台管理界面是**内置在框架中**的，源代码位于：

```
/Users/mac/Code/Python/strapi_project/backend/node_modules/@strapi/admin
```

**⚠️ 重要提示**：不要直接修改 `node_modules` 中的文件，因为：
- 更新 Strapi 版本时会被覆盖
- 违反框架最佳实践
- 可能导致不可预期的问题

---

## 🎨 正确的自定义方法

### 1. 使用 `src/admin/app.js` 配置文件

当前目录下的 `app.js` 文件用于自定义后台界面，包括：

- ✅ Logo 和 Favicon
- ✅ 主题颜色
- ✅ 页面标题
- ✅ 菜单项
- ✅ 翻译文本
- ✅ 自定义页面和组件

### 2. 添加自定义 Logo

**步骤 1**：将 Logo 文件放到 `public` 目录

```bash
# 在 backend 目录下
cp /path/to/your/logo.png public/logo.png
cp /path/to/your/favicon.ico public/favicon.ico
```

**步骤 2**：在 `app.js` 中引用（已配置）

```javascript
export default {
  config: {
    auth: {
      logo: '/logo.png', // 登录页 Logo
    },
    menu: {
      logo: '/logo.png', // 侧边栏 Logo
    },
  },
};
```

### 3. 自定义主题颜色

当前配置已将主色调改为橙色（`#f97316`），与前端保持一致。

### 4. 重建后台

修改 `src/admin/app.js` 后，需要重建后台才能生效：

```bash
# 在 backend 目录下
npm run build

# 或者在 Docker 中
docker-compose exec strapi npm run build
```

---

## 🔧 常用自定义选项

### 修改后台标题

```javascript
// src/admin/app.js
export default {
  config: {
    translations: {
      zh: {
        'app.components.LeftMenu.navbrand.title': '你的标题',
      },
    },
  },
};
```

### 隐藏菜单项

```javascript
// src/admin/app.js
export default {
  config: {
    menu: {
      logo: '/logo.png',
    },
  },
  bootstrap(app) {
    // 隐藏某些菜单项
    console.log(app);
  },
};
```

### 添加自定义页面

```javascript
// src/admin/app.js
import MyCustomPage from './pages/MyCustomPage';

export default {
  config: {
    // ...
  },
  bootstrap(app) {
    app.addMenuLink({
      to: '/plugins/my-custom-page',
      icon: () => 'icon',
      intlLabel: {
        id: 'my-custom-page.title',
        defaultMessage: '自定义页面',
      },
      Component: MyCustomPage,
    });
  },
};
```

---

## 📚 官方文档

- [Admin Panel Customization](https://docs.strapi.io/dev-docs/admin-panel-customization)
- [Theme Configuration](https://docs.strapi.io/dev-docs/admin-panel-customization#theme-extension)
- [Logo Customization](https://docs.strapi.io/dev-docs/admin-panel-customization#logos)

---

## 🚀 快速测试

1. 修改 `app.js` 配置
2. 重建后台：`npm run build`
3. 重启 Strapi：`docker-compose restart strapi`
4. 访问：http://localhost:1337/admin

---

## 📝 注意事项

1. **开发模式**：开发模式下修改会自动重载，但生产环境需要重建
2. **Logo 尺寸**：建议使用 SVG 格式或高分辨率 PNG（推荐 200x50px）
3. **缓存问题**：如果修改未生效，清除浏览器缓存或使用无痕模式
4. **Docker 环境**：确保 Logo 文件在 Docker 容器中可访问
