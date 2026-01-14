'use strict';

/**
 * wishlist controller
 *
 * 功能说明：
 * - 管理用户收藏夹的 CRUD 操作
 * - 防止重复收藏
 * - 验证收藏所有权
 * - 提供切换收藏状态的便捷方法
 */

module.exports = {
  /**
   * 查找当前用户的所有收藏
   *
   * 端点：GET /api/wishlists
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 只返回当前登录用户的收藏
   * - 自动关联商品详细信息
   * - 按创建时间倒序排列
   */
  async find(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const wishlists = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: user.id,
      },
      populate: {
        product: {
          populate: ['images', 'category'],
        },
      },
      sort: ['createdAt:desc'],
    });

    return { data: wishlists || [] };
  },

  /**
   * 查找单个收藏（验证所有权）
   *
   * 端点：GET /api/wishlists/:id
   * 权限：需要登录（is-authenticated）
   */
  async findOne(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const wishlist = await strapi.entityService.findOne('api::wishlist.wishlist', id, {
      populate: {
        product: {
          populate: '*',
        },
      },
    });

    if (!wishlist) {
      return ctx.notFound('Wishlist item not found');
    }

    // 验证所有权
    if (wishlist.user.id !== user.id) {
      return ctx.forbidden('You do not have permission to access this wishlist item');
    }

    return { data: wishlist };
  },

  /**
   * 添加收藏
   *
   * 端点：POST /api/wishlists
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 自动关联当前用户
   * - 检查是否已收藏，避免重复
   * - 已收藏则返回错误提示
   */
  async create(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const { data } = ctx.request.body;
    const productId = data.product;

    // 检查是否已收藏该商品
    const existing = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: user.id,
        product: productId,
      },
    });

    if (existing.length > 0) {
      return ctx.badRequest('This product is already in your wishlist');
    }

    // 创建收藏
    const wishlist = await strapi.entityService.create('api::wishlist.wishlist', {
      data: {
        user: user.id,
        product: productId,
      },
      populate: {
        product: {
          populate: '*',
        },
      },
    });

    return { data: wishlist };
  },

  /**
   * 删除收藏
   *
   * 端点：DELETE /api/wishlists/:id
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 验证收藏所有权
   * - 删除收藏
   */
  async delete(ctx) {
    const { id } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    // 验证所有权
    const existingWishlist = await strapi.entityService.findOne('api::wishlist.wishlist', id);

    if (!existingWishlist) {
      return ctx.notFound('Wishlist item not found');
    }

    if (existingWishlist.user !== user.id) {
      return ctx.forbidden('You do not have permission to delete this wishlist item');
    }

    // 删除收藏
    const wishlist = await strapi.entityService.delete('api::wishlist.wishlist', id);

    return { data: wishlist };
  },

  /**
   * 切换收藏状态
   *
   * 端点：POST /api/wishlists/toggle
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 如果已收藏则取消收藏
   * - 如果未收藏则添加收藏
   * - 返回操作后的状态
   *
   * 请求体：
   * {
   *   "data": {
   *     "product": productId
   *   }
   * }
   */
  async toggle(ctx) {
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const { data } = ctx.request.body;
    const productId = data.product;

    if (!productId) {
      return ctx.badRequest('Product ID is required');
    }

    // 检查是否已收藏
    const existing = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: user.id,
        product: productId,
      },
    });

    if (existing.length > 0) {
      // 已收藏，删除收藏
      await strapi.entityService.delete('api::wishlist.wishlist', existing[0].id);

      return {
        data: {
          isFavorited: false,
          message: 'Product removed from wishlist',
        },
      };
    } else {
      // 未收藏，添加收藏
      const wishlist = await strapi.entityService.create('api::wishlist.wishlist', {
        data: {
          user: user.id,
          product: productId,
        },
        populate: {
          product: {
            populate: '*',
          },
        },
      });

      return {
        data: {
          isFavorited: true,
          wishlist,
          message: 'Product added to wishlist',
        },
      };
    }
  },

  /**
   * 检查商品是否已收藏
   *
   * 端点：GET /api/wishlists/check/:productId
   * 权限：需要登录（is-authenticated）
   *
   * 功能：
   * - 返回指定商品的收藏状态
   */
  async check(ctx) {
    const { productId } = ctx.params;
    const user = ctx.state.user;

    if (!user) {
      return ctx.unauthorized('You are not authenticated');
    }

    const existing = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: user.id,
        product: productId,
      },
    });

    return {
      data: {
        isFavorited: existing.length > 0,
        wishlistId: existing.length > 0 ? existing[0].id : null,
      },
    };
  },
};
