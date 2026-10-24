import { useState, useEffect } from 'react'
import { BookOpen, ShoppingBag, ShieldCheck, Globe, Menu, X, LogIn, Sun, Moon } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export const Navbar = ({ currentView, setCurrentView, openAdminModal }) => {
  const { lang, setLang, t } = useLanguage()
  const { totalItems, setIsCartOpen } = useCart()
  const { isAdmin } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('kitobhon_theme')
    return saved ? saved === 'dark' : true // dark by default
  })

  useEffect(() => {
    const root = document.documentElement
    if (isDark) {
      root.classList.remove('light')
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
      root.classList.add('light')
    }
    localStorage.setItem('kitobhon_theme', isDark ? 'dark' : 'light')
  }, [isDark])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('[data-lang-dropdown]')) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const languages = [
    { code: 'uz', label: "O'zbekcha", flag: "🇺🇿" },
    { code: 'ru', label: 'Русский',   flag: '🇷🇺' },
    { code: 'en', label: 'English',   flag: '🇬🇧' },
  ]

  const navItems = [
    { key: 'home',    label: t('home')    },
    { key: 'books',   label: t('books')   },
    { key: 'about',   label: t('about')   },
    { key: 'contact', label: t('contact') },
  ]

  const handleNavClick = (view) => {
    setCurrentView(view)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#0b0f19]/85 border-b border-slate-800/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-2.5 cursor-pointer group flex-shrink-0"
          >
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-all duration-300">
              <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-indigo-400 group-hover:scale-110 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <span className="text-lg md:text-2xl font-extrabold tracking-tight font-heading bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                Kitobhon<span className="text-amber-400">.uz</span>
              </span>
              <span className="hidden sm:block text-[10px] tracking-widest text-slate-400 uppercase font-mono">
                Premium Bookstore
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-full border border-slate-800/60 backdrop-blur-md">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  currentView === item.key
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-1.5 md:gap-3">

            {/* Dark / Light Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 md:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 text-slate-300 hover:text-white transition-all"
              title={isDark ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
            >
              {isDark
                ? <Sun className="w-4 h-4 text-amber-400" />
                : <Moon className="w-4 h-4 text-indigo-400" />
              }
            </button>

            {/* Language Switcher */}
            <div className="relative" data-lang-dropdown>
              <button
                onClick={(e) => { e.stopPropagation(); setLangDropdownOpen(!langDropdownOpen) }}
                className="flex items-center gap-1.5 px-2.5 md:px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/80 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors"
                title="Tilni tanlash"
                data-lang-dropdown
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="uppercase hidden xs:inline">{lang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-40 py-1.5 rounded-xl bg-slate-900/95 border border-slate-800 shadow-xl shadow-black/50 backdrop-blur-xl z-50" data-lang-dropdown>
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => { setLang(l.code); setLangDropdownOpen(false) }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-left transition-colors ${
                        lang === l.code
                          ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 md:p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 text-slate-200 hover:text-indigo-400 transition-all"
              title={t('cart')}
            >
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-[10px] flex items-center justify-center shadow-lg shadow-amber-500/30">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Admin Button — hidden on very small screens */}
            <button
              onClick={openAdminModal}
              className={`hidden sm:flex items-center gap-2 px-3 md:px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                isAdmin
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                  : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
              title={isAdmin ? 'Admin Dashboard' : 'Admin Login'}
            >
              {isAdmin
                ? <><ShieldCheck className="w-4 h-4 text-emerald-400" /><span>Admin</span></>
                : <><LogIn className="w-4 h-4" /><span>Admin</span></>
              }
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 transition-colors"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0b0f19]/98 backdrop-blur-xl">
          <div className="px-4 py-4 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.key}
                onClick={() => handleNavClick(item.key)}
                className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all ${
                  currentView === item.key
                    ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
            {/* Admin in mobile menu */}
            <button
              onClick={() => { openAdminModal(); setMobileMenuOpen(false) }}
              className={`w-full text-left px-4 py-3.5 rounded-xl text-sm font-medium transition-all mt-2 ${
                isAdmin
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/60 text-slate-300'
              }`}
            >
              {isAdmin ? '🛡️ Admin Dashboard' : '🔑 Admin Login'}
            </button>
          </div>
        </div>
      )}
    </header>
  )
}
