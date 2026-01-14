'use strict';

/**
 * is-authenticated policy
 *
 * 功能说明：
 * - 检查请求是否包含有效的 JWT token
 * - 验证用户身份是否已认证
 * - 用于保护需要登录才能访问的路由
 *
 * 使用方法：
 * 在 routes 配置中添加：
 * config: {
 *   policies: ['is-authenticated']
 * }
 *
 * 优先级：在所有 controller 执行之前运行
 *
 * 返回值：
 * - true：用户已认证，继续执行
 * - false：用户未认证，返回 401 Unauthorized
 */

module.exports = async (policyContext, config, { strapi }) => {
  // ctx.state.user 是由 Strapi 的 Users & Permissions 插件设置的
  // 如果 JWT token 有效，会包含用户信息
  if (policyContext.state && policyContext.state.user) {
    // 用户已认证
    return true;
  }

  // 用户未认证
  return false;
};
