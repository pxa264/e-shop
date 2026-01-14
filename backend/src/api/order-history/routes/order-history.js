'use strict';

/**
 * OrderHistory Routes
 *
 * 订单历史记录的路由配置
 * 使用 Strapi 默认生成的 RESTful 路由
 */
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::order-history.order-history');
