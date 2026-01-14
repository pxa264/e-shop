import createMiddleware from 'next-intl/middleware'
import { defaultLocale, locales } from './i18n'

export default createMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'always'
})

export const config = {
  // 只处理前端路由，排除 Strapi 后端和系统路径
  matcher: [
    '/((?!api|admin|uploads|i18n|content-manager|content-type-builder|users-permissions|email|upload|documentation|logo\\.png|favicon\\.ico|_next|_vercel|.*\\..*).*)',
  ],
}
