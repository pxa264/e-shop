/**
 * Strapi Admin Panel Customization
 *
 * Documentation: https://docs.strapi.io/dev-docs/admin-panel-customization
 *
 * Features:
 * - Role-based UI isolation (non-super-admin sees customized interface)
 * - Menu reorganization (direct access to Category, Product, etc.)
 * - Custom homepage for non-admin users
 * - Hide Settings, Releases, and NPS survey
 */

import React from 'react';
import './custom-admin.css';

// Custom Homepage Component for non-admin users
const CustomHomepage = () => {
  return React.createElement(
    'div',
    { style: { padding: '40px', maxWidth: '1200px', margin: '0 auto' } },
    React.createElement('h1', { style: { fontSize: '32px', marginBottom: '20px' } }, 'Operations Dashboard'),
    React.createElement('p', { style: { fontSize: '16px', color: '#666', marginBottom: '40px' } },
      'Welcome to the E-Shop Management System. Please select an option from the left menu.'
    ),
    React.createElement(
      'div',
      { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' } },
      React.createElement(
        'div',
        { style: { padding: '24px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' } },
        React.createElement('h3', { style: { fontSize: '18px', marginBottom: '8px' } }, '📦 Product Management'),
        React.createElement('p', { style: { fontSize: '14px', color: '#666' } }, 'Manage products, inventory, and pricing')
      ),
      React.createElement(
        'div',
        { style: { padding: '24px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' } },
        React.createElement('h3', { style: { fontSize: '18px', marginBottom: '8px' } }, '📂 Category Management'),
        React.createElement('p', { style: { fontSize: '14px', color: '#666' } }, 'Organize and maintain product categories')
      ),
      React.createElement(
        'div',
        { style: { padding: '24px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' } },
        React.createElement('h3', { style: { fontSize: '18px', marginBottom: '8px' } }, '📊 Content Management'),
        React.createElement('p', { style: { fontSize: '14px', color: '#666' } }, 'Manage website content and media assets')
      )
    )
  );
};

export default {
  config: {
    // Custom page title (browser tab)
    head: {
      favicon: '/favicon.ico',
    },

    // Custom Logo
    auth: {
      logo: '/logo.png', // Login page logo
    },

    menu: {
      logo: '/logo.png', // Sidebar logo
    },

    // Enable Chinese language
    locales: [
      'zh-Hans',
    ],

    // Custom theme colors
    theme: {
      light: {
        colors: {
          primary100: '#fff5f0',
          primary200: '#ffe8db',
          primary500: '#f97316', // Primary color (orange)
          primary600: '#ea580c',
          primary700: '#c2410c',
          danger700: '#b72b1a',
        },
      },
    },

    // Custom translations
    translations: {
      zh: {
        'app.components.LeftMenu.navbrand.title': 'E-Shop Admin',
        'app.components.LeftMenu.navbrand.workplace': 'E-Commerce Management',
      },
    },

    // Disable tutorials and notifications
    tutorials: false,
    notifications: { releases: false },
  },

  /**
   * Register hook: Add custom menu links
   * Provides direct access to content types without going through Content Manager
   */
  register(app) {
    // Add Category quick access menu
    app.addMenuLink({
      to: '/content-manager/collection-types/api::category.category',
      icon: () => React.createElement('span', null, '📂'),
      intlLabel: {
        id: 'menu.category',
        defaultMessage: 'Categories',
      },
      permissions: [],
    });

    // Add Product quick access menu
    app.addMenuLink({
      to: '/content-manager/collection-types/api::product.product',
      icon: () => React.createElement('span', null, '📦'),
      intlLabel: {
        id: 'menu.product',
        defaultMessage: 'Products',
      },
      permissions: [],
    });
  },

  /**
   * Bootstrap hook: Initialize admin panel customizations
   * Injects body class for role-based styling and custom homepage
   */
  bootstrap(app) {
    console.log('Strapi Admin Panel Loaded');

    // Inject body class based on user role
    const injectRoleBasedClass = () => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectRoleBasedClass);
        return;
      }

      // Get user info from localStorage
      const userInfoStr = localStorage.getItem('userInfo') ||
                          localStorage.getItem('strapi-admin-user');

      if (!userInfoStr) {
        setTimeout(injectRoleBasedClass, 1000);
        return;
      }

      try {
        const userInfo = JSON.parse(userInfoStr);
        const roles = userInfo.roles || [];
        const isSuperAdmin = roles.some(role =>
          role.code === 'strapi-super-admin' ||
          role.name === 'Super Admin'
        );

        // Add body class for non-admin users
        if (!isSuperAdmin) {
          document.body.classList.add('custom-operator-view');
          console.log('Operator view enabled');
        }
      } catch (error) {
        console.error('Error parsing user info:', error);
      }
    };

    // Inject custom homepage for non-admin users
    const injectCustomHomepage = () => {
      const currentPath = window.location.pathname;
      if ((currentPath === '/admin' || currentPath === '/admin/') &&
          document.body.classList.contains('custom-operator-view')) {

        // Find the main content area
        const mainContent = document.querySelector('main');
        if (mainContent && !document.getElementById('custom-homepage-injected')) {
          // Hide ALL original content in main
          Array.from(mainContent.children).forEach(child => {
            child.style.display = 'none';
          });

          // Inject custom homepage
          const customDiv = document.createElement('div');
          customDiv.id = 'custom-homepage-injected';
          customDiv.style.display = 'block';
          const root = document.createElement('div');
          customDiv.appendChild(root);
          mainContent.appendChild(customDiv);

          // Render custom homepage component
          const React = require('react');
          const ReactDOM = require('react-dom');
          ReactDOM.render(React.createElement(CustomHomepage), root);
        }
      }
    };

    // Hide GENERAL section in navigation (more precise targeting)
    const hideGeneralSection = () => {
      if (!document.body.classList.contains('custom-operator-view')) return;

      const navElements = document.querySelectorAll('nav *');
      navElements.forEach(el => {
        const text = el.textContent?.trim();
        if (text === 'GENERAL' && el.tagName !== 'A') {
          // Hide the element and its parent container
          el.style.display = 'none';
          if (el.parentElement) {
            el.parentElement.style.display = 'none';
          }
        }
      });
    };

    // Execute immediately
    injectRoleBasedClass();
    setTimeout(() => {
      hideGeneralSection();
      injectCustomHomepage();
    }, 500);

    // Monitor for route changes
    const observer = new MutationObserver(() => {
      hideGeneralSection();
      injectCustomHomepage();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    // Also listen to popstate for navigation
    window.addEventListener('popstate', () => {
      injectRoleBasedClass();
      setTimeout(() => {
        hideGeneralSection();
        injectCustomHomepage();
      }, 100);
    });
  },
};
