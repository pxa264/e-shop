/**
 * @fileoverview Dashboard Statistics Controller
 * @description Provides dashboard KPI data with permission-based filtering.
 * @module ops-dashboard/controllers/dashboard
 */

'use strict';

module.exports = {
  /**
   * Get dashboard statistics.
   * Uses Content Manager permission settings for data filtering.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getStats(ctx) {
    try {
      const adminUser = ctx.state.user;

      // Pass adminUser to service for permission-based filtering
      const stats = await strapi
        .plugin('ops-dashboard')
        .service('dashboard')
        .getStats(adminUser);

      ctx.body = { data: stats };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to fetch dashboard statistics');
    }
  },
};
