'use client'

import { useState, useEffect } from 'react'
import { Search, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react'
import { getProducts, fetchCategories, getImageUrl } from '@/lib/api'
import Header from '@/components/Header'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { Link } from '@/navigation'

export default function ProductsPage() {
  const t = useTranslations()
  const locale = useLocale()

  const [products, setProducts] = useState<any>({ data: [] })
  const [categories, setCategories] = useState<any>({ data: [] })
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [sortBy, setSortBy] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const itemsPerPage = 12

  useEffect(() => {
    loadData()
  }, [selectedCategory, searchQuery, sortBy, currentPage])

  const loadData = async () => {
    setLoading(true)
    try {
      const [productsData, categoriesData] = await Promise.all([
        getProducts({ category: selectedCategory || undefined, locale }),
        fetchCategories({ locale })
      ])
      
      let filteredProducts = productsData.data || []
      
      // 搜索过滤
      if (searchQuery) {
        filteredProducts = filteredProducts.filter((product: any) =>
          product.attributes.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.attributes.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      }
      
      // 排序
      if (sortBy === 'price-asc') {
        filteredProducts.sort((a: any, b: any) => a.attributes.price - b.attributes.price)
      } else if (sortBy === 'price-desc') {
        filteredProducts.sort((a: any, b: any) => b.attributes.price - a.attributes.price)
      } else if (sortBy === 'name') {
        filteredProducts.sort((a: any, b: any) => a.attributes.name.localeCompare(b.attributes.name))
      }
      
      // 计算总页数
      const total = Math.ceil(filteredProducts.length / itemsPerPage)
      setTotalPages(total)
      
      // 分页处理
      const startIndex = (currentPage - 1) * itemsPerPage
      const endIndex = startIndex + itemsPerPage
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex)
      
      setProducts({ ...productsData, data: paginatedProducts })
      setCategories(categoriesData)
    } catch (error) {
      console.error('Failed to load data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{t('products.title')}</h1>
            <p className="text-gray-500">{t('products.subtitle')}</p>
          </div>
          
          {/* 搜索和排序栏 */}
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="relative group min-w-[300px]">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors w-5 h-5" />
              <input
                type="text"
                placeholder={t('products.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all shadow-soft outline-none font-medium"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-6 py-3 bg-white border border-gray-100 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all shadow-soft outline-none font-bold text-gray-700 cursor-pointer appearance-none"
            >
              <option value="">{t('products.sort.default')}</option>
              <option value="price-asc">{t('products.sort.priceAsc')}</option>
              <option value="price-desc">{t('products.sort.priceDesc')}</option>
              <option value="name">{t('products.sort.name')}</option>
            </select>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-10">
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl shadow-soft p-8 sticky top-28 border border-gray-50">
              <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-3"></div>
                {t('products.categories')}
              </h2>
              <ul className="space-y-2">
                <li>
                  <button 
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold ${
                      selectedCategory === '' 
                        ? 'bg-primary-600 text-white shadow-soft translate-x-1' 
                        : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'
                    }`}
                  >
                    {t('products.allProducts')}
                  </button>
                </li>
                {categories.data?.map((category: any) => (
                  <li key={category.id}>
                    <button 
                      onClick={() => setSelectedCategory(String(category.id))}
                      className={`w-full text-left px-4 py-3 rounded-xl transition-all font-bold ${
                        selectedCategory === String(category.id)
                          ? 'bg-primary-600 text-white shadow-soft translate-x-1' 
                          : 'text-gray-500 hover:bg-primary-50 hover:text-primary-600'
                      }`}
                    >
                      {category.attributes.name}
                    </button>
                  </li>
                ))}
              </ul>
              
              <div className="mt-10 p-6 bg-secondary-900 rounded-2xl text-white relative overflow-hidden group">
                <div className="relative z-10">
                  <p className="text-primary-400 font-bold text-sm mb-2">{t('products.promo.badge')}</p>
                  <h3 className="text-lg font-bold mb-4">
                    {t('products.promo.titleLine1')}
                    <br />
                    {t('products.promo.titleLine2')}
                  </h3>
                  <button className="text-xs font-black bg-white text-secondary-900 px-4 py-2 rounded-full hover:bg-primary-500 hover:text-white transition-colors">
                    {t('products.promo.cta')}
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-primary-600 rounded-full blur-2xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            </div>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-3xl p-4 shadow-soft animate-pulse">
                    <div className="h-64 bg-gray-100 rounded-2xl mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-full mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-100 rounded w-1/4"></div>
                      <div className="h-10 bg-gray-100 rounded-xl w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : products.data && products.data.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.data.map((product: any) => (
                  <div 
                    key={product.id}
                    className="group bg-white rounded-3xl shadow-soft overflow-hidden hover:shadow-premium transition-all duration-500 hover:-translate-y-2 border border-transparent hover:border-primary-100 flex flex-col"
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
                          <ShoppingCart className="w-12 h-12 opacity-10" />
                        </div>
                      )}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-600">
                        {t('products.new')}
                      </div>
                    </Link>
                    <div className="p-6 flex-1 flex flex-col">
                      <Link href={`/products/${product.id}`} className="block">
                        <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-1">
                          {product.attributes.name}
                        </h3>
                      </Link>
                      <p className="text-gray-500 text-sm mb-6 line-clamp-2 flex-1 leading-relaxed">
                        {product.attributes.description}
                      </p>
                      <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-50">
                        <span className="text-primary-600 font-black text-2xl">¥{product.attributes.price.toFixed(2)}</span>
                        <button 
                          onClick={(e) => {
                            e.preventDefault()
                            // ... 这里保留原来的加入购物车逻辑 ...
                            try {
                              const cart = JSON.parse(localStorage.getItem('cart') || '[]')
                              const existingItem = cart.find((item: any) => item.id === product.id)
                              let imageUrl = product.attributes.images?.data?.[0]?.attributes?.url || null
                              if (existingItem) { existingItem.quantity += 1 } 
                              else { cart.push({ id: product.id, name: product.attributes.name, price: product.attributes.price, quantity: 1, image: imageUrl }) }
                              localStorage.setItem('cart', JSON.stringify(cart))
                              window.dispatchEvent(new Event('cartUpdated'))
                              toast.success(t('cart.added', { name: product.attributes.name }))
                            } catch (error) { toast.error(t('common.tryAgain')) }
                          }}
                          className="bg-primary-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-primary-700 transition-all active:scale-95 shadow-soft text-sm"
                        >
                          {t('cart.addToCart')}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-32 bg-white rounded-3xl border-2 border-dashed border-gray-100">
                <div className="text-gray-200 mb-6 flex justify-center">
                  <Search className="w-20 h-20" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('products.empty.title')}</h3>
                <p className="text-gray-500">{t('products.empty.subtitle')}</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('')}}
                  className="mt-8 text-primary-600 font-bold hover:underline"
                >
                  {t('products.empty.clear')}
                </button>
              </div>
            )}

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="mt-16 flex justify-center items-center space-x-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-soft hover:bg-primary-50 hover:text-primary-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <ChevronLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
                </button>
                
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-12 h-12 rounded-xl font-bold transition-all ${
                        currentPage === page
                          ? 'bg-primary-600 text-white shadow-soft'
                          : 'bg-white border border-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600 shadow-soft'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="w-12 h-12 flex items-center justify-center bg-white border border-gray-100 rounded-xl shadow-soft hover:bg-primary-50 hover:text-primary-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed group"
                >
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
