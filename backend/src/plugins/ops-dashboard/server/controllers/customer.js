/**
 * @fileoverview Customer Management Controller
 * @description Handles customer-related operations including listing, details,
 *              statistics, and order history. Implements permission-based filtering
 *              based on merchant's products using Content Manager settings.
 * @module ops-dashboard/controllers/customer
 */

'use strict';

const {
  getMerchantProductIds,
  getMerchantOrdersAndCustomers,
} = require('../utils/role-helper');

module.exports = ({ strapi }) => ({
  /**
   * Get customers list filtered by merchant's products.
   * Uses Content Manager permissions to determine data visibility.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getCustomers(ctx) {
    try {
      // Validate user authentication
      const adminUser = ctx.state.user;
      if (!adminUser || !adminUser.id) {
        return ctx.unauthorized('Authentication required');
      }

      const { page = 1, pageSize = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = ctx.query;

      // Get merchant's customer IDs using two-step query
      const merchantProductIds = await getMerchantProductIds(strapi, adminUser);
      const { customerIds: merchantCustomerIds, orderIds: merchantOrderIds } = await getMerchantOrdersAndCustomers(strapi, merchantProductIds);

      if (merchantCustomerIds !== null && merchantCustomerIds.length === 0) {
        return ctx.body = {
          data: [],
          meta: { pagination: { page: 1, pageSize: parseInt(pageSize), pageCount: 0, total: 0 } },
        };
      }

      // Build filters
      const filters = {};
      if (merchantCustomerIds !== null) {
        filters.id = { $in: merchantCustomerIds };
      }

      if (search) {
        filters.$or = [
          { username: { $containsi: search } },
          { email: { $containsi: search } },
        ];
      }

      const [customers, total] = await Promise.all([
        strapi.entityService.findMany('plugin::users-permissions.user', {
          filters: Object.keys(filters).length > 0 ? filters : undefined,
          sort: { [sortBy]: sortOrder },
          start: (page - 1) * pageSize,
          limit: parseInt(pageSize),
          populate: ['role'],
        }),
        strapi.entityService.count('plugin::users-permissions.user', {
          filters: Object.keys(filters).length > 0 ? filters : undefined,
        }),
      ]);

      // Optimize: Batch fetch all orders for these customers in one query (avoid N+1)
      const customerIdList = customers.map(c => c.id);
      let allCustomerOrders = [];

      if (customerIdList.length > 0) {
        const orderFilters = {
          user: { $in: customerIdList },
        };
        if (merchantOrderIds !== null) {
          orderFilters.id = { $in: merchantOrderIds };
        }

        allCustomerOrders = await strapi.entityService.findMany('api::order.order', {
          filters: orderFilters,
          fields: ['id', 'totalAmount'],
          populate: { user: { fields: ['id'] } },
        });
      }

      // Group orders by customer ID
      const ordersByCustomer = allCustomerOrders.reduce((acc, order) => {
        const userId = order.user?.id;
        if (userId) {
          if (!acc[userId]) acc[userId] = [];
          acc[userId].push(order);
        }
        return acc;
      }, {});

      // Calculate stats from grouped data (no additional queries)
      const customersWithStats = customers.map(customer => {
        const customerOrders = ordersByCustomer[customer.id] || [];
        const totalOrders = customerOrders.length;
        const totalSpent = customerOrders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);

        return {
          ...customer,
          totalOrders,
          totalSpent,
        };
      });

      ctx.body = {
        data: customersWithStats,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            pageCount: Math.ceil(total / pageSize),
            total,
          },
        },
      };
    } catch (error) {
      strapi.log.error('[ops-dashboard] getCustomers failed:', error);
      ctx.throw(500, error.message || 'Failed to fetch customers');
    }
  },

  /**
   * Get single customer details.
   * Validates that the customer has purchased merchant's products.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getCustomer(ctx) {
    try {
      // Validate user authentication
      const adminUser = ctx.state.user;
      if (!adminUser || !adminUser.id) {
        return ctx.unauthorized('Authentication required');
      }

      const { id } = ctx.params;

      // Get merchant's customer IDs using two-step query
      const merchantProductIds = await getMerchantProductIds(strapi, adminUser);
      const { customerIds: merchantCustomerIds, orderIds: merchantOrderIds } = await getMerchantOrdersAndCustomers(strapi, merchantProductIds);

      // Validate customer has purchased merchant's products
      if (merchantCustomerIds !== null && !merchantCustomerIds.includes(parseInt(id))) {
        return ctx.forbidden('You do not have permission to view this customer');
      }

      const customer = await strapi.entityService.findOne('plugin::users-permissions.user', id, {
        populate: ['role'],
      });

      if (!customer) {
        return ctx.notFound('Customer not found');
      }

      // Get customer orders (only merchant's related orders)
      let orderFilters = { user: id };
      if (merchantOrderIds !== null) {
        orderFilters.id = { $in: merchantOrderIds };
      }

      const orders = await strapi.entityService.findMany('api::order.order', {
        filters: orderFilters,
        sort: { createdAt: 'desc' },
        populate: ['orderItems'],
      });

      const totalOrders = orders.length;
      const totalSpent = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

      ctx.body = {
        data: {
          ...customer,
          orders,
          stats: {
            totalOrders,
            totalSpent,
            averageOrderValue,
          },
        },
      };
    } catch (error) {
      strapi.log.error('[ops-dashboard] getCustomer failed:', error);
      ctx.throw(500, error.message || 'Failed to fetch customer details');
    }
  },

  /**
   * Get customer statistics.
   * Statistics are filtered based on merchant's products.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getCustomerStats(ctx) {
    try {
      // Validate user authentication
      const adminUser = ctx.state.user;
      if (!adminUser || !adminUser.id) {
        return ctx.unauthorized('Authentication required');
      }

      // Get merchant's orders using two-step query
      const merchantProductIds = await getMerchantProductIds(strapi, adminUser);
      const { orderIds: merchantOrderIds, orders: cachedOrders } = await getMerchantOrdersAndCustomers(strapi, merchantProductIds);

      let orders;
      if (merchantOrderIds === null) {
        // Super Admin sees all orders
        orders = await strapi.entityService.findMany('api::order.order', {
          populate: ['user'],
        });
      } else if (merchantOrderIds.length === 0) {
        // No related orders
        return ctx.body = {
          data: {
            totalCustomers: 0,
            newCustomersThisMonth: 0,
            growthRate: 0,
            activeCustomers: 0,
            totalRevenue: 0,
            averageOrderValue: 0,
            totalOrders: 0,
          },
        };
      } else {
        // Use cached orders or re-query
        orders = cachedOrders || await strapi.entityService.findMany('api::order.order', {
          filters: { id: { $in: merchantOrderIds } },
          populate: ['user'],
        });
      }

      // Get unique customer IDs
      const customerIds = [...new Set(orders.map(o => o.user?.id).filter(Boolean))];
      const totalCustomers = customerIds.length;

      // Get new customers this month (who purchased merchant's products)
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const ordersThisMonth = orders.filter(o => new Date(o.createdAt) >= startOfMonth);
      const newCustomerIdsThisMonth = [...new Set(ordersThisMonth.map(o => o.user?.id).filter(Boolean))];
      const newCustomersThisMonth = newCustomerIdsThisMonth.length;

      // Get last month customers
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

      const ordersLastMonth = orders.filter(o => {
        const date = new Date(o.createdAt);
        return date >= startOfLastMonth && date <= endOfLastMonth;
      });
      const customerIdsLastMonth = [...new Set(ordersLastMonth.map(o => o.user?.id).filter(Boolean))];
      const newCustomersLastMonth = customerIdsLastMonth.length;

      // Calculate growth rate
      const growthRate = newCustomersLastMonth > 0
        ? ((newCustomersThisMonth - newCustomersLastMonth) / newCustomersLastMonth * 100).toFixed(1)
        : 0;

      // Active customers
      const activeCustomers = customerIds.length;

      // Calculate total revenue and average order value
      const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.totalAmount) || 0), 0);
      const averageOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

      ctx.body = {
        data: {
          totalCustomers,
          newCustomersThisMonth,
          growthRate: parseFloat(growthRate),
          activeCustomers,
          totalRevenue,
          averageOrderValue,
          totalOrders: orders.length,
        },
      };
    } catch (error) {
      strapi.log.error('[ops-dashboard] getCustomerStats failed:', error);
      ctx.throw(500, error.message || 'Failed to fetch customer statistics');
    }
  },

  /**
   * Get customer order history.
   * Filters orders based on merchant's products.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getCustomerOrders(ctx) {
    try {
      // Validate user authentication
      const adminUser = ctx.state.user;
      if (!adminUser || !adminUser.id) {
        return ctx.unauthorized('Authentication required');
      }

      const { id } = ctx.params;
      const { page = 1, pageSize = 10 } = ctx.query;

      // Get merchant's order IDs using two-step query
      const merchantProductIds = await getMerchantProductIds(strapi, adminUser);
      const { orderIds: merchantOrderIds } = await getMerchantOrdersAndCustomers(strapi, merchantProductIds);

      // Build order filter
      let orderFilter = { user: id };
      if (merchantOrderIds !== null) {
        orderFilter.id = { $in: merchantOrderIds };
      }

      const [orders, total] = await Promise.all([
        strapi.entityService.findMany('api::order.order', {
          filters: orderFilter,
          sort: { createdAt: 'desc' },
          start: (page - 1) * pageSize,
          limit: parseInt(pageSize),
          populate: ['orderItems'],
        }),
        strapi.entityService.count('api::order.order', {
          filters: orderFilter,
        }),
      ]);

      ctx.body = {
        data: orders,
        meta: {
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            pageCount: Math.ceil(total / pageSize),
            total,
          },
        },
      };
    } catch (error) {
      strapi.log.error('[ops-dashboard] getCustomerOrders failed:', error);
      ctx.throw(500, error.message || 'Failed to fetch customer orders');
    }
  },
});
