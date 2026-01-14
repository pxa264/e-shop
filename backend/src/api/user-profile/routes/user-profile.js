'use strict';

/**
 * user-profile router
 * 
 * 独立的用户资料管理路由
 */

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/user-profile/me',
      handler: 'user-profile.me',
      config: {
        policies: [],
      },
    },
    {
      method: 'PUT',
      path: '/user-profile/me',
      handler: 'user-profile.updateProfile',
      config: {
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/user-profile/change-password',
      handler: 'user-profile.changePassword',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/user-profile/orders',
      handler: 'user-profile.getMyOrders',
      config: {
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/user-profile/statistics',
      handler: 'user-profile.getMyStatistics',
      config: {
        policies: [],
      },
    },
  ],
};
