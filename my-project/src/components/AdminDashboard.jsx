import { useState, useMemo, useEffect } from 'react'
import {
  Plus,
  Trash2,
  Edit,
  Eye,
  Search,
  BookOpen,
  Boxes,
  TrendingUp,
  Star,
  LogOut,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Database,
  Layers,
  Sparkles,
  X,
  Save,
  RefreshCw,
  SlidersHorizontal,
  Sun,
  Moon,
  Globe,
  Tag,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Bot,
  Check,
  ShieldCheck,
  CheckCircle,
  XCircle,
  ToggleLeft,
  ToggleRight,
  Menu,
} from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { isSupabaseConfigured, supabase, saveSupabaseCredentials, supabaseUrl } from '../lib/supabaseClient'
import {
  sendAdminActivityNotification,
  getTelegramConfig,
  saveTelegramConfig,
  testTelegramConnection,
} from '../services/telegramService'
import {
  getSiteSettings,
  saveSiteSettings,
  getStoredInquiries,
  deleteInquiry,
  toggleInquiryStatus,
} from '../services/siteSettings'
import { initialPromoCodes } from '../data/initialPromoCodes'

export const AdminDashboard = ({ books, onAddBook, onUpdateBook, onDeleteBook, onBackToStore }) => {
  const { lang, setLang, t } = useLanguage()
  const { logoutAdmin } = useAuth()

  // Active Admin Tab: 'books' | 'promos' | 'contacts' | 'inquiries' | 'telegram' | 'supabase'
  const [activeTab, setActiveTab] = useState('books')

  // Mobile sidebar open state
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Theme State (Dark / Light)
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('kitobhon_theme')
    return saved ? saved === 'dark' : true
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

  // Language Dropdown
  const [langDropdownOpen, setLangDropdownOpen] = useState(false)
  const languages = [
    { code: 'uz', label: "O'zbekcha", flag: "🇺🇿" },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ]

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (!e.target.closest('[data-admin-lang]')) {
        setLangDropdownOpen(false)
      }
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  // ==========================================
  // 1. BOOKS MANAGEMENT STATE
  // ==========================================
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [deletingBook, setDeletingBook] = useState(null)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)

  const initialBookFormState = {
    title: '',
    author: '',
    category: 'Badiiy',
    price: '',
    old_price: '',
    cover_url: '',
    description: '',
    pages: 300,
    year: 2024,
    language: "O'zbekcha",
    stock: 20,
    is_featured: false,
    rating: 5.0,
  }

  const [formData, setFormData] = useState(initialBookFormState)
  const categories = ['Badiiy', 'Biznes', 'Psixologiya', 'IT & Dasturlash', 'Shaxsiy rivojlanish', 'Tarix & Falsafa']

  // Statistics calculation
  const stats = useMemo(() => {
    const totalBooks = books.length
    const totalStock = books.reduce((acc, b) => acc + Number(b.stock || 0), 0)
    const totalValue = books.reduce((acc, b) => acc + Number(b.price || 0) * Number(b.stock || 0), 0)
    const avgRating = books.length
      ? (books.reduce((acc, b) => acc + Number(b.rating || 4.8), 0) / books.length).toFixed(1)
      : '5.0'

    return { totalBooks, totalStock, totalValue, avgRating }
  }, [books])

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase())
      const matchesCat = selectedCategory === 'ALL' || b.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [books, search, selectedCategory])

  const handleOpenEdit = (book) => {
    setEditingBook(book)
    setFormData({
      title: book.title || '',
      author: book.author || '',
      category: book.category || 'Badiiy',
      price: book.price || '',
      old_price: book.old_price || '',
      cover_url: book.cover_url || '',
      description: book.description || '',
      pages: book.pages || 300,
      year: book.year || 2024,
      language: book.language || "O'zbekcha",
      stock: book.stock || 20,
      is_featured: Boolean(book.is_featured),
      rating: book.rating || 5.0,
    })
    setIsAddModalOpen(true)
  }

  const handleOpenCreate = () => {
    setEditingBook(null)
    setFormData(initialBookFormState)
    setIsAddModalOpen(true)
  }

  const handleSaveBook = async (e) => {
    e.preventDefault()
    if (!formData.title.trim() || !formData.author.trim() || !formData.price) return

    const bookPayload = {
      ...formData,
      price: Number(formData.price),
      old_price: formData.old_price ? Number(formData.old_price) : null,
      pages: Number(formData.pages) || 300,
      year: Number(formData.year) || 2024,
      stock: Number(formData.stock) || 0,
      cover_url:
        formData.cover_url.trim() ||
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
      description: formData.description.trim() || 'Tavsif berilmagan.',
    }

    if (editingBook) {
      onUpdateBook({ ...bookPayload, id: editingBook.id })
      sendAdminActivityNotification("Kitob tahrirlandi", bookPayload.title, `Narxi: ${bookPayload.price} so'm`)

      if (isSupabaseConfigured() && supabase) {
        await supabase.from('books').update(bookPayload).eq('id', editingBook.id)
      }
    } else {
      const newBook = {
        ...bookPayload,
        id: Date.now(),
        reviews_count: 0,
        reviews: [],
      }
      onAddBook(newBook)
      sendAdminActivityNotification("Yangi kitob qo'shildi", newBook.title, `Muallif: ${newBook.author}, Janr: ${newBook.category}`)

      if (isSupabaseConfigured() && supabase) {
        await supabase.from('books').insert([newBook])
      }
    }

    setIsAddModalOpen(false)
    setEditingBook(null)
  }

  const handleConfirmDelete = async () => {
    if (!deletingBook) return

    onDeleteBook(deletingBook.id)
    sendAdminActivityNotification("Kitob o'chirildi", deletingBook.title)

    if (isSupabaseConfigured() && supabase) {
      await supabase.from('books').delete().eq('id', deletingBook.id)
    }

    setDeletingBook(null)
  }

  // ==========================================
  // 2. PROMOCODES STATE & HANDLERS
  // ==========================================
  const [promos, setPromos] = useState(() => {
    try {
      const stored = localStorage.getItem('kitobhon_promocodes')
      return stored ? JSON.parse(stored) : initialPromoCodes
    } catch {
      return initialPromoCodes
    }
  })

  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false)
  const [editingPromo, setEditingPromo] = useState(null)
  const [promoForm, setPromoForm] = useState({
    code: '',
    discountPercent: 10,
    description: '',
    isActive: true,
  })
  const [promoToast, setPromoToast] = useState('')

  const showPromoToast = (msg) => {
    setPromoToast(msg)
    setTimeout(() => setPromoToast(''), 3000)
  }

  const syncPromos = (newPromos) => {
    setPromos(newPromos)
    localStorage.setItem('kitobhon_promocodes', JSON.stringify(newPromos))
  }

  const handleOpenAddPromo = () => {
    setEditingPromo(null)
    setPromoForm({ code: '', discountPercent: 10, description: '', isActive: true })
    setIsPromoModalOpen(true)
  }

  const handleOpenEditPromo = (p) => {
    setEditingPromo(p)
    setPromoForm({
      code: p.code,
      discountPercent: p.discountPercent || p.discount_percent || 10,
      description: p.description || '',
      isActive: p.isActive !== false && p.is_active !== false,
    })
    setIsPromoModalOpen(true)
  }

  const handleSavePromo = (e) => {
    e.preventDefault()
    const cleanCode = promoForm.code.trim().toUpperCase()
    if (!cleanCode) return

    const percent = Math.min(100, Math.max(1, Number(promoForm.discountPercent) || 10))

    if (editingPromo) {
      const updated = promos.map((p) =>
        p.code === editingPromo.code
          ? {
              ...p,
              code: cleanCode,
              discountPercent: percent,
              description: promoForm.description.trim(),
              isActive: promoForm.isActive,
            }
          : p
      )
      syncPromos(updated)
      showPromoToast(t('promoUpdated'))
    } else {
      if (promos.some((p) => p.code.toUpperCase() === cleanCode)) {
        alert("Bunday nomdagi promokod allaqachon mavjud!")
        return
      }
      const newPromo = {
        code: cleanCode,
        discountPercent: percent,
        description: promoForm.description.trim() || `${percent}% chegirma`,
        isActive: promoForm.isActive,
      }
      syncPromos([newPromo, ...promos])
      showPromoToast(t('promoAdded'))
    }

    setIsPromoModalOpen(false)
    setEditingPromo(null)
  }

  const handleDeletePromo = (code) => {
    if (window.confirm(`Haqiqatan ham "${code}" promokodini o'chirmoqchimisiz?`)) {
      const updated = promos.filter((p) => p.code !== code)
      syncPromos(updated)
      showPromoToast(t('promoDeleted'))
    }
  }

  const handleTogglePromo = (code) => {
    const updated = promos.map((p) => {
      if (p.code === code) {
        const cur = p.isActive !== false && p.is_active !== false
        return { ...p, isActive: !cur }
      }
      return p
    })
    syncPromos(updated)
  }

  // ==========================================
  // 3. CONTACT & SITE SETTINGS STATE
  // ==========================================
  const [siteSettings, setSiteSettings] = useState(getSiteSettings())
  const [siteSettingsSaved, setSiteSettingsSaved] = useState(false)

  const handleSaveSettings = (e) => {
    e.preventDefault()
    saveSiteSettings(siteSettings)
    setSiteSettingsSaved(true)
    setTimeout(() => setSiteSettingsSaved(false), 3000)
  }

  // ==========================================
  // 4. INQUIRIES STATE
  // ==========================================
  const [inquiries, setInquiries] = useState(getStoredInquiries())

  useEffect(() => {
    const handleInquiriesChange = () => {
      setInquiries(getStoredInquiries())
    }
    window.addEventListener('inquiries-changed', handleInquiriesChange)
    return () => window.removeEventListener('inquiries-changed', handleInquiriesChange)
  }, [])

  const handleToggleInquiry = (id) => {
    toggleInquiryStatus(id)
  }

  const handleDeleteInquiryItem = (id) => {
    if (window.confirm("Ushbu murojaatni ro'yxatdan o'chirmoqchimisiz?")) {
      deleteInquiry(id)
    }
  }

  // ==========================================
  // 5. TELEGRAM BOT SETTINGS STATE
  // ==========================================
  const [tgConfig, setTgConfig] = useState(getTelegramConfig())
  const [tgSaved, setTgSaved] = useState(false)
  const [testStatus, setTestStatus] = useState('idle') // 'idle' | 'testing' | 'success' | 'error'
  const [testResultMsg, setTestResultMsg] = useState('')

  const handleSaveTgConfig = (e) => {
    e.preventDefault()
    saveTelegramConfig(tgConfig)
    setTgSaved(true)
    setTimeout(() => setTgSaved(false), 3000)
  }

  const handleTestTg = async () => {
    setTestStatus('testing')
    setTestResultMsg('')
    const res = await testTelegramConnection(tgConfig.botToken, tgConfig.adminChatId)
    if (res.success) {
      setTestStatus('success')
      setTestResultMsg(t('testSuccess'))
    } else {
      setTestStatus('error')
      setTestResultMsg(`${t('testFailed')}: ${res.error || 'Noma\'lum xatolik'}`)
    }
    setTimeout(() => {
      if (res.success) setTestStatus('idle')
    }, 5000)
  }

  // Supabase Config state
  const [cfgUrl, setCfgUrl] = useState(supabaseUrl || '')
  const [cfgKey, setCfgKey] = useState('')

  const handleSaveSupabase = (e) => {
    e.preventDefault()
    saveSupabaseCredentials(cfgUrl, cfgKey)
    setIsConfigModalOpen(false)
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col lg:flex-row">
      
      {/* MOBILE TOP BAR (visible on screens smaller than lg) */}
      <div className="lg:hidden sticky top-0 z-40 h-16 bg-[#0b0f19]/95 border-b border-slate-800 px-4 flex items-center justify-between backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Menyuni ochish"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-bold text-white text-sm font-heading">Kitobhon.uz</span>
            <span className="px-1.5 py-0.2 rounded-md bg-indigo-500/20 text-indigo-400 text-[10px] font-mono font-bold">
              ADMIN
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            title={isDark ? t('lightMode') : t('darkMode')}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
          </button>
          <button
            onClick={logoutAdmin}
            className="p-2 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/30"
            title="Chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* MOBILE SIDEBAR BACKDROP */}
      {mobileSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* LEFT SIDEBAR (The Navigation Items on the Left) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-[#0b0f19] border-r border-slate-800/80 flex flex-col justify-between p-5 transition-transform duration-300
        lg:sticky lg:top-0 lg:h-screen lg:shrink-0 lg:translate-x-0
        ${mobileSidebarOpen ? 'translate-x-0 shadow-2xl shadow-black' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Top: Logo & Brand */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-5 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-amber-400 p-0.5 shadow-md shadow-indigo-600/30">
                <div className="w-full h-full bg-[#0b0f19] rounded-[10px] flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base font-bold font-heading text-white">Kitobhon.uz</h1>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 text-[10px] font-mono font-bold">
                    ADMIN PRO
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 font-mono">
                  kitob@kitobhon.uz
                </div>
              </div>
            </div>

            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* SIDEBAR NAVIGATION ITEMS (CIRCLED IN RED BY USER) */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-mono font-bold text-slate-500 px-3 pb-1 tracking-wider">
              Boshqaruv menyusi
            </div>

            {/* Tab 1: Books Management */}
            <button
              onClick={() => { setActiveTab('books'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'books'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-indigo-400 group-hover:text-white" />
                <span>{t('tabBooks')}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'books' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {books.length}
              </span>
            </button>

            {/* Tab 2: Promo Codes */}
            <button
              onClick={() => { setActiveTab('promos'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'promos'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Tag className="w-4 h-4 text-amber-400" />
                <span>{t('tabPromos')}</span>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                activeTab === 'promos' ? 'bg-indigo-800 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {promos.length}
              </span>
            </button>

            {/* Tab 3: Contact & Store Info */}
            <button
              onClick={() => { setActiveTab('contacts'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'contacts'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>{t('tabContacts')}</span>
            </button>

            {/* Tab 4: Customer Inquiries */}
            <button
              onClick={() => { setActiveTab('inquiries'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'inquiries'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <span>{t('tabInquiries')}</span>
              </div>
              {inquiries.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500 text-slate-950">
                  {inquiries.length}
                </span>
              )}
            </button>

            {/* Tab 5: Telegram Bot & Links */}
            <button
              onClick={() => { setActiveTab('telegram'); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                activeTab === 'telegram'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Bot className="w-4 h-4 text-blue-400" />
              <span>{t('tabTelegram')}</span>
            </button>

            {/* Tab 6: Supabase Cloud Database */}
            <button
              onClick={() => { setIsConfigModalOpen(true); setMobileSidebarOpen(false); }}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-emerald-300 hover:bg-slate-900/80 transition-all"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Supabase Cloud</span>
              </div>
              <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400 shadow-md shadow-emerald-500/50' : 'bg-amber-400'}`} />
            </button>
          </div>
        </div>

        {/* Bottom Sidebar: Theme, Lang, Store, Logout */}
        <div className="pt-5 border-t border-slate-800/80 space-y-2.5">
          {/* Theme & Language row */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsDark(!isDark)}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 text-slate-300 hover:text-white transition-colors"
              title={isDark ? t('lightMode') : t('darkMode')}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />}
              <span>{isDark ? t('lightMode') : t('darkMode')}</span>
            </button>

            {/* Language dropdown */}
            <div className="relative" data-admin-lang>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setLangDropdownOpen(!langDropdownOpen)
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-300 bg-slate-900/90 border border-slate-800 hover:border-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
                title={t('selectLanguage')}
              >
                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                <span className="uppercase">{lang}</span>
              </button>

              {langDropdownOpen && (
                <div className="absolute bottom-full mb-2 right-0 w-36 py-1.5 rounded-xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code)
                        setLangDropdownOpen(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors ${
                        lang === l.code
                          ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                          : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                      }`}
                    >
                      <span>{l.flag}</span>
                      <span>{l.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Back to store */}
          <button
            onClick={onBackToStore}
            className="w-full py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-4 h-4 text-indigo-400" />
            <span>{t('backToStore')}</span>
          </button>

          {/* Logout */}
          <button
            onClick={logoutAdmin}
            className="w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logoutButton')}</span>
          </button>
        </div>
      </aside>

      {/* RIGHT SIDE MAIN CONTAINER */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Header of Right Content Area */}
        <header className="sticky top-0 z-30 h-16 sm:h-20 bg-[#0b0f19]/80 border-b border-slate-800/80 backdrop-blur-xl px-4 sm:px-8 flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold font-heading text-white">
              {activeTab === 'books' && t('tabBooks')}
              {activeTab === 'promos' && t('tabPromos')}
              {activeTab === 'contacts' && t('tabContacts')}
              {activeTab === 'inquiries' && t('tabInquiries')}
              {activeTab === 'telegram' && t('tabTelegram')}
            </h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              {activeTab === 'books' && "Kitoblar katalogi, narxlar va ombor zaxirasini boshqarish"}
              {activeTab === 'promos' && "Xaridorlar uchun chegirma promokodlari va aksiyalar"}
              {activeTab === 'contacts' && "Sayt va do'kon aloqa ma'lumotlarini sozlash"}
              {activeTab === 'inquiries' && "Saytdan xaridorlar qoldirgan murojaat va arizalar"}
              {activeTab === 'telegram' && "Telegram bot tokeni va bildirishnomalar integratsiyasi"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {activeTab === 'books' && (
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addBook')}</span>
              </button>
            )}

            {activeTab === 'promos' && (
              <button
                onClick={handleOpenAddPromo}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addPromo')}</span>
              </button>
            )}
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="p-4 sm:p-8 flex-1 space-y-8">
        
        {/* ========================================================
            TAB 1: BOOKS MANAGEMENT
            ======================================================== */}
        {activeTab === 'books' && (
          <div className="space-y-8">
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-indigo-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">{t('totalBooks')}</div>
                    <div className="text-3xl font-extrabold text-white font-heading mt-1">
                      {stats.totalBooks} ta
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <BookOpen className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Barcha kitoblar sotuvga faol</span>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-amber-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">{t('totalStockCount')}</div>
                    <div className="text-3xl font-extrabold text-amber-400 font-heading mt-1">
                      {stats.totalStock.toLocaleString()} ta
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Boxes className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-[11px] text-slate-400">
                  Ombordagi umumiy qoldiq
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">Umumiy tovar qiymati</div>
                    <div className="text-2xl font-extrabold text-emerald-400 font-heading mt-1">
                      {Math.round(stats.totalValue / 1000000).toLocaleString()} mln so'm
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-[11px] text-slate-400">
                  {stats.totalValue.toLocaleString()} so'm
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm relative overflow-hidden group hover:border-purple-500/40 transition-all">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-400 font-medium">{t('avgRating')}</div>
                    <div className="text-3xl font-extrabold text-purple-400 font-heading mt-1">
                      ★ {stats.avgRating}
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                    <Star className="w-6 h-6" />
                  </div>
                </div>
                <div className="mt-4 text-[11px] text-slate-400">
                  Kitobxonlar baholari asosida
                </div>
              </div>
            </div>

            {/* Filter Bar & Add Button */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex flex-1 items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Kitob nomi yoki muallif bo'yicha qidirish..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="ALL">Barcha janrlar</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleOpenCreate}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addBook')}</span>
              </button>
            </div>

            {/* Books Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-4 sm:px-6">Kitob</th>
                      <th className="py-4 px-4">Janr</th>
                      <th className="py-4 px-4">Narxi</th>
                      <th className="py-4 px-4 text-center">Zaxira</th>
                      <th className="py-4 px-4 text-center">Reyting</th>
                      <th className="py-4 px-4 sm:px-6 text-right">Amallar</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredBooks.map((book) => (
                      <tr key={book.id} className="hover:bg-slate-800/30 transition-colors group">
                        <td className="py-3.5 px-4 sm:px-6">
                          <div className="flex items-center gap-3">
                            <img
                              src={book.cover_url}
                              alt={book.title}
                              className="w-10 h-14 object-cover rounded-lg bg-slate-950 border border-slate-800 shrink-0"
                            />
                            <div>
                              <div className="font-bold text-white group-hover:text-indigo-400 transition-colors">
                                {book.title}
                              </div>
                              <div className="text-xs text-slate-400">{book.author}</div>
                              {book.is_featured && (
                                <span className="inline-block mt-1 px-2 py-0.2 rounded-md bg-amber-500/20 text-amber-300 text-[10px] font-semibold border border-amber-500/30">
                                  👑 Bestseller
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs">
                            {book.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                          {Number(book.price).toLocaleString()} so'm
                          {book.old_price && (
                            <span className="block text-[11px] text-slate-500 line-through font-normal">
                              {Number(book.old_price).toLocaleString()} so'm
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center font-mono">
                          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                            book.stock > 10
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : book.stock > 0
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}>
                            {book.stock} ta
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 text-xs font-semibold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>{Number(book.rating || 5).toFixed(1)}</span>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 sm:px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEdit(book)}
                              className="p-2 rounded-xl bg-slate-800/60 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                              title={t('editBook')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingBook(book)}
                              className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                              title={t('deleteBook')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: PROMOCODES MANAGEMENT
            ======================================================== */}
        {activeTab === 'promos' && (
          <div className="space-y-6">
            
            {/* Header + Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <Tag className="w-5 h-5 text-indigo-400" />
                  <span>Promokodlar boshqaruvi</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Xaridorlar buyurtma rasmiylashtirishda ushbu promokodlar orqali chegirma oladilar.
                </p>
              </div>

              <button
                onClick={handleOpenAddPromo}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all self-start sm:self-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{t('addPromo')}</span>
              </button>
            </div>

            {promoToast && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>{promoToast}</span>
              </div>
            )}

            {/* Promos Table */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">Kod</th>
                    <th className="py-4 px-4">Chegirma</th>
                    <th className="py-4 px-4">Tavsifi</th>
                    <th className="py-4 px-4 text-center">Holati</th>
                    <th className="py-4 px-6 text-right">Amallar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {promos.map((p) => {
                    const active = p.isActive !== false && p.is_active !== false
                    return (
                      <tr key={p.code} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono font-extrabold text-sm tracking-wider">
                            <Tag className="w-3.5 h-3.5" />
                            <span>{p.code}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold font-mono text-sm">
                            -{p.discountPercent || p.discount_percent || 10}%
                          </span>
                        </td>

                        <td className="py-4 px-4 text-slate-300 max-w-xs">
                          {p.description || "Do'kon aksiyasi"}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleTogglePromo(p.code)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all ${
                              active
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                            }`}
                            title={t('toggleStatus')}
                          >
                            {active ? <CheckCircle className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            <span>{active ? t('active') : t('inactive')}</span>
                          </button>
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditPromo(p)}
                              className="p-2 rounded-xl bg-slate-800/60 hover:bg-indigo-600 text-slate-300 hover:text-white transition-colors"
                              title={t('editPromo')}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePromo(p.code)}
                              className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                              title={t('deletePromo')}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 3: CONTACT & STORE SETTINGS
            ======================================================== */}
        {activeTab === 'contacts' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                  <Phone className="w-5 h-5 text-indigo-400" />
                  <span>Do'kon aloqa ma'lumotlarini boshqarish</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Ushbu ma'lumotlar saytning pastki qismida (Footer) va "Aloqa" sahifasida real vaqtda yangilanadi.
                </p>
              </div>

              {siteSettingsSaved && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t('settingsSaved')}</span>
                </div>
              )}

              <form onSubmit={handleSaveSettings} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('phone1Label')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={siteSettings.phone1}
                      onChange={(e) => setSiteSettings({ ...siteSettings, phone1: e.target.value })}
                      placeholder="+998 71 200 00 00"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('phone2Label')}
                    </label>
                    <input
                      type="text"
                      value={siteSettings.phone2}
                      onChange={(e) => setSiteSettings({ ...siteSettings, phone2: e.target.value })}
                      placeholder="+998 90 123 45 67"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('emailLabel')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={siteSettings.email}
                      onChange={(e) => setSiteSettings({ ...siteSettings, email: e.target.value })}
                      placeholder="info@kitobhon.uz"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('telegramUserLabel')}
                    </label>
                    <input
                      type="text"
                      value={siteSettings.telegramUsername}
                      onChange={(e) => setSiteSettings({ ...siteSettings, telegramUsername: e.target.value })}
                      placeholder="@kitobhon_admin"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t('telegramChannelLabel')}
                  </label>
                  <input
                    type="url"
                    value={siteSettings.telegramChannel}
                    onChange={(e) => setSiteSettings({ ...siteSettings, telegramChannel: e.target.value })}
                    placeholder="https://t.me/kitobhon_uz"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t('addressLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={siteSettings.address}
                    onChange={(e) => setSiteSettings({ ...siteSettings, address: e.target.value })}
                    placeholder="Toshkent sh., Yunusobod tumani..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('landmarkLabel')}
                    </label>
                    <input
                      type="text"
                      value={siteSettings.addressLandmark}
                      onChange={(e) => setSiteSettings({ ...siteSettings, addressLandmark: e.target.value })}
                      placeholder="Mo'ljal: Metro Bodomzor"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('workingHoursLabel')}
                    </label>
                    <input
                      type="text"
                      value={siteSettings.workingHours}
                      onChange={(e) => setSiteSettings({ ...siteSettings, workingHours: e.target.value })}
                      placeholder="09:00 — 22:00 (Har kuni)"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('saveSettings')}</span>
                  </button>
                </div>

              </form>
            </div>

          </div>
        )}

        {/* ========================================================
            TAB 4: CUSTOMER INQUIRIES
            ======================================================== */}
        {activeTab === 'inquiries' && (
          <div className="space-y-6">
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white font-heading flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-400" />
                  <span>{t('customerInquiries')}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Mijozlar saytdagi kontakt formasi orqali yuborgan barcha savol va xabarlar
                </p>
              </div>
            </div>

            {inquiries.length > 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
                    <tr>
                      <th className="py-4 px-6">Mijoz</th>
                      <th className="py-4 px-4">Telefon</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-4">Xabar matni</th>
                      <th className="py-4 px-4">Vaqti</th>
                      <th className="py-4 px-4 text-center">Holat</th>
                      <th className="py-4 px-6 text-right">Amal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {inquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-4 px-6 font-bold text-white">
                          {inq.name}
                        </td>
                        <td className="py-4 px-4 font-mono text-indigo-300">
                          <a href={`tel:${inq.phone}`} className="hover:underline">
                            {inq.phone}
                          </a>
                        </td>
                        <td className="py-4 px-4 text-slate-400">
                          {inq.email ? (
                            <a href={`mailto:${inq.email}`} className="hover:underline">
                              {inq.email}
                            </a>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-4 px-4 text-slate-200 max-w-sm">
                          <p className="line-clamp-2">{inq.message}</p>
                        </td>
                        <td className="py-4 px-4 text-xs text-slate-400 font-mono">
                          {new Date(inq.date).toLocaleString('uz-UZ', { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleToggleInquiry(inq.id)}
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              inq.status === 'contacted'
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}
                          >
                            {inq.status === 'contacted' ? 'Bog\'lanildi' : 'Yangi'}
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => handleDeleteInquiryItem(inq.id)}
                            className="p-2 rounded-xl bg-slate-800/60 hover:bg-rose-600 text-slate-400 hover:text-white transition-colors"
                            title={t('deleteInquiry')}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-16 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8 space-y-3">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-base font-bold text-white">{t('noInquiries')}</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Mijozlar saytdan murojaat yuborganida shu yerda ro'yxatda paydo bo'ladi.
                </p>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            TAB 5: TELEGRAM BOT & LINKS SETTINGS
            ======================================================== */}
        {activeTab === 'telegram' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white font-heading flex items-center gap-2">
                    <Bot className="w-6 h-6 text-indigo-400" />
                    <span>{t('telegramSettingsTitle')}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Buyurtmalar va mijozlar arizalari avtomatik tarzda Telegram orqali sizga yuboriladi.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {tgConfig.botUsername && (
                    <a
                      href={`https://t.me/${tgConfig.botUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Bot className="w-4 h-4" />
                      <span>{t('openTelegramBot')}</span>
                    </a>
                  )}
                  {siteSettings.telegramUsername && (
                    <a
                      href={`https://t.me/${siteSettings.telegramUsername.replace('@', '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>{t('openTelegramAdmin')}</span>
                    </a>
                  )}
                </div>
              </div>

              {tgSaved && (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{t('telegramBotSaved')}</span>
                </div>
              )}

              {testResultMsg && (
                <div className={`p-4 rounded-xl text-xs sm:text-sm flex items-center gap-2 border ${
                  testStatus === 'success'
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  {testStatus === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{testResultMsg}</span>
                </div>
              )}

              <form onSubmit={handleSaveTgConfig} className="space-y-5">
                
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    {t('botTokenLabel')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={tgConfig.botToken}
                    onChange={(e) => setTgConfig({ ...tgConfig, botToken: e.target.value.trim() })}
                    placeholder="8571838307:AAHBYzDfpJF0HyOjY9SCFT9xtVny7C9x7I8"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-mono text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Telegram @BotFather orqali olingan API Token
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('chatIdLabel')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={tgConfig.adminChatId}
                      onChange={(e) => setTgConfig({ ...tgConfig, adminChatId: e.target.value.trim() })}
                      placeholder="7420313359"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white font-mono text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <span className="text-[11px] text-slate-500 mt-1 block">
                      Telegram @userinfobot orqali Chat ID ni bilib olishingiz mumkin
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      {t('botUsernameLabel')}
                    </label>
                    <input
                      type="text"
                      value={tgConfig.botUsername}
                      onChange={(e) => setTgConfig({ ...tgConfig, botUsername: e.target.value.trim() })}
                      placeholder="@kitobhon_bot"
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-white text-xs sm:text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* Notification Toggles */}
                <div className="pt-2 space-y-3 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Bildirishnomalarni yoqish / o'chirish:
                  </h4>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <span className="text-xs sm:text-sm text-slate-200">{t('notifyOrdersLabel')}</span>
                    <input
                      type="checkbox"
                      checked={tgConfig.notifyOrders !== false}
                      onChange={(e) => setTgConfig({ ...tgConfig, notifyOrders: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <span className="text-xs sm:text-sm text-slate-200">{t('notifyContactsLabel')}</span>
                    <input
                      type="checkbox"
                      checked={tgConfig.notifyContacts !== false}
                      onChange={(e) => setTgConfig({ ...tgConfig, notifyContacts: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 cursor-pointer hover:border-slate-700">
                    <span className="text-xs sm:text-sm text-slate-200">{t('notifyActionsLabel')}</span>
                    <input
                      type="checkbox"
                      checked={tgConfig.notifyAdminActions !== false}
                      onChange={(e) => setTgConfig({ ...tgConfig, notifyAdminActions: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                  </label>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleTestTg}
                    disabled={testStatus === 'testing'}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-semibold text-xs sm:text-sm border border-slate-700 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{testStatus === 'testing' ? t('testing') : t('testBotConnection')}</span>
                  </button>

                  <button
                    type="submit"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
                  >
                    <Save className="w-4 h-4" />
                    <span>{t('save')}</span>
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

      </main>
      </div>

      {/* ========================================================
          MODAL: ADD / EDIT BOOK
          ======================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsAddModalOpen(false)} />
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl z-10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-xl font-bold text-white font-heading">
                {editingBook ? t('editBook') : t('addBook')}
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveBook} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Kitob nomi *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Muallif *</label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Janr</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Narxi (so'm) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Eski narxi (so'm)</label>
                  <input
                    type="number"
                    value={formData.old_price}
                    onChange={(e) => setFormData({ ...formData, old_price: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Muqova rasm havolasi (URL)</label>
                <input
                  type="url"
                  value={formData.cover_url}
                  onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Ombordagi soni</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Sahifalar</label>
                  <input
                    type="number"
                    value={formData.pages}
                    onChange={(e) => setFormData({ ...formData, pages: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Yili</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Kitob tavsifi</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <label htmlFor="is_featured" className="text-xs sm:text-sm text-slate-300 cursor-pointer">
                  Bestsellerlar qatoriga qo'shish (Bosh sahifada ko'rinadi)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ADD / EDIT PROMOCODE
          ======================================================== */}
      {isPromoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsPromoModalOpen(false)} />
          <div className="relative w-full max-w-md p-6 sm:p-8 bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl z-10 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white font-heading">
                {editingPromo ? t('editPromo') : t('addPromo')}
              </h3>
              <button
                onClick={() => setIsPromoModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePromo} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t('promoCodeLabel')} *
                </label>
                <input
                  type="text"
                  required
                  value={promoForm.code}
                  onChange={(e) => setPromoForm({ ...promoForm, code: e.target.value.toUpperCase() })}
                  placeholder="BAHOR20"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono font-bold text-sm tracking-wider uppercase focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t('discountPercentLabel')} *
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={promoForm.discountPercent}
                  onChange={(e) => setPromoForm({ ...promoForm, discountPercent: e.target.value })}
                  placeholder="20"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t('promoDescLabel')}
                </label>
                <input
                  type="text"
                  value={promoForm.description}
                  onChange={(e) => setPromoForm({ ...promoForm, description: e.target.value })}
                  placeholder="Talabalar uchun 20% chegirma"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs sm:text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="promo_active"
                  checked={promoForm.isActive}
                  onChange={(e) => setPromoForm({ ...promoForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                />
                <label htmlFor="promo_active" className="text-xs sm:text-sm text-slate-300 cursor-pointer">
                  Promokod faol (savatda ishlatish mumkin)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPromoModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: DELETE BOOK CONFIRMATION
          ======================================================== */}
      {deletingBook && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setDeletingBook(null)} />
          <div className="relative w-full max-w-md p-6 bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl z-10 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Kitobni o'chirish</h3>
            <p className="text-xs text-slate-300">
              Haqiqatan ham <b className="text-white">"{deletingBook.title}"</b> kitobini o'chirmoqchimisiz?
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <button
                onClick={() => setDeletingBook(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-6 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30"
              >
                {t('deleteBook')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: SUPABASE CONFIGURATION
          ======================================================== */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="fixed inset-0" onClick={() => setIsConfigModalOpen(false)} />
          <div className="relative w-full max-w-lg p-6 sm:p-8 bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl z-10 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-white">Supabase Cloud Database</h3>
              </div>
              <button
                onClick={() => setIsConfigModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Supabase hisobingizdagi Project Settings &gt; API bo'limidagi URL va anon kalitini kiriting.
            </p>

            <form onSubmit={handleSaveSupabase} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Project URL</label>
                <input
                  type="url"
                  required
                  value={cfgUrl}
                  onChange={(e) => setCfgUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Anon / Public API Key</label>
                <input
                  type="password"
                  required
                  value={cfgKey}
                  onChange={(e) => setCfgKey(e.target.value)}
                  placeholder="eyJh..."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsConfigModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-600/30"
                >
                  {t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default AdminDashboard
