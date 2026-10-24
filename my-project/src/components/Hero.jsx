import { Search, Sparkles, Truck, Users, BookCheck, ArrowRight } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export const Hero = ({ searchQuery, setSearchQuery, onExploreBooks, onSelectCategory }) => {
  const { t } = useLanguage()

  const categories = [
    { key: 'catFiction', label: t('catFiction'), color: 'from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30' },
    { key: 'catBusiness', label: t('catBusiness'), color: 'from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30' },
    { key: 'catPsychology', label: t('catPsychology'), color: 'from-purple-500/20 to-pink-500/20 text-purple-300 border-purple-500/30' },
    { key: 'catIT', label: t('catIT'), color: 'from-blue-500/20 to-indigo-500/20 text-blue-300 border-blue-500/30' },
    { key: 'catSelfDev', label: t('catSelfDev'), color: 'from-rose-500/20 to-amber-500/20 text-rose-300 border-rose-500/30' },
  ]

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    onExploreBooks()
  }

  return (
    <section className="relative overflow-hidden pt-10 pb-16 md:pt-20 md:pb-32">
      {/* Background glowing orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/25 via-purple-600/20 to-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
      <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-[90px] pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-semibold tracking-wide">
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" />
              <span>{t('heroBadge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-heading leading-[1.15]">
              {t('heroTitlePrefix')}{' '}
              <span className="bg-gradient-to-r from-amber-400 via-indigo-300 to-indigo-500 bg-clip-text text-transparent">
                {t('heroTitleHighlight')}
              </span>
            </h1>

            {/* Subtitle Description */}
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              {t('heroDesc')}
            </p>

            {/* Interactive Search Bar */}
            <form 
              onSubmit={handleSearchSubmit}
              className="relative max-w-xl mx-auto lg:mx-0 pt-2"
            >
              <div className="relative flex items-center">
                <Search className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-12 pr-32 sm:pr-40 py-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-xl backdrop-blur-xl transition-all"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-2 bottom-2 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 shadow-md shadow-indigo-600/30 flex items-center gap-2"
                >
                  <span>{t('exploreBooks')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Popular Genre Quick Filters */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="text-xs text-slate-400 font-mono mr-1">Ommabop:</span>
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  onClick={() => onSelectCategory(cat.label)}
                  className={`text-xs px-3 py-1.5 rounded-full border bg-gradient-to-r ${cat.color} hover:scale-105 transition-transform duration-200`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Stats Row */}
            <div className="pt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 border-t border-slate-800/80">
              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-amber-400 font-extrabold text-xl sm:text-2xl font-heading">
                  <Users className="w-4 h-4 text-indigo-400" />
                  25k+
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400">{t('heroStatHappyReaders')}</div>
              </div>

              <div className="flex flex-col items-center lg:items-start border-x border-slate-800 px-3">
                <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xl sm:text-2xl font-heading">
                  <BookCheck className="w-4 h-4 text-emerald-400" />
                  100%
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400">Asl nusxalar</div>
              </div>

              <div className="flex flex-col items-center lg:items-start">
                <div className="flex items-center gap-1.5 text-indigo-400 font-extrabold text-xl sm:text-2xl font-heading">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  2 soat
                </div>
                <div className="text-[11px] sm:text-xs text-slate-400">{t('heroStatFastDelivery')}</div>
              </div>
            </div>

          </div>

          {/* Right Visual — only visible on lg+ screens */}
          <div className="lg:col-span-5 relative items-center justify-center hidden lg:flex">
            
            {/* Ambient Back Glow */}
            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/30 to-amber-500/20 rounded-3xl blur-3xl" />

            <div className="relative w-full max-w-sm">
              {/* Primary Featured Card */}
              <div className="glass-card rounded-3xl p-5 border border-slate-700/60 shadow-2xl relative z-20 transform hover:-translate-y-2 transition-all duration-300">
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden mb-4 shadow-lg group">
                  <img
                    src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"
                    alt="O'tkan kunlar"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500/90 backdrop-blur-md rounded-full text-slate-950 font-bold text-xs shadow-md">
                    👑 Bestseller
                  </div>
                  <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-slate-950/90 to-transparent">
                    <span className="text-xs font-mono text-amber-300">Abdulla Qodiriy</span>
                    <h3 className="text-lg font-bold text-white font-heading">O'tkan kunlar</h3>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-slate-400 line-through">60,000 so'm</span>
                    <div className="text-xl font-bold text-amber-400 font-heading">48,000 so'm</div>
                  </div>
                  <button
                    onClick={onExploreBooks}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
                  >
                    Barcha kitoblar
                  </button>
                </div>
              </div>

              {/* Floating review card */}
              <div className="absolute -bottom-6 -left-6 z-30 p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700/80 shadow-xl backdrop-blur-md max-w-[210px] hidden sm:block">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center">
                    NA
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Nodirbek A.</div>
                    <div className="text-[10px] text-amber-400">★★★★★</div>
                  </div>
                </div>
                <p className="text-[11px] text-slate-300 leading-tight">
                  "Har bir o'zbek o'qishi shart bo'lgan durdona asar!"
                </p>
              </div>

              {/* Floating Speed Delivery card */}
              <div className="absolute -top-5 -right-5 z-30 p-3 rounded-2xl bg-indigo-950/90 border border-indigo-500/40 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/30 flex items-center justify-center text-amber-400">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">Tezkor kuryer</div>
                  <div className="text-[10px] text-indigo-300">Toshkent: 2 soat</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  )
}
