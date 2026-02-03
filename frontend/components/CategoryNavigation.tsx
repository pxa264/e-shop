'use client'

import { useState, useEffect } from 'react'
import { Link } from '@/navigation'
import { fetchCategories } from '@/lib/api'
import { useLocale, useTranslations } from 'next-intl'
import { ChevronRight, Package } from 'lucide-react'

export default function CategoryNavigation() {
  const locale = useLocale()
  const t = useTranslations()
  const [categories, setCategories] = useState<any>({ data: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCategories()
  }, [locale])

  const loadCategories = async () => {
    try {
      const data = await fetchCategories({ locale })
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded-xl mb-8"></div>
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-64 h-32 bg-gray-200 rounded-2xl flex-shrink-0"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (!categories.data || categories.data.length === 0) {
    return null
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">
            {t('home.browseCategories')}
          </h2>
          <div className="h-1.5 w-20 bg-primary-500 rounded-full"></div>
        </div>
      </div>

      {/* Desktop: Grid layout */}
      <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.data.map((category: any) => {
          const productCount = category.attributes.products?.data?.length || 0

          return (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group bg-white rounded-2xl shadow-soft p-6 hover:shadow-premium transition-all duration-500 hover:-translate-y-2 border border-gray-50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-500">
                  📦
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
              </div>
              <h3 className="font-black text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {category.attributes.name}
              </h3>
              <p className="text-sm text-gray-500 font-bold">
                {productCount} {t('home.products')}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Mobile: Horizontal scroll */}
      <div className="md:hidden flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
        {categories.data.map((category: any) => {
          const productCount = category.attributes.products?.data?.length || 0

          return (
            <Link
              key={category.id}
              href={`/products?category=${category.id}`}
              className="group bg-white rounded-2xl shadow-soft p-6 hover:shadow-premium transition-all duration-500 border border-gray-50 flex-shrink-0 w-64 snap-start"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-2xl">
                  📦
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600 transition-colors" />
              </div>
              <h3 className="font-black text-lg text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                {category.attributes.name}
              </h3>
              <p className="text-sm text-gray-500 font-bold">
                {productCount} {t('home.products')}
              </p>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
