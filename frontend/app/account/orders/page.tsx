'use client';

export const dynamic = 'force-dynamic';

/**
 * 订单列表页面
 *
 * 功能说明：
 * - 显示用户的所有订单
 * - 按状态筛选
 * - 订单号搜索
 * - 分页显示
 */

import { useEffect, useState } from 'react';
import { getMyOrders, cancelOrder } from '@/lib/api';
import { Link } from '@/navigation'
import toast from 'react-hot-toast';
import { useLocale, useTranslations } from 'next-intl'

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  customerName: string;
}

interface Meta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// 订单状态配置
const statusConfig = {
  pending: { color: 'bg-orange-100 text-orange-800' },
  processing: { color: 'bg-blue-100 text-blue-800' },
  shipped: { color: 'bg-purple-100 text-purple-800' },
  completed: { color: 'bg-green-100 text-green-800' },
  cancelled: { color: 'bg-gray-100 text-gray-800' },
};

import { 
  Package, 
  Search, 
  ChevronRight, 
  Calendar, 
  CreditCard,
  XCircle,
  Truck,
  CheckCircle2,
  Clock,
  Filter
} from 'lucide-react';

export default function OrdersPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [orders, setOrders] = useState<Order[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const dateLocale = locale === 'zh' ? 'zh-CN' : 'en-US';

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t('account.orders.status.pending');
      case 'processing':
        return t('account.orders.status.processing');
      case 'shipped':
        return t('account.orders.status.shipped');
      case 'completed':
        return t('account.orders.status.completed');
      case 'cancelled':
        return t('account.orders.status.cancelled');
      default:
        return status;
    }
  };

  // 状态图标映射
  const statusIcons = {
    pending: Clock,
    processing: CreditCard,
    shipped: Truck,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, currentPage]);

  /**
   * 获取订单列表
   */
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getMyOrders({
        ...(statusFilter && { status: statusFilter }),
        limit: 10,
        start: (currentPage - 1) * 10,
      });
      setOrders(data.data);
      setMeta(data.meta);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error(t('account.orders.toast.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 取消订单
   */
  const handleCancelOrder = async (orderNumber: string) => {
    if (!confirm(t('account.orders.cancel.confirm'))) return;

    try {
      await cancelOrder(orderNumber);
      toast.success(t('account.orders.toast.cancelSuccess'));
      fetchOrders();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || t('account.orders.toast.cancelFailed');
      toast.error(errorMsg);
    }
  };

  /**
   * 搜索订单
   */
  const handleSearch = () => {
    if (!searchTerm.trim()) {
      fetchOrders();
      return;
    }
    const filtered = orders.filter(o => o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    if (filtered.length === 0) {
      toast.error(t('account.orders.toast.searchNotFound'));
    } else {
      setOrders(filtered);
      toast.success(t('account.orders.toast.searchFound', { count: filtered.length }));
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-fade-in">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 mb-2">{t('account.orders.title')}</h1>
        <p className="text-gray-500 font-medium">{t('account.orders.subtitle')}</p>
        <div className="h-1.5 w-12 bg-primary-500 rounded-full mt-4"></div>
      </div>

      {/* 筛选和搜索 */}
      <div className="bg-gray-50/50 rounded-3xl p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* 状态筛选 */}
          <div className="flex-1">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
              {t('account.orders.filter.label')}
            </label>
            <div className="relative group">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-12 pr-5 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft appearance-none cursor-pointer"
              >
                <option value="">{t('account.orders.filter.all')}</option>
                <option value="pending">{t('account.orders.status.pending')}</option>
                <option value="processing">{t('account.orders.status.processing')}</option>
                <option value="shipped">{t('account.orders.status.shipped')}</option>
                <option value="completed">{t('account.orders.status.completed')}</option>
                <option value="cancelled">{t('account.orders.status.cancelled')}</option>
              </select>
            </div>
          </div>

          {/* 搜索框 */}
          <div className="flex-[2]">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
              {t('account.orders.search.label')}
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('account.orders.search.placeholder')}
                  className="w-full pl-12 pr-5 py-3.5 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-soft"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-8 py-3.5 bg-secondary-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-soft active:scale-95"
              >
                {t('account.orders.search.button')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      {loading ? (
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-50 shadow-soft animate-pulse">
              <div className="flex justify-between mb-6">
                <div className="h-6 bg-gray-100 rounded w-1/3"></div>
                <div className="h-6 bg-gray-100 rounded-full w-20"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-premium p-20 text-center border border-gray-50 animate-fade-in">
          <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Package className="w-16 h-16 text-gray-200" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">{t('account.orders.empty.title')}</h2>
          <p className="text-gray-500 mb-10 max-w-sm mx-auto">
            {t('account.orders.empty.subtitle')}
          </p>
          <Link
            href="/products"
            className="inline-flex items-center bg-primary-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-95"
          >
            {t('account.orders.empty.cta')}
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const status = statusConfig[order.status as keyof typeof statusConfig];
            const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;
            return (
              <div 
                key={order.id} 
                className="group bg-white rounded-3xl border border-gray-100 shadow-soft hover:shadow-premium hover:border-primary-100 transition-all duration-300 overflow-hidden"
              >
                <div className="p-6 lg:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* 订单信息 */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-4 mb-6">
                        <div className="px-4 py-1.5 bg-gray-100 rounded-full text-xs font-black text-gray-500 uppercase tracking-widest">
                          #{order.orderNumber}
                        </div>
                        <div className={`flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${status.color.replace('bg-', 'bg-opacity-10 border-').replace('text-', 'text-')}`}>
                          <StatusIcon className="w-3 h-3 mr-2" />
                          {getStatusLabel(order.status)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-3 text-gray-500 font-bold text-sm">
                          <Calendar className="w-4 h-4 text-gray-300" />
                          <span>{t('account.orders.item.placedAt')}{new Date(order.createdAt).toLocaleString(dateLocale, {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-900 font-black text-lg">
                          <span className="text-gray-400 font-bold text-sm uppercase tracking-widest mr-1">{t('account.orders.item.amount')}</span>
                          <span className="text-primary-600">¥{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex items-center gap-3 pt-6 lg:pt-0 border-t lg:border-t-0 border-gray-50">
                      <Link
                        href={`/account/orders/${order.orderNumber}`}
                        className="flex-1 lg:flex-none flex items-center justify-center space-x-2 px-6 py-3 bg-gray-50 text-gray-600 rounded-xl font-bold hover:bg-primary-50 hover:text-primary-600 transition-all group/btn"
                      >
                        <span>{t('account.orders.actions.viewDetail')}</span>
                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                      {order.status === 'pending' && (
                        <button
                          onClick={() => handleCancelOrder(order.orderNumber)}
                          className="flex-1 lg:flex-none px-6 py-3 text-red-500 border-2 border-red-50/50 rounded-xl font-bold hover:bg-red-50 hover:border-red-100 transition-all active:scale-95"
                        >
                          {t('account.orders.actions.cancel')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {/* 底部装饰条 */}
                <div className={`h-1 w-full ${status.color.split(' ')[0]}`}></div>
              </div>
            );
          })}
        </div>
      )}

      {/* 分页 */}
      {meta && meta.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-50">
          <div className="text-sm font-bold text-gray-400 uppercase tracking-widest">
            {t('account.orders.pagination.summary', { total: meta.total, page: meta.page, totalPages: meta.totalPages })}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={meta.page === 1}
              className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-soft hover:bg-primary-50 hover:text-primary-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <ChevronRight className="w-5 h-5 rotate-180 group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(meta.totalPages, p + 1))}
              disabled={meta.page === meta.totalPages}
              className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-soft hover:bg-primary-50 hover:text-primary-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
            >
              <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
