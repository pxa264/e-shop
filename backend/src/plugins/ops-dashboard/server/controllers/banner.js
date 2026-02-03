/**
 * @fileoverview Banner Management Controller
 * @description Handles banner-related operations including listing, reordering,
 *              bulk toggle, and bulk delete. Implements permission-based access
 *              control using Content Manager settings.
 * @module ops-dashboard/controllers/banner
 */

'use strict';

const { buildFilterFromPermissions, canAccessEntity, getPermissionConditions } = require('../utils/role-helper');
const { validateIds } = require('../utils/validators');

module.exports = {
  /**
   * Get banner list.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getBanners(ctx) {
    try {
      const adminUser = ctx.state.user;

      // Read permission conditions from Content Manager and apply filter
      const filters = {};
      const permissionFilter = await buildFilterFromPermissions(
        strapi,
        adminUser,
        'api::banner.banner',
        'find'
      );
      if (permissionFilter) {
        Object.assign(filters, permissionFilter);
      }

      const banners = await strapi.entityService.findMany('api::banner.banner', {
        filters,
        populate: { image: true },
        sort: { sortOrder: 'asc' },
      });

      ctx.body = {
        data: banners,
        meta: { total: banners.length },
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  /**
   * Update banner order.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async reorderBanners(ctx) {
    const { updates } = ctx.request.body;
    const adminUser = ctx.state.user;

    if (!updates || !Array.isArray(updates) || updates.length === 0) {
      return ctx.badRequest('Updates array is required');
    }

    // Validate updates structure
    const invalidUpdates = updates.filter(u =>
      !u || typeof u !== 'object' || !Number.isInteger(Number(u.id)) || Number(u.id) <= 0
    );
    if (invalidUpdates.length > 0) {
      return ctx.badRequest('Each update must have a valid id');
    }

    // First check if user has update permission
    const permissionInfo = await getPermissionConditions(
      strapi,
      adminUser,
      'api::banner.banner',
      'update'
    );
    if (!permissionInfo.hasPermission) {
      return ctx.forbidden('You do not have permission to reorder banners');
    }

    try {
      const results = [];
      for (const { id, sortOrder } of updates) {
        const banner = await strapi.entityService.findOne('api::banner.banner', id, {
          populate: ['createdBy'],
        });
        // Use Content Manager permission check
        const canAccess = await canAccessEntity(
          strapi,
          adminUser,
          'api::banner.banner',
          banner,
          'update'
        );
        if (canAccess) {
          const updated = await strapi.entityService.update('api::banner.banner', id, {
            data: { sortOrder },
          });
          results.push(updated);
        }
      }

      ctx.body = {
        data: results,
        message: 'Banners reordered successfully',
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  /**
   * Bulk toggle banner status.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async bulkToggle(ctx) {
    const { ids, isActive } = ctx.request.body;
    const adminUser = ctx.state.user;

    // Validate IDs
    const validation = validateIds(ids);
    if (!validation.valid) {
      return ctx.badRequest(validation.error);
    }

    // First check if user has update permission
    const permissionInfo = await getPermissionConditions(
      strapi,
      adminUser,
      'api::banner.banner',
      'update'
    );
    if (!permissionInfo.hasPermission) {
      return ctx.forbidden('You do not have permission to toggle banners');
    }

    try {
      const results = [];
      for (const id of validation.ids) {
        const banner = await strapi.entityService.findOne('api::banner.banner', id, {
          populate: ['createdBy'],
        });
        // Use Content Manager permission check
        const canAccess = await canAccessEntity(
          strapi,
          adminUser,
          'api::banner.banner',
          banner,
          'update'
        );
        if (canAccess) {
          const updated = await strapi.entityService.update('api::banner.banner', id, {
            data: { isActive },
          });
          results.push(updated);
        }
      }

      ctx.body = {
        data: results,
        message: `${results.length} banner(s) ${isActive ? 'enabled' : 'disabled'}`,
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  /**
   * Bulk delete banners.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async bulkDelete(ctx) {
    const { ids } = ctx.request.body;
    const adminUser = ctx.state.user;

    // Validate IDs
    const validation = validateIds(ids);
    if (!validation.valid) {
      return ctx.badRequest(validation.error);
    }

    // First check if user has delete permission
    const permissionInfo = await getPermissionConditions(
      strapi,
      adminUser,
      'api::banner.banner',
      'delete'
    );
    if (!permissionInfo.hasPermission) {
      return ctx.forbidden('You do not have permission to delete banners');
    }

    try {
      let deletedCount = 0;
      for (const id of validation.ids) {
        const banner = await strapi.entityService.findOne('api::banner.banner', id, {
          populate: ['createdBy'],
        });
        // Use Content Manager permission check
        const canAccess = await canAccessEntity(
          strapi,
          adminUser,
          'api::banner.banner',
          banner,
          'delete'
        );
        if (canAccess) {
          await strapi.entityService.delete('api::banner.banner', id);
          deletedCount++;
        }
      }

      ctx.body = {
        data: { deletedCount },
        message: `${deletedCount} banner(s) deleted`,
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },

  /**
   * Update single banner.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async updateBanner(ctx) {
    const { id } = ctx.params;
    const { title, link, isActive } = ctx.request.body;
    const adminUser = ctx.state.user;

    try {
      const existingBanner = await strapi.entityService.findOne('api::banner.banner', id, {
        populate: ['createdBy'],
      });

      if (!existingBanner) {
        return ctx.notFound('Banner not found');
      }

      // Use Content Manager permission check
      const canAccess = await canAccessEntity(
        strapi,
        adminUser,
        'api::banner.banner',
        existingBanner,
        'update'
      );
      if (!canAccess) {
        return ctx.forbidden('You do not have permission to update this banner');
      }

      const banner = await strapi.entityService.update('api::banner.banner', id, {
        data: { title, link, isActive },
      });

      ctx.body = {
        data: banner,
        message: 'Banner updated successfully',
      };
    } catch (error) {
      ctx.throw(500, error.message);
    }
  },
};
