'use strict';

/**
 * Order Service
 *
 * 订单服务层 - 处理订单相关的核心业务逻辑
 *
 * 主要功能：
 * - 订单状态流转管理（状态机模式）
 * - 订单历史记录
 * - 邮件通知发送
 * - 订单统计
 */
const { createCoreService } = require('@strapi/strapi').factories;

// 状态流转规则 - 定义哪些状态可以转换到哪些状态
const STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],       // 待处理 -> 处理中 / 已取消
  processing: ['shipped', 'cancelled'],       // 处理中 -> 已发货 / 已取消
  shipped: ['completed', 'cancelled'],        // 已发货 -> 已完成 / 已取消
  completed: [],                               // 已完成 -> 终态，不可流转
  cancelled: []                                // 已取消 -> 终态，不可流转
};

// 状态显示配置 - 用于前端和邮件模板
const STATUS_CONFIG = {
  pending: {
    label: '待处理',
    color: '#fbbf24',
    icon: 'Clock',
    description: '订单已创建，等待处理'
  },
  processing: {
    label: '处理中',
    color: '#3b82f6',
    icon: 'Settings',
    description: '订单正在处理中'
  },
  shipped: {
    label: '已发货',
    color: '#8b5cf6',
    icon: 'Truck',
    description: '商品已发货'
  },
  completed: {
    label: '已完成',
    color: '#10b981',
    icon: 'CheckCircle',
    description: '订单已完成'
  },
  cancelled: {
    label: '已取消',
    color: '#ef4444',
    icon: 'XCircle',
    description: '订单已取消'
  }
};

