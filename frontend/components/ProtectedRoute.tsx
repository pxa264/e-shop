'use client';

/**
 * ProtectedRoute - 路由保护组件
 *
 * 功能说明：
 * - 包装需要登录才能访问的页面
 * - 未登录用户自动重定向到登录页
 * - 登录后自动返回原页面
 * - 加载时显示 loading 状态
 *
 * 使用方式：
 * ```tsx
 * // 在 page.tsx 中使用
 * export default function ProtectedPage() {
 *   return (
 *     <ProtectedRoute>
 *       <YourPageContent />
 *     </ProtectedRoute>
 *   );
 * }
 * ```
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute 组件
 *
 * @param children - 需要保护的页面内容
 *
 * 行为：
 * - 如果用户未登录 → 重定向到 /login?redirect=/current-path
 * - 如果正在加载认证状态 → 显示加载动画
 * - 如果用户已登录 → 渲染 children
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 如果不是在加载中且用户未登录，重定向到登录页
    if (!loading && !isAuthenticated) {
      const currentPath = window.location.pathname;
      router.push(`/login?redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [isAuthenticated, loading, router]);

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-100 border-t-primary-600 mb-4"></div>
          <p className="text-gray-500 font-bold tracking-widest uppercase text-xs">正在验证身份...</p>
        </div>
      </div>
    );
  }

  // 用户未登录，显示空白（会被重定向）
  if (!isAuthenticated) {
    return null;
  }

  // 用户已登录，渲染受保护的内容
  return <>{children}</>;
}
