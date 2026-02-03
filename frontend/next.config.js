/** @type {import('next').NextConfig} */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const withNextIntl = require('next-intl/plugin')('./i18n/request.js')

const nextConfig = {
  output: 'standalone',
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: ['localhost', 'strapi.mulink.link'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'strapi.mulink.link',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
