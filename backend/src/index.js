module.exports = {
  register({ strapi }) {
  },

  async bootstrap({ strapi }) {
    // users-permissions 邮件模板与跳转链接配置
    try {
      const frontendUrlRaw = process.env.FRONTEND_URL || 'http://localhost:3000';
      const frontendUrl = frontendUrlRaw.replace(/\/$/, '');

      const mailFromEmail = process.env.MAIL_FROM_ADDRESS;
      const mailFromName = process.env.MAIL_FROM_NAME;
      const mailReplyTo = process.env.MAIL_FROM_ADDRESS;

      const pluginStore = await strapi.store({ type: 'plugin', name: 'users-permissions' });

      const advanced = (await pluginStore.get({ key: 'advanced' })) || {};
      await pluginStore.set({
        key: 'advanced',
        value: {
          ...advanced,
          // 注册相关
          allow_register: true,
          unique_email: true,
          // 开启邮箱确认：注册后不会返回 jwt，需要用户点击邮件确认
          email_confirmation: true,
          // 忘记密码邮件里的 URL（模板会在后面拼 ?code=<%= TOKEN %> ）
          email_reset_password: `${frontendUrl}/reset-password`,
          // 邮箱确认成功后 Strapi 会 302 重定向到这里
          email_confirmation_redirection: `${frontendUrl}/email-confirmation?confirmed=1`,
        },
      });

      const emailSettings = (await pluginStore.get({ key: 'email' })) || {};

      const from = {
        email: mailFromEmail,
        name: mailFromName,
      };

      await pluginStore.set({
        key: 'email',
        value: {
          ...emailSettings,
          // 注册邮箱确认
          email_confirmation: {
            options: {
              from,
              response_email: mailReplyTo,
              object: 'Confirm your email address',
              message:
                '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f6f7fb; padding:24px;">' +
                '<div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; padding:28px; border:1px solid #eef0f4;">' +
                '<h2 style="margin:0 0 12px; color:#111827; font-size:20px;">Confirm your email</h2>' +
                '<p style="margin:0 0 14px; color:#374151; font-size:14px; line-height:1.6;">Hi <strong><%= USER.username %></strong>,</p>' +
                '<p style="margin:0 0 18px; color:#374151; font-size:14px; line-height:1.6;">Thanks for signing up. Please confirm your email address by clicking the button below. This link expires in <strong>5 minutes</strong>.</p>' +
                '<div style="margin:22px 0; text-align:center;">' +
                '<a href="<%= URL %>?confirmation=<%= CODE %>" style="display:inline-block; background:#2563eb; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:12px; font-weight:700;">Confirm Email</a>' +
                '</div>' +
                '<p style="margin:18px 0 0; color:#6b7280; font-size:12px; line-height:1.6;">If you did not create an account, you can safely ignore this email.</p>' +
                '</div>' +
                '</div>',
            },
          },
          // 忘记密码
          reset_password: {
            options: {
              from,
              response_email: mailReplyTo,
              object: 'Reset your password',
              message:
                '<div style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif; background:#f6f7fb; padding:24px;">' +
                '<div style="max-width:560px; margin:0 auto; background:#ffffff; border-radius:16px; padding:28px; border:1px solid #eef0f4;">' +
                '<h2 style="margin:0 0 12px; color:#111827; font-size:20px;">Reset your password</h2>' +
                '<p style="margin:0 0 14px; color:#374151; font-size:14px; line-height:1.6;">Hi <strong><%= USER.username %></strong>,</p>' +
                '<p style="margin:0 0 18px; color:#374151; font-size:14px; line-height:1.6;">We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>5 minutes</strong>.</p>' +
                '<div style="margin:22px 0; text-align:center;">' +
                '<a href="<%= URL %>?code=<%= TOKEN %>" style="display:inline-block; background:#111827; color:#ffffff; text-decoration:none; padding:12px 18px; border-radius:12px; font-weight:700;">Reset Password</a>' +
                '</div>' +
                '<p style="margin:18px 0 0; color:#6b7280; font-size:12px; line-height:1.6;">If you did not request this, you can safely ignore this email.</p>' +
                '</div>' +
                '</div>',
            },
          },
        },
      });

      strapi.log.info('Users-permissions email templates configured');
    } catch (error) {
      strapi.log.error(`Bootstrap users-permissions email template error: ${error.message}`);
    }

    // 自动设置 API 权限
    try {
      const authenticatedRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'authenticated' } });

      if (authenticatedRole) {
        // 获取所有需要设置权限的 actions
        const actionsToEnable = [
          // user-profile
          'api::user-profile.user-profile.me',
          'api::user-profile.user-profile.updateProfile',
          'api::user-profile.user-profile.changePassword',
          'api::user-profile.user-profile.getMyOrders',
          'api::user-profile.user-profile.getMyStatistics',
          // user-address
          'api::user-address.user-address.find',
          'api::user-address.user-address.findOne',
          'api::user-address.user-address.create',
          'api::user-address.user-address.update',
          'api::user-address.user-address.delete',
          'api::user-address.user-address.setDefault',
          // wishlist
          'api::wishlist.wishlist.find',
          'api::wishlist.wishlist.findOne',
          'api::wishlist.wishlist.create',
          'api::wishlist.wishlist.delete',
          'api::wishlist.wishlist.toggle',
          'api::wishlist.wishlist.check',
          // order (read only for users)
          'api::order.order.find',
          'api::order.order.findOne',
          // order (custom actions for users)
          'api::order.order.getMyOrderDetail',
          'api::order.order.cancelOrder',
        ];

        // 使用 users-permissions 插件的服务来更新权限
        const permissionsService = strapi.plugin('users-permissions').service('role');
        
        // 获取当前角色的权限
        const role = await permissionsService.findOne(authenticatedRole.id);
        
        // 更新权限
        const permissions = role.permissions || {};
        
        for (const action of actionsToEnable) {
          const [, apiName, controllerName, actionName] = action.match(/api::([^.]+)\.([^.]+)\.(.+)/) || [];
          if (apiName && controllerName && actionName) {
            if (!permissions[`api::${apiName}`]) {
              permissions[`api::${apiName}`] = { controllers: {} };
            }
            if (!permissions[`api::${apiName}`].controllers[controllerName]) {
              permissions[`api::${apiName}`].controllers[controllerName] = {};
            }
            permissions[`api::${apiName}`].controllers[controllerName][actionName] = { enabled: true };
          }
        }

        await permissionsService.updateRole(authenticatedRole.id, { permissions });
        strapi.log.info('API permissions configured for authenticated users');
      }
    } catch (error) {
      strapi.log.error(`Bootstrap error: ${error.message}`);
    }
  },
};
