/**
 * @fileoverview Product Bulk Operations Service
 * @description Handles batch operations for products with permission checks.
 *              Includes bulk publish, category update, price/stock adjustments,
 *              and deletion. All operations use Content Manager permission settings.
 * @module ops-dashboard/services/product-bulk
 */

'use strict';

const { canAccessEntity } = require('../utils/permission-sync');

module.exports = ({ strapi }) => ({
  /**
   * Verify product access using Content Manager permissions.
   * Uses Content Manager permission settings.
   *
   * @param {number} productId - Product ID to verify
   * @param {object} adminUser - Current admin user
   * @param {string} operation - Operation type (update/delete)
   * @returns {Promise<boolean>} True if user has access
   */
  async verifyAccess(productId, adminUser, operation = 'update') {
    const product = await strapi.entityService.findOne('api::product.product', productId, {
      populate: ['createdBy'],
    });
    if (!product) return false;

    return canAccessEntity(strapi, adminUser, 'api::product.product', product, operation);
  },

  /**
   * Bulk publish/unpublish products.
   * Uses Content Manager permission settings.
   *
   * @param {number[]} productIds - Array of product IDs
   * @param {boolean} shouldPublish - Whether to publish or unpublish
   * @param {object} adminUser - Current admin user
   * @returns {Promise<{success: number[], failed: {id: number, error: string}[]}>}
   */
  async bulkPublish(productIds, shouldPublish, adminUser) {
    try {
      const results = {
        success: [],
        failed: [],
      };

      for (const id of productIds) {
        try {
          // Check permission using Content Manager settings
          const canAccess = await this.verifyAccess(id, adminUser, 'update');
          if (!canAccess) {
            results.failed.push({ id, error: 'Permission denied' });
            continue;
          }

          if (shouldPublish) {
            await strapi.entityService.update('api::product.product', id, {
              data: { publishedAt: new Date() },
            });
          } else {
            await strapi.entityService.update('api::product.product', id, {
              data: { publishedAt: null },
            });
          }
          results.success.push(id);
        } catch (error) {
          results.failed.push({ id, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk update category.
   * Uses Content Manager permission settings.
   *
   * @param {number[]} productIds - Array of product IDs
   * @param {number} categoryId - Target category ID
   * @param {object} adminUser - Current admin user
   * @returns {Promise<{success: number[], failed: {id: number, error: string}[]}>}
   */
  async bulkUpdateCategory(productIds, categoryId, adminUser) {
    try {
      const results = {
        success: [],
        failed: [],
      };

      for (const id of productIds) {
        try {
          // Check permission using Content Manager settings
          const canAccess = await this.verifyAccess(id, adminUser, 'update');
          if (!canAccess) {
            results.failed.push({ id, error: 'Permission denied' });
            continue;
          }

          await strapi.entityService.update('api::product.product', id, {
            data: { category: categoryId },
          });
          results.success.push(id);
        } catch (error) {
          results.failed.push({ id, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk update price.
   * Uses Content Manager permission settings.
   *
   * @param {number[]} productIds - Array of product IDs
   * @param {{operation: string, value: number}} priceData - Price operation data
   * @param {object} adminUser - Current admin user
   * @returns {Promise<{success: number[], failed: {id: number, error: string}[]}>}
   */
  async bulkUpdatePrice(productIds, priceData, adminUser) {
    try {
      const results = {
        success: [],
        failed: [],
      };

      const { operation, value } = priceData;

      for (const id of productIds) {
        try {
          // Check permission using Content Manager settings
          const canAccess = await this.verifyAccess(id, adminUser, 'update');
          if (!canAccess) {
            results.failed.push({ id, error: 'Permission denied' });
            continue;
          }

          const product = await strapi.entityService.findOne('api::product.product', id, {
            fields: ['price'],
          });

          let newPrice = product.price;

          switch (operation) {
            case 'set':
              newPrice = parseFloat(value);
              break;
            case 'increase':
              newPrice = product.price + parseFloat(value);
              break;
            case 'decrease':
              newPrice = product.price - parseFloat(value);
              break;
            case 'percentage':
              newPrice = product.price * (1 + parseFloat(value) / 100);
              break;
          }

          // Price boundary checks
          if (newPrice < 0) newPrice = 0;
          if (newPrice > 999999.99) newPrice = 999999.99;
          newPrice = Math.round(newPrice * 100) / 100; // Round to 2 decimal places

          await strapi.entityService.update('api::product.product', id, {
            data: { price: newPrice },
          });
          results.success.push(id);
        } catch (error) {
          results.failed.push({ id, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk update stock.
   * Uses Content Manager permission settings.
   *
   * @param {number[]} productIds - Array of product IDs
   * @param {{operation: string, value: number}} stockData - Stock operation data
   * @param {object} adminUser - Current admin user
   * @returns {Promise<{success: number[], failed: {id: number, error: string}[]}>}
   */
  async bulkUpdateStock(productIds, stockData, adminUser) {
    try {
      const results = {
        success: [],
        failed: [],
      };

      const { operation, value } = stockData;

      for (const id of productIds) {
        try {
          // Check permission using Content Manager settings
          const canAccess = await this.verifyAccess(id, adminUser, 'update');
          if (!canAccess) {
            results.failed.push({ id, error: 'Permission denied' });
            continue;
          }

          const product = await strapi.entityService.findOne('api::product.product', id, {
            fields: ['stock'],
          });

          let newStock = product.stock;

          switch (operation) {
            case 'set':
              newStock = parseInt(value);
              break;
            case 'increase':
              newStock = product.stock + parseInt(value);
              break;
            case 'decrease':
              newStock = Math.max(0, product.stock - parseInt(value));
              break;
          }

          await strapi.entityService.update('api::product.product', id, {
            data: { stock: newStock },
          });
          results.success.push(id);
        } catch (error) {
          results.failed.push({ id, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Bulk delete products.
   * Uses Content Manager permission settings.
   *
   * @param {number[]} productIds - Array of product IDs
   * @param {object} adminUser - Current admin user
   * @returns {Promise<{success: number[], failed: {id: number, error: string}[]}>}
   */
  async bulkDelete(productIds, adminUser) {
    try {
      const results = {
        success: [],
        failed: [],
      };

      for (const id of productIds) {
        try {
          // Check permission using Content Manager settings
          const canAccess = await this.verifyAccess(id, adminUser, 'delete');
          if (!canAccess) {
            results.failed.push({ id, error: 'Permission denied' });
            continue;
          }

          await strapi.entityService.delete('api::product.product', id);
          results.success.push(id);
        } catch (error) {
          results.failed.push({ id, error: error.message });
        }
      }

      return results;
    } catch (error) {
      throw error;
    }
  },
});
