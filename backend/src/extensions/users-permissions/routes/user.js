'use strict';

/**
 * User routes extension
 *
 * 功能说明：
 * - 扩展 Users & Permissions 插件的路由
 * - 添加用户端 API 端点
 * - 配置自定义 controller 方法的路由
 *
 * 注意：
 * - 这些路由会添加到默认路由之外
 * - 所有路由都需要认证（使用 is-authenticated policy）
 */

module.exports = (plugin) => {
  // 获取现有的路由配置
  const routes = plugin.routes['content-api'].routes;

  // 添加自定义路由（认证检查在控制器内部处理）
  routes.push({
    method: 'GET',
    path: '/users/me',
    handler: 'user.me',
    config: {
      policies: ['global::is-authenticated'],
    },
  });

  routes.push({
    method: 'PUT',
    path: '/users/me',
    handler: 'user.updateProfile',
    config: {
      policies: ['global::is-authenticated'],
    },
  });

  routes.push({
    method: 'POST',
    path: '/users/me/change-password',
    handler: 'user.changePassword',
    config: {
      policies: ['global::is-authenticated'],
    },
  });

  routes.push({
    method: 'GET',
    path: '/users/me/orders',
    handler: 'user.getMyOrders',
    config: {
      policies: ['global::is-authenticated'],
    },
  });

  routes.push({
    method: 'GET',
    path: '/users/me/statistics',
    handler: 'user.getMyStatistics',
    config: {
      policies: ['global::is-authenticated'],
    },
  });

  return plugin;
};
