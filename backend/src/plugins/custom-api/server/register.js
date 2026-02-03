'use strict';

module.exports = ({ strapi }) => {
  // 注册 Custom API 插件权限
  const actions = [
    {
      section: 'plugins',
      displayName: 'Access Custom API',
      uid: 'read',
      pluginName: 'custom-api',
    },
  ];

  strapi.admin.services.permission.actionProvider.registerMany(actions);
};
