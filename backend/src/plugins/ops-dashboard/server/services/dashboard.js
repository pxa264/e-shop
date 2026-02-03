/**
 * @fileoverview Dashboard Statistics Service
 * @description Provides comprehensive dashboard statistics including KPIs,
 *              order trends, low stock alerts, category stats, and user growth.
 *              All statistics are filtered based on merchant permissions.
 * @module ops-dashboard/services/dashboard
 */

'use strict';

const {
  isSuperAdmin,
  getMerchantProductIds,
  getMerchantOrderIds,
} = require('../utils/role-helper');

module.exports = ({ strapi }) => ({
  /**
   * Get comprehensive dashboard statistics.
   * Statistics are filtered based on user permissions:
   * - Super Admin: sees all data
   * - Regular merchant: sees only data related to their products
   *
   * @param {object} adminUser - Current admin user object
   * @returns {Promise<object>} Dashboard statistics including KPIs, charts, and alerts
   *
   * @example
   * const stats = await dashboardService.getStats(ctx.state.user);
   * // Returns: { kpis, ordersByStatus, orderTrend, lowStockProducts, categoryStats, userGrowth }
   */
  async getStats(adminUser) {
    // Validate user
    if (!adminUser || !adminUser.id) {
      throw new Error('Authentication required');
    }

    /**
     * Calculate trend percentage between two periods
     * @param {number} current - Current period value
     * @param {number} previous - Previous period value
     * @returns {string} Trend percentage as string with 1 decimal place
     */
    const calculateTrend = (current, previous) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous * 100).toFixed(1);
    };

    // Determine merchant's data scope based on permissions
    let merchantProductIds = [];
    let merchantOrderIds = null; // null = no filter (Super Admin)
    let merchantProductFilter = {};

    if (!isSuperAdmin(adminUser)) {
      // Get merchant's product IDs using permission-based filter
      const productIds = await getMerchantProductIds(strapi, adminUser);

      if (productIds === null) {
        // This shouldn't happen for non-Super Admin, but handle gracefully
        merchantProductIds = [];
        merchantOrderIds = [];
      } else {
        merchantProductIds = productIds;

        // Build product filter for createdBy
        merchantProductFilter = {
          createdBy: { id: adminUser.id },
        };

        // Get merchant's order IDs using two-step query
        merchantOrderIds = await getMerchantOrderIds(strapi, merchantProductIds);
      }
    }

    /**
     * Build order filter based on merchant permissions
     * @param {object} additionalFilters - Additional filters to merge
     * @returns {object} Combined filter object
     */
    const buildOrderFilter = (additionalFilters = {}) => {
      if (merchantOrderIds === null) {
        return additionalFilters; // Super Admin - no restriction
      }
      if (merchantOrderIds.length === 0) {
        return { id: { $eq: -1 }, ...additionalFilters }; // Impossible condition - returns empty
      }
      return { id: { $in: merchantOrderIds }, ...additionalFilters };
    };

    // Define date ranges for trend calculations
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // ============================================
    // KPI: Total Orders with Trend
    // ============================================
    const totalOrders = await strapi.entityService.count('api::order.order', {
      filters: buildOrderFilter(),
    });
    const ordersLast30Days = await strapi.entityService.count('api::order.order', {
      filters: buildOrderFilter({
        createdAt: { $gte: thirtyDaysAgo.toISOString() },
      }),
    });
    const ordersPrevious30Days = await strapi.entityService.count('api::order.order', {
      filters: buildOrderFilter({
        createdAt: {
          $gte: sixtyDaysAgo.toISOString(),
          $lt: thirtyDaysAgo.toISOString(),
        },
      }),
    });
    const ordersTrend = calculateTrend(ordersLast30Days, ordersPrevious30Days);

    // ============================================
    // KPI: Total Users with Trend (global - not filtered by merchant)
    // ============================================
    const totalUsers = await strapi.entityService.count('plugin::users-permissions.user');
    const usersLast30Days = await strapi.entityService.count('plugin::users-permissions.user', {
      filters: { createdAt: { $gte: thirtyDaysAgo.toISOString() } },
    });
    const usersPrevious30Days = await strapi.entityService.count('plugin::users-permissions.user', {
      filters: {
        createdAt: {
          $gte: sixtyDaysAgo.toISOString(),
          $lt: thirtyDaysAgo.toISOString(),
        },
      },
    });
    const usersTrend = calculateTrend(usersLast30Days, usersPrevious30Days);

    // ============================================
    // KPI: Total Products with Trend (filtered by merchant)
    // ============================================
    const totalProducts = await strapi.entityService.count('api::product.product', {
      filters: merchantProductFilter,
    });
    const productsLast30Days = await strapi.entityService.count('api::product.product', {
      filters: {
        ...merchantProductFilter,
        createdAt: { $gte: thirtyDaysAgo.toISOString() },
      },
    });
    const productsPrevious30Days = await strapi.entityService.count('api::product.product', {
      filters: {
        ...merchantProductFilter,
        createdAt: {
          $gte: sixtyDaysAgo.toISOString(),
          $lt: thirtyDaysAgo.toISOString(),
        },
      },
    });
    const productsTrend = calculateTrend(productsLast30Days, productsPrevious30Days);

    // ============================================
    // KPI: Total Sales with Trend (filtered by merchant's products)
    // ============================================
    const allOrders = await strapi.entityService.findMany('api::order.order', {
      fields: ['totalAmount', 'createdAt'],
      filters: buildOrderFilter({
        status: { $ne: 'cancelled' },
      }),
    });
    const totalSales = allOrders.reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

    const salesLast30Days = allOrders
      .filter(order => new Date(order.createdAt) >= thirtyDaysAgo)
      .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

    const salesPrevious30Days = allOrders
      .filter(order => {
        const date = new Date(order.createdAt);
        return date >= sixtyDaysAgo && date < thirtyDaysAgo;
      })
      .reduce((sum, order) => sum + parseFloat(order.totalAmount || 0), 0);

    const salesTrend = calculateTrend(salesLast30Days, salesPrevious30Days);

    // ============================================
    // Chart: Order Status Distribution
    // ============================================
    const ordersByStatus = await strapi.entityService.findMany('api::order.order', {
      fields: ['status'],
      filters: buildOrderFilter(),
    });
    const statusCounts = ordersByStatus.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // ============================================
    // Chart: Order Trend (Last 30 Days)
    // ============================================
    const recentOrders = await strapi.entityService.findMany('api::order.order', {
      fields: ['createdAt', 'totalAmount'],
      filters: buildOrderFilter({
        createdAt: { $gte: thirtyDaysAgo.toISOString() },
      }),
    });

    // Group orders by date with sales amount
    const orderTrendMap = recentOrders.reduce((acc, order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { count: 0, sales: 0 };
      }
      acc[date].count += 1;
      acc[date].sales += parseFloat(order.totalAmount || 0);
      return acc;
    }, {});

    const orderTrend = Object.entries(orderTrendMap)
      .map(([date, data]) => ({
        date,
        count: data.count,
        sales: parseFloat(data.sales.toFixed(2)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // ============================================
    // Alert: Low Stock Products (stock < 10)
    // ============================================
    const lowStockProducts = await strapi.entityService.findMany('api::product.product', {
      fields: ['name', 'stock', 'price'],
      filters: {
        ...merchantProductFilter,
        stock: { $lt: 10 },
        publishedAt: { $notNull: true },
      },
      sort: { stock: 'asc' },
      limit: 10,
    });

    // ============================================
    // Chart: Category Statistics
    // ============================================
    const categories = await strapi.entityService.findMany('api::category.category', {
      fields: ['name'],
      populate: {
        products: {
          fields: ['id'],
          filters: merchantProductFilter,
        },
      },
    });

    const categoryStats = categories
      .map(cat => ({
        name: cat.name,
        count: cat.products?.length || 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // ============================================
    // Chart: User Growth (Last 12 Months)
    // ============================================
    const twelveMonthsAgo = new Date(now);
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    const allUsers = await strapi.entityService.findMany('plugin::users-permissions.user', {
      fields: ['createdAt'],
      filters: {
        createdAt: { $gte: twelveMonthsAgo.toISOString() },
      },
    });

    // Initialize month map
    const userGrowthMap = {};
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      userGrowthMap[monthKey] = 0;
    }

    // Group users by month
    allUsers.forEach(user => {
      const date = new Date(user.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (userGrowthMap[monthKey] !== undefined) {
        userGrowthMap[monthKey]++;
      }
    });

    const userGrowth = Object.entries(userGrowthMap).map(([month, count]) => ({
      month,
      count,
    }));

    // ============================================
    // Return Complete Dashboard Data
    // ============================================
    return {
      kpis: {
        totalOrders: {
          value: totalOrders,
          trend: parseFloat(ordersTrend),
          sparkline: orderTrend.slice(-7).map(d => d.count),
        },
        totalUsers: {
          value: totalUsers,
          trend: parseFloat(usersTrend),
          sparkline: [],
        },
        totalProducts: {
          value: totalProducts,
          trend: parseFloat(productsTrend),
          sparkline: [],
        },
        totalSales: {
          value: totalSales.toFixed(2),
          trend: parseFloat(salesTrend),
          sparkline: orderTrend.slice(-7).map(d => d.sales),
        },
      },
      ordersByStatus: Object.entries(statusCounts).map(([status, count]) => ({
        status,
        count,
      })),
      orderTrend,
      lowStockProducts,
      categoryStats,
      userGrowth,
    };
  },
});
