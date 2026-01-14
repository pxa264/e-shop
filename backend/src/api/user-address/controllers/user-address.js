'use strict';

/**
 * user-address controller
 *
 * 功能说明：
 * - 管理用户收货地址的 CRUD 操作
 * - 处理默认地址逻辑（设置新默认地址时取消其他地址的默认状态）
 * - 验证地址所有权，确保用户只能操作自己的地址
 */

module.exports = {
  /**
   * 查找当前用户的所有地址
   *
   * 端点：GET /api/user-addresses
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 只返回当前登录用户的地址
   * - 默认地址排在前面
   */
  async find(ctx) {
    // 获取当前用户
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 查询当前用户的地址，默认地址排在前面
    const addresses = await strapi.entityService.findMany('api::user-address.user-address', {
      filters: {
        user: user.id,
      },
      sort: ['isDefault:desc', 'createdAt:desc'],
      populate: ['user'],
    });

    return { data: addresses || [] };
  },

  /**
   * 查找单个地址（验证所有权）
   *
   * 端点：GET /api/user-addresses/:id
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 验证地址是否属于当前用户
   * - 不属于则返回 403 错误
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const address = await strapi.entityService.findOne('api::user-address.user-address', id, {
      populate: '*',
    });

    if (!address) {
      return ctx.notFound('Address not found');
    }

    // 验证所有权
    if (address.user.id !== user.id) {
      return ctx.forbidden('You do not have permission to access this address');
    }

    return { data: address };
  },

  /**
   * 创建新地址
   *
   * 端点：POST /api/user-addresses
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 自动关联当前用户
   * - 如果设置为默认地址，取消其他地址的默认状态
   */
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const { data } = ctx.request.body;
    const isDefault = data.isDefault || false;

    // 如果设置为默认地址，先取消其他地址的默认状态
    if (isDefault) {
      const defaultAddresses = await strapi.entityService.findMany('api::user-address.user-address', {
        filters: {
          user: user.id,
          isDefault: true,
        },
        fields: ['id'],
      });

      for (const addr of defaultAddresses) {
        await strapi.entityService.update('api::user-address.user-address', addr.id, {
          data: { isDefault: false },
        });
      }
    }

    // 创建新地址，自动关联当前用户
    const address = await strapi.entityService.create('api::user-address.user-address', {
      data: {
        ...data,
        user: user.id,
      },
      populate: '*',
    });

    return { data: address };
  },

  /**
   * 更新地址
   *
   * 端点：PUT /api/user-addresses/:id
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 验证地址所有权
   * - 处理默认地址逻辑
   */
  async update(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 验证所有权
    const existingAddress = await strapi.entityService.findOne('api::user-address.user-address', id, {
      populate: ['user'],
    });

    if (!existingAddress) {
      return ctx.notFound('Address not found');
    }

    if ((existingAddress.user?.id || existingAddress.user) !== user.id) {
      return ctx.forbidden('You do not have permission to update this address');
    }

    const { data } = ctx.request.body;
    const isDefault = data.isDefault || false;

    // 如果设置为默认地址，先取消其他地址的默认状态
    if (isDefault) {
      const defaultAddresses = await strapi.entityService.findMany('api::user-address.user-address', {
        filters: {
          user: user.id,
          isDefault: true,
        },
        fields: ['id'],
      });

      for (const addr of defaultAddresses) {
        if (addr.id !== Number(id)) {
          await strapi.entityService.update('api::user-address.user-address', addr.id, {
            data: { isDefault: false },
          });
        }
      }
    }

    // 更新地址
    const address = await strapi.entityService.update('api::user-address.user-address', id, {
      data,
      populate: '*',
    });

    return { data: address };
  },

  /**
   * 删除地址
   *
   * 端点：DELETE /api/user-addresses/:id
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 验证地址所有权
   * - 删除地址
   */
  async delete(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 验证所有权
    const existingAddress = await strapi.entityService.findOne(
      'api::user-address.user-address',
      id,
      { populate: ['user'] }
    );

    if (!existingAddress) {
      return ctx.notFound('Address not found');
    }

    if ((existingAddress.user?.id || existingAddress.user) !== user.id) {
      return ctx.forbidden('You do not have permission to delete this address');
    }

    // 删除地址
    const address = await strapi.entityService.delete('api::user-address.user-address', id);

    return { data: address };
  },

  /**
   * 设置默认地址
   *
   * 端点：POST /api/user-addresses/:id/set-default
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 验证地址所有权
   * - 取消其他地址的默认状态
   * - 将当前地址设置为默认
   */
  async setDefault(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 验证所有权
    const existingAddress = await strapi.entityService.findOne(
      'api::user-address.user-address',
      id,
      { populate: ['user'] }
    );

    if (!existingAddress) {
      return ctx.notFound('Address not found');
    }

    if ((existingAddress.user?.id || existingAddress.user) !== user.id) {
      return ctx.forbidden('You do not have permission to update this address');
    }

    // 取消其他地址的默认状态 - 查找所有默认地址并更新
    const defaultAddresses = await strapi.entityService.findMany('api::user-address.user-address', {
      filters: {
        user: user.id,
        isDefault: true,
      },
      fields: ['id'],
    });

    // 逐个取消默认状态
    for (const addr of defaultAddresses) {
      await strapi.entityService.update('api::user-address.user-address', addr.id, {
        data: { isDefault: false },
      });
    }

    // 设置当前地址为默认
    const address = await strapi.entityService.update('api::user-address.user-address', id, {
      data: {
        isDefault: true,
      },
      populate: '*',
    });

    return { data: address };
  },
};
