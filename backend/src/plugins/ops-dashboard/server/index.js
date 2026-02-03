'use strict';

const register = require('./register');
const bootstrap = require('./bootstrap');
const routes = require('./routes');
const controllers = require('./controllers');
const services = require('./services');
const policies = require('./policies');

module.exports = {
  register,
  bootstrap,
  routes,
  controllers,
  services,
  policies,
};
