'use strict';

const dashboard = require('./dashboard');
const productBulk = require('./product-bulk');
const orderExport = require('./order-export');
const categoryTree = require('./category-tree');
const productImport = require('./product-import');

module.exports = {
  dashboard,
  'product-bulk': productBulk,
  'order-export': orderExport,
  'category-tree': categoryTree,
  'product-import': productImport,
};
