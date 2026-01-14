'use client';

/**
 * 订单详情页面
 *
 * 功能说明：
 * - 显示订单完整信息
 * - 订单商品清单
 * - 状态时间线（使用 OrderHistory）
 * - 取消订单功能（仅 pending 状态）
 */

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getMyOrderDetail, cancelOrder } from '@/lib/api';
import { useLocale, useTranslations } from 'next-intl'

interface OrderHistory {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  note: string;
  changedAt: string;
  changedBy: {
    id: number;
    username: string;
    email: string;
  };
}

interface OrderItem {
  id: number;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface OrderDetail {
  id: number;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  totalAmount: number;
  status: string;
  notes: string;
  createdAt: string;
  items: OrderItem[];
  histories: OrderHistory[];
}

// 订单状态配置
const statusConfig = {
  pending: { color: 'bg-orange-100 text-orange-800', step: 1 },
  processing: { color: 'bg-blue-100 text-blue-800', step: 2 },
  shipped: { color: 'bg-purple-100 text-purple-800', step: 3 },
  completed: { color: 'bg-green-100 text-green-800', step: 4 },
  cancelled: { color: 'bg-gray-100 text-gray-800', step: 0 },
};

import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Calendar,
  MapPin,
  Phone,
  User,
  Info,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations();
  const locale = useLocale();
  const orderNumber = params.orderNumber as string;

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

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  // 状态图标映射
  const statusIcons = {
    pending: Clock,
    processing: CreditCard,
    shipped: Truck,
    completed: CheckCircle2,
    cancelled: XCircle,
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetail();
    }
  }, [orderNumber]);

  /**
   * 获取订单详情
   */
  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const data = await getMyOrderDetail(orderNumber);
      setOrder(data.data);
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || t('account.orderDetail.toast.fetchFailed');
      toast.error(errorMsg);
      router.push('/account/orders');
    } finally {
      setLoading(false);
    }
  };

  /**
   * 取消订单
   */
  const handleCancelOrder = async () => {
    if (!confirm(t('account.orders.cancel.confirm'))) return;

    setCancelling(true);
    try {
      await cancelOrder(orderNumber);
      toast.success(t('account.orderDetail.toast.cancelSuccess'));
      fetchOrderDetail();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || t('account.orders.toast.cancelFailed');
      toast.error(errorMsg);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 lg:p-12 space-y-8 animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-1/4"></div>
        <div className="h-64 bg-gray-100 rounded-3xl w-full"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="h-48 bg-gray-100 rounded-3xl"></div>
          <div className="h-48 bg-gray-100 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-20 text-center animate-fade-in">
        <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
          <Info className="w-16 h-16 text-gray-200" />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-4">{t('account.orderDetail.notFound.title')}</h3>
        <button
          onClick={() => router.push('/account/orders')}
          className="inline-flex items-center text-primary-600 font-bold hover:underline"
        >
          {t('account.orderDetail.notFound.back')} <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>
    );
  }

  const status = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = statusIcons[order.status as keyof typeof statusIcons] || Package;

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-fade-in">
      {/* 顶部导航和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-gray-50">
        <div>
          <button
            onClick={() => router.push('/account/orders')}
            className="inline-flex items-center text-gray-400 hover:text-primary-600 font-bold mb-4 group transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {t('account.orderDetail.backToList')}
          </button>
          <div className="flex flex-wrap items-center gap-4">
            <h1 className="text-3xl font-black text-gray-900">{t('account.orderDetail.title')}</h1>
            <div className="px-4 py-1.5 bg-gray-100 rounded-full text-sm font-black text-gray-500 uppercase tracking-widest">
              #{order.orderNumber}
            </div>
          </div>
        </div>
        {order.status === 'pending' && (
          <button
            onClick={handleCancelOrder}
            disabled={cancelling}
            className="px-8 py-4 bg-red-50 text-red-500 border-2 border-red-100 rounded-2xl font-black hover:bg-red-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center"
          >
            {cancelling ? (
              <>
                <div className="w-4 h-4 border-2 border-red-500/30 border-t-red-500 rounded-full animate-spin mr-2"></div>
                <span>{t('account.orderDetail.actions.cancelling')}</span>
              </>
            ) : (
              <span>{t('account.orders.actions.cancel')}</span>
            )}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        {/* 左侧：核心信息 */}
        <div className="xl:col-span-2 space-y-10">
          {/* 订单状态概览 */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-soft overflow-hidden">
            <div className={`p-8 flex items-center justify-between ${status.color.replace('text-', 'text-opacity-90 text-').replace('bg-', 'bg-opacity-10 bg-')}`}>
              <div className="flex items-center space-x-4">
                <div className={`p-4 rounded-2xl bg-white shadow-soft ${status.color}`}>
                  <StatusIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mb-1">{t('account.orderDetail.status.current')}</p>
                  <h2 className="text-2xl font-black text-gray-900">{getStatusLabel(order.status)}</h2>
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mb-1">{t('account.orderDetail.status.placedOn')}</p>
                <p className="text-gray-900 font-black">
                  {new Date(order.createdAt).toLocaleString(dateLocale, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            {/* 步骤条预览（仅对非取消订单显示） */}
            {order.status !== 'cancelled' && (
              <div className="px-8 py-10 border-t border-gray-50">
                <div className="relative flex items-center justify-between">
                  {/* 线条 */}
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-100 -translate-y-1/2 rounded-full"></div>
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-primary-500 -translate-y-1/2 rounded-full transition-all duration-1000"
                    style={{ width: `${(Math.max(0, status.step - 1) / 3) * 100}%` }}
                  ></div>
                  
                  {/* 节点 */}
                  {['pending', 'processing', 'shipped', 'completed'].map((s, idx) => {
                    const stepStatus = statusConfig[s as keyof typeof statusConfig];
                    const isActive = status.step >= stepStatus.step;
                    const isCurrent = status.step === stepStatus.step;
                    
                    return (
                      <div key={s} className="relative z-10 flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                          isActive 
                            ? 'bg-primary-600 text-white shadow-premium scale-110' 
                            : 'bg-white border-2 border-gray-100 text-gray-300'
                        }`}>
                          {isActive ? <CheckCircle2 className="w-5 h-5" /> : <span className="font-black text-sm">{idx + 1}</span>}
                        </div>
                        <span className={`absolute -bottom-8 whitespace-nowrap text-xs font-black uppercase tracking-widest ${
                          isCurrent ? 'text-primary-600' : 'text-gray-400'
                        }`}>
                          {getStatusLabel(s)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 商品清单 */}
          <div className="bg-white rounded-[2rem] border border-gray-100 shadow-soft overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 flex items-center">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-3"></div>
                {t('account.orderDetail.items.title')}
              </h3>
              <span className="px-4 py-1.5 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                {t('account.orderDetail.items.count', { count: order.items.length })}
              </span>
            </div>
            <div className="divide-y divide-gray-50">
              {order.items.map((item) => (
                <div key={item.id} className="p-8 flex items-center gap-6 hover:bg-gray-50/50 transition-colors">
                  <div className="w-20 h-20 bg-gray-100 rounded-2xl flex-shrink-0 flex items-center justify-center">
                    <ShoppingBag className="w-8 h-8 text-gray-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-black text-lg text-gray-900 truncate mb-1">{item.productName}</h4>
                    <p className="text-gray-400 font-bold text-sm">{t('account.orderDetail.items.unitPrice')}¥{item.price.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-gray-900">¥{item.subtotal.toFixed(2)}</p>
                    <p className="text-gray-400 font-bold text-sm">{t('account.orderDetail.items.quantity')}{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-8 bg-gray-50/50 border-t border-gray-50">
              <div className="flex justify-between items-end">
                <span className="text-gray-500 font-bold uppercase tracking-widest text-sm">{t('account.orderDetail.items.total')}</span>
                <span className="text-3xl font-black text-primary-600">¥{order.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 右侧：辅助信息 */}
        <div className="space-y-10">
          {/* 收货人信息 */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-soft">
            <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center">
              <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-3"></div>
              {t('account.orderDetail.shipping.title')}
            </h3>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('account.orderDetail.shipping.name')}</p>
                  <p className="text-gray-900 font-bold">{order.customerName}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('account.orderDetail.shipping.phone')}</p>
                  <p className="text-gray-900 font-bold">{order.customerPhone}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('account.orderDetail.shipping.address')}</p>
                  <p className="text-gray-900 font-bold leading-relaxed">{order.shippingAddress}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 订单动态/历史 */}
          {order.histories && order.histories.length > 0 && (
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-soft">
              <h3 className="text-xl font-black text-gray-900 mb-8 flex items-center">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-3"></div>
                {t('account.orderDetail.history.title')}
              </h3>
              <div className="space-y-8">
                {order.histories.map((history, index) => {
                  return (
                    <div key={history.id} className="relative flex gap-4">
                      {/* 线条 */}
                      {index < order.histories.length - 1 && (
                        <div className="absolute top-10 left-5 w-0.5 h-full bg-gray-50 -translate-x-1/2"></div>
                      )}
                      
                      <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        index === 0 ? 'bg-primary-600 text-white shadow-soft' : 'bg-gray-50 text-gray-300'
                      }`}>
                        <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-white animate-ping' : 'bg-current'}`}></div>
                      </div>
                      
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`font-black text-sm ${index === 0 ? 'text-gray-900' : 'text-gray-400'}`}>
                            {getStatusLabel(history.toStatus)}
                          </span>
                          <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
                            {new Date(history.changedAt).toLocaleTimeString(dateLocale, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 font-bold mb-2">
                          {new Date(history.changedAt).toLocaleDateString(dateLocale, { month: 'long', day: 'numeric' })}
                        </p>
                        {history.note && (
                          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <p className="text-xs text-gray-500 leading-relaxed font-medium">{history.note}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 订单备注 */}
          {order.notes && (
            <div className="bg-orange-50 rounded-[2rem] p-8 border border-orange-100">
              <h3 className="text-lg font-black text-orange-900 mb-4 flex items-center">
                <Info className="w-5 h-5 mr-2" />
                {t('account.orderDetail.notes.title')}
              </h3>
              <p className="text-orange-800 text-sm font-medium leading-relaxed italic">
                “ {order.notes} ”
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
