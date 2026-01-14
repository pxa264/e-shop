'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createOrder, createOrderItem, getImageUrl, getAddresses } from '@/lib/api'
import Header from '@/components/Header'
import { useAuth } from '@/contexts/AuthContext'
import toast from 'react-hot-toast'

interface CartItem {
  id: number
  name: string
  price: number
  quantity: number
  image?: string
}

interface AddressItem {
  id: number
  receiverName: string
  receiverPhone: string
  province: string
  city: string
  district: string
  detailAddress: string
  isDefault: boolean
}

interface OrderData {
  customerName: string
  email: string
  phone: string
  address: string
  items: CartItem[]
  totalAmount: number
}

import {
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  ShieldCheck,
  ChevronRight,
  ArrowLeft,
  ShoppingBag,
  Info,
  CheckCircle2,
  AlertCircle,
  Plus,
  Circle
} from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [cart, setCart] = useState<CartItem[]>([])
  const [addresses, setAddresses] = useState<AddressItem[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: ''
  })

  const [errors, setErrors] = useState({
    customerName: '',
    email: '',
    phone: '',
    address: ''
  })

  // 认证检查：未登录用户重定向到登录页
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('请先登录后再结算')
      router.push('/login?redirect=/checkout')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (authLoading) return
    if (!user) return

    loadCart()
  }, [authLoading, user])

  // 认证加载中显示加载状态
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在验证身份...</p>
        </div>
      </div>
    )
  }

  // 未认证时不渲染内容（会重定向）
  if (!user) {
    return null
  }

  const loadCart = async () => {
    try {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]')
      setCart(cartData)
      
      if (cartData.length === 0) {
        router.push('/cart')
      }

      // 加载用户地址
      const addressResponse = await getAddresses()
      const addressList: AddressItem[] = addressResponse.data || []
      setAddresses(addressList)

      if (addressList.length > 0) {
        const defaultAddress = addressList.find((addr) => addr.isDefault) || addressList[0]
        setSelectedAddressId(defaultAddress.id)
        setFormData((prev) => ({
          ...prev,
          customerName: defaultAddress.receiverName,
          phone: defaultAddress.receiverPhone,
          address: `${defaultAddress.province}${defaultAddress.city}${defaultAddress.district}${defaultAddress.detailAddress}`,
        }))
      }
    } catch (error) {
      console.error('读取购物车或地址失败:', error)
      toast.error('加载购物车或地址信息失败，请刷新后重试')
    } finally {
      setLoading(false)
    }
  }

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal >= 200 ? 0 : 15
  const total = subtotal + shipping

  const handleSelectAddress = (address: AddressItem) => {
    setSelectedAddressId(address.id)
    setFormData((prev) => ({
      ...prev,
      customerName: address.receiverName,
      phone: address.receiverPhone,
      address: `${address.province}${address.city}${address.district}${address.detailAddress}`,
    }))
    setErrors((prev) => ({
      ...prev,
      customerName: '',
      phone: '',
      address: '',
    }))
  }

  const validateForm = () => {
    const newErrors = {
      customerName: '',
      email: '',
      phone: '',
      address: ''
    }

    if (!formData.customerName.trim()) {
      newErrors.customerName = '请输入姓名'
    }

    if (!formData.email.trim()) {
      newErrors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '邮箱格式不正确'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '请输入电话'
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = '电话格式不正确'
    }

    if (!formData.address.trim()) {
      newErrors.address = '请输入收货地址'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e?.preventDefault) e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const orderNumber = `ORD${Date.now()}`
      
      const orderData = {
        orderNumber: orderNumber,
        customerName: formData.customerName,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        shippingAddress: formData.address,
        totalAmount: total,
        status: 'pending'
      }

      const orderResponse = await createOrder(orderData)
      const orderId = orderResponse.data.id
      
      const orderItemPromises = cart.map((item: CartItem) => {
        const orderItemData = {
          order: orderId,
          productId: item.id,
          productName: item.name,
          price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity
        }
        return createOrderItem(orderItemData)
      })
      
      await Promise.all(orderItemPromises)
      
      localStorage.removeItem('cart')
      window.dispatchEvent(new Event('cartUpdated'))
      
      toast.success('订单提交成功！')
      router.push(`/order/success?orderNumber=${orderNumber}`)
    } catch (error) {
      console.error('提交订单失败:', error)
      toast.error('提交订单失败，请检查收货信息或稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">正在进入结算页面...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-10">
          <Link href="/cart" className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors group font-bold">
            <div className="p-2 bg-white rounded-xl shadow-soft mr-3 group-hover:bg-primary-50 transition-colors">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            返回购物车
          </Link>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-[2.5rem] shadow-premium p-8 lg:p-12 border border-gray-50 animate-fade-in space-y-10">
              <div className="flex items-center space-x-3 mb-10">
                <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">收货地址</h2>
              </div>

              {/* 地址列表 */}
              {addresses.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">
                      请选择已保存的收货地址
                    </p>
                    <Link
                      href="/account/addresses"
                      className="inline-flex items-center justify-center px-4 py-2 border border-primary-100 text-primary-600 rounded-xl font-bold hover:bg-primary-50 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      管理 / 添加地址
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => {
                      const isSelected = address.id === selectedAddressId
                      return (
                        <button
                          type="button"
                          key={address.id}
                          onClick={() => handleSelectAddress(address)}
                          className={`text-left p-5 rounded-2xl border-2 transition-all duration-300 shadow-soft hover:shadow-premium ${
                            isSelected
                              ? 'border-primary-500 ring-2 ring-primary-100 bg-primary-50'
                              : 'border-gray-100 hover:border-primary-200 bg-white'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-lg font-black text-gray-900">{address.receiverName}</p>
                              <p className="text-sm font-bold text-gray-500 mt-1">{address.receiverPhone}</p>
                            </div>
                            {isSelected ? (
                              <CheckCircle2 className="w-5 h-5 text-primary-600" />
                            ) : (
                              <Circle className="w-5 h-5 text-gray-300" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 font-bold leading-relaxed">
                            {address.province} {address.city} {address.district}
                            <br />
                            {address.detailAddress}
                          </p>
                          {address.isDefault && (
                            <span className="inline-flex items-center mt-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary-600 text-white">
                              默认地址
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <MapPin className="w-10 h-10 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-bold mb-4">暂无保存的收货地址</p>
                  <Link
                    href="/account/addresses"
                    className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-full font-black text-sm hover:bg-primary-700 transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    立即添加
                  </Link>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label htmlFor="customerName" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                      收货人姓名 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner ${
                          errors.customerName ? 'border-red-500' : 'border-gray-100'
                        }`}
                        placeholder="请输入姓名"
                      />
                    </div>
                    {errors.customerName && (
                      <p className="mt-2 ml-1 text-xs font-bold text-red-500 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.customerName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                      联系电话 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner ${
                          errors.phone ? 'border-red-500' : 'border-gray-100'
                        }`}
                        placeholder="请输入手机号码"
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 ml-1 text-xs font-bold text-red-500 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="email" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                      电子邮箱 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner ${
                          errors.email ? 'border-red-500' : 'border-gray-100'
                        }`}
                        placeholder="请输入邮箱地址"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 ml-1 text-xs font-bold text-red-500 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">
                      详细地址 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-6 w-5 h-5 text-gray-300 group-focus-within:text-primary-500 transition-colors" />
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className={`w-full pl-12 pr-5 py-4 bg-gray-50 border rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none font-bold text-gray-700 shadow-inner resize-none ${
                          errors.address ? 'border-red-500' : 'border-gray-100'
                        }`}
                        placeholder="请输入详细收货地址"
                      />
                    </div>
                    {errors.address && (
                      <p className="mt-2 ml-1 text-xs font-bold text-red-500 flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" /> {errors.address}
                      </p>
                    )}
                  </div>
                </div>
              </form>
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-soft p-8 lg:p-12 border border-gray-50 animate-fade-in">
              <div className="flex items-center space-x-3 mb-10">
                <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">支付方式</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-6 border-2 border-primary-500 bg-primary-50 rounded-3xl relative overflow-hidden group cursor-pointer">
                  <div className="flex items-center justify-between mb-4">
                    <CheckCircle2 className="w-6 h-6 text-primary-600" />
                    <div className="w-10 h-6 bg-primary-200 rounded"></div>
                  </div>
                  <p className="font-black text-primary-900">在线支付</p>
                  <p className="text-xs text-primary-600 font-bold mt-1">支持 微信/支付宝/银联</p>
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-primary-600/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                </div>
                
                <div className="p-6 border-2 border-gray-100 rounded-3xl relative overflow-hidden group cursor-not-allowed opacity-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-6 h-6 border-2 border-gray-200 rounded-full"></div>
                    <div className="w-10 h-6 bg-gray-100 rounded"></div>
                  </div>
                  <p className="font-black text-gray-400">货到付款</p>
                  <p className="text-[10px] text-gray-300 font-black uppercase tracking-widest mt-1">暂不可用</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2rem] shadow-premium p-8 border border-gray-50 sticky top-32 animate-slide-up">
              <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-3"></div>
                订单汇总
              </h2>
              
              <div className="space-y-6 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 overflow-hidden border border-gray-100">
                      {item.image ? (
                        <img 
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <ShoppingBag className="w-6 h-6 opacity-20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-sm text-gray-900 truncate">{item.name}</h4>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                        ¥{item.price.toFixed(2)} × {item.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-gray-900">¥{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-6 border-t border-gray-50 mb-8">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">商品总计</span>
                  <span className="font-black text-gray-900">¥{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-bold uppercase tracking-widest text-xs">运费估计</span>
                  <span className={`font-black ${shipping === 0 ? 'text-green-500' : 'text-gray-900'}`}>
                    {shipping === 0 ? '免费配送' : `¥${shipping.toFixed(2)}`}
                  </span>
                </div>
                {shipping > 0 && (
                  <div className="bg-primary-50 p-3 rounded-xl flex items-center space-x-2">
                    <Info className="w-4 h-4 text-primary-600" />
                    <p className="text-primary-600 text-[10px] font-black uppercase tracking-widest">
                      满 ¥200 即可享受包邮
                    </p>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-50 pt-6 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-gray-900 font-black text-lg">最终总额</span>
                  <span className="text-primary-600 font-black text-4xl">¥{total.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                <button 
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center justify-center w-full bg-primary-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-primary-700 transition-all hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3"></div>
                      <span>订单提交中...</span>
                    </>
                  ) : (
                    <>
                      <span>提交订单</span>
                      <ChevronRight className="w-6 h-6 ml-2" />
                    </>
                  )}
                </button>
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    SSL 加密安全结算
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
