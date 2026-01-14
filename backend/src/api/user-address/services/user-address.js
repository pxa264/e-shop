'use strict';

/**
 * user-address service
 *
 * 功能说明：
 * - 提供地址业务逻辑层
 * - 处理默认地址的复杂逻辑
 * - 地址验证和查询辅助方法
 */

module.exports = {
  /**
   * 获取用户的默认地址
   *
   * @param {number} userId - 用户 ID
   * @returns {Promise<Object|null>} 默认地址对象，如果没有则返回 null
   */
  async getDefaultAddress(userId) {
    const addresses = await strapi.entityService.findMany('api::user-address.user-address', {
      filters: {
        user: userId,
        isDefault: true,
      },
      populate: '*',
    });

    return addresses.length > 0 ? addresses[0] : null;
  },

  /**
   * 获取用户的所有地址数量
   *
   * @param {number} userId - 用户 ID
   * @returns {Promise<number>} 地址数量
   */
  async getAddressCount(userId) {
    const addresses = await strapi.entityService.findMany('api::user-address.user-address', {
      filters: {
        user: userId,
      },
    });

    return addresses.length;
  },

  /**
   * 检查地址是否属于指定用户
   *
   * @param {number} addressId - 地址 ID
   * @param {number} userId - 用户 ID
   * @returns {Promise<boolean>} 是否属于该用户
   */
  async isOwner(addressId, userId) {
    const address = await strapi.entityService.findOne('api::user-address.user-address', addressId);

    if (!address) {
      return false;
    }

    return address.user === userId;
  },

  /**
   * 取消用户所有地址的默认状态
   *
   * @param {number} userId - 用户 ID
   * @returns {Promise<void>}
   */
  async clearAllDefaults(userId) {
    await strapi.entityService.updateMany('api::user-address.user-address', {
      filters: {
        user: userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  },
};
