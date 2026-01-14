'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ShoppingCart, Search, Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import Header from '@/components/Header'
import { getProducts, fetchBannersByLocale, getImageUrl } from '@/lib/api'
import toast from 'react-hot-toast'
import { useLocale } from 'next-intl'

export default function Home() {
  const locale = useLocale()
  const [products, setProducts] = useState<any>({ data: [] })
  const [banners, setBanners] = useState<any>({ data: [] })
  const [currentBanner, setCurrentBanner] = useState(0)
  const [cartCount, setCartCount] = useState(0)
  const [loading, setLoading] = useState(true)

  const getBannerField = (banner: any, baseField: string) => {
    const attrs = banner?.attributes ?? {}
    const isZh = locale === 'zh'

    const candidates = isZh
      ? [`${baseField}_zh`, `${baseField}Zh`, `${baseField}_zhCN`, `${baseField}ZhCn`, baseField]
      : [`${baseField}_en`, `${baseField}En`, baseField]

    for (const key of candidates) {
      const value = attrs?.[key]
      if (typeof value === 'string' && value.trim()) return value
    }
    return ''
  }

  useEffect(() => {
    loadData()
    loadCartCount()
    
    const handleCartUpdate = () => {
      loadCartCount()
    }
    
    window.addEventListener('cartUpdated', handleCartUpdate)
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate)
    }
  }, [])

  useEffect(() => {
    if (banners.data && banners.data.length > 0) {
      const timer = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.data.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [banners])

  const loadData = async () => {
    try {
      const [productsData, bannersData] = await Promise.all([
        getProducts({ featured: true, limit: 4 }),
        fetchBannersByLocale(locale)
      ])
      setProducts(productsData)
      setBanners(bannersData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCartCount = () => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const count = cart.reduce((sum: number, item: any) => sum + item.quantity, 0)
      setCartCount(count)
    } catch (error) {
      console.error('Failed to load cart count:', error)
    }
  }

  const handleAddToCart = (e: any, product: any) => {
    e.preventDefault()
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]')
      const existingItem = cart.find((item: any) => item.id === product.id)
      
      const imageUrl = product.attributes.images?.data?.[0]?.attributes?.url || null
      
      if (existingItem) {
        existingItem.quantity += 1
      } else {
        cart.push({
          id: product.id,
          name: product.attributes.name,
          price: product.attributes.price,
          quantity: 1,
          image: imageUrl
        })
      }
      
      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))
      toast.success(`已添加 ${product.attributes.name} 到购物车`)
    } catch (error) {
      console.error('添加到购物车失败:', error)
      toast.error('添加到购物车失败，请重试')
    }
  }

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.data.length)
  }

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.data.length) % banners.data.length)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">加载中...</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />

      <main>
        {/* 轮播 Banner */}
        {banners.data && banners.data.length > 0 ? (
          <section className="relative h-[500px] md:h-[600px] bg-gray-900 overflow-hidden">
            {banners.data.map((banner: any, index: number) => (
              <div
                key={banner.id}
                className={`absolute inset-0 transition-all duration-700 ease-in-out transform ${
                  index === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                }`}
              >
                {banner.attributes.image?.data ? (
                  <img
                    src={getImageUrl(banner.attributes.image.data.attributes.url)}
                    alt={getBannerField(banner, 'title')}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary-600 via-primary-500 to-primary-800" />
                )}
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center backdrop-blur-[2px]">
                  <div className="max-w-4xl px-4 text-center text-white animate-slide-up">
                    <h2 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
                      {getBannerField(banner, 'title')}
                    </h2>
                    {getBannerField(banner, 'description') && (
                      <p className="text-xl md:text-2xl mb-10 text-white/90 font-medium max-w-2xl mx-auto leading-relaxed">
                        {getBannerField(banner, 'description')}
                      </p>
                    )}
                    {getBannerField(banner, 'link') && (
                      <Link
                        href={getBannerField(banner, 'link')}
                        className="inline-flex items-center bg-white text-primary-600 px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-50 transition-all hover:shadow-premium hover:-translate-y-1 active:scale-95"
                      >
                        立即探索
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {banners.data.length > 1 && (
              <>
                <button
                  onClick={prevBanner}
                  className="absolute left-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-4 transition-all text-white group"
                >
                  <ChevronLeft className="w-8 h-8 group-hover:-translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={nextBanner}
                  className="absolute right-6 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full p-4 transition-all text-white group"
                >
                  <ChevronRight className="w-8 h-8 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex space-x-3">
                  {banners.data.map((_: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBanner(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentBanner ? 'bg-white w-12' : 'bg-white/40 w-4 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </section>
        ) : (
          <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-fade-in">
              <h1 className="text-5xl md:text-7xl font-extrabold mb-8 tracking-tight">
                欢迎来到理想商城
              </h1>
              <p className="text-xl md:text-2xl mb-12 text-primary-50 max-w-2xl mx-auto leading-relaxed">
                甄选优质好物，为您打造精致生活
              </p>
              <Link
                href="/products"
                className="inline-block bg-white text-primary-600 px-12 py-4 rounded-full font-bold text-lg hover:bg-primary-50 transition-all hover:shadow-premium hover:-translate-y-1 active:scale-95"
              >
                立即开启购物之旅
              </Link>
            </div>
          </section>
        )}

        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-2">热门推荐</h2>
              <div className="h-1.5 w-20 bg-primary-500 rounded-full"></div>
            </div>
            <Link href="/products" className="text-primary-600 font-semibold hover:text-primary-700 flex items-center group">
              查看全部商品 <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.data && products.data.length > 0 ? (
              products.data.map((product: any) => (
                <div 
                  key={product.id}
                  className="group bg-white rounded-2xl shadow-soft overflow-hidden hover:shadow-premium transition-all duration-500 hover:-translate-y-2 flex flex-col"
                >
                  <Link href={`/products/${product.id}`} className="relative h-64 bg-gray-100 overflow-hidden block">
                    {product.attributes.images?.data?.[0] ? (
                      <img 
                        src={getImageUrl(product.attributes.images.data[0].attributes.url)}
                        alt={product.attributes.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="w-12 h-12 opacity-20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                  </Link>
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="mb-2">
                      <span className="text-xs font-bold text-primary-500 uppercase tracking-wider">精选好物</span>
                    </div>
                    <Link href={`/products/${product.id}`} className="block">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                        {product.attributes.name}
                      </h3>
                    </Link>
                    <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1">
                      {product.attributes.description}
                    </p>
                    <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-400 line-through">¥{(product.attributes.price * 1.2).toFixed(2)}</span>
                        <span className="text-primary-600 font-black text-2xl">¥{product.attributes.price.toFixed(2)}</span>
                      </div>
                      <button 
                        onClick={(e) => handleAddToCart(e, product)}
                        className="bg-primary-600 text-white p-3 rounded-xl hover:bg-primary-700 transition-all hover:rotate-12 active:scale-90 shadow-soft"
                        aria-label="加入购物车"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-4 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="text-gray-300 mb-4 flex justify-center">
                  <Package className="w-16 h-16" />
                </div>
                <p className="text-gray-500 text-lg">暂无热门商品推荐</p>
                <Link href="/products" className="mt-4 inline-block text-primary-600 font-semibold hover:underline">
                  去看看其他商品
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

