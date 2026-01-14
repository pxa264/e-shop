'use strict';

/**
 * user-profile controller
 * 
 * 独立的用户资料管理控制器
 */

const bcrypt = require('bcryptjs');

module.exports = {
  /**
   * 获取当前用户详细信息
   */
  async me(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const data = await strapi.entityService.findOne(
      'plugin::users-permissions.user',
      user.id,
      {
        populate: {
          addresses: {
            sort: ['isDefault:desc', 'createdAt:desc'],
          },
          wishlists: {
            populate: {
              product: {
                populate: ['images', 'category'],
              },
            },
          },
          orders: {
            sort: ['createdAt:desc'],
          },
        },
      }
    );

    return {
      data: {
        id: data.id,
        username: data.username,
        email: data.email,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        addresses: data.addresses || [],
        wishlists: data.wishlists || [],
        orders: data.orders || [],
      },
    };
  },

  /**
   * 更新用户资料
   */
  async updateProfile(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const body = ctx.request.body.data || ctx.request.body;
    const { username, email } = body;

    // 验证邮箱唯一性
    if (email && email !== user.email) {
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          email,
          id: { $ne: user.id },
        },
      });

      if (existingUser) {
        return ctx.badRequest('Email is already taken');
      }
    }

    // 更新用户资料（只更新 Strapi 默认支持的字段）
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;

    const updatedUser = await strapi.entityService.update(
      'plugin::users-permissions.user',
      user.id,
      { data: updateData }
    );

    return {
      data: {
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
      },
    };
  },

  /**
   * 修改密码
   */
  async changePassword(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const body = ctx.request.body.data || ctx.request.body;
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return ctx.badRequest('Current password and new password are required');
    }

    if (newPassword.length < 6) {
      return ctx.badRequest('New password must be at least 6 characters long');
    }

    // 获取用户完整信息（包含密码）
    const fullUser = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
    });

    // 验证当前密码
    const validPassword = await bcrypt.compare(currentPassword, fullUser.password);
    if (!validPassword) {
      return ctx.badRequest('Current password is incorrect');
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await strapi.entityService.update(
      'plugin::users-permissions.user',
      user.id,
      { data: { password: hashedPassword } }
    );

    return {
      data: {
        message: 'Password changed successfully',
      },
    };
  },

  /**
   * 获取用户订单列表
   */
  async getMyOrders(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const { status, limit = 10, start = 0 } = ctx.query;

    const filters = { user: user.id };
    if (status) {
      filters.status = status;
    }

    const orders = await strapi.entityService.findMany('api::order.order', {
      filters,
      sort: ['createdAt:desc'],
      limit: parseInt(limit),
      start: parseInt(start),
      populate: ['items', 'histories'],
    });

    const total = await strapi.entityService.count('api::order.order', { filters });

    return {
      data: orders,
      meta: {
        total,
        page: Math.floor(start / limit) + 1,
        pageSize: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * 获取用户统计信息
   */
  async getMyStatistics(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const [orderCount, wishlistCount, addressCount] = await Promise.all([
      strapi.entityService.count('api::order.order', { filters: { user: user.id } }),
      strapi.entityService.count('api::wishlist.wishlist', { filters: { user: user.id } }),
      strapi.entityService.count('api::user-address.user-address', { filters: { user: user.id } }),
    ]);

    // 按状态统计订单
    const [pendingOrders, processingOrders, shippedOrders, completedOrders, cancelledOrders] = await Promise.all([
      strapi.entityService.count('api::order.order', { filters: { user: user.id, status: 'pending' } }),
      strapi.entityService.count('api::order.order', { filters: { user: user.id, status: 'processing' } }),
      strapi.entityService.count('api::order.order', { filters: { user: user.id, status: 'shipped' } }),
      strapi.entityService.count('api::order.order', { filters: { user: user.id, status: 'completed' } }),
      strapi.entityService.count('api::order.order', { filters: { user: user.id, status: 'cancelled' } }),
    ]);

    return {
      data: {
        orders: {
          total: orderCount,
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
        addressCount,
        wishlistCount,
      },
    };
  },
};
