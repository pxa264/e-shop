module.exports = {
  async check(ctx) {
    try {
      // Check database connection
      await strapi.db.connection.raw('SELECT 1');

      ctx.body = {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      };
    } catch (error) {
      ctx.status = 503;
      ctx.body = {
        status: 'error',
        message: error.message,
      };
    }
  },
};
