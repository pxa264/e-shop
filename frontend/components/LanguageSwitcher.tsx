'use client'

import { useLocale } from 'next-intl'
import { usePathname, useRouter } from '@/navigation'

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const nextLocale = locale === 'zh' ? 'en' : 'zh'
  const label = locale === 'zh' ? '中文' : 'EN'

  return (
    <button
      type="button"
      onClick={() => router.push(pathname, { locale: nextLocale })}
      className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-100 text-gray-700 hover:bg-primary-50 hover:text-primary-700 hover:border-primary-200 transition-all text-xs font-black"
      aria-label="Switch language"
    >
      {label}
    </button>
  )
}
