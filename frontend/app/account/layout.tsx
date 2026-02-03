'use client';

export const dynamic = 'force-dynamic';

/**
 * 个人中心布局
 *
 * 功能说明：
 * - 个人中心所有页面的统一布局
 * - 左侧侧边栏导航
 * - 显示用户信息
 * - 退出登录功能
 * - 路由保护
 */

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Link } from '@/navigation'
import { 
  LayoutDashboard, 
  UserCircle, 
  MapPin, 
  Heart, 
  Package, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useTranslations } from 'next-intl'

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  // 导航菜单
  const navItems = [
    { name: t('account.sidebar.dashboard'), href: '/account', icon: LayoutDashboard },
    { name: t('account.sidebar.profile'), href: '/account/profile', icon: UserCircle },
    { name: t('account.sidebar.addresses'), href: '/account/addresses', icon: MapPin },
    { name: t('account.sidebar.favorites'), href: '/account/favorites', icon: Heart },
    { name: t('account.sidebar.orders'), href: '/account/orders', icon: Package },
  ];

  /**
   * 退出登录
   */
  const handleLogout = () => {
    if (confirm(t('account.logout.confirm'))) {
      logout();
      router.push('/login');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#fafafa]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col lg:flex-row gap-10">
            {/* 侧边栏 */}
            <aside className="w-full lg:w-72 flex-shrink-0">
              <div className="bg-white rounded-3xl shadow-soft border border-gray-50 overflow-hidden sticky top-28">
                {/* 用户简要信息 */}
                <div className="p-8 bg-gradient-to-br from-primary-600 to-primary-800 text-white relative overflow-hidden">
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl font-black mb-4 border-2 border-white/30 shadow-soft">
                      {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <h2 className="text-xl font-black truncate w-full">{user?.username}</h2>
                    <p className="text-primary-100 text-xs font-medium truncate w-full opacity-80 mt-1">{user?.email}</p>
                  </div>
                  {/* 背景装饰 */}
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                </div>

                {/* 导航菜单 */}
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                          isActive
                            ? 'bg-primary-50 text-primary-600 shadow-soft translate-x-1'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-primary-500'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-500'}`} />
                          <span className={`font-bold ${isActive ? 'text-primary-700' : ''}`}>{item.name}</span>
                        </div>
                        <ChevronRight className={`w-4 h-4 transition-transform duration-300 ${isActive ? 'rotate-90 opacity-100' : 'opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                      </Link>
                    );
                  })}
                </nav>

                {/* 底部操作 */}
                <div className="p-4 pt-0 mt-4 border-t border-gray-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-4 py-4 mt-4 text-red-500 font-bold hover:bg-red-50 rounded-2xl transition-all group"
                  >
                    <div className="p-2 bg-red-100/50 rounded-lg mr-3 group-hover:bg-red-100 transition-colors">
                      <LogOut className="w-4 h-4" />
                    </div>
                    {t('account.menu.logout')}
                  </button>
                </div>
              </div>
            </aside>

            {/* 主内容区域 */}
            <main className="flex-1 animate-fade-in">
              <div className="bg-white rounded-3xl shadow-soft border border-gray-50 min-h-[600px] overflow-hidden">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
