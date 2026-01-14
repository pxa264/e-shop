'use strict';

/**
 * wishlist router
 *
 * 功能说明：
 * - 定义收藏夹管理的所有路由端点
 * - 配置路由权限和策略
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/wishlists',
      handler: 'wishlist.find',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/wishlists/:id',
      handler: 'wishlist.findOne',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/wishlists',
      handler: 'wishlist.create',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'DELETE',
      path: '/wishlists/:id',
      handler: 'wishlist.delete',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'POST',
      path: '/wishlists/toggle',
      handler: 'wishlist.toggle',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
    {
      method: 'GET',
      path: '/wishlists/check/:productId',
      handler: 'wishlist.check',
      config: {
        policies: ['global::is-authenticated'],
      },
    },
  ],
};