module.exports = createCoreService('api::order.order', ({ strapi }) => ({
  /**
   * 更新订单状态
   *
   * 功能：
   * - 验证状态流转的合法性
   * - 更新订单状态
   * - 记录状态变更历史
   * - 发送邮件通知
   *
   * @param {number} orderId - 订单ID
   * @param {string} newStatus - 新状态
   * @param {number} userId - 操作人ID
   * @param {string} note - 备注（可选）
   * @returns {Promise<Object>} 更新后的订单对象
   * @throws {Error} 当订单不存在或状态流转不合法时抛出错误
   */
  async updateStatus(orderId, newStatus, userId, note = null) {
    // 查找订单，包含客户信息和订单明细
    const order = await this.findOne(orderId, {
      populate: ['items'],
    });

    if (!order) {
      throw new Error('Order not found');
    }

    // 验证状态流转的合法性
    const allowedTransitions = STATUS_TRANSITIONS[order.status] || [];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(
        `Cannot transition from ${order.status} to ${newStatus}. ` +
        `Allowed transitions: ${allowedTransitions.join(', ') || 'none'}`
      );
    }

    const oldStatus = order.status;

    // 准备更新数据
    const updateData = {
      status: newStatus
    };

    // 根据新状态设置对应的时间戳
    if (newStatus === 'cancelled') {
      updateData.cancelledAt = new Date();
    } else if (newStatus === 'completed') {
      updateData.completedAt = new Date();
    } else if (newStatus === 'shipped') {
      updateData.shippedAt = new Date();
    }

    // 更新订单状态
    const updatedOrder = await this.update(orderId, {
      data: updateData
    });

    // 记录状态变更历史
    try {
      await strapi.entityService.create('api::order-history.order-history', {
        data: {
          order: orderId,
          fromStatus: oldStatus,
          toStatus: newStatus,
          changedBy: userId,
          note: note || `状态从 "${oldStatus}" 变更为 "${newStatus}"`,
          changedAt: new Date()
        }
      });
    } catch (error) {
      strapi.log.error('Failed to create order history:', error);
      // 不抛出错误，允许状态更新继续
    }

    // 发送邮件通知
    try {
      await this.sendStatusNotification(updatedOrder, oldStatus, newStatus);
    } catch (error) {
      strapi.log.error('Failed to send status notification:', error);
      // 不抛出错误，允许状态更新继续
    }

    return updatedOrder;
  },

  /**
   * 批量更新订单状态
   *
   * 功能：
   * - 批量更新多个订单的状态
   * - 为每个订单记录历史
   * - 返回每个订单的更新结果
   *
   * @param {number[]} orderIds - 订单ID数组
   * @param {string} newStatus - 新状态
   * @param {number} userId - 操作人ID
   * @param {string} note - 备注（可选）
   * @returns {Promise<Array>} 更新结果数组，每个元素包含 success 和 order/error
   */
  async bulkUpdateStatus(orderIds, newStatus, userId, note = null) {
    const results = [];

    for (const orderId of orderIds) {
      try {
        const result = await this.updateStatus(orderId, newStatus, userId, note);
        results.push({ success: true, order: result });
      } catch (error) {
        results.push({
          success: false,
          orderId,
          error: error.message
        });
      }
    }

    return results;
  },

  /**
   * 发送订单状态变更通知邮件
   *
   * 功能：
   * - 生成 HTML 邮件内容
   * - 发送邮件给客户
   *
   * @param {Object} order - 订单对象
   * @param {string} oldStatus - 旧状态
   * @param {string} newStatus - 新状态
   * @returns {Promise<void>}
   */
  async sendStatusNotification(order, oldStatus, newStatus) {
    // 如果订单没有客户邮箱，跳过发送
    if (!order.customerEmail) {
      strapi.log.warn(`Order ${order.orderNumber} has no customer email, skipping notification`);
      return;
    }

    try {
      // 检查邮件插件是否已安装
      const emailPlugin = strapi.plugin('email');
      if (!emailPlugin) {
        strapi.log.warn('Email plugin not configured, skipping notification');
        return;
      }

      const emailService = emailPlugin.service('email');

      // 生成邮件内容
      const htmlContent = await this.generateStatusEmail(order, oldStatus, newStatus);

      // 发送邮件
      await emailService.send({
        to: order.customerEmail,
        subject: `订单状态更新通知 - ${order.orderNumber}`,
        html: htmlContent
      });

      strapi.log.info(`Status notification sent for order ${order.orderNumber}`);
    } catch (error) {
      strapi.log.error('Failed to send status notification:', error);
      throw error;
    }
  },

  /**
   * 生成订单状态变更邮件内容
   *
   * @param {Object} order - 订单对象
   * @param {string} oldStatus - 旧状态
   * @param {string} newStatus - 新状态
   * @returns {Promise<string>} HTML 邮件内容
   */
  async generateStatusEmail(order, oldStatus, newStatus) {
    const toConfig = STATUS_CONFIG[newStatus];
    const toLabel = toConfig ? toConfig.label : newStatus;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

    // 生成订单明细 HTML
    let itemsHtml = '';
    if (order.items && order.items.length > 0) {
      itemsHtml = order.items.map(item => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          <td style="padding: 12px 0; color: #374151;">${item.productName || '商品'}</td>
          <td style="padding: 12px 0; text-align: center; color: #6b7280;">${item.quantity || 1}</td>
          <td style="padding: 12px 0; text-align: right; color: #374151; font-weight: 600;">
            ¥${(item.price || 0).toFixed(2)}
          </td>
        </tr>
      `).join('');
    }

    return `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>订单状态更新通知</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; background: #f9fafb;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">订单状态更新通知</h1>
    </div>

    <!-- Content -->
    <div style="padding: 40px 30px;">
      <p style="font-size: 16px; color: #4b5563; margin: 0 0 10px;">
        尊敬的 <strong>${order.customerName}</strong>，
      </p>

      <p style="font-size: 16px; color: #4b5563; margin: 0 0 30px;">
        您的订单状态已更新为：<strong style="color: #f97316; font-size: 18px;">${toLabel}</strong>
      </p>

      <!-- Order Info Card -->
      <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;">
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">订单编号</p>
          <p style="margin: 0; color: #f97316; font-size: 20px; font-weight: 600; letter-spacing: 0.5px;">
            ${order.orderNumber}
          </p>
        </div>

        <div style="border-bottom: 1px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 15px;">
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">订单金额</p>
          <p style="margin: 0; color: #111827; font-size: 24px; font-weight: 700;">¥${(order.totalAmount || 0).toFixed(2)}</p>
        </div>

        <div>
          <p style="margin: 0 0 8px; color: #6b7280; font-size: 14px;">配送地址</p>
          <p style="margin: 0; color: #111827; line-height: 1.6;">${order.shippingAddress}</p>
        </div>
      </div>

      ${itemsHtml ? `
      <!-- Order Items -->
      <div style="background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px;">
        <h3 style="margin: 0 0 20px; color: #111827; font-size: 18px;">订单商品</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="border-bottom: 2px solid #e5e7eb;">
              <th style="text-align: left; padding: 12px 0; color: #6b7280; font-size: 14px;">商品</th>
              <th style="text-align: center; padding: 12px 0; color: #6b7280; font-size: 14px;">数量</th>
              <th style="text-align: right; padding: 12px 0; color: #6b7280; font-size: 14px;">单价</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
      </div>
      ` : ''}

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${frontendUrl}/order/success?orderNumber=${order.orderNumber}"
           style="display: inline-block; background: #f97316; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
          查看订单详情
        </a>
      </div>

      <!-- Help Box -->
      <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 6px; margin-bottom: 20px;">
        <p style="margin: 0; color: #92400e; font-size: 14px;">
          <strong>需要帮助？</strong> 如有任何疑问，请回复此邮件或联系我们的客服团队。
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background: #f3f4f6; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="margin: 0 0 10px; color: #6b7280; font-size: 14px;">感谢您的购买！</p>
      <p style="margin: 0; color: #9ca3af; font-size: 12px;">此邮件由系统自动发送，请勿直接回复</p>
      <p style="margin: 20px 0 0; color: #9ca3af; font-size: 12px;">
        © ${new Date().getFullYear()} 您的商城. 保留所有权利.
      </p>
    </div>
  </div>
</body>
</html>
    `;
  },

  /**
   * 获取订单状态统计
   *
   * 功能：
   * - 统计各个状态的订单数量
   * - 返回总数和各状态数量
   *
   * @returns {Promise<Object>} 包含各状态数量的统计对象
   */
  async getStatusStatistics() {
    const orders = await this.findMany({
      fields: ['status']
    });

    const stats = {
      total: orders.length,
      pending: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0
    };

    orders.forEach(order => {
      if (stats.hasOwnProperty(order.status)) {
        stats[order.status]++;
      }
    });

    return stats;
  },

  /**
   * 获取状态配置信息
   *
   * 功能：
   * - 返回状态的显示配置
   * - 用于前端展示
   *
   * @returns {Object} 状态配置对象
   */
  getStatusConfig() {
    return STATUS_CONFIG;
  },

  /**
   * 获取允许的状态转换
   *
   * 功能：
   * - 返回某个状态可以转换到的所有状态
   *
   * @param {string} currentStatus - 当前状态
   * @returns {string[]} 允许转换到的状态数组
   */
  getAllowedTransitions(currentStatus) {
    return STATUS_TRANSITIONS[currentStatus] || [];
  }
}));
