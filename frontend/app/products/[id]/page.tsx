'use client'

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react'
import { Link } from '@/navigation'
import { useParams } from 'next/navigation'
import { ArrowLeft, Plus, Minus, ShoppingCart, Heart } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { toggleWishlist, checkWishlist, getImageUrl, getAPIUrl } from '@/lib/api'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

export default function ProductDetailPage() {
  const params = useParams()
  const { isAuthenticated } = useAuth()
  const t = useTranslations()
  const [product, setProduct] = useState<any>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [relatedProducts, setRelatedProducts] = useState<any[]>([])
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useEffect(() => {
    loadProduct()
  }, [params.id])

  // 检查收藏状态
  useEffect(() => {
    if (isAuthenticated && product) {
      checkFavoriteStatus()
    }
  }, [isAuthenticated, product])

  // 自动选择第一个变体
  useEffect(() => {
    if (product && product.attributes.variants && product.attributes.variants.length > 0) {
      setSelectedVariant(product.attributes.variants[0])
    }
  }, [product])

  const checkFavoriteStatus = async () => {
    try {
      const result = await checkWishlist(product.id)
      setIsFavorited(result.data.isFavorited)
    } catch (error) {
      console.error('Failed to check wishlist status:', error)
    }
  }

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.error(t('products.detail.toast.loginToFavorite'))
      return
    }

    setFavoriteLoading(true)
    try {
      const result = await toggleWishlist(product.id)
      setIsFavorited(result.data.isFavorited)
      toast.success(
        result.data.isFavorited
          ? t('products.detail.toast.favorited')
          : t('products.detail.toast.unfavorited')
      )
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.error?.message ||
        error.message ||
        t('common.tryAgain')
      toast.error(errorMsg)
    } finally {
      setFavoriteLoading(false)
    }
  }

  const loadProduct = async () => {
    try {
      const apiUrl = getAPIUrl()
      const response = await fetch(`${apiUrl}/api/products/${params.id}?populate=*`)
      const data = await response.json()
      setProduct(data.data)
      
      // 加载相关商品（同分类的其他商品）
      if (data.data?.attributes?.category?.data?.id) {
        const categoryId = data.data.attributes.category.data.id
        const relatedResponse = await fetch(
          `${apiUrl}/api/products?populate=*&filters[category][id][$eq]=${categoryId}&pagination[limit]=4`
        )
        const relatedData = await relatedResponse.json()
        // 过滤掉当前商品
        const filtered = relatedData.data.filter((p: any) => p.id !== data.data.id)
        setRelatedProducts(filtered.slice(0, 4))
      }
    } catch (error) {
      console.error('Failed to load product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    try {
      // Check if product has variants but none is selected
      if (product.attributes.variants && product.attributes.variants.length > 0 && !selectedVariant) {
        toast.error(t('products.detail.toast.selectVariant') || 'Please select a variant')
        return
      }

      const cart = JSON.parse(localStorage.getItem('cart') || '[]')

      // Use variant price if available, otherwise use product price
      const price = selectedVariant ? selectedVariant.price : product.attributes.price
      const imageUrl = product.attributes.images?.data?.[0]?.attributes?.url || null

      // Create unique key for cart item (product + variant combination)
      const cartItemKey = selectedVariant
        ? `${product.id}-${selectedVariant.id}`
        : `${product.id}`

      const existingItem = cart.find((item: any) => {
        if (selectedVariant) {
          return item.id === product.id && item.variantId === selectedVariant.id
        }
        return item.id === product.id && !item.variantId
      })

      const cartItem = {
        id: product.id,
        name: product.attributes.name,
        price: price,
        quantity: quantity,
        image: imageUrl,
        variantId: selectedVariant?.id || null,
        variantName: selectedVariant?.name || null
      }

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        cart.push(cartItem)
      }

      localStorage.setItem('cart', JSON.stringify(cart))
      window.dispatchEvent(new Event('cartUpdated'))

      const productName = selectedVariant
        ? `${product.attributes.name} (${selectedVariant.name})`
        : product.attributes.name

      toast.success(
        t('products.detail.toast.addedToCart', {
          count: quantity,
          name: productName,
        })
      )
    } catch (error) {
      console.error('添加到购物车失败:', error)
      toast.error(t('products.detail.toast.addToCartFailed'))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          <p className="mt-4 text-gray-600">{t('products.detail.loading')}</p>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 font-bold">{t('products.detail.notFound.title')}</p>
          <Link href="/products" className="mt-4 inline-block text-primary-600 hover:underline font-bold">
            {t('products.detail.notFound.backToList')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-10">
          <Link href="/products" className="inline-flex items-center text-gray-500 hover:text-primary-600 transition-colors group font-bold">
            <div className="p-2 bg-white rounded-xl shadow-soft mr-3 group-hover:bg-primary-50 transition-colors">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </div>
            {t('products.detail.backToList')}
          </Link>
        </nav>

        <div className="bg-white rounded-[2.5rem] shadow-premium overflow-hidden border border-gray-50 mb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* 左侧图片区域 */}
            <div className="p-8 lg:p-12 bg-gray-50/50">
              <div className="sticky top-32">
                <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-soft border border-gray-100 mb-6 group">
                  {product.attributes.images?.data?.length > 0 ? (
                    <img 
                      src={getImageUrl(product.attributes.images.data[selectedImageIndex].attributes.url)}
                      alt={product.attributes.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <ShoppingCart className="w-20 h-20 opacity-10" />
                    </div>
                  )}
                </div>
                
                {/* 缩略图切换 */}
                {product.attributes.images?.data?.length > 1 && (
                  <div className="flex flex-wrap gap-4">
                    {product.attributes.images.data.map((image: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                          selectedImageIndex === index 
                            ? 'border-primary-500 shadow-soft ring-4 ring-primary-50 scale-105' 
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <img 
                          src={getImageUrl(image.attributes.url)}
                          alt={`${product.attributes.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 右侧信息区域 */}
            <div className="p-8 lg:p-16 flex flex-col">
              <div className="mb-8">
                <div className="flex items-center space-x-2 mb-4">
                  <span className="px-3 py-1 bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {t('products.detail.badges.authentic')}
                  </span>
                  <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full">
                    {t('products.detail.badges.inStockSale')}
                  </span>
                </div>
                <h1 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4 leading-tight">
                  {product.attributes.name}
                </h1>
                <div className="flex items-baseline space-x-4">
                  <span className="text-5xl font-black text-primary-600">
                    ¥{(selectedVariant ? selectedVariant.price : product.attributes.price).toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-400 line-through">
                    ¥{((selectedVariant ? selectedVariant.price : product.attributes.price) * 1.5).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="prose prose-slate prose-sm mb-10">
                <h3 className="text-gray-900 font-bold mb-3">{t('products.detail.sections.description')}</h3>
                <p className="text-gray-500 font-medium leading-relaxed text-base">
                  {product.attributes.description}
                </p>
              </div>

              {/* Variant Selector */}
              {product.attributes.variants && product.attributes.variants.length > 0 && (
                <div className="mb-10 pt-8 border-t border-gray-50">
                  <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-4">
                    {t('products.detail.selectVariant') || 'Select Variant'}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.attributes.variants.map((variant: any, index: number) => (
                      <button
                        key={index}
                        onClick={() => setSelectedVariant(variant)}
                        disabled={variant.stock === 0}
                        className={`p-4 rounded-xl border-2 transition-all text-left ${
                          selectedVariant?.id === variant.id
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-primary-300'
                        } ${
                          variant.stock === 0
                            ? 'opacity-50 cursor-not-allowed'
                            : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-black text-gray-900">{variant.name}</span>
                          <span className="text-primary-600 font-black">¥{variant.price.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className={variant.stock > 0 ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                            {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
                          </span>
                          {variant.sku && (
                            <span className="text-gray-400 font-bold">SKU: {variant.sku}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-6 mb-10 pt-8 border-t border-gray-50">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-gray-400 uppercase tracking-wider">{t('products.detail.stock.label')}</span>
                  <span className={(selectedVariant ? selectedVariant.stock : product.attributes.stock) > 0 ? 'text-green-500' : 'text-red-500'}>
                    {(selectedVariant ? selectedVariant.stock : product.attributes.stock) > 0
                      ? t('products.detail.stock.inStock', { count: selectedVariant ? selectedVariant.stock : product.attributes.stock })
                      : t('products.detail.stock.outOfStock')}
                  </span>
                </div>
                {product.attributes.sku && (
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span className="text-gray-400 uppercase tracking-wider">{t('products.detail.sku')}</span>
                    <span className="text-gray-900">{product.attributes.sku}</span>
                  </div>
                )}
              </div>

              <div className="mb-10">
                <label className="block text-gray-400 text-xs font-black uppercase tracking-widest mb-4">{t('products.detail.quantity')}</label>
                <div className="flex items-center bg-gray-50 w-fit rounded-2xl p-1 border border-gray-100 shadow-inner">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white hover:text-primary-600 hover:shadow-soft transition-all active:scale-90"
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-xl font-black w-16 text-center text-gray-900">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min((selectedVariant ? selectedVariant.stock : product.attributes.stock), quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white hover:text-primary-600 hover:shadow-soft transition-all active:scale-90"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                <button
                  onClick={handleAddToCart}
                  disabled={(selectedVariant ? selectedVariant.stock : product.attributes.stock) === 0}
                  className="flex-[2] bg-primary-600 text-white py-5 px-8 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all hover:shadow-premium active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center space-x-3 shadow-soft"
                >
                  <ShoppingCart className="w-6 h-6" />
                  <span>
                    {(selectedVariant ? selectedVariant.stock : product.attributes.stock) === 0
                      ? t('products.detail.stock.outOfStock')
                      : t('products.detail.actions.addToCart')}
                  </span>
                </button>
                
                <button 
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className={`flex-1 py-5 px-8 rounded-2xl font-black transition-all flex items-center justify-center border-2 ${
                    isFavorited 
                      ? 'bg-red-50 border-red-100 text-red-500 hover:bg-red-100' 
                      : 'bg-white border-gray-100 text-gray-400 hover:border-primary-100 hover:text-primary-500 hover:bg-primary-50'
                  } disabled:opacity-50 group shadow-soft active:scale-[0.98]`}
                >
                  <Heart className={`w-6 h-6 mr-3 ${isFavorited ? 'fill-current' : 'group-hover:scale-110 transition-transform'}`} />
                  <span>{isFavorited ? t('products.detail.actions.favorited') : t('products.detail.actions.favorite')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 相关商品推荐 */}
        {relatedProducts.length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">{t('products.detail.sections.related')}</h2>
                <div className="h-1.5 w-16 bg-primary-500 rounded-full"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map((relatedProduct: any) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="group bg-white rounded-[2rem] shadow-soft overflow-hidden hover:shadow-premium transition-all duration-500 hover:-translate-y-2 flex flex-col border border-transparent hover:border-primary-50"
                >
                  <div className="aspect-square bg-gray-50 overflow-hidden relative">
                    {relatedProduct.attributes.images?.data?.[0] ? (
                      <img
                        src={getImageUrl(relatedProduct.attributes.images.data[0].attributes.url)}
                        alt={relatedProduct.attributes.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ShoppingCart className="w-10 h-10 opacity-10" />
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                      {relatedProduct.attributes.name}
                    </h3>
                    <p className="text-primary-600 font-black text-xl">
                      ¥{relatedProduct.attributes.price.toFixed(2)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
