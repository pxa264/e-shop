'use strict';

/**
 * user-address router
 *
 * 功能说明：
 * - 定义用户地址管理的所有路由端点
 * - 配置路由权限和策略
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/user-addresses',
      handler: 'user-address.find',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/user-addresses/:id',
      handler: 'user-address.findOne',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/user-addresses',
      handler: 'user-address.create',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'PUT',
      path: '/user-addresses/:id',
      handler: 'user-address.update',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'DELETE',
      path: '/user-addresses/:id',
      handler: 'user-address.delete',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/user-addresses/:id/set-default',
      handler: 'user-address.setDefault',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
  ],
};
