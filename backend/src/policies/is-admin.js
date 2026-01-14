'use strict';

/**
 * is-admin policy
 *
 * 功能说明：
 * - 检查当前用户是否具有管理员角色
 * - 用于保护需要管理员权限的路由
 *
 * 使用方法：
 * 在 routes 配置中添加：
 * config: {
 *   policies: ['global::is-admin']
 * }
 *
 * 返回值：
 * - true：用户是管理员
 * - false：用户不是管理员或未认证
 */

module.exports = async (policyContext, config, { strapi }) => {
  // 检查用户是否已认证
  if (!policyContext.state || !policyContext.state.user) {
    return false;
  }

  // 获取用户角色信息
  const user = policyContext.state.user;

  // 检查用户角色类型是否为 'admin'
  // Strapi 的 users-permissions 插件会将角色信息存储在 user 对象中
  const isAdmin = user.role?.type === 'admin' || user.role?.name === 'Admin';

  return isAdmin;
};
