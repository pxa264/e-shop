import { prefixPluginTranslations } from '@strapi/helper-plugin';
import pluginPkg from '../../package.json';
import pluginId from './pluginId';
import PluginIcon from './components/PluginIcon';
import { ChartPie, ShoppingCart, File, Folder, Picture, User } from '@strapi/icons';

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    // 1. Dashboard
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: ChartPie,
      intlLabel: {
        id: `${pluginId}.menu.dashboard`,
        defaultMessage: 'Dashboard',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [
        { action: 'plugin::ops-dashboard.read', subject: null },
      ],
    });

    // 2. Product Management
    app.addMenuLink({
      to: `/plugins/${pluginId}/products`,
      icon: ShoppingCart,
      intlLabel: {
        id: `${pluginId}.menu.products`,
        defaultMessage: 'Product Management',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [
        { action: 'plugin::ops-dashboard.products', subject: null },
      ],
    });

    // 3. Order Management
    app.addMenuLink({
      to: `/plugins/${pluginId}/orders`,
      icon: File,
      intlLabel: {
        id: `${pluginId}.menu.orders`,
        defaultMessage: 'Order Management',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [
        { action: 'plugin::ops-dashboard.orders', subject: null },
      ],
    });

    // 4. Category Management
    app.addMenuLink({
      to: `/plugins/${pluginId}/categories`,
      icon: Folder,
      intlLabel: {
        id: `${pluginId}.menu.categories`,
        defaultMessage: 'Category Management',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [
        { action: 'plugin::ops-dashboard.categories', subject: null },
      ],
    });

    // 5. Banner Management
    app.addMenuLink({
      to: `/plugins/${pluginId}/banners`,
      icon: Picture,
      intlLabel: {
        id: `${pluginId}.menu.banners`,
        defaultMessage: 'Banner Management',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [
        { action: 'plugin::ops-dashboard.banners', subject: null },
      ],
    });

    // 6. Customer Management
    app.addMenuLink({
      to: `/plugins/${pluginId}/customers`,
      icon: User,
      intlLabel: {
        id: `${pluginId}.menu.customers`,
        defaultMessage: 'Customer Management',
      },
      Component: async () => {
        const component = await import('./pages/App');
        return component;
      },
      permissions: [
        { action: 'plugin::ops-dashboard.customers', subject: null },
      ],
    });

    app.registerPlugin({
      id: pluginId,
      name,
    });
  },

  bootstrap(app) {
    // 菜单显示由 RBAC 权限控制，无需手动隐藏
    // 在 Strapi Admin 中为角色分配权限即可控制菜单可见性
  },

  async registerTrads({ locales }) {
    return [];
  },
};
