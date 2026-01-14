import { ShoppingCart, Package, ChevronRight, Mail, Phone, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from '@/navigation'
import { useTranslations } from 'next-intl'

export default function Footer() {
  const t = useTranslations()

  return (
    <footer className="bg-secondary-900 text-white pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand and Description */}
          <div className="space-y-6">
            <Link href="/" className="group flex items-center space-x-2 w-fit">
              <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-soft">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tight">
                E-Shop
              </span>
            </Link>
            <p className="text-secondary-400 leading-relaxed font-medium">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center hover:bg-primary-600 transition-all group shadow-soft">
                <Facebook className="w-5 h-5 text-secondary-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center hover:bg-primary-600 transition-all group shadow-soft">
                <Twitter className="w-5 h-5 text-secondary-400 group-hover:text-white transition-colors" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-secondary-800 flex items-center justify-center hover:bg-primary-600 transition-all group shadow-soft">
                <Instagram className="w-5 h-5 text-secondary-400 group-hover:text-white transition-colors" />
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-black mb-8 relative inline-block">
              {t('footer.quickLinks')}
              <div className="absolute -bottom-2 left-0 h-1 w-8 bg-primary-500 rounded-full"></div>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/products" className="text-secondary-400 hover:text-white transition-all flex items-center group font-bold">
                  <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-primary-500" /> 
                  {t('footer.links.products')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-secondary-400 hover:text-white transition-all flex items-center group font-bold">
                  <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-primary-500" /> 
                  {t('footer.links.about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-secondary-400 hover:text-white transition-all flex items-center group font-bold">
                  <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-primary-500" /> 
                  {t('footer.links.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-xl font-black mb-8 relative inline-block">
              {t('footer.support')}
              <div className="absolute -bottom-2 left-0 h-1 w-8 bg-primary-500 rounded-full"></div>
            </h3>
            <ul className="space-y-4">
              <li>
                <Link href="/faq" className="text-secondary-400 hover:text-white transition-all flex items-center group font-bold">
                  <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-primary-500" /> 
                  {t('footer.supportLinks.faq')}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-secondary-400 hover:text-white transition-all flex items-center group font-bold">
                  <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-primary-500" /> 
                  {t('footer.supportLinks.shipping')}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-secondary-400 hover:text-white transition-all flex items-center group font-bold">
                  <ChevronRight className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform text-primary-500" /> 
                  {t('footer.supportLinks.returns')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-black mb-8 relative inline-block">
              {t('footer.contact')}
              <div className="absolute -bottom-2 left-0 h-1 w-8 bg-primary-500 rounded-full"></div>
            </h3>
            <div className="space-y-6 text-secondary-400">
              <div className="flex items-start">
                <div className="p-3 bg-secondary-800 rounded-xl mr-4 text-primary-500 shadow-soft">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-secondary-500 uppercase tracking-widest mb-1">{t('footer.contactLabels.email')}</p>
                  <a
                    href="mailto:support@eshop.com"
                    className="text-white font-bold hover:underline"
                  >
                    support@eshop.com
                  </a>
                </div>
              </div>
              <div className="flex items-start">
                <div className="p-3 bg-secondary-800 rounded-xl mr-4 text-primary-500 shadow-soft">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-secondary-500 uppercase tracking-widest mb-1">{t('footer.contactLabels.phone')}</p>
                  <a
                    href="tel:400-123-4567"
                    className="text-white font-bold hover:underline"
                  >
                    400-123-4567
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-secondary-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-secondary-500 text-sm font-bold">
          <p>{t('footer.bottom.copyright')}</p>
          <div className="flex space-x-8">
            <Link href="/privacy" className="hover:text-white transition-colors">{t('footer.bottom.privacy')}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t('footer.bottom.terms')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
