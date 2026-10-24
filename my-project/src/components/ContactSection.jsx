import { useState, useEffect } from 'react'
import { Send, Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { sendContactNotification } from '../services/telegramService'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { getSiteSettings, saveInquiry } from '../services/siteSettings'

export const ContactSection = () => {
  const { t } = useLanguage()

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('+998 ')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  // Dynamic Site Settings
  const [settings, setSettings] = useState(getSiteSettings())

  useEffect(() => {
    const handleSettingsChange = (e) => {
      setSettings(e.detail || getSiteSettings())
    }
    window.addEventListener('site-settings-changed', handleSettingsChange)
    return () => window.removeEventListener('site-settings-changed', handleSettingsChange)
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !phone.trim() || !message.trim()) return

    setIsSending(true)

    const inquiryPayload = {
      id: Date.now(),
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || null,
      message: message.trim(),
      date: new Date().toISOString(),
      status: 'new',
    }

    try {
      // 1. Dispatch Telegram Notification to Admin
      await sendContactNotification(inquiryPayload)

      // 2. Save locally for Admin dashboard
      saveInquiry(inquiryPayload)

      // 3. Save in Supabase if configured
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('contacts').insert([
          {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim() || null,
            message: message.trim(),
          },
        ])
      }

      setSubmitted(true)
      setName('')
      setPhone('+998 ')
      setEmail('')
      setMessage('')
    } catch (err) {
      console.warn('Contact submission error:', err)
    } finally {
      setIsSending(false)
    }
  }

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('contactBadge')}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
            {t('contactTitle')}
          </h2>
          <p className="text-slate-400 text-xs sm:text-sm">
            {t('contactDesc')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left Column: Contact Cards */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono">Qo'ng'iroq uchun:</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  <a href={`tel:${settings.phone1}`} className="hover:text-indigo-400 transition-colors">
                    {settings.phone1}
                  </a>
                </div>
                {settings.phone2 && (
                  <div className="text-xs text-indigo-400 mt-0.5">
                    <a href={`tel:${settings.phone2}`} className="hover:underline">
                      {settings.phone2}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono">Rasmiy email va Telegram:</div>
                <div className="text-sm font-bold text-white mt-0.5">
                  <a href={`mailto:${settings.email}`} className="hover:text-amber-400 transition-colors">
                    {settings.email}
                  </a>
                </div>
                {settings.telegramUsername && (
                  <div className="text-xs text-amber-400 mt-0.5">
                    <a
                      href={`https://t.me/${settings.telegramUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:underline"
                    >
                      Telegram: {settings.telegramUsername}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono">Do'kon manzili:</div>
                <div className="text-sm font-bold text-white mt-0.5">{settings.address}</div>
                {settings.addressLandmark && (
                  <div className="text-xs text-slate-400 mt-0.5">{settings.addressLandmark}</div>
                )}
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-start gap-4 hover:border-slate-700 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono">Ish vaqti:</div>
                <div className="text-sm font-bold text-white mt-0.5">{settings.workingHours}</div>
                {settings.onlineHours && (
                  <div className="text-xs text-emerald-400 mt-0.5">{settings.onlineHours}</div>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Form */}
          <div className="lg:col-span-7">
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl relative">
              
              {submitted && (
                <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span>{t('contactSuccess')}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('contactName')} *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ismingizni kiriting"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('contactPhone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+998 90 123 45 67"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Email manzilingiz (ixtiyoriy)
                  </label>
                  <input
                    type="email"
                    placeholder="misol@pochta.uz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t('contactMessage')} *
                  </label>
                  <textarea
                    required
                    rows="4"
                    placeholder="Qanday kitob kerak yoki qanday savolingiz bor?.."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Telegram orqali zudlik bilan adminga boradi</span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSending ? t('sending') : t('sendMessage')}</span>
                  </button>
                </div>

              </form>

            </div>
          </div>

        </div>

      </div>
    </section>
  )
}
export default ContactSection
