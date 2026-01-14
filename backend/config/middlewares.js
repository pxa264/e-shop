module.exports = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'connect-src': [
            "'self'",
            'https:',
            'https://meeriad-v3.s3.cn-north-1.amazonaws.com.cn',
          ],
          'img-src': [
            "'self'",
            'data:',
            'blob:',
            'https://market-assets.strapi.io',
            'https://meeriad-v3.s3.cn-north-1.amazonaws.com.cn',
          ],
          'media-src': [
            "'self'",
            'data:',
            'blob:',
            'https://meeriad-v3.s3.cn-north-1.amazonaws.com.cn',
          ],
          upgradeInsecureRequests: null,
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      enabled: true,
      origin: [
        'http://localhost:3000',
        'http://127.0.0.1:3000',
        'http://localhost:1337',
        'http://127.0.0.1:1337',
        'http://localhost:8080',
        'http://127.0.0.1:8080',
      ],
      headers: [
        'Content-Type',
        'Authorization',
        'Origin',
        'Accept',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
