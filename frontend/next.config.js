/** @type {import('next').NextConfig} */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const withNextIntl = require('next-intl/plugin')('./i18n/request.js')

const nextConfig = {
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = withNextIntl(nextConfig)
