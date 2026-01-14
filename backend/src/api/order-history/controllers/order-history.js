'use strict';

/**
 * OrderHistory Controller
 *
 * 订单历史记录的控制器
 * 使用 Strapi 默认生成的 CRUD 操作
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order-history.order-history');
