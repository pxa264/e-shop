'use strict';

/**
 * OrderHistory Service
 *
 * 订单历史记录的服务层
 * 使用 Strapi 默认生成的 CRUD 操作
 */
const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::order-history.order-history');
