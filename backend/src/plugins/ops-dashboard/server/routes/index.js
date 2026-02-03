module.exports = [
  // Dashboard stats
  {
    method: 'GET',
    path: '/stats',
    handler: 'dashboard.getStats',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.read'],
      },
    },
  },
  // Product management routes
  {
    method: 'GET',
    path: '/products',
    handler: 'product.getProducts',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  {
    method: 'POST',
    path: '/products/bulk/publish',
    handler: 'product.bulkPublish',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  {
    method: 'POST',
    path: '/products/bulk/category',
    handler: 'product.bulkUpdateCategory',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  {
    method: 'POST',
    path: '/products/bulk/price',
    handler: 'product.bulkUpdatePrice',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  {
    method: 'POST',
    path: '/products/bulk/stock',
    handler: 'product.bulkUpdateStock',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  {
    method: 'POST',
    path: '/products/bulk/delete',
    handler: 'product.bulkDelete',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  // Product import routes
  {
    method: 'GET',
    path: '/products/import/template',
    handler: 'product.downloadTemplate',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  {
    method: 'POST',
    path: '/products/import/preview',
    handler: 'product.previewImport',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  {
    method: 'POST',
    path: '/products/import',
    handler: 'product.importProducts',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  {
    method: 'GET',
    path: '/products/export',
    handler: 'product.exportProducts',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.products'],
      },
    },
  },
  // Order management routes
  {
    method: 'GET',
    path: '/orders',
    handler: 'order.getOrders',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.orders'],
      },
    },
  },
  {
    method: 'POST',
    path: '/orders/export',
    handler: 'order.exportOrders',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.orders'],
      },
    },
  },
  {
    method: 'GET',
    path: '/orders/stats',
    handler: 'order.getOrderStats',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.orders'],
      },
    },
  },
  // Category management routes
  {
    method: 'GET',
    path: '/categories/tree',
    handler: 'category.getCategoryTree',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.categories'],
      },
    },
  },
  {
    method: 'POST',
    path: '/categories/move',
    handler: 'category.moveCategory',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.categories'],
      },
    },
  },
  {
    method: 'POST',
    path: '/categories/reorder',
    handler: 'category.reorderCategories',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.categories'],
      },
    },
  },
  {
    method: 'POST',
    path: '/categories',
    handler: 'category.createCategory',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.categories'],
      },
    },
  },
  {
    method: 'PUT',
    path: '/categories/:id',
    handler: 'category.updateCategory',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.categories'],
      },
    },
  },
  {
    method: 'DELETE',
    path: '/categories/:id',
    handler: 'category.deleteCategory',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.categories'],
      },
    },
  },
  // Banner management routes
  {
    method: 'GET',
    path: '/banners',
    handler: 'banner.getBanners',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.banners'],
      },
    },
  },
  {
    method: 'POST',
    path: '/banners/reorder',
    handler: 'banner.reorderBanners',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.banners'],
      },
    },
  },
  {
    method: 'POST',
    path: '/banners/bulk/toggle',
    handler: 'banner.bulkToggle',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.banners'],
      },
    },
  },
  {
    method: 'POST',
    path: '/banners/bulk/delete',
    handler: 'banner.bulkDelete',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.banners'],
      },
    },
  },
  {
    method: 'PUT',
    path: '/banners/:id',
    handler: 'banner.updateBanner',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.banners'],
      },
    },
  },
  // Customer management routes
  {
    method: 'GET',
    path: '/customers',
    handler: 'customer.getCustomers',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.customers'],
      },
    },
  },
  {
    method: 'GET',
    path: '/customers/stats',
    handler: 'customer.getCustomerStats',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.customers'],
      },
    },
  },
  {
    method: 'GET',
    path: '/customers/:id',
    handler: 'customer.getCustomer',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.customers'],
      },
    },
  },
  {
    method: 'GET',
    path: '/customers/:id/orders',
    handler: 'customer.getCustomerOrders',
    config: {
      auth: {
        scope: ['plugin::ops-dashboard.customers'],
      },
    },
  },
];
