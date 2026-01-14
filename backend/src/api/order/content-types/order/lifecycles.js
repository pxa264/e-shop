'use strict';

/**
 * Order Lifecycle Hooks
 *
 * 订单生命周期钩子 - 在订单数据变更时自动触发
 *
 * 功能：
 * - afterCreate: 订单创建后自动记录初始状态历史
 * - beforeUpdate: 订单更新前可以进行额外验证
 * - afterUpdate: 订单更新后可以执行后续操作
 *
 * 注意事项：
 * - Lifecycle hooks 中的错误会阻止数据操作
 * - 邮件发送等非关键操作应该使用 try-catch 包裹
 * - 避免在 hooks 中执行耗时操作
 */
module.exports = {
  /**
   * 订单创建后的钩子
   *
   * 功能：
   * - 自动创建初始状态历史记录
   * - 记录订单创建人（如果有）
   *
   * @param {Object} result - 创建的订单对象
   */
  async afterCreate(result) {
    try {
      // 创建初始状态历史记录
      await strapi.entityService.create('api::order-history.order-history', {
        data: {
          order: result.id,
          fromStatus: null,              // 初始状态，无旧状态
          toStatus: result.status,       // 当前状态
          changedBy: result.createdBy?.id || null,
          note: '订单创建',
          changedAt: new Date()
        }
      });

      strapi.log.info(`Initial order history created for order ${result.orderNumber || result.id}`);
    } catch (error) {
      // 记录错误但不阻止订单创建
      strapi.log.error('Failed to create initial order history:', error);
    }
  },

  /**
   * 订单更新前的钩子
   *
   * 功能：
   * - 可以在这里添加额外的验证逻辑
   * - 例如检查库存、验证价格等
   *
   * @param {Object} params - 查询参数
   * @param {Object} data - 要更新的数据
   */
  async beforeUpdate(params, data) {
    // 示例：如果要防止直接修改已完成的订单
    // if (data.status && data.data) {
    //   const order = await strapi.entityService.findOne('api::order.order', params.where.id, {
    //     fields: ['status']
    //   });
    //   if (order && order.status === 'completed' && order.status !== data.data.status) {
    //     throw new Error('Cannot modify a completed order');
    //   }
    // }
  },

  /**
   * 订单更新后的钩子
   *
   * 功能：
   * - 可以在这里执行订单更新后的后续操作
   * - 例如触发库存更新、发送通知等
   *
   * 注意：
   * - 状态变更的历史记录已在 Service 层处理
   * - 这里只处理其他业务逻辑
   *
   * @param {Object} result - 更新后的订单对象
   * @param {Object} params - 查询参数
   * @param {Object} data - 更新的数据
   */
  async afterUpdate(result, params, data) {
    // 示例：如果订单被取消，可以恢复库存
    // if (result.status === 'cancelled' && data.data && data.data.status === 'cancelled') {
    //   try {
    //     // 恢复库存逻辑
    //     strapi.log.info(`Order ${result.orderNumber} cancelled, restoring inventory`);
    //   } catch (error) {
    //     strapi.log.error('Failed to restore inventory:', error);
    //   }
    // }
  },

  /**
   * 订单删除前的钩子
   *
   * 功能：
   * - 可以在删除订单前进行验证
   * - 例如检查订单是否可以删除
   *
   * @param {Object} params - 查询参数
   */
  async beforeDelete(params) {
    // 示例：防止删除已付款的订单
    // const order = await strapi.entityService.findOne('api::order.order', params.where.id, {
    //   fields: ['status', 'paidAt']
    // });
    // if (order && order.paidAt) {
    //   throw new Error('Cannot delete a paid order');
    // }
  },

  /**
   * 订单删除后的钩子
   *
   * 功能：
   * - 清理订单相关数据
   * - 由于关系配置，历史记录会自动级联删除
   *
   * @param {Object} params - 查询参数
   */
  async afterDelete(params) {
    // Strapi 的关系配置会自动删除关联的 order-history 记录
    // 这里可以添加其他清理逻辑
    strapi.log.info(`Order deleted, ID: ${params.where.id}`);
  }
};
