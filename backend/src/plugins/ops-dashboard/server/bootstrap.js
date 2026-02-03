/**
 * @fileoverview Plugin Bootstrap
 * @description Registers plugin permissions on startup.
 *              Simplified to 5 Access permissions, actual data operation
 *              permissions are controlled by Content Manager collection types.
 * @module ops-dashboard/bootstrap
 */

'use strict';

module.exports = async ({ strapi }) => {
  // Register plugin permission actions
  // Simplified to 5 Access permissions; actual data operations use Content Manager permissions
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access Products',
      uid: 'products',
      pluginName: 'ops-dashboard',
    },
    {
      section: 'plugins',
      displayName: 'Access Orders',
      uid: 'orders',
      pluginName: 'ops-dashboard',
    },
    {
      section: 'plugins',
      displayName: 'Access Categories',
      uid: 'categories',
      pluginName: 'ops-dashboard',
    },
    {
      section: 'plugins',
      displayName: 'Access Banners',
      uid: 'banners',
      pluginName: 'ops-dashboard',
    },
    {
      section: 'plugins',
      displayName: 'Access Customers',
      uid: 'customers',
      pluginName: 'ops-dashboard',
    },
  ];

  await strapi.admin.services.permission.actionProvider.registerMany(actions);
};
