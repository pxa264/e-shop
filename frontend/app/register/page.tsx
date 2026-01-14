'use client';

/**
 * 注册页面
 *
 * 功能说明：
 * - 用户注册新账户
 * - 表单验证（密码确认）
 * - 注册成功后自动登录
 * - 错误提示（用户名/邮箱已存在）
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from '@/navigation'
import { 
  User, 
  Mail, 
  Lock, 
  ArrowRight, 
  ChevronLeft,
  AlertCircle,
  ShoppingCart,
  ShieldCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // 如果已登录，重定向到首页
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 验证密码
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    // 验证密码确认
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      await register(formData.username, formData.email, formData.password);
      if (isAuthenticated) {
        toast.success('Account created. Signed in successfully.');
        router.push('/');
      } else {
        toast.success('Account created. Please confirm your email, then sign in.');
        router.push('/login');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Sign-up failed. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* 左侧：品牌展示区域 */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-secondary-800 to-secondary-950 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-3 group w-fit">
            <div className="w-12 h-12 bg-primary-600 rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-soft">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight">E-Shop</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-primary-400 text-xs font-black uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3 h-3" />
            <span>Join our community</span>
          </div>
          <h1 className="text-6xl font-black mb-8 leading-tight">
            Create your<br />account today
          </h1>
          <p className="text-secondary-300 text-xl font-medium leading-relaxed opacity-90">
            Create an account in seconds. Enjoy exclusive offers, track orders, and start shopping.
          </p>
        </div>

        <div className="relative z-10 flex items-center space-x-8 text-secondary-400 text-sm font-bold uppercase tracking-widest">
          <div className="flex items-center">
            <span className="text-white mr-2">01</span>
            <span>Create Account</span>
          </div>
          <div className="w-8 h-px bg-secondary-700"></div>
          <div className="flex items-center opacity-40">
            <span className="mr-2">02</span>
            <span>Explore Goods</span>
          </div>
        </div>

        {/* 背景装饰 */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-primary-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>

      {/* 右侧：注册表单区域 */}
      <div className="flex items-center justify-center p-8 lg:p-20 bg-gray-50/30">
        <div className="max-w-md w-full animate-fade-in">
          <div className="mb-10">
            <Link 
              href="/login" 
              className="inline-flex items-center text-gray-400 hover:text-primary-600 font-bold mb-8 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to sign in
            </Link>
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Create an account</h2>
            <p className="text-gray-500 font-medium">
              Already have an account?{' '}
              <Link href="/login" className="text-primary-600 font-black hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* 错误提示 */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-center animate-slide-up">
                <AlertCircle className="w-5 h-5 mr-3" />
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* 用户名 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Username
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft"
                    placeholder="Your display name"
                  />
                </div>
              </div>

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
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
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

              {/* 确认密码 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                  Confirm password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft"
                    placeholder="Re-enter password"
                  />
                </div>
              </div>
            </div>

            {/* 注册条款 */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-6">
              <p className="text-[10px] text-gray-400 font-bold leading-relaxed uppercase tracking-widest text-center">
                By creating an account, you agree to our <Link href="/terms" className="text-primary-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</Link>
              </p>
            </div>

            {/* 注册按钮 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-5 px-8 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-soft"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* 返回首页 */}
            <div className="text-center pt-6">
              <Link href="/" className="text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">
                Not now, go back home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
