'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Package, Home, ArrowRight, Heart, ShoppingBag } from 'lucide-react'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState<string>('')

  useEffect(() => {
    const num = searchParams.get('orderNumber')
    if (num) {
      setOrderNumber(num)
    }
  }, [searchParams])

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center px-4 py-12">
      <div className="max-w-xl w-full animate-fade-in">
        <div className="bg-white rounded-[3rem] shadow-premium p-10 lg:p-16 text-center border border-gray-50 relative overflow-hidden">
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-50 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 mb-10">
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 relative">
              <CheckCircle2 className="w-16 h-16 text-green-500 animate-float" />
              <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-20"></div>
            </div>
            <h1 className="text-4xl font-black text-gray-900 mb-4 tracking-tight">订单提交成功！</h1>
            <p className="text-gray-500 text-lg font-medium leading-relaxed max-w-sm mx-auto">
              感谢您的信任。我们已经收到您的订单，正在马不停蹄地为您准备包裹。
            </p>
          </div>
          
          {orderNumber && (
            <div className="relative z-10 bg-gray-50 rounded-[2rem] p-8 mb-10 border border-gray-100 flex flex-col items-center">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-2">订单编号</p>
              <p className="text-2xl font-black text-primary-600 tracking-tight">{orderNumber}</p>
              <div className="mt-4 flex items-center space-x-2 text-gray-400">
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
                <span className="text-xs font-bold">请妥善保管此编号以便查询</span>
                <div className="w-1 h-1 rounded-full bg-gray-300"></div>
              </div>
            </div>
          )}
          
          <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
            <Link
              href="/account/orders"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-secondary-900 text-white rounded-2xl font-black hover:bg-black transition-all shadow-soft active:scale-[0.98]"
            >
              <Package className="w-5 h-5" />
              <span>追踪订单</span>
            </Link>
            
            <Link
              href="/products"
              className="flex items-center justify-center space-x-2 px-8 py-4 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all shadow-soft active:scale-[0.98]"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>继续购物</span>
            </Link>
          </div>
          
          <div className="relative z-10 pt-8 border-t border-gray-50">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Heart className="w-4 h-4 text-red-400 fill-current" />
              <p className="text-sm font-bold text-gray-400">我们将全力确保商品完美送达</p>
            </div>
            <Link href="/" className="inline-flex items-center text-primary-600 font-black hover:underline group">
              返回商城首页 <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
