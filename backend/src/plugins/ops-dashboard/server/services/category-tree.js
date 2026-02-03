'use strict';

module.exports = ({ strapi }) => ({
  /**
   * Build tree structure from flat category list
   */
  buildTree(categories, parentId = null) {
    const tree = [];

    for (const category of categories) {
      const categoryParentId = category.parent?.id || null;

      if (categoryParentId === parentId) {
        const children = this.buildTree(categories, category.id);
        tree.push({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          sortOrder: category.sortOrder || 0,
          productCount: category.products?.length || 0,
          parent: category.parent ? { id: category.parent.id, name: category.parent.name } : null,
          children: children,
        });
      }
    }

    // Sort by sortOrder
    tree.sort((a, b) => a.sortOrder - b.sortOrder);
    return tree;
  },

  /**
   * Calculate max depth of tree
   */
  calculateMaxDepth(tree, currentDepth = 1) {
    let maxDepth = currentDepth;

    for (const node of tree) {
      if (node.children && node.children.length > 0) {
        const childDepth = this.calculateMaxDepth(node.children, currentDepth + 1);
        maxDepth = Math.max(maxDepth, childDepth);
      }
    }

    return maxDepth;
  },

  /**
   * Get category tree structure
   */
  async getCategoryTree() {
    const categories = await strapi.entityService.findMany('api::category.category', {
      populate: {
        parent: { fields: ['id', 'name'] },
        products: { fields: ['id'] },
      },
      sort: { sortOrder: 'asc' },
    });

    const tree = this.buildTree(categories, null);
    const maxDepth = tree.length > 0 ? this.calculateMaxDepth(tree) : 0;

    return {
      tree,
      totalCount: categories.length,
      maxDepth,
    };
  },

  /**
   * Validate circular reference - prevent category from being moved to its own descendant
   */
  async validateCircularReference(categoryId, newParentId) {
    if (!newParentId) {
      return true; // Moving to root level is always valid
    }

    if (categoryId === newParentId) {
      return false; // Cannot be parent of itself
    }

    // Traverse up from newParentId to check if categoryId is an ancestor
    let currentId = newParentId;
    const visited = new Set();

    while (currentId) {
      if (visited.has(currentId)) {
        return false; // Circular reference detected
      }
      visited.add(currentId);

      if (currentId === categoryId) {
        return false; // categoryId is an ancestor of newParentId
      }

      const category = await strapi.entityService.findOne('api::category.category', currentId, {
        populate: { parent: { fields: ['id'] } },
      });

      currentId = category?.parent?.id || null;
    }

    return true;
  },

  /**
   * Move category to new parent
   */
  async moveCategory(categoryId, newParentId, newSortOrder = 0) {
    // Validate category exists
    const category = await strapi.entityService.findOne('api::category.category', categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Validate new parent exists (if not null)
    if (newParentId) {
      const newParent = await strapi.entityService.findOne('api::category.category', newParentId);
      if (!newParent) {
        throw new Error('New parent category not found');
      }
    }

    // Validate circular reference
    const isValid = await this.validateCircularReference(categoryId, newParentId);
    if (!isValid) {
      throw new Error('Cannot move category: circular reference detected');
    }

    // Update category
    const updated = await strapi.entityService.update('api::category.category', categoryId, {
      data: {
        parent: newParentId || null,
        sortOrder: newSortOrder,
      },
      populate: { parent: { fields: ['id', 'name'] } },
    });

    return updated;
  },

  /**
   * Reorder categories (bulk update sortOrder)
   */
  async reorderCategories(updates) {
    const results = { success: [], failed: [] };

    for (const update of updates) {
      try {
        await strapi.entityService.update('api::category.category', update.id, {
          data: { sortOrder: update.sortOrder },
        });
        results.success.push(update.id);
      } catch (error) {
        results.failed.push({ id: update.id, error: error.message });
      }
    }

    return results;
  },
});
