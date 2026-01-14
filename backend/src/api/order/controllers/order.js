'use strict';

/**
 * Order Controller
 *
 * 订单控制器 - 处理订单相关的 HTTP 请求
 *
 * 主要功能：
 * - 更新订单状态
 * - 批量更新订单状态
 * - 获取订单历史
 * - 获取订单统计
 * - 获取状态配置
 */
const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::order.order', ({ strapi }) => ({
  /**
   * 创建订单（前台）
   *
   * 强制将订单与当前登录用户关联，避免丢失 user 关系导致前台无法查询。
   */
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const payload = ctx.request.body?.data || {};

    // 仅允许使用当前登录用户，忽略请求体中的 user 字段
    const sanitizedInput = await this.sanitizeInput(payload, ctx);

    const orderData = {
      ...sanitizedInput,
      status: sanitizedInput.status || 'pending',
      user: user.id,
    };

    const entity = await strapi.service('api::order.order').create({
      data: orderData,
    });

    const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
    return this.transformResponse(sanitizedEntity);
  },

  /**
   * 更新订单状态
   *
   * 端点: POST /orders/:id/status
   * 权限: 需要管理员权限
   *
   * 请求体:
   * - status: string (必需) - 新状态
   * - note: string (可选) - 备注说明
   *
   * @param {Object} ctx - Koa 上下文对象
   * @returns {Object} 包含更新后订单和成功消息的响应
   */
  async updateStatus(ctx) {
    const { id } = ctx.params;
    const { status, note } = ctx.request.body;
    const userId = ctx.state.user?.id;

    // 参数验证
    if (!status) {
      return ctx.badRequest('Status is required');
    }

    try {
      // 调用 Service 层更新状态
      const order = await strapi.service('api::order.order').updateStatus(
        id,
        status,
        userId,
        note
      );

      return ctx.send({
        data: order,
        message: 'Order status updated successfully'
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * 批量更新订单状态
   *
   * 端点: POST /orders/bulk/status
   * 权限: 需要管理员权限
   *
   * 请求体:
   * - orderIds: number[] (必需) - 订单ID数组
   * - status: string (必需) - 新状态
   * - note: string (可选) - 备注说明
   *
   * @param {Object} ctx - Koa 上下文对象
   * @returns {Object} 包含批量更新结果的响应
   */
  async bulkUpdateStatus(ctx) {
    const { orderIds, status, note } = ctx.request.body;
    const userId = ctx.state.user?.id;

    // 参数验证
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return ctx.badRequest('orderIds must be a non-empty array');
    }

    if (!status) {
      return ctx.badRequest('Status is required');
    }

    try {
      // 调用 Service 层批量更新
      const results = await strapi.service('api::order.order').bulkUpdateStatus(
        orderIds,
        status,
        userId,
        note
      );

      // 统计成功和失败的数量
      const successCount = results.filter(r => r.success).length;
      const failCount = results.filter(r => !r.success).length;

      return ctx.send({
        data: results,
        message: `Bulk update completed: ${successCount} succeeded, ${failCount} failed`
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * 获取订单历史记录
   *
   * 端点: GET /orders/:id/history
   * 权限: 需要管理员权限
   *
   * 返回指定订单的所有状态变更历史
   *
   * @param {Object} ctx - Koa 上下文对象
   * @returns {Object} 包含历史记录数组的响应
   */
  async getHistory(ctx) {
    const { id } = ctx.params;

    try {
      const histories = await strapi.entityService.findMany(
        'api::order-history.order-history',
        {
          filters: {
            order: id
          },
          populate: {
            changedBy: {
              fields: ['id', 'username', 'email']
            }
          },
          sort: { changedAt: 'desc' }
        }
      );

      return ctx.send({ data: histories });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * 获取订单统计信息
   *
   * 端点: GET /orders/statistics
   * 权限: 需要管理员权限
   *
   * 返回各状态的订单数量统计
   *
   * @param {Object} ctx - Koa 上下文对象
   * @returns {Object} 包含统计数据的响应
   */
  async getStatistics(ctx) {
    try {
      const stats = await strapi.service('api::order.order').getStatusStatistics();
      return ctx.send({ data: stats });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * 获取订单状态配置
   *
   * 端点: GET /orders/status-config
   * 权限: 公开访问
   *
   * 返回订单状态的显示配置和流转规则
   * 用于前端渲染状态标签和流转按钮
   *
   * @param {Object} ctx - Koa 上下文对象
   * @returns {Object} 包含状态配置的响应
   */
  async getStatusConfig(ctx) {
    try {
      const statusConfig = await strapi.service('api::order.order').getStatusConfig();
      const statusTransitions = {
        pending: ['processing', 'cancelled'],
        processing: ['shipped', 'cancelled'],
        shipped: ['completed', 'cancelled'],
        completed: [],
        cancelled: []
      };

      return ctx.send({
        data: {
          statusConfig,
          statusTransitions
        }
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * 用户取消订单
   *
   * 端点: POST /orders/:orderNumber/cancel
   * 权限: 需要登录（is-authenticated）
   *
   * 功能：
   * - 验证订单是否属于当前用户
   * - 只有 pending 状态的订单可以取消
   * - 订单状态变更为 cancelled
   * - 自动记录状态变更历史
   *
   * @param {Object} ctx - Koa 上下文对象
   * @returns {Object} 包含取消后订单的响应
   */
  async cancelOrder(ctx) {
    const { orderNumber } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    try {
      // 查询订单
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: {
          orderNumber,
        },
        populate: {
          user: true,
        },
      });

      if (orders.length === 0) {
        return ctx.notFound('Order not found');
      }

      const order = orders[0];

      // 验证所有权
      if (!order.user || order.user.id !== user.id) {
        return ctx.forbidden('You do not have permission to cancel this order');
      }

      // 验证订单状态（只有 pending 状态可以取消）
      if (order.status !== 'pending') {
        return ctx.badRequest('Only pending orders can be cancelled');
      }

      // 更新订单状态
      const updatedOrder = await strapi.service('api::order.order').updateStatus(
        order.id,
        'cancelled',
        user.id,
        'Cancelled by customer'
      );

      return ctx.send({
        data: updatedOrder,
        message: 'Order cancelled successfully',
      });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  },

  /**
   * 获取用户订单详情
   *
   * 端点: GET /orders/:orderNumber/detail
   * 权限: 需要登录（is-authenticated）
   *
   * 功能：
   * - 验证订单是否属于当前用户
   * - 返回订单完整信息
   * - 包含订单明细、状态历史、地址信息
   *
   * @param {Object} ctx - Koa 上下文对象
   * @returns {Object} 包含订单详情的响应
   */
  async getMyOrderDetail(ctx) {
    const { orderNumber } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    try {
      // 查询订单
      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: {
          orderNumber,
        },
        populate: {
          user: {
            fields: ['id', 'username', 'email'],
          },
          items: true,
          histories: {
            populate: {
              changedBy: {
                fields: ['id', 'username', 'email'],
              },
            },
            sort: ['changedAt:desc'],
          },
        },
      });

      if (orders.length === 0) {
        return ctx.notFound('Order not found');
      }

      const order = orders[0];

      // 验证所有权
      if (!order.user || order.user.id !== user.id) {
        return ctx.forbidden('You do not have permission to view this order');
      }

      return ctx.send({ data: order });
    } catch (error) {
      return ctx.badRequest(error.message);
    }
  }
}));
