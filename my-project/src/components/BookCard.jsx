import { Star, ShoppingBag, Eye, Check } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useLanguage } from '../context/LanguageContext'

export const BookCard = ({ book, onSelectBook }) => {
  const { addToCart } = useCart()
  const { t } = useLanguage()
  const [justAdded, setJustAdded] = useState(false)

  const handleAddToCart = (e) => {
    e.stopPropagation()
    addToCart(book)
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1500)
  }

  const discountPercent =
    book.old_price && book.old_price > book.price
      ? Math.round(((book.old_price - book.price) / book.old_price) * 100)
      : null

  return (
    <div
      onClick={() => onSelectBook && onSelectBook(book)}
      className="group relative flex flex-col rounded-2xl sm:rounded-3xl bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 p-3 sm:p-4 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer overflow-hidden backdrop-blur-sm"
    >
      {/* Cover Image Container */}
      <div className="relative aspect-[3/4] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950 mb-3 sm:mb-4">
        <img
          src={book.cover_url || "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80"}
          alt={book.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Gradient Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
          {book.is_featured && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
              👑 {t('bestseller')}
            </span>
          )}
          {discountPercent && (
            <span className="px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-rose-500 text-white shadow-md">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Category Pill */}
        {book.category && (
          <div className="absolute bottom-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-medium bg-slate-900/80 border border-slate-700/60 text-slate-300 backdrop-blur-md">
              {book.category}
            </span>
          </div>
        )}

        {/* Quick View Button on Hover */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            onSelectBook && onSelectBook(book)
          }}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-slate-900/80 hover:bg-indigo-600 text-slate-300 hover:text-white flex items-center justify-center backdrop-blur-md border border-slate-700/60 opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 shadow-lg"
          title={t('details')}
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>

      {/* Book Information */}
      <div className="flex flex-col flex-grow justify-between space-y-2">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{Number(book.rating || 5).toFixed(1)}</span>
            <span className="text-[11px] text-slate-400 font-normal">
              ({book.reviews_count || (book.reviews ? book.reviews.length : 0)})
            </span>
          </div>

          <h3 className="text-sm sm:text-base font-bold text-white font-heading line-clamp-1 group-hover:text-indigo-300 transition-colors">
            {book.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
            {book.author}
          </p>
        </div>

        {/* Price & Action */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div>
            {book.old_price && book.old_price > book.price && (
              <span className="text-[11px] text-slate-500 line-through block -mb-0.5">
                {Number(book.old_price).toLocaleString()} {t('som')}
              </span>
            )}
            <span className="text-sm sm:text-base font-extrabold text-amber-400 font-heading">
              {Number(book.price).toLocaleString()} <span className="text-xs font-normal text-slate-400">{t('som')}</span>
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 shadow-md ${
              justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('addedToCart')}</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('addToCart')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
export default BookCard
