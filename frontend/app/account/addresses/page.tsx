'use client';

/**
 * 地址管理页面
 *
 * 功能说明：
 * - 显示用户的所有收货地址
 * - 添加新地址
 * - 编辑地址
 * - 删除地址
 * - 设置默认地址
 */

import { useEffect, useState } from 'react';
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from '@/lib/api';
import { useTranslations } from 'next-intl'

interface Address {
  id: number;
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  postalCode: string;
  isDefault: boolean;
}

interface FormData {
  receiverName: string;
  receiverPhone: string;
  province: string;
  city: string;
  district: string;
  detailAddress: string;
  postalCode: string;
  isDefault: boolean;
}

const emptyFormData: FormData = {
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: '',
  postalCode: '',
  isDefault: false,
};

import { 
  MapPin, 
  Plus, 
  User, 
  Phone, 
  Trash2, 
  Edit2, 
  Map as MapIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AddressesPage() {
  const t = useTranslations();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyFormData);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, []);

  /**
   * 获取地址列表
   */
  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await getAddresses();
      setAddresses(data.data);
    } catch (error) {
      console.error('Failed to fetch addresses:', error);
      toast.error(t('account.addresses.toast.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 打开添加地址表单
   */
  const handleAdd = () => {
    setFormData(emptyFormData);
    setEditingId(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 打开编辑地址表单
   */
  const handleEdit = (address: Address) => {
    setFormData({
      receiverName: address.receiverName,
      receiverPhone: address.receiverPhone,
      province: address.province,
      city: address.city,
      district: address.district,
      detailAddress: address.detailAddress,
      postalCode: address.postalCode || '',
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /**
   * 删除地址
   */
  const handleDelete = async (id: number) => {
    if (!confirm(t('account.addresses.delete.confirm'))) return;

    try {
      await deleteAddress(id);
      toast.success(t('account.addresses.toast.deleteSuccess'));
      fetchAddresses();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || t('account.addresses.toast.deleteFailed');
      toast.error(errorMsg);
    }
  };

  /**
   * 设置默认地址
   */
  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      toast.success(t('account.addresses.toast.setDefaultSuccess'));
      fetchAddresses();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || t('account.addresses.toast.setDefaultFailed');
      toast.error(errorMsg);
    }
  };

  /**
   * 提交表单（创建或更新）
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (editingId) {
        await updateAddress(editingId, formData);
        toast.success(t('account.addresses.toast.updateSuccess'));
      } else {
        await createAddress(formData);
        toast.success(t('account.addresses.toast.createSuccess'));
      }

      setShowForm(false);
      fetchAddresses();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || t('account.addresses.toast.saveFailed');
      toast.error(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 取消表单
   */
  const handleCancel = () => {
    setShowForm(false);
    setFormData(emptyFormData);
    setEditingId(null);
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{t('account.addresses.title')}</h1>
          <p className="text-gray-500 font-medium">{t('account.addresses.subtitle')}</p>
          <div className="h-1.5 w-12 bg-primary-500 rounded-full mt-4"></div>
        </div>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-primary-600 text-white rounded-2xl font-black shadow-soft hover:bg-primary-700 transition-all hover:shadow-premium active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>{t('account.addresses.actions.add')}</span>
          </button>
        )}
      </div>

      {/* 地址表单 */}
      {showForm && (
        <div className="bg-white rounded-[2.5rem] shadow-premium p-8 lg:p-10 border border-gray-50 animate-slide-up">
          <div className="flex items-center space-x-3 mb-10">
            <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-gray-900">
              {editingId ? t('account.addresses.form.editTitle') : t('account.addresses.form.createTitle')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 收货人 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  {t('account.addresses.form.receiverName.label')} <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="text"
                    value={formData.receiverName}
                    onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                    required
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                    placeholder={t('account.addresses.form.receiverName.placeholder')}
                  />
                </div>
              </div>

              {/* 联系电话 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  {t('account.addresses.form.receiverPhone.label')} <span className="text-red-500">*</span>
                </label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                  <input
                    type="tel"
                    value={formData.receiverPhone}
                    onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
                    required
                    className="w-full pl-12 pr-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                    placeholder={t('account.addresses.form.receiverPhone.placeholder')}
                  />
                </div>
              </div>

              {/* 所在地区 - 省 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  {t('account.addresses.form.province.label')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  required
                  placeholder={t('account.addresses.form.province.placeholder')}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                />
              </div>

              {/* 所在地区 - 市 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  {t('account.addresses.form.city.label')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  placeholder={t('account.addresses.form.city.placeholder')}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                />
              </div>

              {/* 所在地区 - 区 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  {t('account.addresses.form.district.label')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  required
                  placeholder={t('account.addresses.form.district.placeholder')}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                />
              </div>

              {/* 邮政编码 */}
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                  {t('account.addresses.form.postalCode.label')}
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  placeholder={t('account.addresses.form.postalCode.placeholder')}
                  className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner"
                />
              </div>
            </div>

            {/* 详细地址 */}
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                {t('account.addresses.form.detailAddress.label')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.detailAddress}
                onChange={(e) => setFormData({ ...formData, detailAddress: e.target.value })}
                required
                rows={3}
                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner resize-none"
                placeholder={t('account.addresses.form.detailAddress.placeholder')}
              />
            </div>

            {/* 设为默认地址 */}
            <div className="flex items-center">
              <label className="relative inline-flex items-center cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 transition-colors"></div>
                <span className="ml-3 text-sm font-bold text-gray-700 group-hover:text-primary-600 transition-colors">{t('account.addresses.form.isDefault')}</span>
              </label>
            </div>

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-50">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-soft hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>{t('account.addresses.form.actions.submitting')}</span>
                  </>
                ) : (
                  <span>{editingId ? t('account.addresses.form.actions.update') : t('account.addresses.form.actions.save')}</span>
                )}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-8 py-4 bg-white border-2 border-gray-100 text-gray-500 rounded-2xl font-black text-lg hover:border-primary-100 hover:text-primary-600 transition-all active:scale-[0.98]"
              >
                {t('account.addresses.form.actions.cancel')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 地址列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-50 shadow-soft animate-pulse">
              <div className="h-6 bg-gray-100 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-8"></div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                <div className="h-10 bg-gray-100 rounded-xl w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        !showForm && (
          <div className="bg-white rounded-[2.5rem] shadow-premium p-20 text-center border border-gray-50 animate-fade-in">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <MapIcon className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">{t('account.addresses.empty.title')}</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">
              {t('account.addresses.empty.subtitle')}
            </p>
            <button
              onClick={handleAdd}
              className="inline-flex items-center bg-primary-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2" />
              {t('account.addresses.empty.cta')}
            </button>
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-white rounded-[2rem] p-8 border-2 transition-all duration-300 relative group shadow-soft hover:shadow-premium ${
                address.isDefault 
                  ? 'border-primary-500 ring-4 ring-primary-50' 
                  : 'border-gray-50 hover:border-primary-100'
              }`}
            >
              {/* 默认地址标签 */}
              {address.isDefault && (
                <div className="absolute top-6 right-8">
                  <span className="inline-flex items-center px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white bg-primary-600 rounded-full shadow-soft">
                    {t('account.addresses.badges.default')}
                  </span>
                </div>
              )}

              {/* 地址信息 */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-xl font-black text-gray-900 truncate">
                    {address.receiverName}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-gray-500 font-bold">
                    <Phone className="w-4 h-4 text-gray-300" />
                    <span>{address.receiverPhone}</span>
                  </div>
                  
                  <div className="flex items-start space-x-3 text-gray-500 font-bold leading-relaxed">
                    <MapPin className="w-4 h-4 mt-1 text-gray-300 flex-shrink-0" />
                    <span>
                      {address.province} {address.city} {address.district}<br/>
                      {address.detailAddress}
                      {address.postalCode && (
                        <span className="block text-xs font-medium text-gray-400 mt-1 uppercase tracking-widest">
                          {t('account.addresses.item.postalCode')}{address.postalCode}
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex items-center gap-3 pt-6 border-t border-gray-50">
                <button
                  onClick={() => handleEdit(address)}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-primary-50 hover:text-primary-600 transition-all"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>{t('account.addresses.actions.edit')}</span>
                </button>
                
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="flex-1 px-4 py-3 bg-white border border-gray-100 text-gray-500 rounded-xl font-bold hover:border-primary-100 hover:text-primary-600 transition-all"
                  >
                    {t('account.addresses.actions.setDefault')}
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(address.id)}
                  className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                  aria-label={t('account.addresses.actions.deleteAria')}
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
