'use client';

/**
 * 忘记密码页面
 *
 * 功能说明：
 * - 发送密码重置邮件到用户邮箱
 * - 输入邮箱后调用 Strapi 内置 API
 * - 显示成功提示
 */

import { useState } from 'react';
import { Link } from '@/navigation'
import { forgotPassword } from '@/lib/api';
import { 
  Mail, 
  ArrowRight, 
  ChevronLeft,
  AlertCircle,
  CheckCircle2,
  ShoppingCart,
  ShieldQuestion
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
      toast.success('Reset email sent. Please check your inbox.');
    } catch (err: any) {
      const errorMsg = err.message || 'Something went wrong. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-white">
      {/* 左侧：品牌展示区域 */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-primary-700 to-primary-950 text-white relative overflow-hidden">
        <div className="relative z-10">
          <Link href="/" className="flex items-center space-x-3 group w-fit">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-soft">
              <ShoppingCart className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-black tracking-tight">E-Shop</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-primary-400 text-xs font-black uppercase tracking-widest mb-6">
            <ShieldQuestion className="w-3 h-3" />
            <span>Account Security</span>
          </div>
          <h1 className="text-6xl font-black mb-8 leading-tight tracking-tight animate-slide-up">
            Don't worry,
            <br />we've got you covered
          </h1>
          <p className="text-primary-100 text-xl font-medium leading-relaxed opacity-90">
            Enter your email and we'll send you a secure link to reset your password.
          </p>
        </div>

        <div className="relative z-10 text-primary-300 text-sm font-bold uppercase tracking-widest">
          &copy; 2026 E-Shop Security Protocol
        </div>

        {/* 背景装饰 */}
        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* 右侧：表单区域 */}
      <div className="flex items-center justify-center p-8 lg:p-20 bg-gray-50/30">
        <div className="max-w-md w-full animate-fade-in">
          <div className="mb-12">
            <Link 
              href="/login" 
              className="inline-flex items-center text-gray-400 hover:text-primary-600 font-bold mb-8 transition-colors group"
            >
              <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
              Back to sign in
            </Link>
            <h2 className="text-4xl font-black text-gray-900 mb-3 tracking-tight">Forgot password?</h2>
            <p className="text-gray-500 font-medium">We'll email you a reset link.</p>
          </div>

          {success ? (
            <div className="bg-white rounded-[2.5rem] shadow-premium p-10 text-center border border-gray-100 animate-slide-up">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">Check your email</h3>
              <p className="text-gray-500 font-medium leading-relaxed mb-10">
                We sent a password reset link to{' '}
                <span className="text-primary-600 font-bold">{email}</span>
                . If you don't see it, check your spam folder.
              </p>
              <Link
                href="/login"
                className="inline-flex items-center justify-center w-full bg-primary-600 text-white py-4 rounded-2xl font-black hover:bg-primary-700 transition-all shadow-soft active:scale-95"
              >
                Back to sign in
              </Link>
              <button 
                onClick={() => setSuccess(false)}
                className="mt-6 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors"
              >
                Send again
              </button>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl font-bold text-sm flex items-center animate-slide-up">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  {error}
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                    Email
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-5 py-4 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2 shadow-soft"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <span>Send reset link</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="text-center pt-6">
                <Link href="/" className="text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest transition-colors">
                  Not now, go back home
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
