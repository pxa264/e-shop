/**
 * @fileoverview Permission Synchronization Utility
 * @description Reads Content Manager permission settings and applies the same
 *              conditions to ops-dashboard plugin. Enables synchronization with
 *              collection type permissions for consistent access control.
 * @module ops-dashboard/utils/permission-sync
 */

'use strict';

/**
 * Check if user is a Super Admin.
 * Super Admins have unrestricted access to all data.
 *
 * @param {object} user - Admin user object
 * @returns {boolean} True if user is Super Admin
 */
const isSuperAdmin = (user) => {
  if (!user || !user.roles) return false;
  return user.roles.some(role =>
    role.code === 'strapi-super-admin' || role.name === 'Super Admin'
  );
};

/**
 * Map plugin operation names to Content Manager action names.
 *
 * Content Manager stores actions in the database with format:
 *   action:  'plugin::content-manager.explorer.read'
 *   subject: 'api::product.product'
 *   conditions: ['admin::is-creator']
 *
 * @constant {object}
 */
const OPERATION_MAP = {
  'find': 'read',
  'findOne': 'read',
  'create': 'create',
  'update': 'update',
  'delete': 'delete',
  'publish': 'publish',
};

/**
 * Get user's permission conditions for a collection type.
 *
 * @param {object} strapi - Strapi instance
 * @param {object} user - Current admin user
 * @param {string} collectionType - Collection type UID (e.g., 'api::product.product')
 * @param {string} operation - Operation type: 'find', 'findOne', 'create', 'update', 'delete'
 * @returns {Promise<{hasPermission: boolean, conditions: string[], hasCreatorCondition: boolean}>}
 */
const getPermissionConditions = async (strapi, user, collectionType, operation = 'find') => {
  // Super Admin has no restrictions
  if (isSuperAdmin(user)) {
    return {
      hasPermission: true,
      conditions: [],
      hasCreatorCondition: false,
    };
  }

  const roleIds = user.roles?.map(r => r.id) || [];
  if (roleIds.length === 0) {
    return {
      hasPermission: false,
      conditions: [],
      hasCreatorCondition: false,
    };
  }

  try {
    // Map operation name to Content Manager format
    const cmOperation = OPERATION_MAP[operation] || operation;

    // Content Manager action format in database:
    //   action:  'plugin::content-manager.explorer.read'
    //   subject: 'api::product.product'
    const action = `plugin::content-manager.explorer.${cmOperation}`;

    // Query permissions for this role and collection type
    const permissions = await strapi.db.query('admin::permission').findMany({
      where: {
        role: { id: { $in: roleIds } },
        action: action,
        subject: collectionType,
      },
    });

    if (permissions.length === 0) {
      return {
        hasPermission: false,
        conditions: [],
        hasCreatorCondition: false,
      };
    }

    // Merge conditions from all permissions
    const allConditions = permissions.flatMap(p => p.conditions || []);
    const uniqueConditions = [...new Set(allConditions)];

    return {
      hasPermission: true,
      conditions: uniqueConditions,
      hasCreatorCondition: uniqueConditions.includes('admin::is-creator'),
    };
  } catch (error) {
    strapi.log.error(`[ops-dashboard] Permission sync error: ${error.message}`);
    // Return false on error for safety
    return {
      hasPermission: false,
      conditions: [],
      hasCreatorCondition: false,
    };
  }
};

/**
 * Build filter object based on Content Manager permission conditions.
 *
 * @param {object} strapi - Strapi instance
 * @param {object} user - Current admin user
 * @param {string} collectionType - Collection type UID (e.g., 'api::product.product')
 * @param {string} operation - Operation type
 * @returns {Promise<object|null>} Filter object or null (no restriction)
 */
const buildFilterFromPermissions = async (strapi, user, collectionType, operation = 'find') => {
  // Super Admin - no filtering
  if (isSuperAdmin(user)) {
    return null;
  }

  const permissionInfo = await getPermissionConditions(strapi, user, collectionType, operation);

  // No permission - return filter that matches nothing
  if (!permissionInfo.hasPermission) {
    return { id: { $eq: -1 } }; // Will not match any record
  }

  // Has is-creator condition - apply createdBy filter
  if (permissionInfo.hasCreatorCondition) {
    return { createdBy: { id: user.id } };
  }

  // Has permission but no special conditions - no filtering
  return null;
};

/**
 * Check if user has access to a specific entity based on Content Manager permissions.
 *
 * @param {object} strapi - Strapi instance
 * @param {object} user - Current admin user
 * @param {string} collectionType - Collection type UID
 * @param {object} entity - Entity to check (must have createdBy field populated)
 * @param {string} operation - Operation type
 * @returns {Promise<boolean>} True if user can access the entity
 */
const canAccessEntity = async (strapi, user, collectionType, entity, operation = 'update') => {
  // Super Admin can access all
  if (isSuperAdmin(user)) {
    return true;
  }

  const permissionInfo = await getPermissionConditions(strapi, user, collectionType, operation);

  // No permission
  if (!permissionInfo.hasPermission) {
    return false;
  }

  // Has is-creator condition - check createdBy
  if (permissionInfo.hasCreatorCondition) {
    return entity.createdBy?.id === user.id;
  }

  // Has permission with no special conditions
  return true;
};

/**
 * Get user ID for ownership checks.
 * Returns null for Super Admin (no filtering needed).
 *
 * @param {object} user - Admin user object
 * @returns {number|null} User ID or null for Super Admin
 */
const getUserId = (user) => {
  if (isSuperAdmin(user)) {
    return null;
  }
  return user?.id || null;
};

/**
 * Quick method: Get createdBy filter (compatible with legacy code).
 * This method doesn't query the database, suitable for simple scenarios.
 *
 * @param {object} user - Admin user object
 * @returns {object|null} Filter object or null for Super Admin
 */
const getCreatedByFilter = (user) => {
  if (isSuperAdmin(user)) {
    return null;
  }
  const userId = user?.id;
  if (!userId) return null;
  return { createdBy: { id: userId } };
};

module.exports = {
  isSuperAdmin,
  getUserId,
  getCreatedByFilter,
  getPermissionConditions,
  buildFilterFromPermissions,
  canAccessEntity,
};
