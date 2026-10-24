import { useState } from 'react'
import { X, Star, ShoppingBag, Book, Calendar, Globe2, Layers, CheckCircle2, Send, MessageSquare } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'

export const BookModal = ({ book, onClose, onAddReview }) => {
  const { t } = useLanguage()
  const { addToCart, setIsCartOpen } = useCart()
  
  const [newReviewerName, setNewReviewerName] = useState('')
  const [newRating, setNewRating] = useState(5)
  const [newComment, setNewComment] = useState('')
  const [reviewSubmitted, setReviewSubmitted] = useState(false)

  if (!book) return null

  const handleBuyNow = () => {
    addToCart(book)
    onClose()
    setIsCartOpen(true)
  }

  const handleReviewSubmit = (e) => {
    e.preventDefault()
    if (!newReviewerName.trim() || !newComment.trim()) return

    const newReview = {
      id: Date.now(),
      user: newReviewerName.trim(),
      rating: newRating,
      date: new Date().toISOString().split('T')[0],
      comment: newComment.trim(),
    }

    if (onAddReview) {
      onAddReview(book.id, newReview)
    }

    setReviewSubmitted(true)
    setNewReviewerName('')
    setNewComment('')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Click outside to close */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#0f172a] border border-slate-700/80 rounded-3xl shadow-2xl z-10 flex flex-col">
        
        {/* Header Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-slate-900/80 text-slate-400 hover:text-white border border-slate-700/60 hover:bg-slate-800 transition-colors"
          title={t('close')}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="p-6 sm:p-8 grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Left Column: Cover and Quick Spec */}
          <div className="md:col-span-5 flex flex-col items-center">
            <div className="w-full max-w-xs aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 relative">
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-indigo-600/90 backdrop-blur-md text-white font-semibold text-xs shadow">
                {book.category}
              </div>
            </div>

            {/* Price Display */}
            <div className="mt-5 text-center w-full">
              {book.old_price && (
                <div className="text-sm text-slate-400 line-through">
                  {Number(book.old_price).toLocaleString('uz-UZ')} so'm
                </div>
              )}
              <div className="text-2xl sm:text-3xl font-extrabold text-amber-400 font-heading">
                {Number(book.price).toLocaleString('uz-UZ')} so'm
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-5 w-full space-y-2.5">
              <button
                onClick={handleBuyNow}
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2"
              >
                <span>{t('directBuy')}</span>
              </button>

              <button
                onClick={() => {
                  addToCart(book)
                  onClose()
                }}
                className="w-full py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-sm border border-slate-700 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span>{t('addToCart')}</span>
              </button>
            </div>

          </div>

          {/* Right Column: Book Details, Synopsis & Reviews */}
          <div className="md:col-span-7 space-y-6">
            
            {/* Title & Author */}
            <div>
              <div className="text-xs uppercase tracking-wider text-indigo-400 font-mono mb-1 font-semibold">
                {book.author}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-heading leading-tight">
                {book.title}
              </h2>

              <div className="flex items-center gap-3 mt-2.5">
                <div className="flex items-center text-amber-400 gap-1 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                  <Star className="w-4 h-4 fill-amber-400 stroke-none" />
                  <span className="text-sm font-bold">{book.rating || 4.9}</span>
                </div>
                <span className="text-xs text-slate-400">
                  ({book.reviews?.length || book.reviews_count || 24} {t('reviewsCountSuffix')})
                </span>
                <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {book.stock > 0 ? `${book.stock} ta mavjud` : t('outOfStock')}
                </span>
              </div>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800">
              <div className="text-center p-2">
                <Layers className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400">{t('pageCount')}</div>
                <div className="text-xs font-bold text-white">{book.pages || 320} bet</div>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <Calendar className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400">{t('pubYear')}</div>
                <div className="text-xs font-bold text-white">{book.year || '2022'}</div>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <Globe2 className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400">{t('bookLang')}</div>
                <div className="text-xs font-bold text-white">{book.language || "O'zbekcha"}</div>
              </div>
              <div className="text-center p-2 border-l border-slate-800">
                <Book className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                <div className="text-[10px] text-slate-400">Format</div>
                <div className="text-xs font-bold text-white">Qattiq muqova</div>
              </div>
            </div>

            {/* Book Synopsis ("Nimahaqidaligi") */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center gap-2">
                <span className="w-1.5 h-4 bg-indigo-500 rounded-full" />
                {t('synopsisTitle')}
              </h3>
              <p className="text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
                {book.description}
              </p>
            </div>

            {/* Customer Reviews ("Otzivla") */}
            <div className="space-y-3 pt-2">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-heading flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-amber-500 rounded-full" />
                  {t('reviewsTitle')}
                </span>
                <span className="text-xs text-slate-400 font-normal">
                  {book.reviews?.length || 0} ta sharh
                </span>
              </h3>

              {/* Reviews List */}
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {book.reviews && book.reviews.length > 0 ? (
                  book.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{rev.user}</span>
                        <div className="flex items-center text-amber-400">
                          {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-400 stroke-none" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed italic">
                        "{rev.comment}"
                      </p>
                      {rev.date && (
                        <div className="text-[10px] text-slate-500">{rev.date}</div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">
                    Hozircha sharhlar yo'q. Birinchi bo'lib fikringizni qoldiring!
                  </p>
                )}
              </div>

              {/* Write Review Form */}
              <form onSubmit={handleReviewSubmit} className="pt-2 border-t border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{t('writeReview')}</span>
                </div>

                {reviewSubmitted && (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs">
                    Rahmat! Sharhingiz muvaffaqiyatli qo'shildi.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder={t('yourName')}
                    value={newReviewerName}
                    onChange={(e) => setNewReviewerName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                    <span className="text-slate-400">Baholash:</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewRating(star)}
                          className={`text-sm ${star <= newRating ? 'text-amber-400' : 'text-slate-600'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <textarea
                    required
                    rows="2"
                    placeholder={t('yourComment')}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('submitReview')}</span>
                </button>
              </form>

            </div>

          </div>

        </div>

      </div>

    </div>
  )
}
