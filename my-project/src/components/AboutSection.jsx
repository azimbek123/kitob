import { Award, Truck, Bot, Heart, Sparkles, CheckCircle2 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

export const AboutSection = () => {
  const { t } = useLanguage()

  const stats = [
    { value: "25,000+", label: "Mamnun kitobxonlar" },
    { value: "1,200+", label: "Saralangan kitoblar" },
    { value: "99.4%", label: "Ijobiy sharhlar" },
    { value: "24/7", label: "Telegram orqali qo'llab-quvvatlash" },
  ]

  const pillars = [
    {
      icon: Award,
      title: t('feature1Title'),
      desc: t('feature1Desc'),
      color: "from-amber-500/20 to-orange-500/10 text-amber-400 border-amber-500/30",
    },
    {
      icon: Truck,
      title: t('feature2Title'),
      desc: t('feature2Desc'),
      color: "from-indigo-500/20 to-blue-500/10 text-indigo-400 border-indigo-500/30",
    },
    {
      icon: Bot,
      title: t('feature3Title'),
      desc: t('feature3Desc'),
      color: "from-emerald-500/20 to-teal-500/10 text-emerald-400 border-emerald-500/30",
    },
  ]

  return (
    <section className="py-20 relative overflow-hidden bg-slate-950/40">
      
      {/* Decorative Glow */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('aboutBadge')}</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-heading tracking-tight">
            {t('aboutTitle')}
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            {t('aboutP1')}
          </p>
        </div>

        {/* 3 Value Pillars */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar, idx) => {
            const Icon = pillar.icon
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between"
              >
                <div>
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${pillar.color} border flex items-center justify-center mb-5 shadow-inner`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-white font-heading mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-2 text-xs text-slate-500 font-mono">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Kafolatlangan xizmat</span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Stats Strip */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s, idx) => (
              <div key={idx} className="space-y-1">
                <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 font-heading">
                  {s.value}
                </div>
                <div className="text-xs text-slate-400 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  )
}
