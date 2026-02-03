/**
 * @fileoverview Product Import/Export Service
 * @description Handles CSV parsing, validation, import and export operations
 *              for products. Includes field mapping and category resolution.
 * @module ops-dashboard/services/product-import
 */

'use strict';

module.exports = ({ strapi }) => ({
  /**
   * Parse CSV file content.
   *
   * @param {Buffer} buffer - CSV file buffer
   * @returns {Promise<{headers: string[], data: object[]}>}
   */
  async parseCsv(buffer) {
    const content = buffer.toString('utf-8').replace(/^\uFEFF/, ''); // Remove BOM
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');

    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse header row
    const headers = this.parseCsvLine(lines[0]).map(h => h.trim().toLowerCase());

    // Parse data rows
    const data = [];
    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCsvLine(lines[i]);
      const rowData = {};
      headers.forEach((header, index) => {
        if (header && values[index] !== undefined) {
          rowData[header] = values[index].trim();
        }
      });
      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    }

    return { headers, data };
  },

  /**
   * Parse CSV line (handles quotes and commas).
   *
   * @param {string} line - CSV line to parse
   * @returns {string[]} Array of field values
   */
  parseCsvLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = false;
          }
        } else {
          current += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(current);
          current = '';
        } else {
          current += char;
        }
      }
    }
    result.push(current);
    return result;
  },

  /**
   * Validate import data.
   *
   * @param {object[]} products - Raw product data from CSV
   * @param {object} fieldMapping - Field mapping configuration
   * @returns {{validProducts: object[], errors: object[]}}
   */
  validateProducts(products, fieldMapping) {
    const errors = [];
    const validProducts = [];

    products.forEach((product, index) => {
      const rowErrors = [];
      const mappedProduct = {};

      // Map fields from CSV to Strapi fields
      Object.entries(fieldMapping).forEach(([csvField, strapiField]) => {
        if (strapiField && product[csvField] !== undefined) {
          mappedProduct[strapiField] = product[csvField];
        }
      });

      // Validate required fields
      if (!mappedProduct.name || mappedProduct.name.toString().trim() === '') {
        rowErrors.push('Name is required');
      }

      // Validate price
      if (mappedProduct.price !== undefined) {
        const price = parseFloat(mappedProduct.price);
        if (isNaN(price) || price < 0) {
          rowErrors.push('Price must be a positive number');
        } else {
          mappedProduct.price = price;
        }
      }

      // Validate stock
      if (mappedProduct.stock !== undefined) {
        const stock = parseInt(mappedProduct.stock);
        if (isNaN(stock) || stock < 0) {
          rowErrors.push('Stock must be a non-negative integer');
        } else {
          mappedProduct.stock = stock;
        }
      }

      if (rowErrors.length > 0) {
        errors.push({ row: index + 2, errors: rowErrors });
      } else {
        validProducts.push(mappedProduct);
      }
    });

    return { validProducts, errors };
  },

  /**
   * Bulk import products.
   * Uses db.query to set createdBy.
   *
   * @param {object[]} products - Validated product data
   * @param {number} userId - User ID for createdBy
   * @returns {Promise<{success: number, failed: number, errors: object[]}>}
   */
  async importProducts(products, userId) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    // Pre-cache all categories (avoid repeated queries)
    const categoryCache = await this.buildCategoryCache();

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      try {
        // Generate slug if not provided
        if (!product.slug && product.name) {
          product.slug = product.name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '') + '-' + Date.now() + '-' + i;
        }

        // Parse category name to ID
        let categoryId = null;
        if (product.category) {
          const categoryName = product.category.toString().trim();
          categoryId = categoryCache[categoryName.toLowerCase()];
          if (!categoryId) {
            // Category not found, log warning but continue import
            strapi.log.warn(`Category "${categoryName}" not found for product "${product.name}"`);
          }
        }

        // Build product data (exclude original category string)
        const { category, ...productData } = product;
        const createData = {
          ...productData,
          publishedAt: new Date(),
          createdBy: userId,
          updatedBy: userId,
        };

        // If category found, add relation
        if (categoryId) {
          createData.category = categoryId;
        }

        // Use db.query to create and set createdBy
        await strapi.db.query('api::product.product').create({
          data: createData,
        });
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          name: product.name,
          error: error.message,
        });
      }
    }

    return results;
  },

  /**
   * Build category cache (name/slug -> ID).
   *
   * @returns {Promise<object>} Category lookup cache
   */
  async buildCategoryCache() {
    const categories = await strapi.entityService.findMany('api::category.category', {
      fields: ['id', 'name', 'slug'],
    });

    const cache = {};
    categories.forEach(cat => {
      // Support lookup by name and slug (case-insensitive)
      if (cat.name) {
        cache[cat.name.toLowerCase()] = cat.id;
      }
      if (cat.slug) {
        cache[cat.slug.toLowerCase()] = cat.id;
      }
    });

    return cache;
  },

  /**
   * Generate CSV import template.
   *
   * @returns {Promise<Buffer>} CSV template buffer
   */
  async generateTemplate() {
    const headers = ['Name', 'Description', 'Price', 'Stock', 'SKU', 'Category'];
    const exampleRow = ['Example Product', 'This is an example product description', '99.99', '100', 'SKU-001', 'Electronics'];

    const bom = '\uFEFF';
    const csvContent = [
      headers.join(','),
      exampleRow.map(v => `"${v}"`).join(','),
    ].join('\n');

    return Buffer.from(bom + csvContent, 'utf-8');
  },

  /**
   * Export products to CSV.
   *
   * @param {object[]} products - Products to export
   * @returns {Promise<string>} CSV content
   */
  async exportProducts(products) {
    const headers = ['ID', 'Name', 'Description', 'Price', 'Stock', 'SKU', 'Category', 'Status', 'Created At'];
    const rows = products.map(p => [
      p.id,
      p.name || '',
      (p.description || '').replace(/\n/g, ' '),
      p.price || 0,
      p.stock || 0,
      p.sku || '',
      p.category?.name || '',
      p.publishedAt ? 'Published' : 'Draft',
      p.createdAt ? new Date(p.createdAt).toLocaleString() : '',
    ]);

    const header = headers.map(h => `"${h}"`).join(',');
    const dataRows = rows.map(row =>
      row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')
    );

    const bom = '\uFEFF';
    return bom + [header, ...dataRows].join('\n');
  },
});
