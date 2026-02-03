/**
 * @fileoverview Product Management Controller
 * @description Handles product-related operations including listing, bulk operations,
 *              CSV import/export. Implements permission-based filtering using
 *              Content Manager settings.
 * @module ops-dashboard/controllers/product
 */

'use strict';

const { buildFilterFromPermissions } = require('../utils/role-helper');
const {
  validateIds,
  validateFileUpload,
  validatePriceOperation,
  validateStockOperation,
} = require('../utils/validators');

module.exports = {
  /**
   * Bulk publish/unpublish products.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async bulkPublish(ctx) {
    try {
      const { productIds, shouldPublish } = ctx.request.body;
      const adminUser = ctx.state.user;

      // Validate input
      const validation = validateIds(productIds);
      if (!validation.valid) {
        return ctx.badRequest(validation.error);
      }

      // Pass adminUser to service layer for permission check
      const results = await strapi
        .plugin('ops-dashboard')
        .service('product-bulk')
        .bulkPublish(validation.ids, shouldPublish, adminUser);

      ctx.body = {
        data: results,
        message: `${results.success.length} products ${shouldPublish ? 'published' : 'unpublished'} successfully`,
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to publish products');
    }
  },

  /**
   * Bulk update category.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async bulkUpdateCategory(ctx) {
    try {
      const { productIds, categoryId } = ctx.request.body;
      const adminUser = ctx.state.user;

      // Validate input
      const validation = validateIds(productIds);
      if (!validation.valid) {
        return ctx.badRequest(validation.error);
      }

      if (!categoryId) {
        return ctx.badRequest('Category ID is required');
      }

      // Pass adminUser to service layer for permission check
      const results = await strapi
        .plugin('ops-dashboard')
        .service('product-bulk')
        .bulkUpdateCategory(validation.ids, categoryId, adminUser);

      ctx.body = {
        data: results,
        message: `${results.success.length} products updated successfully`,
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to update product category');
    }
  },

  /**
   * Bulk update price.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async bulkUpdatePrice(ctx) {
    try {
      const { productIds, operation, value } = ctx.request.body;
      const adminUser = ctx.state.user;

      // Validate IDs
      const idsValidation = validateIds(productIds);
      if (!idsValidation.valid) {
        return ctx.badRequest(idsValidation.error);
      }

      // Validate price operation
      const priceValidation = validatePriceOperation(operation, value);
      if (!priceValidation.valid) {
        return ctx.badRequest(priceValidation.error);
      }

      // Pass adminUser to service layer for permission check
      const results = await strapi
        .plugin('ops-dashboard')
        .service('product-bulk')
        .bulkUpdatePrice(idsValidation.ids, { operation, value: priceValidation.value }, adminUser);

      ctx.body = {
        data: results,
        message: `${results.success.length} products updated successfully`,
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to update product price');
    }
  },

  /**
   * Bulk update stock.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async bulkUpdateStock(ctx) {
    try {
      const { productIds, operation, value } = ctx.request.body;
      const adminUser = ctx.state.user;

      // Validate IDs
      const idsValidation = validateIds(productIds);
      if (!idsValidation.valid) {
        return ctx.badRequest(idsValidation.error);
      }

      // Validate stock operation
      const stockValidation = validateStockOperation(operation, value);
      if (!stockValidation.valid) {
        return ctx.badRequest(stockValidation.error);
      }

      // Pass adminUser to service layer for permission check
      const results = await strapi
        .plugin('ops-dashboard')
        .service('product-bulk')
        .bulkUpdateStock(idsValidation.ids, { operation, value: stockValidation.value }, adminUser);

      ctx.body = {
        data: results,
        message: `${results.success.length} products updated successfully`,
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to update product stock');
    }
  },

  /**
   * Bulk delete products.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async bulkDelete(ctx) {
    try {
      const { productIds } = ctx.request.body;
      const adminUser = ctx.state.user;

      // Validate input
      const validation = validateIds(productIds);
      if (!validation.valid) {
        return ctx.badRequest(validation.error);
      }

      // Pass adminUser to service layer for permission check
      const results = await strapi
        .plugin('ops-dashboard')
        .service('product-bulk')
        .bulkDelete(validation.ids, adminUser);

      ctx.body = {
        data: results,
        message: `${results.success.length} products deleted successfully`,
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to delete products');
    }
  },

  /**
   * Get products list with filters.
   * Uses Content Manager permissions for access control.
   *
   * @param {object} ctx - Koa context
   * @returns {Promise<void>}
   */
  async getProducts(ctx) {
    try {
      const { page = 1, pageSize = 10, search, category, status, stockFilter } = ctx.query;
      const adminUser = ctx.state.user;

      const filters = {};

      // Read permission conditions from Content Manager and apply filter
      const permissionFilter = await buildFilterFromPermissions(
        strapi,
        adminUser,
        'api::product.product',
        'find'
      );
      if (permissionFilter) {
        Object.assign(filters, permissionFilter);
      }

      // Search filter
      if (search) {
        filters.$or = [
          { name: { $containsi: search } },
          { sku: { $containsi: search } },
        ];
      }

      // Category filter
      if (category) {
        filters.category = { id: category };
      }

      // Status filter (published/draft)
      if (status === 'published') {
        filters.publishedAt = { $notNull: true };
      } else if (status === 'draft') {
        filters.publishedAt = { $null: true };
      }

      // Stock filter
      if (stockFilter === 'low') {
        filters.stock = { $lt: 10 };
      } else if (stockFilter === 'out') {
        filters.stock = { $eq: 0 };
      }

      const products = await strapi.entityService.findPage('api::product.product', {
        page,
        pageSize,
        filters,
        populate: {
          category: {
            fields: ['name'],
          },
          images: {
            fields: ['url'],
          },
        },
        sort: { createdAt: 'desc' },
      });

      ctx.body = { data: products };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to fetch products');
    }
  },

  /**
   * Download CSV import template
   */
  async downloadTemplate(ctx) {
    try {
      const buffer = await strapi
        .plugin('ops-dashboard')
        .service('product-import')
        .generateTemplate();

      ctx.set('Content-Type', 'text/csv; charset=utf-8');
      ctx.set('Content-Disposition', 'attachment; filename=product-import-template.csv');
      ctx.body = buffer;
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to generate template');
    }
  },

  /**
   * Import products from CSV
   */
  async importProducts(ctx) {
    try {
      const { files } = ctx.request;
      const { fieldMapping } = ctx.request.body;
      const adminUser = ctx.state.user;

      // Compatible with different file field names
      const file = files?.file || files?.['files.file'];

      // Validate file upload
      const fileValidation = validateFileUpload(file);
      if (!fileValidation.valid) {
        return ctx.badRequest(fileValidation.error);
      }

      const fs = require('fs');
      const buffer = fs.readFileSync(file.path);

      // Parse CSV
      const { headers, data } = await strapi
        .plugin('ops-dashboard')
        .service('product-import')
        .parseCsv(buffer);

      // Parse field mapping
      const mapping = fieldMapping ? JSON.parse(fieldMapping) : {};

      // Validate
      const { validProducts, errors } = strapi
        .plugin('ops-dashboard')
        .service('product-import')
        .validateProducts(data, mapping);

      // Import with merchant ID
      const results = await strapi
        .plugin('ops-dashboard')
        .service('product-import')
        .importProducts(validProducts, adminUser.id);

      ctx.body = {
        data: {
          ...results,
          validationErrors: errors,
        },
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to import products');
    }
  },

  /**
   * Preview import data from CSV
   */
  async previewImport(ctx) {
    try {
      const { files } = ctx.request;

      // Compatible with different file field names
      const file = files?.file || files?.['files.file'];

      // Validate file upload
      const fileValidation = validateFileUpload(file);
      if (!fileValidation.valid) {
        return ctx.badRequest(fileValidation.error);
      }

      const fs = require('fs');
      const buffer = fs.readFileSync(file.path);

      const { headers, data } = await strapi
        .plugin('ops-dashboard')
        .service('product-import')
        .parseCsv(buffer);

      ctx.body = {
        data: {
          headers,
          preview: data.slice(0, 10),
          totalRows: data.length,
        },
      };
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to preview import');
    }
  },

  /**
   * Export products to CSV
   */
  async exportProducts(ctx) {
    try {
      const adminUser = ctx.state.user;

      const filters = {};

      // Read permission conditions from Content Manager and apply filter
      const permissionFilter = await buildFilterFromPermissions(
        strapi,
        adminUser,
        'api::product.product',
        'find'
      );
      if (permissionFilter) {
        Object.assign(filters, permissionFilter);
      }

      const products = await strapi.entityService.findMany('api::product.product', {
        filters,
        populate: {
          category: { fields: ['name'] },
        },
        sort: { createdAt: 'desc' },
      });

      const csvData = await strapi
        .plugin('ops-dashboard')
        .service('product-import')
        .exportProducts(products);

      ctx.set('Content-Type', 'text/csv; charset=utf-8');
      ctx.set('Content-Disposition', `attachment; filename=products-${Date.now()}.csv`);
      ctx.body = csvData;
    } catch (error) {
      ctx.throw(500, error.message || 'Failed to export products');
    }
  },
};
