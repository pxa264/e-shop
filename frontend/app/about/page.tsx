'use client'

export const dynamic = 'force-dynamic';

import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'

import { 
  Users, 
  Target, 
  Heart, 
  Rocket, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight,
  Phone,
  Mail,
  Clock,
  MapPin,
  ArrowRight
} from 'lucide-react'

export default function AboutPage() {
  const t = useTranslations()
  const values = [
    {
      title: t('about.values.integrity.title'),
      desc: t('about.values.integrity.desc'),
      icon: ShieldCheck,
      color: 'text-blue-500',
      bg: 'bg-blue-50'
    },
    {
      title: t('about.values.quality.title'),
      desc: t('about.values.quality.desc'),
      icon: Heart,
      color: 'text-red-500',
      bg: 'bg-red-50'
    },
    {
      title: t('about.values.customerFirst.title'),
      desc: t('about.values.customerFirst.desc'),
      icon: Users,
      color: 'text-green-500',
      bg: 'bg-green-50'
    },
    {
      title: t('about.values.innovation.title'),
      desc: t('about.values.innovation.desc'),
      icon: Rocket,
      color: 'text-purple-500',
      bg: 'bg-purple-50'
    }
  ]

  return (
    <div className="bg-[#fafafa]">
      
      <main>
        {/* Hero Section */}
        <section className="relative py-24 lg:py-32 bg-secondary-900 overflow-hidden text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-primary-400 text-xs font-black uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" />
                <span>{t('about.hero.badge')}</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black mb-8 leading-tight tracking-tight animate-slide-up">
                {t('about.hero.titleLine1')}<br />{t('about.hero.titleLine2')}
              </h1>
              <p className="text-secondary-300 text-xl font-medium leading-relaxed opacity-90 mb-10">
                {t('about.hero.subtitle')}
              </p>
            </div>
          </div>
          {/* 背景装饰 */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-3xl translate-y-1/2"></div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* 左侧：公司简介 */}
            <div className="lg:col-span-2 space-y-10">
              <div className="bg-white rounded-[2.5rem] shadow-premium p-10 lg:p-16 border border-gray-50">
                <div className="flex items-center space-x-3 mb-8">
                  <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
                    <Target className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 tracking-tight">{t('about.vision.title')}</h2>
                </div>
                <div className="prose prose-slate lg:prose-lg max-w-none text-gray-500 font-medium leading-relaxed space-y-6">
                  <p>
                    {t('about.vision.p1')}
                  </p>
                  <p>
                    {t('about.vision.p2')}
                  </p>
                </div>
              </div>

              {/* 核心价值观 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((v, i) => (
                  <div key={i} className="bg-white rounded-3xl p-8 border border-gray-50 shadow-soft hover:shadow-premium transition-all duration-300 group">
                    <div className={`w-14 h-14 ${v.bg} ${v.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500`}>
                      <v.icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900 mb-3">{v.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed text-sm">
                      {v.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 右侧：联系我们 */}
            <div className="space-y-8">
              <div className="bg-white rounded-[2.5rem] p-10 shadow-premium border border-gray-50">
                <h3 className="text-2xl font-black text-gray-900 mb-8 flex items-center tracking-tight">
                  <div className="w-1.5 h-6 bg-primary-500 rounded-full mr-3"></div>
                  {t('about.contact.title')}
                </h3>
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('about.contact.phoneLabel')}</p>
                      <a
                        href="tel:400-123-4567"
                        className="text-gray-900 font-bold text-lg hover:underline"
                      >
                        400-123-4567
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('about.contact.emailLabel')}</p>
                      <a
                        href="mailto:support@eshop.com"
                        className="text-gray-900 font-bold hover:underline"
                      >
                        support@eshop.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('about.contact.hoursLabel')}</p>
                      <p className="text-gray-900 font-bold">{t('about.contact.hoursValue')}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gray-50 rounded-xl text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{t('about.contact.addressLabel')}</p>
                      <p className="text-gray-900 font-bold leading-relaxed">{t('about.contact.addressLine1')}<br />{t('about.contact.addressLine2')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-gray-50">
                  <Link href="/" className="flex items-center justify-center w-full bg-primary-600 text-white py-4 rounded-2xl font-black text-lg hover:bg-primary-700 transition-all shadow-soft active:scale-[0.98]">
                    {t('about.contact.backToStore')}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </div>
              </div>

              {/* 加入我们卡片 */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-[2.5rem] p-10 text-white shadow-premium relative overflow-hidden group">
                <div className="relative z-10">
                  <h3 className="text-2xl font-black mb-4">{t('about.join.title')}</h3>
                  <p className="text-primary-100 font-medium mb-8 leading-relaxed opacity-90">
                    {t('about.join.subtitle')}
                  </p>
                  <button className="flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-xl font-black text-sm hover:bg-primary-50 transition-colors">
                    <span>{t('about.join.cta')}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

