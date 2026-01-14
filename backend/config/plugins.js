/**
 * Plugins Configuration
 *
 * Strapi 插件配置文件
 *
 * Email 插件配置说明：
 * - provider: 邮件服务提供商（nodemailer 或 sendgrid）
 * - providerOptions: 提供商特定的配置选项
 * - settings: 全局邮件设置
 *
 * 注意：邮件功能已暂时禁用，需要先安装依赖才能启用
 * 安装命令：npm install @strapi/provider-email-nodemailer
 *
 * 环境变量说明：
 * - SMTP_HOST: SMTP 服务器地址
 * - SMTP_PORT: SMTP 端口（通常 587 或 465）
 * - SMTP_USERNAME: SMTP 用户名
 * - SMTP_PASSWORD: SMTP 密码
 * - EMAIL_DEFAULT_FROM: 默认发件人邮箱
 * - EMAIL_DEFAULT_REPLY_TO: 默认回复邮箱
 */

module.exports = ({ env }) => ({
  'users-permissions': {
    config: {
      jwt: {
        expiresIn: '30m',
      },
    },
  },

  documentation: {
    enabled: env.bool('ENABLE_DOCUMENTATION', false),
    config: {
      openapi: '3.0.0',
    },
  },

  email: {
    config: {
      provider: 'nodemailer',
      providerOptions: {
        host: env('MAIL_HOST', env('SMTP_HOST', 'localhost')),
        port: env.int('MAIL_PORT', env.int('SMTP_PORT', 587)),
        secure:
          env('MAIL_ENCRYPTION', env('SMTP_ENCRYPTION', 'tls')).toLowerCase() === 'ssl' ||
          env.int('MAIL_PORT', env.int('SMTP_PORT', 587)) === 465,
        auth: {
          user: env('MAIL_USERNAME', env('SMTP_USERNAME')),
          pass: env('MAIL_PASSWORD', env('SMTP_PASSWORD')),
        },
      },
      settings: {
        defaultFrom: env('MAIL_FROM_ADDRESS', env('EMAIL_DEFAULT_FROM', 'noreply@yourstore.com')),
        defaultReplyTo: env('MAIL_FROM_ADDRESS', env('EMAIL_DEFAULT_REPLY_TO', 'noreply@yourstore.com')),
      },
    },
  },

  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          credentials: {
            accessKeyId: env('AWS_ACCESS_KEY_ID'),
            secretAccessKey: env('AWS_SECRET_ACCESS_KEY'),
          },
          endpoint: env('AWS_ENDPOINT', undefined),
          region: env('AWS_REGION', env('AWS_DEFAULT_REGION')),
          forcePathStyle: env.bool('AWS_USE_PATH_STYLE_ENDPOINT', false),
          params: {
            ACL: env('AWS_ACL', 'public-read'),
          },
        },
      },
      actionOptions: {
        upload: {
          Bucket: env('AWS_BUCKET'),
          ACL: env('AWS_ACL', 'public-read'),
        },
        uploadStream: {
          Bucket: env('AWS_BUCKET'),
          ACL: env('AWS_ACL', 'public-read'),
        },
        delete: {
          Bucket: env('AWS_BUCKET'),
        },
      },
      baseUrl: env('AWS_CLOUDFRONT_URL', env('AWS_RESOURCE_URL')),
    },
  },
});
