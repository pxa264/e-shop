'use client';

/**
 * 登录页面
 *
 * 功能说明：
 * - 用户邮箱密码登录
 * - 表单验证和错误提示
 * - 登录成功后重定向
 * - 支持从其他页面跳转回来（redirect 参数）
 */

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/navigation'
import { 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft,
  AlertCircle,
  ShoppingCart
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 如果已登录，重定向到首页或 redirect 指定的页面
  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    }
  }, [isAuthenticated, router, searchParams]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Welcome back! Signed in successfully.');
      const redirect = searchParams.get('redirect') || '/';
      router.push(redirect);
    } catch (err: any) {
      const errorMsg = err.message || 'Sign-in failed. Please check your email and password.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* 左侧：品牌展示区域（仅在大屏幕显示） */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-600 to-primary-900 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-3 group w-fit">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight">E-Shop</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-6xl font-black mb-8 leading-tight">
            Discover<br />quality products
          </h1>
          <p className="text-primary-100 text-xl font-medium leading-relaxed opacity-90">Join our shopping community and start your premium lifestyle journey.</p>
        </div>

        <div className="relative z-10 flex items-center justify-between text-primary-200 text-sm font-bold uppercase tracking-widest">
          <span>Quality Products</span>
          <div className="flex space-x-4">
            <div className="w-2 h-2 rounded-full bg-white animate-pulse"></div>
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
            <div className="w-2 h-2 rounded-full bg-white/40"></div>
          </div>
          <span>Secure Shopping</span>
        </div>

        {/* 背景装饰 */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* 右侧：登录表单区域 */}
      <div className="flex items-center justify-center p-8 lg:p-20 bg-gray-50/30">
        <div className="max-w-md w-full animate-fade-in">
          <div className="mb-12">
            <Link 
              href="/" 
              className="inline-flex items-center text-gray-400 hover:text-primary-600 font-bold mb-8 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to store
            </Link>
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Sign in</h2>
            <p className="text-gray-500 font-medium">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary-600 font-black hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-center animate-slide-up">
                <AlertCircle className="w-5 h-5 mr-3" />
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* 邮箱输入 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Email
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              {/* 密码输入 */}
              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">
                    Password
                  </label>
                  <Link href="/forgot-password" className="text-xs font-black text-primary-600 hover:underline uppercase tracking-widest">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* 记住我 */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 transition-colors"></div>
                <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors">Keep me signed in</span>
              </label>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-soft"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign in</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* 其他登录方式 */}
            <div className="pt-8 border-t border-gray-100 mt-10">
              <p className="text-center text-xs font-black text-gray-400 uppercase tracking-widest mb-6">Or continue with</p>
              <div className="grid grid-cols-2 gap-4">
                <button type="button" className="flex items-center justify-center space-x-2 py-3.5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-soft active:scale-95">
                  <div className="w-5 h-5 bg-green-500 rounded-full"></div>
                  <span>WeChat</span>
                </button>
                <button type="button" className="flex items-center justify-center space-x-2 py-3.5 bg-white border border-gray-100 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all shadow-soft active:scale-95">
                  <div className="w-5 h-5 bg-blue-500 rounded-full"></div>
                  <span>QQ</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
