'use strict';

/**
 * Users-Permissions 插件扩展入口
 * 
 * 功能说明：
 * - 注册自定义控制器方法
 * - 注册自定义路由
 * - 扩展用户相关 API
 */

const userController = require('./controllers/user');
const authController = require('./controllers/auth');
const userService = require('./services/user');
const userRoutes = require('./routes/user');

module.exports = (plugin) => {
  // 扩展控制器
  plugin = userController(plugin);
  plugin = authController(plugin);

  // 扩展 services
  plugin = userService(plugin);
  
  // 扩展路由
  plugin = userRoutes(plugin);
  
  return plugin;
};
