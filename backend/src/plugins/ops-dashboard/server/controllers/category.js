/**
 * @fileoverview Category Management Controller
 * @description Handles category-related operations including tree view, CRUD,
 *              moving, and reordering. Implements permission-based access control
 *              using Content Manager settings.
 * @module ops-dashboard/controllers/category
 */

'use strict';

const { canAccessEntity, getPermissionConditions } = require('../utils/role-helper');

module.exports = {
  /**
   * Get category tree structure.
   * Read operation: All merchants can read all categories (no permission filter).
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getCategoryTree(ctx) {
    try {
      const result = await strapi
        .plugin('ops-dashboard')
        .service('category-tree')
        .getCategoryTree();

      ctx.body = {
        data: result,
        meta: {
          totalCategories: result.totalCount,
          maxDepth: result.maxDepth,
        },
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to fetch category tree');
    }
  },

  /**
   * Move category to new parent.
   * Write operation: Uses Content Manager permission settings.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async moveCategory(ctx) {
    try {
      const { categoryId, newParentId, newSortOrder } = ctx.request.body;
      const adminUser = ctx.state.user;

      if (!categoryId) {
        return ctx.badRequest('Category ID is required');
      }

      // Check permission using Content Manager settings
      const category = await strapi.entityService.findOne('api::category.category', categoryId, {
        populate: ['createdBy'],
      });
      if (!category) {
        return ctx.notFound('Category not found');
      }

      const canAccess = await canAccessEntity(
        strapi,
        adminUser,
        'api::category.category',
        category,
        'update'
      );
      if (!canAccess) {
        return ctx.forbidden('You do not have permission to move this category');
      }

      const result = await strapi
        .plugin('ops-dashboard')
        .service('category-tree')
        .moveCategory(categoryId, newParentId, newSortOrder || 0);

      ctx.body = {
        data: result,
        message: 'Category moved successfully',
      };
    } catch (error) {
      if (error.message && error.message.includes('circular')) {
        return ctx.badRequest(error.message);
      }
      ctx.throw(500, error.message || 'Failed to move category');
    }
  },

  /**
   * Reorder categories (bulk update sortOrder).
   * Write operation: Uses Content Manager permission settings.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async reorderCategories(ctx) {
    try {
      const { updates } = ctx.request.body;
      const adminUser = ctx.state.user;

      if (!updates || !Array.isArray(updates) || updates.length === 0) {
        return ctx.badRequest('Updates array is required');
      }

      // Filter updates using Content Manager permissions
      const allowedUpdates = [];
      for (const u of updates) {
        const category = await strapi.entityService.findOne('api::category.category', u.id, {
          populate: ['createdBy'],
        });
        const canAccess = await canAccessEntity(
          strapi,
          adminUser,
          'api::category.category',
          category,
          'update'
        );
        if (canAccess) {
          allowedUpdates.push(u);
        }
      }

      const results = await strapi
        .plugin('ops-dashboard')
        .service('category-tree')
        .reorderCategories(allowedUpdates);

      ctx.body = {
        data: results,
        message: `${results.success.length} categories reordered successfully`,
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to reorder categories');
    }
  },

  /**
   * Create new category.
   * Create operation: Checks Content Manager create permission.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async createCategory(ctx) {
    try {
      const { name, description, slug, parentId, sortOrder } = ctx.request.body;
      const adminUser = ctx.state.user;

      if (!name) {
        return ctx.badRequest('Category name is required');
      }

      // Check if user has permission to create categories
      const permissionInfo = await getPermissionConditions(
        strapi,
        adminUser,
        'api::category.category',
        'create'
      );
      if (!permissionInfo.hasPermission) {
        return ctx.forbidden('You do not have permission to create categories');
      }

      // Use db.query to create and manually set createdBy
      const created = await strapi.db.query('api::category.category').create({
        data: {
          name,
          description: description || '',
          slug: slug || name.toLowerCase().replace(/\s+/g, '-'),
          parent: parentId || null,
          sortOrder: sortOrder || 0,
          publishedAt: new Date(),
          createdBy: adminUser.id,
          updatedBy: adminUser.id,
        },
        populate: { parent: { select: ['id', 'name'] } },
      });

      ctx.body = {
        data: created,
        message: 'Category created successfully',
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to create category');
    }
  },

  /**
   * Update category.
   * Write operation: Uses Content Manager permission settings.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async updateCategory(ctx) {
    try {
      const { id } = ctx.params;
      const { name, description, slug } = ctx.request.body;
      const adminUser = ctx.state.user;

      // Check permission using Content Manager settings
      const category = await strapi.entityService.findOne('api::category.category', id, {
        populate: ['createdBy'],
      });
      if (!category) {
        return ctx.notFound('Category not found');
      }

      const canAccess = await canAccessEntity(
        strapi,
        adminUser,
        'api::category.category',
        category,
        'update'
      );
      if (!canAccess) {
        return ctx.forbidden('You do not have permission to update this category');
      }

      const updated = await strapi.entityService.update('api::category.category', id, {
        data: { name, description, slug },
        populate: { parent: { fields: ['id', 'name'] } },
      });

      ctx.body = {
        data: updated,
        message: 'Category updated successfully',
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to update category');
    }
  },

  /**
   * Delete category.
   * Write operation: Uses Content Manager permission settings.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async deleteCategory(ctx) {
    try {
      const { id } = ctx.params;
      const { force } = ctx.query;
      const adminUser = ctx.state.user;

      // Check if category exists and has children/products
      const category = await strapi.entityService.findOne('api::category.category', id, {
        populate: { children: true, products: true, createdBy: true },
      });

      if (!category) {
        return ctx.notFound('Category not found');
      }

      // Check permission using Content Manager settings
      const canAccess = await canAccessEntity(
        strapi,
        adminUser,
        'api::category.category',
        category,
        'delete'
      );
      if (!canAccess) {
        return ctx.forbidden('You do not have permission to delete this category');
      }

      if (category.children?.length > 0 && force !== 'true') {
        return ctx.badRequest(
          'Category has children. Move or delete children first, or use force=true'
        );
      }

      if (category.products?.length > 0) {
        return ctx.badRequest(
          `Category has ${category.products.length} products. Reassign products first.`
        );
      }

      await strapi.entityService.delete('api::category.category', id);

      ctx.body = {
        data: { id },
        message: 'Category deleted successfully',
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to delete category');
    }
  },
};
