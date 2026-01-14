'use strict';

/**
 * User controller extension
 *
 * 功能说明：
 * - 扩展 Users & Permissions 插件的 User controller
 * - 添加用户端 API 方法
 * - 提供用户资料管理、密码修改、订单查询等功能
 *
 * 注意：
 * - 这个文件会覆盖默认的 User controller
 * - 保留原有的功能，添加新的自定义方法
 */

module.exports = (plugin) => {
  const { controllers } = plugin;

  /**
   * 获取当前用户详细信息
   *
   * 端点：GET /api/users/me
   * 权限：需要登录
   *
   * 功能：
   * - 返回当前登录用户的完整信息
   * - 包含关联数据（地址、收藏等）
   */
  controllers.user.me = async (ctx) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 查询用户详细信息，包含关联数据
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
                populate: '*',
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
        phone: data.phone,
        avatar: data.avatar,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        addresses: data.addresses || [],
        wishlists: data.wishlists || [],
        orders: data.orders || [],
      },
    };
  };

  /**
   * 更新用户资料
   *
   * 端点：PUT /api/users/me
   * 权限：需要登录
   *
   * 功能：
   * - 允许用户更新自己的资料
   * - 可更新字段：username, email, phone, avatar
   * - 不允许直接更新 password（使用 changePassword 方法）
   */
  controllers.user.updateProfile = async (ctx) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 支持两种格式：{ data: {...} } 或直接 {...}
    const body = ctx.request.body.data || ctx.request.body;
    const { username, email, phone, avatar } = body;

    // 验证邮箱是否已被其他用户使用
    if (email) {
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

    // 验证手机号是否已被其他用户使用
    if (phone) {
      const existingUser = await strapi.query('plugin::users-permissions.user').findOne({
        where: {
          phone,
          id: { $ne: user.id },
        },
      });

      if (existingUser) {
        return ctx.badRequest('Phone number is already taken');
      }
    }

    // 更新用户资料
    const data = await strapi.entityService.update(
      'plugin::users-permissions.user',
      user.id,
      {
        data: {
          ...(username && { username }),
          ...(email && { email }),
          ...(phone && { phone }),
          ...(avatar && { avatar }),
        },
      }
    );

    return {
      data: {
        id: data.id,
        username: data.username,
        email: data.email,
        phone: data.phone,
        avatar: data.avatar,
        updatedAt: data.updatedAt,
      },
    };
  };

  /**
   * 修改密码
   *
   * 端点：POST /api/users/me/change-password
   * 权限：需要登录
   *
   * 请求体：
   * {
   *   "data": {
   *     "currentPassword": "oldPassword",
   *     "newPassword": "newPassword"
   *   }
   * }
   *
   * 功能：
   * - 验证当前密码是否正确
   * - 验证新密码是否符合要求
   * - 更新密码
   */
  controllers.user.changePassword = async (ctx) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 支持两种格式：{ data: {...} } 或直接 {...}
    const body = ctx.request.body.data || ctx.request.body;
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return ctx.badRequest('Current password and new password are required');
    }

    // 验证密码长度
    if (newPassword.length < 6) {
      return ctx.badRequest('New password must be at least 6 characters long');
    }

    // 获取用户完整信息（包含密码）
    const userWithPassword = await strapi.query('plugin::users-permissions.user').findOne({
      where: { id: user.id },
    });

    // 验证当前密码
    const validPassword = await strapi
      .plugin('users-permissions')
      .service('user')
      .validatePassword(currentPassword, userWithPassword.password);

    if (!validPassword) {
      return ctx.badRequest('Current password is incorrect');
    }

    // 更新密码
    await strapi.entityService.update('plugin::users-permissions.user', user.id, {
      data: {
        password: newPassword,
      },
    });

    return {
      data: {
        message: 'Password changed successfully',
      },
    };
  };

  /**
   * 获取当前用户的订单列表
   *
   * 端点：GET /api/users/me/orders
   * 权限：需要登录
   *
   * 查询参数：
   * - status: 筛选订单状态（可选）
   * - limit: 限制返回数量（可选）
   * - start: 分页起始位置（可选）
   *
   * 功能：
   * - 返回当前用户的所有订单
   * - 支持按状态筛选
   * - 支持分页
   * - 包含订单明细和状态历史
   */
  controllers.user.getMyOrders = async (ctx) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const { status, limit = 10, start = 0 } = ctx.query;

    // 构建查询条件
    const filters = {
      user: user.id,
    };

    if (status) {
      filters.status = status;
    }

    // 查询订单
    const { results, total } = await strapi.entityService.findMany('api::order.order', {
      filters,
      populate: {
        items: true,
        histories: {
          sort: ['changedAt:desc'],
        },
      },
      sort: ['createdAt:desc'],
      limit: parseInt(limit),
      start: parseInt(start),
    });

    // 计算分页信息
    const totalPages = Math.ceil(total / limit);

    return {
      data: results,
      meta: {
        total,
        page: Math.floor(start / limit) + 1,
        pageSize: parseInt(limit),
        totalPages,
      },
    };
  };

  /**
   * 获取当前用户的统计信息
   *
   * 端点：GET /api/users/me/statistics
   * 权限：需要登录
   *
   * 功能：
   * - 返回订单统计（待付款、待发货、已完成等）
   * - 返回地址数量
   * - 返回收藏数量
   */
  controllers.user.getMyStatistics = async (ctx) => {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 统计各状态订单数量
    const orders = await strapi.entityService.findMany('api::order.order', {
      filters: {
        user: user.id,
      },
      fields: ['status'],
    });

    const orderStats = {
      pending: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
      cancelled: 0,
      total: orders.length,
    };

    orders.forEach((order) => {
      if (orderStats.hasOwnProperty(order.status)) {
        orderStats[order.status]++;
      }
    });

    // 统计地址数量
    const addressCount = await strapi.entityService.count('api::user-address.user-address', {
      filters: {
        user: user.id,
      },
    });

    // 统计收藏数量
    const wishlistCount = await strapi.entityService.count('api::wishlist.wishlist', {
      filters: {
        user: user.id,
      },
    });

    return {
      data: {
        orders: orderStats,
        addressCount,
        wishlistCount,
      },
    };
  };

  return plugin;
};
