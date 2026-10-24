import { useState, useEffect } from 'react'
import { BookOpen, Send, Phone, MapPin, Heart, ShieldCheck, Truck, Headphones } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { getSiteSettings } from '../services/siteSettings'

export const Footer = ({ onNavigate }) => {
  const { t } = useLanguage()
  const [settings, setSettings] = useState(getSiteSettings())

  useEffect(() => {
    const handleSettingsChange = (e) => {
      setSettings(e.detail || getSiteSettings())
    }
    window.addEventListener('site-settings-changed', handleSettingsChange)
    return () => window.removeEventListener('site-settings-changed', handleSettingsChange)
  }, [])

  const handleNav = (view) => {
    if (onNavigate) {
      onNavigate(view)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const cleanTelegram = settings.telegramUsername ? settings.telegramUsername.replace('@', '') : 'kitobhon_admin'

  return (
    <footer className="relative bg-slate-950 border-t border-slate-800/80 pt-16 pb-12 overflow-hidden">
      {/* Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-indigo-500/10 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Features Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-12 mb-12 border-b border-slate-800/80">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('feature1Title')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Sifatli va asl nusxa kafolati</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{t('feature2Title')}</h4>
              <p className="text-xs text-slate-400 mt-0.5">Toshkent: 2 soat, Viloyatlarga tez yetkazish</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">24/7 Qo'llab-quvvatlash</h4>
              <p className="text-xs text-slate-400 mt-0.5">Telegram orqali tezkor aloqa</p>
            </div>
          </div>
        </div>

        {/* Main Footer Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => handleNav('home')}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight font-heading text-white">
                  Kitobhon<span className="text-amber-400">.uz</span>
                </span>
                <span className="text-[10px] text-slate-400 -mt-1 tracking-wider uppercase">Onlayn kitoblar</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              {t('footerDesc')}
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href={settings.telegramChannel || `https://t.me/${cleanTelegram}`}
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Telegram"
              >
                <Send className="w-4 h-4" />
              </a>
              <a
                href={`tel:${settings.phone1}`}
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Qo'ng'iroq"
              >
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              {t('quickLinks')}
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button onClick={() => handleNav('home')} className="hover:text-indigo-400 transition-colors">
                  {t('home')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('books')} className="hover:text-indigo-400 transition-colors">
                  {t('books')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('about')} className="hover:text-indigo-400 transition-colors">
                  {t('about')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('contact')} className="hover:text-indigo-400 transition-colors">
                  {t('contact')}
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              {t('categories')}
            </h5>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <button onClick={() => handleNav('books')} className="hover:text-amber-400 transition-colors">
                  {t('catFiction')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('books')} className="hover:text-emerald-400 transition-colors">
                  {t('catBusiness')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('books')} className="hover:text-purple-400 transition-colors">
                  {t('catPsychology')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('books')} className="hover:text-blue-400 transition-colors">
                  {t('catIT')}
                </button>
              </li>
              <li>
                <button onClick={() => handleNav('books')} className="hover:text-rose-400 transition-colors">
                  {t('catSelfDev')}
                </button>
              </li>
            </ul>
          </div>

          {/* Contacts info */}
          <div className="space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-white font-heading">
              {t('contact')}
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${settings.phone1}`} className="hover:underline">
                  {settings.phone1}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Send className="w-4 h-4 text-blue-400 shrink-0" />
                <a
                  href={`https://t.me/${cleanTelegram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {settings.telegramUsername}
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} Kitobhon.uz. {t('allRightsReserved')}.
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <span>{t('developedWithLove')}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>

      </div>
    </footer>
  )
}
export default Footer
