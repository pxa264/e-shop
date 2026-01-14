'use client';

/**
 * 个人中心首页
 *
 * 功能说明：
 * - 欢迎信息
 * - 快捷操作入口
 * - 账户信息摘要（订单统计等）
 */

import { useEffect, useState } from 'react';
import { getMyStatistics } from '@/lib/api';
import { Link, useRouter } from '@/navigation'
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  Heart, 
  MapPin, 
  ChevronRight,
  User,
  ShoppingBag
} from 'lucide-react';
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

export default function AccountHomePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const t = useTranslations();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const hour = new Date().getHours();
  const greetingKey =
    hour >= 5 && hour < 11
      ? 'account.home.greeting.morning'
      : hour >= 11 && hour < 14
        ? 'account.home.greeting.noon'
        : hour >= 14 && hour < 18
          ? 'account.home.greeting.afternoon'
          : hour >= 18 && hour < 22
            ? 'account.home.greeting.evening'
            : 'account.home.greeting.lateNight';

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const data = await getMyStatistics();
        setStats(data.data);
      } catch (error) {
        const status = (error as any)?.response?.status;
        if (status === 401 || status === 403) {
          setAuthError(true);

          if (status === 401) {
            toast.error(t('account.auth.toast.expired'));
          } else {
            toast.error(t('account.auth.toast.banned'));
          }

          logout();
          router.push('/login');
          return;
        }
        console.error('Failed to fetch statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatistics();
  }, [logout, router]);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (authError) {
    return null;
  }

  const safeStats = stats ?? {
    orders: {
      total: 0,
      pending: 0,
      processing: 0,
      shipped: 0,
      completed: 0,
    },
    addressCount: 0,
    wishlistCount: 0,
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-fade-in">
      {/* 欢迎信息 */}
      <div className="relative overflow-hidden rounded-[2rem] bg-secondary-900 p-8 lg:p-12 text-white shadow-premium">
        <div className="relative z-10">
          <h1 className="text-3xl lg:text-4xl font-black mb-4">
            {t(greetingKey)}{user?.username} 👋
          </h1>
          <p className="text-secondary-300 text-lg max-w-xl leading-relaxed">
            {t('account.home.welcome')}
          </p>
        </div>
        {/* 背景装饰 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* 核心统计卡片 */}
      <div>
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">{t('account.home.overview.title')}</h2>
            <div className="h-1 w-12 bg-primary-500 rounded-full"></div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 全部订单卡片 */}
          <Link href="/account/orders" className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-soft hover:shadow-premium hover:border-primary-100 transition-all duration-300 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-blue-50 rounded-2xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                <Package className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-1">{t('account.home.cards.orders')}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-gray-900">{safeStats.orders.total}</span>
              <span className="text-gray-400 font-bold text-sm">{t('account.home.units.orders')}</span>
            </div>
          </Link>

          {/* 我的收藏卡片 */}
          <Link href="/account/favorites" className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-soft hover:shadow-premium hover:border-primary-100 transition-all duration-300 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-red-50 rounded-2xl text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors duration-300">
                <Heart className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-1">{t('account.home.cards.favorites')}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-gray-900">{safeStats.wishlistCount}</span>
              <span className="text-gray-400 font-bold text-sm">{t('account.home.units.items')}</span>
            </div>
          </Link>

          {/* 收货地址卡片 */}
          <Link href="/account/addresses" className="group bg-white rounded-3xl p-8 border border-gray-100 shadow-soft hover:shadow-premium hover:border-primary-100 transition-all duration-300 flex flex-col">
            <div className="flex items-start justify-between mb-6">
              <div className="p-4 bg-green-50 rounded-2xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors duration-300">
                <MapPin className="w-6 h-6" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all" />
            </div>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest mb-1">{t('account.home.cards.addresses')}</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-4xl font-black text-gray-900">{safeStats.addressCount}</span>
              <span className="text-gray-400 font-bold text-sm">{t('account.home.units.addresses')}</span>
            </div>
          </Link>
        </div>
      </div>

      {/* 订单状态快捷追踪 */}
      <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100">
        <h3 className="text-lg font-black text-gray-900 mb-8 flex items-center">
          <div className="w-1.5 h-5 bg-primary-500 rounded-full mr-3"></div>
          {t('account.home.todo.title')}
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-soft border border-gray-50 text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500">
                <Package className="w-7 h-7" />
              </div>
              {safeStats.orders.pending > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-orange-500 text-white text-xs font-black rounded-full flex items-center justify-center ring-4 ring-white">
                  {safeStats.orders.pending}
                </span>
              )}
            </div>
            <span className="text-gray-500 font-bold text-sm">{t('account.home.todo.pendingPayment')}</span>
          </div>

          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-soft border border-gray-50 text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                <Package className="w-7 h-7" />
              </div>
              {safeStats.orders.processing > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white text-xs font-black rounded-full flex items-center justify-center ring-4 ring-white">
                  {safeStats.orders.processing}
                </span>
              )}
            </div>
            <span className="text-gray-500 font-bold text-sm">{t('account.home.todo.processing')}</span>
          </div>

          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-soft border border-gray-50 text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500">
                <Package className="w-7 h-7" />
              </div>
              {safeStats.orders.shipped > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-purple-500 text-white text-xs font-black rounded-full flex items-center justify-center ring-4 ring-white">
                  {safeStats.orders.shipped}
                </span>
              )}
            </div>
            <span className="text-gray-500 font-bold text-sm">{t('account.home.todo.shipped')}</span>
          </div>

          <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-soft border border-gray-50 text-center">
            <div className="relative mb-4">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-500">
                <Package className="w-7 h-7" />
              </div>
              {safeStats.orders.completed > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 text-white text-xs font-black rounded-full flex items-center justify-center ring-4 ring-white">
                  {safeStats.orders.completed}
                </span>
              )}
            </div>
            <span className="text-gray-500 font-bold text-sm">{t('account.home.todo.completed')}</span>
          </div>
        </div>
      </div>

      {/* 快捷操作 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('account.home.quickActions.title')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/account/profile"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">👤</span>
            <div>
              <p className="font-medium text-gray-900">{t('account.home.quickActions.profile.title')}</p>
              <p className="text-sm text-gray-500">{t('account.home.quickActions.profile.desc')}</p>
            </div>
          </Link>

          <Link
            href="/account/addresses"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">📍</span>
            <div>
              <p className="font-medium text-gray-900">{t('account.home.quickActions.addresses.title')}</p>
              <p className="text-sm text-gray-500">{t('account.home.quickActions.addresses.desc')}</p>
            </div>
          </Link>

          <Link
            href="/account/orders"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">📦</span>
            <div>
              <p className="font-medium text-gray-900">{t('account.home.quickActions.orders.title')}</p>
              <p className="text-sm text-gray-500">{t('account.home.quickActions.orders.desc')}</p>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl mr-3">🛒</span>
            <div>
              <p className="font-medium text-gray-900">{t('account.home.quickActions.shop.title')}</p>
              <p className="text-sm text-gray-500">{t('account.home.quickActions.shop.desc')}</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
