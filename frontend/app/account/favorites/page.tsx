'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useRouter } from '@/navigation'
import { 
  Heart, 
  ShoppingCart, 
  Trash2, 
  ExternalLink, 
  ShoppingBag,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { getWishlists, removeFromWishlist, getImageUrl } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTranslations } from 'next-intl'

interface WishlistItem {
  id: number;
  product: {
    id: number;
    name: string;
    description: string;
    price: number;
    slug: string;
    images?: {
      url: string;
    }[];
  };
}

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const t = useTranslations();
  const [wishlists, setWishlists] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/account/favorites');
      return;
    }
    fetchWishlists();
  }, [isAuthenticated, router]);

  /**
   * 获取收藏列表
   */
  const fetchWishlists = async () => {
    setLoading(true);
    try {
      const data = await getWishlists();
      setWishlists(data.data);
    } catch (error) {
      console.error('Failed to fetch wishlists:', error);
      toast.error(t('account.favorites.toast.fetchFailed'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * 移除收藏
   */
  const handleRemove = async (id: number) => {
    try {
      await removeFromWishlist(id);
      toast.success(t('account.favorites.toast.removeSuccess'));
      fetchWishlists();
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message || error.message || t('account.favorites.toast.actionFailed');
      toast.error(errorMsg);
    }
  };

  /**
   * 添加到购物车
   */
  const handleAddToCart = (product: any) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingItem = cart.find((item: any) => item.id === product.id);

      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        const rawImageUrl = product.images?.[0]?.url;
        const imageUrl = getImageUrl(rawImageUrl);
        
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          slug: product.slug,
          image: imageUrl,
        });
      }

      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      toast.success(t('account.favorites.toast.addToCartSuccess'));
    } catch (error) {
      toast.error(t('account.favorites.toast.addToCartFailed'));
    }
  };

  return (
    <div className="p-8 lg:p-12 space-y-10 animate-fade-in">
      {/* 页面标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 mb-2">{t('account.favorites.title')}</h1>
          <p className="text-gray-500 font-medium">{t('account.favorites.subtitle', { count: wishlists.length })}</p>
          <div className="h-1.5 w-12 bg-primary-500 rounded-full mt-4"></div>
        </div>
        {wishlists.length > 0 && (
          <Link
            href="/products"
            className="flex items-center justify-center space-x-2 px-6 py-3.5 bg-gray-50 text-gray-600 rounded-2xl font-black hover:bg-primary-50 hover:text-primary-600 transition-all active:scale-95"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>{t('account.favorites.actions.continueShopping')}</span>
          </Link>
        )}
      </div>

      {/* 收藏列表 */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-3xl p-4 border border-gray-50 shadow-soft animate-pulse">
              <div className="aspect-square bg-gray-100 rounded-2xl mb-4"></div>
              <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-gray-100 rounded w-full mb-6"></div>
              <div className="flex gap-3">
                <div className="h-10 bg-gray-100 rounded-xl flex-1"></div>
                <div className="h-10 bg-gray-100 rounded-xl w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      ) : wishlists.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] shadow-premium p-20 text-center border border-gray-50 animate-fade-in">
          <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8 text-primary-200">
            <Heart className="w-16 h-16" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-4">{t('account.favorites.empty.title')}</h2>
          <p className="text-gray-500 mb-10 max-w-sm mx-auto">
            {t('account.favorites.empty.subtitle')}
          </p>
          <button
            onClick={() => router.push('/products')}
            className="inline-flex items-center bg-primary-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-95"
          >
            {t('account.favorites.empty.cta')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {wishlists.map((item) => {
            const product = item.product;
            const rawImageUrl = product.images?.[0]?.url;
            const imageUrl = getImageUrl(rawImageUrl);

            return (
              <div 
                key={item.id} 
                className="group bg-white rounded-3xl border border-gray-100 shadow-soft overflow-hidden hover:shadow-premium hover:border-primary-100 transition-all duration-500 hover:-translate-y-2 flex flex-col"
              >
                {/* 商品图片 */}
                <div className="relative aspect-square bg-gray-50 overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.png';
                    }}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-white/90 backdrop-blur text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full shadow-soft">
                      {t('account.favorites.badges.featured')}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(item.id)}
                    className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur text-gray-400 hover:text-red-500 rounded-xl shadow-soft transition-all active:scale-90"
                    title={t('account.favorites.actions.removeTitle')}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* 商品信息 */}
                <div className="p-6 flex-1 flex flex-col">
                  <Link
                    href={`/products/${product.slug}`}
                    className="group/link block mb-3"
                  >
                    <h3 className="font-black text-lg text-gray-900 group-hover/link:text-primary-600 transition-colors line-clamp-1">
                      {product.name}
                    </h3>
                  </Link>

                  <p className="text-sm text-gray-500 mb-6 line-clamp-2 leading-relaxed flex-1">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-primary-600">
                      ¥{product.price.toFixed(2)}
                    </span>
                    <Link
                      href={`/products/${product.slug}`}
                      className="text-gray-400 hover:text-primary-500 transition-colors"
                      title={t('account.favorites.actions.viewDetailTitle')}
                    >
                      <ExternalLink className="w-5 h-5" />
                    </Link>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full flex items-center justify-center space-x-2 py-3.5 bg-secondary-900 text-white rounded-2xl font-black text-sm hover:bg-black transition-all shadow-soft active:scale-[0.98]"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>{t('account.favorites.actions.addToCart')}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
