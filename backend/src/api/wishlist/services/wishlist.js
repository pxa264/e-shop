'use strict';

/**
 * wishlist service
 *
 * 功能说明：
 * - 提供收藏夹业务逻辑层
 * - 处理收藏状态查询
 * - 收藏验证和查询辅助方法
 */

module.exports = {
  /**
   * 检查用户是否已收藏指定商品
   *
   * @param {number} userId - 用户 ID
   * @param {number} productId - 商品 ID
   * @returns {Promise<boolean>} 是否已收藏
   */
  async isFavorited(userId, productId) {
    const existing = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: userId,
        product: productId,
      },
    });

    return existing.length > 0;
  },

  /**
   * 获取用户的所有收藏商品 ID
   *
   * @param {number} userId - 用户 ID
   * @returns {Promise<number[]>} 商品 ID 数组
   */
  async getFavoritedProductIds(userId) {
    const wishlists = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: userId,
      },
      fields: ['product'],
    });

    return wishlists.map((w) => w.product);
  },

  /**
   * 获取用户的收藏数量
   *
   * @param {number} userId - 用户 ID
   * @returns {Promise<number>} 收藏数量
   */
  async getWishlistCount(userId) {
    const wishlists = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: userId,
      },
    });

    return wishlists.length;
  },

  /**
   * 清除用户的所有收藏
   *
   * @param {number} userId - 用户 ID
   * @returns {Promise<void>}
   */
  async clearAll(userId) {
    const wishlists = await strapi.entityService.findMany('api::wishlist.wishlist', {
      filters: {
        user: userId,
      },
    });

    for (const wishlist of wishlists) {
      await strapi.entityService.delete('api::wishlist.wishlist', wishlist.id);
    }
  },
};
