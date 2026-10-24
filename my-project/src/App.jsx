import { useState, useEffect, useMemo } from 'react'
import { Navbar } from './components/Navbar'
import { Hero } from './components/Hero'
import { BookCard } from './components/BookCard'
import { BookModal } from './components/BookModal'
import { CartDrawer } from './components/CartDrawer'
import { AboutSection } from './components/AboutSection'
import { ContactSection } from './components/ContactSection'
import { Footer } from './components/Footer'
import { AdminLogin } from './components/AdminLogin'
import { AdminDashboard } from './components/AdminDashboard'
import { initialBooks } from './data/initialBooks'
import { useAuth } from './context/AuthContext'
import { useLanguage } from './context/LanguageContext'
import { Search, SlidersHorizontal, BookOpen, Sparkles, RotateCcw } from 'lucide-react'

export function App() {
  const { t } = useLanguage()
  const { isAdmin } = useAuth()

  // Navigation State: 'home' | 'books' | 'about' | 'contact' | 'admin'
  const [currentView, setCurrentView] = useState('home')
  
  // Admin Login Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false)

  // Selected Book for Modal
  const [selectedBook, setSelectedBook] = useState(null)

  // Books State (Persistent with localStorage)
  const [books, setBooks] = useState(() => {
    try {
      const saved = localStorage.getItem('kitobhon_books')
      return saved ? JSON.parse(saved) : initialBooks
    } catch {
      return initialBooks
    }
  })

  // Sync books to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kitobhon_books', JSON.stringify(books))
    } catch (e) {
      console.error('Could not save books to localStorage:', e)
    }
  }, [books])

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [sortBy, setSortBy] = useState('popular') // 'popular' | 'price_asc' | 'price_desc' | 'rating'

  // Categories list
  const categoryKeys = [
    { key: 'ALL', label: t('allCategories') },
    { key: 'Badiiy', label: t('catFiction') },
    { key: 'Biznes', label: t('catBusiness') },
    { key: 'Psixologiya', label: t('catPsychology') },
    { key: 'Dasturlash', label: t('catIT') },
    { key: 'Shaxsiy rivojlanish', label: t('catSelfDev') },
  ]

  // Handlers for Admin
  const handleAddBook = (newBook) => {
    setBooks((prev) => [newBook, ...prev])
  }

  const handleUpdateBook = (updatedBook) => {
    setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)))
  }

  const handleDeleteBook = (bookId) => {
    setBooks((prev) => prev.filter((b) => b.id !== bookId))
  }

  // Handler for adding reader review
  const handleAddReview = (bookId, newReview) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b
        const existingReviews = b.reviews || []
        const updatedReviews = [newReview, ...existingReviews]
        const newRating = (
          updatedReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) /
          updatedReviews.length
        ).toFixed(1)

        const updated = {
          ...b,
          reviews: updatedReviews,
          reviews_count: (b.reviews_count || existingReviews.length) + 1,
          rating: Number(newRating),
        }

        if (selectedBook && selectedBook.id === bookId) {
          setSelectedBook(updated)
        }
        return updated
      })
    )
  }

  // Filtered & Sorted books
  const filteredBooks = useMemo(() => {
    return books
      .filter((book) => {
        const matchesCategory =
          selectedCategory === 'ALL' ||
          (book.category && book.category.toLowerCase().includes(selectedCategory.toLowerCase()))

        const q = searchQuery.toLowerCase().trim()
        const matchesQuery =
          !q ||
          book.title?.toLowerCase().includes(q) ||
          book.author?.toLowerCase().includes(q) ||
          book.category?.toLowerCase().includes(q)

        return matchesCategory && matchesQuery
      })
      .sort((a, b) => {
        if (sortBy === 'price_asc') return a.price - b.price
        if (sortBy === 'price_desc') return b.price - a.price
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
        return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0) // default popular
      })
  }, [books, searchQuery, selectedCategory, sortBy])

  // Featured books for spotlight
  const featuredBooks = useMemo(() => {
    return books.filter((b) => b.is_featured).slice(0, 4)
  }, [books])

  const handleOpenAdmin = () => {
    if (isAdmin) {
      setCurrentView('admin')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      setIsAdminModalOpen(true)
    }
  }

  const handleAdminSuccess = () => {
    setCurrentView('admin')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // If view is Admin and user is authenticated
  if (currentView === 'admin' && isAdmin) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100">
        <AdminDashboard
          books={books}
          onAddBook={handleAddBook}
          onUpdateBook={handleUpdateBook}
          onDeleteBook={handleDeleteBook}
          onBackToStore={() => setCurrentView('home')}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header / Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        openAdminModal={handleOpenAdmin}
      />

      <main className="flex-grow">
        {/* VIEW: HOME */}
        {currentView === 'home' && (
          <>
            <Hero
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              onExploreBooks={() => {
                const el = document.getElementById('books-catalog')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
              onSelectCategory={(cat) => {
                setSelectedCategory(cat)
                const el = document.getElementById('books-catalog')
                if (el) el.scrollIntoView({ behavior: 'smooth' })
              }}
            />

            {/* Featured Books Section */}
            {featuredBooks.length > 0 && (
              <section className="py-12 bg-slate-950/50 border-y border-slate-800/80">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Bestsellerlar</span>
                      </div>
                      <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                        Eng ko'p o'qilayotgan kitoblar
                      </h2>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {featuredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onSelectBook={(b) => setSelectedBook(b)}
                      />
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Catalog Section */}
            <section id="books-catalog" className="py-16 scroll-mt-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                
                {/* Section Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading">
                      {t('catalogTitle')}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">
                      {t('catalogSubtitle')}
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder={t('searchPlaceholder')}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories & Filter Bar */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
                  {/* Category Pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                    {categoryKeys.map((cat) => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                          selectedCategory === cat.key
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                            : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>

                  {/* Sort Dropdown */}
                  <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                    <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                    >
                      <option value="popular">{t('sortPopular')}</option>
                      <option value="price_asc">{t('sortPriceAsc')}</option>
                      <option value="price_desc">{t('sortPriceDesc')}</option>
                      <option value="rating">{t('sortRating')}</option>
                    </select>
                  </div>
                </div>

                {/* Books Grid */}
                {filteredBooks.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredBooks.map((book) => (
                      <BookCard
                        key={book.id}
                        book={book}
                        onSelectBook={(b) => setSelectedBook(b)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
                      <BookOpen className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t('noBooksFound')}</h3>
                    <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                      {t('noBooksFoundDesc')}
                    </p>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedCategory('ALL')
                      }}
                      className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>{t('resetFilters')}</span>
                    </button>
                  </div>
                )}
              </div>
            </section>

            <AboutSection />
            <ContactSection />
          </>
        )}

        {/* VIEW: BOOKS */}
        {currentView === 'books' && (
          <section className="py-12 min-h-[70vh]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-heading">
                    {t('catalogTitle')}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    {t('catalogSubtitle')}
                  </p>
                </div>

                <div className="relative w-full md:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('searchPlaceholder')}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
                  {categoryKeys.map((cat) => (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        selectedCategory === cat.key
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                          : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2 self-end lg:self-auto shrink-0">
                  <SlidersHorizontal className="w-4 h-4 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-xs sm:text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="popular">{t('sortPopular')}</option>
                    <option value="price_asc">{t('sortPriceAsc')}</option>
                    <option value="price_desc">{t('sortPriceDesc')}</option>
                    <option value="rating">{t('sortRating')}</option>
                  </select>
                </div>
              </div>

              {/* Grid */}
              {filteredBooks.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {filteredBooks.map((book) => (
                    <BookCard
                      key={book.id}
                      book={book}
                      onSelectBook={(b) => setSelectedBook(b)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800/60 p-8 space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800/60 text-slate-400 flex items-center justify-center mx-auto">
                    <BookOpen className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-white">{t('noBooksFound')}</h3>
                  <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
                    {t('noBooksFoundDesc')}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSelectedCategory('ALL')
                    }}
                    className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{t('resetFilters')}</span>
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {/* VIEW: ABOUT */}
        {currentView === 'about' && (
          <div className="py-8 min-h-[70vh]">
            <AboutSection />
          </div>
        )}

        {/* VIEW: CONTACT */}
        {currentView === 'contact' && (
          <div className="py-8 min-h-[70vh]">
            <ContactSection />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavigate={(view) => setCurrentView(view)} />

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Book Details Modal */}
      {selectedBook && (
        <BookModal
          book={selectedBook}
          onClose={() => setSelectedBook(null)}
          onAddReview={handleAddReview}
        />
      )}

      {/* Admin Login Modal */}
      {isAdminModalOpen && (
        <AdminLogin
          onClose={() => setIsAdminModalOpen(false)}
          onSuccess={handleAdminSuccess}
        />
      )}
    </div>
  )
}
export default App
