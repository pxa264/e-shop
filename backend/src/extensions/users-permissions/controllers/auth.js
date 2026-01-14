'use strict';

const crypto = require('crypto');
const urlJoin = require('url-join');

const utils = require('@strapi/utils');

const { getAbsoluteAdminUrl, getAbsoluteServerUrl } = utils;
const { sanitize } = utils;

const TOKEN_TTL_MS = 5 * 60 * 1000;

const buildTokenWithTs = (token) => `${token}:${Date.now()}`;

const parseTokenTs = (tokenWithTs) => {
  if (!tokenWithTs) return { token: null, ts: null };
  const parts = String(tokenWithTs).split(':');
  if (parts.length < 2) return { token: tokenWithTs, ts: null };
  const ts = Number(parts[parts.length - 1]);
  if (!Number.isFinite(ts)) return { token: tokenWithTs, ts: null };
  return { token: parts.slice(0, -1).join(':'), ts };
};

const isExpired = (ts) => {
  if (!ts) return true;
  return Date.now() - ts > TOKEN_TTL_MS;
};

const sanitizeUser = async (user, ctx) => {
  const { auth } = ctx.state;
  const userSchema = strapi.getModel('plugin::users-permissions.user');
  return sanitize.contentAPI.output(user, userSchema, { auth });
};

module.exports = (plugin) => {
  const { controllers } = plugin;

  controllers.auth.forgotPassword = async (ctx) => {
    const email = ctx?.request?.body?.email;

    if (!email || typeof email !== 'string') {
      return ctx.badRequest('Email is required');
    }

    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });

    const emailSettings = await pluginStore.get({ key: 'email' });
    const advancedSettings = await pluginStore.get({ key: 'advanced' });

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { email: email.toLowerCase() } });

    if (!user || user.blocked) {
      return ctx.send({ ok: true });
    }

    const resetPasswordToken = buildTokenWithTs(crypto.randomBytes(64).toString('hex'));

    const resetPasswordSettings = (emailSettings && emailSettings.reset_password && emailSettings.reset_password.options) || {};

    const userInfo = await sanitizeUser(user, ctx);

    const emailBody = await strapi
      .plugin('users-permissions')
      .service('users-permissions')
      .template(resetPasswordSettings.message, {
        URL: advancedSettings.email_reset_password,
        SERVER_URL: getAbsoluteServerUrl(strapi.config),
        ADMIN_URL: getAbsoluteAdminUrl(strapi.config),
        USER: userInfo,
        TOKEN: resetPasswordToken,
      });

    const emailObject = await strapi
      .plugin('users-permissions')
      .service('users-permissions')
      .template(resetPasswordSettings.object, {
        USER: userInfo,
      });

    await strapi
      .plugin('users-permissions')
      .service('user')
      .edit(user.id, { resetPasswordToken });

    await strapi.plugin('email').service('email').send({
      to: user.email,
      from:
        resetPasswordSettings.from?.email || resetPasswordSettings.from?.name
          ? `${resetPasswordSettings.from?.name} <${resetPasswordSettings.from?.email}>`
          : undefined,
      replyTo: resetPasswordSettings.response_email,
      subject: emailObject,
      text: emailBody,
      html: emailBody,
    });

    ctx.send({ ok: true });
  };

  controllers.auth.resetPassword = async (ctx) => {
    const { password, passwordConfirmation, code } = ctx?.request?.body || {};

    if (!code || typeof code !== 'string') {
      return ctx.badRequest('Incorrect code provided');
    }

    if (!password || !passwordConfirmation) {
      return ctx.badRequest('Password and passwordConfirmation are required');
    }

    if (password !== passwordConfirmation) {
      return ctx.badRequest('Passwords do not match');
    }

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { resetPasswordToken: code } });

    if (!user) {
      return ctx.badRequest('Incorrect code provided');
    }

    const { ts } = parseTokenTs(code);

    if (isExpired(ts)) {
      await strapi
        .plugin('users-permissions')
        .service('user')
        .edit(user.id, { resetPasswordToken: null });

      return ctx.badRequest('This reset password link has expired. Please request a new one.');
    }

    await strapi
      .plugin('users-permissions')
      .service('user')
      .edit(user.id, { resetPasswordToken: null, password });

    ctx.send({
      jwt: strapi.plugin('users-permissions').service('jwt').issue({ id: user.id }),
      user: await sanitizeUser(user, ctx),
    });
  };

  controllers.auth.emailConfirmation = async (ctx) => {
    const confirmationToken = ctx?.query?.confirmation;

    if (!confirmationToken || typeof confirmationToken !== 'string') {
      return ctx.badRequest('Invalid confirmation token');
    }

    const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });
    const advancedSettings = await pluginStore.get({ key: 'advanced' });

    const user = await strapi
      .query('plugin::users-permissions.user')
      .findOne({ where: { confirmationToken } });

    if (!user) {
      return ctx.badRequest('Invalid confirmation token');
    }

    const { ts } = parseTokenTs(confirmationToken);

    if (isExpired(ts)) {
      await strapi
        .plugin('users-permissions')
        .service('user')
        .edit(user.id, { confirmationToken: null });

      return ctx.badRequest('This confirmation link has expired. Please request a new one.');
    }

    await strapi
      .plugin('users-permissions')
      .service('user')
      .edit(user.id, { confirmed: true, confirmationToken: null });

    const redirectUrl = advancedSettings?.email_confirmation_redirection;

    if (redirectUrl) {
      return ctx.redirect(redirectUrl);
    }

    const apiPrefix = strapi.config.get('api.rest.prefix');
    const defaultRedirect = urlJoin(getAbsoluteServerUrl(strapi.config), apiPrefix);
    return ctx.redirect(defaultRedirect);
  };

  return plugin;
};
