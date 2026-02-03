'use client';

export const dynamic = 'force-dynamic';

/**
 * 个人资料页面
 *
 * 功能说明：
 * - 编辑用户基本信息（用户名、邮箱、手机号）
 * - 修改密码（验证当前密码）
 * - 头像上传（预留功能）
 */

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, changePassword } from '@/lib/api';
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from '@/navigation'
import { 
  UserCircle, 
  Lock, 
  Calendar, 
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, refreshToken, logout } = useAuth();
  const t = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US';

  const [profileData, setProfileData] = useState({
    username: '',
    email: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        username: user.username || '',
        email: user.email || '',
      });
    }
  }, [user]);

  /**
   * 更新个人资料
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile({
        username: profileData.username,
        email: profileData.email,
      });

      toast.success(t('account.profile.toast.updateSuccess'));
      refreshToken();
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.message 
        || t('account.profile.toast.updateFailed');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 修改密码
   */
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // 验证密码长度
    if (passwordData.newPassword.length < 6) {
      toast.error(t('account.profile.password.validation.minLength'));
      return;
    }

    // 验证密码确认
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error(t('account.profile.password.validation.mismatch'));
      return;
    }

    setLoading(true);

    try {
      await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword,
        passwordData.confirmPassword
      );

      toast.success(t('account.profile.toast.passwordSuccess'));
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      logout();
      router.push('/login');
    } catch (error: any) {
      const errorMsg = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.message 
        || t('account.profile.toast.passwordFailed');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-fade-in">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">{t('account.profile.title')}</h1>
        <p className="text-gray-500 font-medium">{t('account.profile.subtitle')}</p>
        <div className="h-1.5 w-12 bg-primary-500 rounded-full mt-4"></div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* 基本信息 */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
              <UserCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">{t('account.profile.basic.title')}</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* 用户名 */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {t('account.profile.basic.username.label')}
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                placeholder={t('account.profile.basic.username.placeholder')}
              />
            </div>

            {/* 邮箱 */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {t('account.profile.basic.email.label')}
              </label>
              <input
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                placeholder={t('account.profile.basic.email.placeholder')}
              />
            </div>

            {/* 保存按钮 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 text-lg font-black text-white bg-primary-600 rounded-2xl hover:bg-primary-700 transition-all hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('account.profile.basic.actions.saving')}</span>
                  </>
                ) : (
                  <span>{t('account.profile.basic.actions.save')}</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 修改密码 */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-soft">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-3 bg-orange-50 rounded-2xl text-orange-600">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-gray-900">{t('account.profile.password.title')}</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6">
            {/* 当前密码 */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {t('account.profile.password.current.label')}
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                placeholder={t('account.profile.password.current.placeholder')}
              />
            </div>

            {/* 新密码 */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {t('account.profile.password.new.label')}
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                placeholder={t('account.profile.password.new.placeholder')}
              />
            </div>

            {/* 确认新密码 */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                {t('account.profile.password.confirm.label')}
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                required
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                placeholder={t('account.profile.password.confirm.placeholder')}
              />
            </div>

            {/* 修改按钮 */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 text-lg font-black text-white bg-secondary-900 rounded-2xl hover:bg-black transition-all hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('account.profile.password.actions.processing')}</span>
                  </>
                ) : (
                  <span>{t('account.profile.password.actions.change')}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 账户详情卡片 */}
      <div className="bg-gray-50/50 rounded-3xl p-8 border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-primary-600 border border-gray-100 font-black text-2xl">
            #
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('account.profile.meta.uidLabel')}</p>
            <p className="text-gray-900 font-bold">{t('account.profile.meta.uidValue', { id: user?.id })}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-primary-600 border border-gray-100">
            <Calendar className="w-8 h-8 opacity-40" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('account.profile.meta.createdAt')}</p>
            <p className="text-gray-900 font-bold">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString(dateLocale, {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : t('account.profile.meta.unknown')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-soft flex items-center justify-center text-primary-600 border border-gray-100">
            <ShieldCheck className="w-8 h-8 opacity-40" />
          </div>
          <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('account.profile.meta.status')}</p>
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
              <p className="text-green-600 font-black">{t('account.profile.meta.verified')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
