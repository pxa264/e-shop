import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { NotFound } from '@strapi/helper-plugin';
import pluginId from '../../pluginId';
import Dashboard from '../Dashboard';
import ProductManagement from '../ProductManagement';
import OrderManagement from '../OrderManagement';
import CategoryManagement from '../CategoryManagement';
import BannerManagement from '../BannerManagement';
import CustomerManagement from '../CustomerManagement';

const App = () => {
  return (
    <Switch>
      <Route path={`/plugins/${pluginId}`} component={Dashboard} exact />
      <Route path={`/plugins/${pluginId}/products`} component={ProductManagement} exact />
      <Route path={`/plugins/${pluginId}/orders`} component={OrderManagement} exact />
      <Route path={`/plugins/${pluginId}/categories`} component={CategoryManagement} exact />
      <Route path={`/plugins/${pluginId}/banners`} component={BannerManagement} exact />
      <Route path={`/plugins/${pluginId}/customers`} component={CustomerManagement} exact />
      <Route component={NotFound} />
    </Switch>
  );
};

export default App;
