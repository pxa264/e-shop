'use strict';

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/orders/:id/status',
      handler: 'order.updateStatus',
      config: {
        policies: ['global::is-admin'],
        description: '更新订单状态 - 需要管理员权限',
        tag: 'Order',
      },
    },
    {
      method: 'POST',
      path: '/orders/bulk/status',
      handler: 'order.bulkUpdateStatus',
      config: {
        policies: ['global::is-admin'],
        description: '批量更新订单状态 - 需要管理员权限',
        tag: 'Order',
      },
    },
    {
      method: 'GET',
      path: '/orders/:id/history',
      handler: 'order.getHistory',
      config: {
        policies: ['global::is-admin'],
        description: '获取订单历史记录 - 需要管理员权限',
        tag: 'Order',
      },
    },
    {
      method: 'GET',
      path: '/orders/statistics',
      handler: 'order.getStatistics',
      config: {
        policies: ['global::is-admin'],
        description: '获取订单统计信息 - 需要管理员权限',
        tag: 'Order',
      },
    },
    {
      method: 'GET',
      path: '/orders/status-config',
      handler: 'order.getStatusConfig',
      config: {
        auth: false,
        policies: [],
        description: '获取订单状态配置 - 公开访问',
        tag: 'Order',
      },
    },
    {
      method: 'POST',
      path: '/orders/:orderNumber/cancel',
      handler: 'order.cancelOrder',
      config: {
        policies: ['global::is-authenticated'],
        description: '用户取消订单 - 需要登录',
        tag: 'Order',
      },
    },
    {
      method: 'GET',
      path: '/orders/:orderNumber/detail',
      handler: 'order.getMyOrderDetail',
      config: {
        policies: ['global::is-authenticated'],
        description: '获取用户订单详情 - 需要登录',
        tag: 'Order',
      },
    },
  ],
};
