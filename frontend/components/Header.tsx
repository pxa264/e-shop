/**
 * Header Component
 *
 * 网站头部导航组件
 *
 * 功能说明：
 * - 显示网站 Logo 和主导航菜单
 * - 实时显示购物车商品数量
 * - 响应式设计，支持移动端和桌面端
 * - 购物车数量通过自定义事件实时更新
 * - 用户认证状态显示（登录/注册/用户菜单）
 *
 * 状态管理：
 * - cartCount: 购物车商品总数（从 localStorage 读取）
 * - mobileMenuOpen: 移动端菜单展开状态
 * - userMenuOpen: 用户菜单展开状态
 *
 * 事件监听：
 * - cartUpdated: 购物车更新自定义事件
 *
 * @component
 * @example
 * return <Header />
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingCart, Search, Menu, X, Home, Package, User, LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { Link } from '@/navigation'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import { useTranslations } from 'next-intl'

export default function Header() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuth()
  const t = useTranslations()

  // 购物车商品数量
  const [cartCount, setCartCount] = useState(0)

  // 移动端菜单展开状态
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // 用户菜单展开状态
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  /**
   * 组件挂载时初始化购物车数量
   * 监听购物车更新事件，实时更新显示
   * 点击外部关闭用户菜单
   */
  useEffect(() => {
    // 初始化：加载购物车数量
    loadCartCount()

    /**
     * 购物车更新事件处理函数
     * 当其他页面添加/修改/删除购物车商品时触发
     */
    const handleCartUpdate = () => {
      loadCartCount()
    }

    // 监听自定义的购物车更新事件
    window.addEventListener('cartUpdated', handleCartUpdate)

    // 点击外部关闭用户菜单
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    // 组件卸载时清理事件监听器
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  /**
   * 加载购物车商品数量
   *
   * 功能：
   * - 从 localStorage 读取购物车数据
   * - 计算所有商品的数量总和
   * - 更新 cartCount 状态
   *
   * 错误处理：
   * - localStorage 解析失败时捕获错误
   * - 确保页面不会因为购物车数据问题而崩溃
   */
  const loadCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      // 计算购物车商品总数
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
      setCartCount(count)
    } catch (error) {
      console.error('Failed to load cart count:', error)
    }
  }

  /**
   * 退出登录
   */
  const handleLogout = () => {
    logout()
    router.push('/')
    setUserMenuOpen(false)
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="group flex items-center space-x-2">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-soft">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight group-hover:text-primary-600 transition-colors">
                E-Shop
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-10">
            <Link href="/" className="relative font-bold text-gray-600 hover:text-primary-600 transition-colors py-2 group">
              {t('nav.home')}
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-primary-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/products" className="relative font-bold text-gray-600 hover:text-primary-600 transition-colors py-2 group">
              {t('nav.products')}
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-primary-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link href="/about" className="relative font-bold text-gray-600 hover:text-primary-600 transition-colors py-2 group">
              {t('nav.about')}
              <span className="absolute bottom-0 left-0 w-0 h-1 bg-primary-500 rounded-full transition-all duration-300 group-hover:w-full"></span>
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-6">
            <LanguageSwitcher />
            {/* Search - placeholder functionality */}
            <button className="p-2 text-gray-400 hover:text-primary-600 transition-colors hidden sm:block">
              <Search className="w-5 h-5" />
            </button>

            {/* 用户区域 */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-1.5 pl-4 rounded-full bg-gray-50 border border-gray-100 hover:border-primary-200 hover:bg-primary-50 transition-all group"
                >
                  <span className="text-sm font-bold text-gray-700 group-hover:text-primary-700">{user?.username}</span>
                  <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 border border-primary-200">
                    <User className="w-4 h-4" />
                  </div>
                </button>

                {/* 用户下拉菜单 */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-premium py-2 ring-1 ring-black ring-opacity-5 animate-slide-up z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{t('account.menu.title')}</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                    </div>
                    <Link
                      href="/account"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4" />
                      <span>{t('account.menu.profile')}</span>
                    </Link>
                    <Link
                      href="/account/orders"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Package className="w-4 h-4" />
                      <span>{t('account.menu.orders')}</span>
                    </Link>
                    <Link
                      href="/account/favorites"
                      className="flex items-center space-x-3 px-4 py-3 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700 transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Home className="w-4 h-4" />
                      <span>{t('account.menu.favorites')}</span>
                    </Link>
                    <div className="border-t border-gray-50 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors font-bold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>{t('account.menu.logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:text-primary-600 transition-colors"
                >
                  {t('auth.login.cta')}
                </Link>
                <Link
                  href="/register"
                  className="px-6 py-2.5 text-sm font-bold text-white bg-primary-600 rounded-full hover:bg-primary-700 transition-all hover:shadow-soft active:scale-95"
                >
                  {t('auth.register.cta')}
                </Link>
              </div>
            )}

            {/* 购物车 */}
            <Link href="/cart" className="relative group">
              <div className="p-2.5 bg-gray-50 rounded-full text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all">
                <ShoppingCart className="w-5 h-5" />
              </div>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-gray-100 animate-slide-up">
            <div className="flex flex-col space-y-2">
              <Link
                href="/"
                className="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="w-5 h-5" />
                <span>{t('nav.home')}</span>
              </Link>
              <Link
                href="/products"
                className="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Package className="w-5 h-5" />
                <span>{t('nav.products')}</span>
              </Link>
              <Link
                href="/about"
                className="p-4 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('nav.about')}
              </Link>
              <Link
                href="/cart"
                className="flex items-center space-x-3 p-4 rounded-xl text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors font-bold"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>
                  {t('cart.title')} {cartCount > 0 && `(${cartCount})`}
                </span>
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
