'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Link } from '@/navigation'
import { ShoppingBag, Trash2, Plus, Minus } from 'lucide-react'
import { getImageUrl } from '@/lib/api'
import { useTranslations } from 'next-intl'
import toast from 'react-hot-toast'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
  variantId?: number | null
  variantName?: string | null
}

export default function CartPage() {
  const t = useTranslations()
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCart()
    
    // 监听购物车更新事件
    const handleCartUpdate = () => {
      loadCart()
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  const loadCart = () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(cartData)
    } catch (error) {
      console.error('读取购物车失败:', error)
      setCart([])
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = (id: number, variantId: number | null | undefined, newQuantity: number) => {
    if (newQuantity < 1) return
    const updatedCart = cart.map(item => {
      if (variantId) {
        return item.id === id && item.variantId === variantId ? { ...item, quantity: newQuantity } : item
      }
      return item.id === id && !item.variantId ? { ...item, quantity: newQuantity } : item
    })
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
  }

  const removeItem = (id: number, variantId: number | null | undefined) => {
    const item = cart.find(i => {
      if (variantId) {
        return i.id === id && i.variantId === variantId
      }
      return i.id === id && !i.variantId
    })
    const updatedCart = cart.filter(item => {
      if (variantId) {
        return !(item.id === id && item.variantId === variantId)
      }
      return !(item.id === id && !item.variantId)
    })
    setCart(updatedCart)
    localStorage.setItem('cart', JSON.stringify(updatedCart))
    window.dispatchEvent(new Event('cartUpdated'))
    toast.success(t('cart.toast.removed', { name: item?.name || t('cart.toast.defaultItemName') }))
  }

  const clearCart = () => {
    if (confirm(t('cart.clear.confirm'))) {
      setCart([])
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success(t('cart.toast.cleared'))
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 0 ? (subtotal >= 200 ? 0 : 15) : 0
  const total = subtotal + shipping

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">{t('cart.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{t('cart.pageTitle')}</h1>
            <p className="text-gray-500 font-medium">{t('cart.pageSubtitle')}</p>
          </div>
          {cart.length > 0 && (
            <button 
              onClick={clearCart}
              className="flex items-center text-red-500 hover:text-red-600 transition-colors font-bold text-sm bg-red-50 px-4 py-2 rounded-xl border border-red-100 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('cart.clear.button')}
            </button>
          )}
        </div>
        
        {cart.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] shadow-premium p-20 text-center border border-gray-50 animate-fade-in">
            <div className="w-32 h-32 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag className="w-16 h-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-4">{t('cart.empty.title')}</h2>
            <p className="text-gray-500 mb-10 max-w-sm mx-auto">
              {t('cart.empty.subtitle')}
            </p>
            <Link 
              href="/products"
              className="inline-flex items-center bg-primary-600 text-white px-10 py-4 rounded-full font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-95"
            >
              {t('cart.empty.cta')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6 animate-fade-in">
              {cart.map((item) => (
                <div key={item.variantId ? `${item.id}-${item.variantId}` : `${item.id}`} className="group bg-white rounded-3xl shadow-soft p-6 border border-gray-50 hover:border-primary-100 transition-all duration-300">
                  <div className="flex flex-col sm:flex-row gap-6">
                    <div className="w-full sm:w-32 h-32 bg-gray-50 rounded-2xl flex-shrink-0 overflow-hidden relative group-hover:shadow-soft transition-all">
                      {item.image ? (
                        <img 
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-8 h-8 opacity-20" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-black text-xl text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{item.name}</h3>
                        {item.variantName && (
                          <p className="text-gray-500 text-sm font-medium mb-2">
                            {item.variantName}
                          </p>
                        )}
                        <p className="text-primary-600 font-black text-2xl">¥{item.price.toFixed(2)}</p>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 w-fit rounded-xl p-1 border border-gray-100 mt-4">
                        <button
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-primary-600 transition-all"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-10 text-center font-black text-gray-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.variantId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:text-primary-600 transition-all"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start">
                      <button
                        onClick={() => removeItem(item.id, item.variantId)}
                        className="text-gray-300 hover:text-red-500 p-2 rounded-xl hover:bg-red-50 transition-all order-2 sm:order-1"
                        aria-label={t('cart.item.removeAria')}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <div className="hidden sm:block sm:mt-auto font-black text-gray-400 text-sm order-1 sm:order-2">
                        {t('cart.item.subtotal')}
                        <span className="text-gray-900 ml-1">¥{(item.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2rem] shadow-premium p-8 sticky top-32 border border-gray-50 animate-slide-up">
                <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
                  <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-3"></div>
                  {t('cart.summary.title')}
                </h2>
                
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('cart.summary.subtotal')}</span>
                    <span className="font-black text-gray-900">¥{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">{t('cart.summary.shipping')}</span>
                    <span className={`font-black ${shipping === 0 ? 'text-green-500' : 'text-gray-900'}`}>
                      {shipping === 0 ? t('cart.summary.freeShipping') : `¥${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  {subtotal > 0 && subtotal < 200 && (
                    <div className="bg-primary-50 p-4 rounded-2xl">
                      <p className="text-primary-600 text-xs font-black text-center">
                        {t('cart.summary.freeShippingTipPrefix')}
                        <span className="text-lg">¥{(200 - subtotal).toFixed(2)}</span>
                        {t('cart.summary.freeShippingTipSuffix')}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-50 pt-6 mb-8">
                  <div className="flex justify-between items-end">
                    <span className="text-gray-900 font-black text-lg">{t('cart.summary.total')}</span>
                    <span className="text-primary-600 font-black text-4xl">¥{total.toFixed(2)}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Link 
                    href="/checkout"
                    className="flex items-center justify-center w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-primary-700 transition-all hover:shadow-premium active:scale-[0.98]"
                  >
                    {t('cart.actions.checkout')}
                  </Link>
                  <Link 
                    href="/products"
                    className="flex items-center justify-center w-full text-gray-500 font-bold hover:text-primary-600 transition-colors py-2"
                  >
                    {t('cart.actions.continueShopping')}
                  </Link>
                </div>

                <div className="mt-8 pt-8 border-t border-gray-50">
                  <div className="flex items-center justify-center space-x-4 grayscale opacity-50">
                    {/* 支付方式图标占位 */}
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                    <div className="w-10 h-6 bg-gray-200 rounded"></div>
                  </div>
                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-4">
                    {t('cart.securityNote')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
