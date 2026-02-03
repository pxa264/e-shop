'use strict';

module.exports = async (policyContext, config, { strapi }) => {
  const user = policyContext.state.user;

  if (!user) {
    return false;
  }

  // Allow Super Admin, Operator, Editor
  const allowedRoles = ['strapi-super-admin', 'operator', 'editor'];
  const userRole = user.roles?.[0]?.code || user.role?.type;

  return allowedRoles.includes(userRole);
};
