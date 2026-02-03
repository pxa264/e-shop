/**
 * @fileoverview Order Management Controller
 * @description Handles order-related operations including listing, exporting,
 *              and statistics. Implements permission-based filtering using
 *              Content Manager settings.
 * @module ops-dashboard/controllers/order
 */

'use strict';

const {
  getMerchantProductIds,
  getMerchantOrderIds,
} = require('../utils/role-helper');

module.exports = {
  /**
   * Get orders list with filters.
   * Filters orders based on merchant's products using Content Manager permissions.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getOrders(ctx) {
    try {
      // Validate user authentication
      const adminUser = ctx.state.user;
      if (!adminUser || !adminUser.id) {
        return ctx.unauthorized('Authentication required');
      }

      const {
        page = 1,
        pageSize = 10,
        search,
        status,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
      } = ctx.query;

      // Build filters
      const filters = {};

      // Get merchant's order IDs using two-step query
      const merchantProductIds = await getMerchantProductIds(strapi, adminUser);
      const merchantOrderIds = await getMerchantOrderIds(strapi, merchantProductIds);

      if (merchantOrderIds !== null) {
        if (merchantOrderIds.length === 0) {
          // No related orders - return empty result
          return ctx.body = {
            data: {
              results: [],
              pagination: { page: 1, pageSize: parseInt(pageSize), pageCount: 0, total: 0 },
            },
          };
        }
        filters.id = { $in: merchantOrderIds };
      }

      // Search filter (customer email or order number)
      if (search) {
        filters.$or = [
          { orderNumber: { $containsi: search } },
          { user: { email: { $containsi: search } } },
        ];
      }

      // Status filter
      if (status) {
        filters.status = status;
      }

      // Date range filter
      if (dateFrom || dateTo) {
        filters.createdAt = {};
        if (dateFrom) {
          filters.createdAt.$gte = new Date(dateFrom);
        }
        if (dateTo) {
          filters.createdAt.$lte = new Date(dateTo);
        }
      }

      // Amount range filter
      if (minAmount || maxAmount) {
        filters.totalAmount = {};
        if (minAmount) {
          filters.totalAmount.$gte = parseFloat(minAmount);
        }
        if (maxAmount) {
          filters.totalAmount.$lte = parseFloat(maxAmount);
        }
      }

      const orders = await strapi.entityService.findPage('api::order.order', {
        page,
        pageSize,
        filters,
        populate: {
          user: {
            fields: ['username', 'email'],
          },
          orderItems: {
            populate: {
              product: {
                fields: ['name', 'price'],
              },
            },
          },
        },
        sort: { createdAt: 'desc' },
      });

      ctx.body = { data: orders };
    } catch (error) {
      strapi.log.error('[ops-dashboard] getOrders failed:', error);
      ctx.throw(500, error.message || 'Failed to fetch orders');
    }
  },

  /**
   * Export orders to CSV format.
   * Filters orders based on merchant's products using Content Manager permissions.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async exportOrders(ctx) {
    try {
      // Validate user authentication
      const adminUser = ctx.state.user;
      if (!adminUser || !adminUser.id) {
        return ctx.unauthorized('Authentication required');
      }

      const { orderIds, fields, filters: clientFilters } = ctx.request.body;

      // Get merchant's order IDs using two-step query
      const merchantProductIds = await getMerchantProductIds(strapi, adminUser);
      const merchantOrderIds = await getMerchantOrderIds(strapi, merchantProductIds);

      // Build merchant filter
      let merchantFilter = {};
      if (merchantOrderIds !== null) {
        if (merchantOrderIds.length === 0) {
          // No related orders - return empty CSV
          ctx.set('Content-Type', 'text/csv; charset=utf-8');
          ctx.set('Content-Disposition', `attachment; filename=orders-${Date.now()}.csv`);
          ctx.body = 'No orders found';
          return;
        }
        merchantFilter = { id: { $in: merchantOrderIds } };
      }

      // Clean empty filter values
      const cleanFilters = (filters) => {
        if (!filters || typeof filters !== 'object') return {};
        const cleaned = {};
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== '' && value !== null && value !== undefined) {
            cleaned[key] = value;
          }
        });
        return cleaned;
      };

      const validClientFilters = cleanFilters(clientFilters);
      const hasClientFilters = Object.keys(validClientFilters).length > 0;

      let orders;

      // Export selected orders (with merchant filter)
      if (orderIds && orderIds.length > 0) {
        // Filter to only include orders the merchant has permission for
        const allowedOrderIds = merchantOrderIds !== null
          ? orderIds.filter(id => merchantOrderIds.includes(id))
          : orderIds;

        orders = await strapi.entityService.findMany('api::order.order', {
          filters: { id: { $in: allowedOrderIds } },
          populate: {
            user: true,
            orderItems: true,
          },
        });
      }
      // Export filtered orders (with merchant filter)
      else if (hasClientFilters) {
        orders = await strapi.entityService.findMany('api::order.order', {
          filters: {
            ...validClientFilters,
            ...merchantFilter,
          },
          populate: {
            user: true,
            orderItems: true,
          },
        });
      }
      // Export all merchant's orders
      else {
        orders = await strapi.entityService.findMany('api::order.order', {
          filters: merchantFilter,
          populate: {
            user: true,
            orderItems: true,
          },
        });
      }

      // Convert to CSV format
      const csvData = await strapi
        .plugin('ops-dashboard')
        .service('order-export')
        .exportToCsv(orders, fields);

      // Log audit trail
      strapi.log.info(`[AUDIT] User ${adminUser.id} exported ${orders.length} orders`);

      ctx.set('Content-Type', 'text/csv; charset=utf-8');
      ctx.set('Content-Disposition', `attachment; filename=orders-${Date.now()}.csv`);
      ctx.body = csvData;
    } catch (error) {
      strapi.log.error('[ops-dashboard] exportOrders failed:', error);
      ctx.throw(500, error.message || 'Failed to export orders');
    }
  },

  /**
   * Get order statistics.
   * Statistics are filtered based on merchant's products using Content Manager permissions.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getOrderStats(ctx) {
    try {
      // Validate user authentication
      const adminUser = ctx.state.user;
      if (!adminUser || !adminUser.id) {
        return ctx.unauthorized('Authentication required');
      }

      // Get merchant's order IDs using two-step query
      const merchantProductIds = await getMerchantProductIds(strapi, adminUser);
      const merchantOrderIds = await getMerchantOrderIds(strapi, merchantProductIds);

      let filters = {};
      if (merchantOrderIds !== null) {
        if (merchantOrderIds.length === 0) {
          // No related orders - return empty statistics
          return ctx.body = {
            data: {
              totalOrders: 0,
              totalRevenue: 0,
              averageOrderValue: 0,
              statusBreakdown: {},
            },
          };
        }
        filters = { id: { $in: merchantOrderIds } };
      }

      const orders = await strapi.entityService.findMany('api::order.order', {
        filters,
        populate: { user: true },
      });

      // Calculate statistics
      const stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0),
        averageOrderValue: 0,
        statusBreakdown: {},
      };

      if (stats.totalOrders > 0) {
        stats.averageOrderValue = stats.totalRevenue / stats.totalOrders;
      }

      // Status breakdown
      orders.forEach((order) => {
        const status = order.status || 'unknown';
        stats.statusBreakdown[status] = (stats.statusBreakdown[status] || 0) + 1;
      });

      ctx.body = { data: stats };
    } catch (error) {
      strapi.log.error('[ops-dashboard] getOrderStats failed:', error);
      ctx.throw(500, error.message || 'Failed to fetch order statistics');
    }
  },
};
