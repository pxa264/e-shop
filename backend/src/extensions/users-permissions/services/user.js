'use strict';

const crypto = require('crypto');
const urlJoin = require('url-join');

const { getAbsoluteAdminUrl, getAbsoluteServerUrl, sanitize } = require('@strapi/utils');

const TOKEN_TTL_MS = 5 * 60 * 1000;

const buildTokenWithTs = (token) => `${token}:${Date.now()}`;

module.exports = (plugin) => {
  const userService = plugin.services.user;

  plugin.services.user.sendConfirmationEmail = async (user) => {
    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
    const userSchema = strapi.getModel('plugin::users-permissions.user');

    const settings = await pluginStore
      .get({ key: 'email' })
      .then((storeEmail) => storeEmail.email_confirmation.options);

    const sanitizedUserInfo = await sanitize.sanitizers.defaultSanitizeOutput(userSchema, user);

    const rawToken = crypto.randomBytes(20).toString('hex');
    const confirmationToken = buildTokenWithTs(rawToken);

    await userService.edit(user.id, { confirmationToken });

    const apiPrefix = strapi.config.get('api.rest.prefix');

    const usersPermissionsService = plugin.services['users-permissions'];

    try {
      settings.message = await usersPermissionsService.template(settings.message, {
        URL: urlJoin(getAbsoluteServerUrl(strapi.config), apiPrefix, '/auth/email-confirmation'),
        SERVER_URL: getAbsoluteServerUrl(strapi.config),
        ADMIN_URL: getAbsoluteAdminUrl(strapi.config),
        USER: sanitizedUserInfo,
        CODE: confirmationToken,
        TOKEN_TTL_MINUTES: Math.floor(TOKEN_TTL_MS / 60000),
      });

      settings.object = await usersPermissionsService.template(settings.object, {
        USER: sanitizedUserInfo,
      });
    } catch {
      strapi.log.error(
        '[plugin::users-permissions.sendConfirmationEmail]: Failed to generate a template for "user confirmation email". Please make sure your email template is valid.'
      );
      return;
    }

    await strapi.plugin('email').service('email').send({
      to: user.email,
      from:
        settings.from?.email && settings.from?.name
          ? `${settings.from.name} <${settings.from.email}>`
          : undefined,
      replyTo: settings.response_email,
      subject: settings.object,
      text: settings.message,
      html: settings.message,
    });
  };

  return plugin;
};
