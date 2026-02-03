/**
 * @fileoverview Role and Permission Helper Utilities
 * @description Provides permission-related functions for ops-dashboard plugin.
 *              Includes methods for checking user permissions, building filters,
 *              and retrieving merchant-specific data based on Content Manager settings.
 * @module ops-dashboard/utils/role-helper
 */

'use strict';

const {
  isSuperAdmin,
  getUserId,
  getCreatedByFilter,
  getPermissionConditions,
  buildFilterFromPermissions,
  canAccessEntity,
} = require('./permission-sync');

/**
 * Get merchant's product IDs based on Content Manager permissions.
 * Uses the Content Manager permission settings to determine which products
 * the current user can access.
 *
 * @param {object} strapi - Strapi instance
 * @param {object} adminUser - Current admin user object
 * @returns {Promise<number[]|null>} Array of product IDs the user can access,
 *                                    or null if user is Super Admin (no filtering needed)
 *
 * @example
 * const productIds = await getMerchantProductIds(strapi, ctx.state.user);
 * if (productIds === null) {
 *   // Super Admin - can access all products
 * } else if (productIds.length === 0) {
 *   // User has no products
 * } else {
 *   // Filter by productIds
 * }
 */
const getMerchantProductIds = async (strapi, adminUser) => {
  // Use Content Manager permission sync to get filter
  const permissionFilter = await buildFilterFromPermissions(
    strapi,
    adminUser,
    'api::product.product',
    'find'
  );

  // No filter means Super Admin - return null to indicate no filtering needed
  if (!permissionFilter) {
    return null;
  }

  // Get products matching the permission filter
  const products = await strapi.entityService.findMany('api::product.product', {
    filters: permissionFilter,
    fields: ['id'],
  });

  return products.map(p => p.id);
};

/**
 * Get merchant's order IDs based on their products.
 * Since Strapi doesn't support deep nested filtering (e.g., orderItems.productId),
 * this uses a two-step query approach.
 *
 * @param {object} strapi - Strapi instance
 * @param {number[]|null} merchantProductIds - Product IDs from getMerchantProductIds
 * @returns {Promise<number[]|null>} Array of order IDs containing merchant's products,
 *                                    or null if no filtering needed (Super Admin)
 *
 * @example
 * const productIds = await getMerchantProductIds(strapi, adminUser);
 * const orderIds = await getMerchantOrderIds(strapi, productIds);
 */
const getMerchantOrderIds = async (strapi, merchantProductIds) => {
  // Super Admin - no filtering needed
  if (merchantProductIds === null) {
    return null;
  }

  // No products - no orders
  if (merchantProductIds.length === 0) {
    return [];
  }

  // Step 1: Query order-items containing merchant's products
  const orderItems = await strapi.entityService.findMany('api::order-item.order-item', {
    filters: {
      productId: { $in: merchantProductIds },
    },
    populate: ['order'],
  });

  // Step 2: Extract unique order IDs
  const orderIds = [...new Set(
    orderItems.map(item => item.order?.id).filter(Boolean)
  )];

  return orderIds;
};

/**
 * Get merchant's orders and customer IDs in a single operation.
 * This is an optimized version that returns both order IDs and customer IDs
 * to avoid multiple queries.
 *
 * @param {object} strapi - Strapi instance
 * @param {number[]|null} merchantProductIds - Product IDs from getMerchantProductIds
 * @returns {Promise<{orderIds: number[]|null, customerIds: number[]|null, orders: object[]|null}>}
 *          Object containing orderIds, customerIds, and cached orders array
 *
 * @example
 * const productIds = await getMerchantProductIds(strapi, adminUser);
 * const { orderIds, customerIds, orders } = await getMerchantOrdersAndCustomers(strapi, productIds);
 */
const getMerchantOrdersAndCustomers = async (strapi, merchantProductIds) => {
  // Super Admin - no filtering needed
  if (merchantProductIds === null) {
    return { orderIds: null, customerIds: null, orders: null };
  }

  // No products - no orders or customers
  if (merchantProductIds.length === 0) {
    return { orderIds: [], customerIds: [], orders: [] };
  }

  // Step 1: Query order-items containing merchant's products
  const orderItems = await strapi.entityService.findMany('api::order-item.order-item', {
    filters: {
      productId: { $in: merchantProductIds },
    },
    populate: ['order'],
  });

  // Step 2: Extract unique order IDs
  const orderIds = [...new Set(
    orderItems.map(item => item.order?.id).filter(Boolean)
  )];

  if (orderIds.length === 0) {
    return { orderIds: [], customerIds: [], orders: [] };
  }

  // Step 3: Get orders with user information
  const orders = await strapi.entityService.findMany('api::order.order', {
    filters: { id: { $in: orderIds } },
    populate: ['user'],
  });

  // Step 4: Extract unique customer IDs
  const customerIds = [...new Set(
    orders.map(o => o.user?.id).filter(Boolean)
  )];

  return { orderIds, customerIds, orders };
};

module.exports = {
  // Basic permission functions (re-exported from permission-sync)
  isSuperAdmin,
  getUserId,

  // Quick mode (hardcoded, no database query)
  getCreatedByFilter,

  // Sync mode (reads Content Manager permissions)
  getPermissionConditions,
  buildFilterFromPermissions,
  canAccessEntity,

  // Merchant data helpers
  getMerchantProductIds,
  getMerchantOrderIds,
  getMerchantOrdersAndCustomers,
};
