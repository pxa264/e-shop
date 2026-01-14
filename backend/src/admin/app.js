/**
 * Strapi 后台管理界面自定义配置
 * 
 * 文档：https://docs.strapi.io/dev-docs/admin-panel-customization
 * 
 * 可自定义内容：
 * - Logo 和 Favicon
 * - 主题颜色
 * - 页面标题
 * - 菜单项
 * - 自定义页面
 */

export default {
  config: {
    // 自定义后台标题（浏览器标签页）
    head: {
      favicon: '/favicon.ico',
    },
    
    // 自定义 Logo
    auth: {
      logo: '/logo.png', // 登录页 Logo
    },
    
    menu: {
      logo: '/logo.png', // 侧边栏 Logo
    },
    
    // 启用中文语言
    locales: [
      'zh-Hans', // 简体中文
    ],
    
    // 自定义主题颜色
    theme: {
      light: {
        colors: {
          primary100: '#fff5f0',
          primary200: '#ffe8db',
          primary500: '#f97316', // 主色调（橙色）
          primary600: '#ea580c',
          primary700: '#c2410c',
          danger700: '#b72b1a',
        },
      },
    },
    
    // 自定义翻译
    translations: {
      zh: {
        'app.components.LeftMenu.navbrand.title': 'E-Shop 管理后台',
        'app.components.LeftMenu.navbrand.workplace': '电商管理系统',
      },
    },
    
    // 禁用教程和通知
    tutorials: false,
    notifications: { releases: false },
  },
  
  bootstrap() {
    // 后台初始化时执行的代码
    console.log('Strapi Admin Panel Loaded');
  },
};
