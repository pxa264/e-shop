'use strict';

module.exports = ({ strapi }) => {
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access Dashboard',
      uid: 'read',
      pluginName: 'ops-dashboard',
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
};
