'use strict';

/**
 * Order Routes
 *
 * 订单路由配置
 *
 * 自定义路由：
 * - POST /orders/:id/status - 更新订单状态
 * - POST /orders/bulk/status - 批量更新订单状态
 * - GET /orders/:id/history - 获取订单历史
 * - GET /orders/statistics - 获取订单统计
 * - GET /orders/status-config - 获取状态配置
 *
 * 权限说明：
 * - 状态变更相关路由需要管理员权限
 * - 查询路由根据具体需求配置权限
 */
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::order.order', {
  config: {
    // 默认 CRUD 路由的配置
    find: {
      middlewares: [],
      policies: [],
    },
    findOne: {
      middlewares: [],
      policies: [],
    },
    create: {
      middlewares: [],
      policies: [],
    },
    update: {
      middlewares: [],
      policies: [],
    },
    delete: {
      middlewares: [],
      policies: [],
    },
  },
});
