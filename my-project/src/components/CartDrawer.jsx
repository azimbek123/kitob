import { useState } from 'react'
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, CheckCircle2, ShieldCheck, Send, Tag, Sparkles } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useCart } from '../context/CartContext'
import { sendOrderNotification } from '../services/telegramService'
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'
import { initialPromoCodes } from '../data/initialPromoCodes'

export const CartDrawer = () => {
  const { t } = useLanguage()
  const {
    cart,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useCart()

  const [checkoutStep, setCheckoutStep] = useState('cart') // 'cart' | 'checkout' | 'success'
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('+998 ')
  const [address, setAddress] = useState('')
  const [paymentMethod, setPaymentMethod] = useState("Yetkazilganda naqd pul / karta")
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastOrderId, setLastOrderId] = useState(null)

  // Promo Code State
  const [promoInput, setPromoInput] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')

  // Load custom promo codes from localStorage if added via admin
  const getAvailablePromoCodes = () => {
    try {
      const stored = localStorage.getItem('kitobhon_promocodes')
      return stored ? JSON.parse(stored) : initialPromoCodes
    } catch {
      return initialPromoCodes
    }
  }

  const handleApplyPromo = (e) => {
    e.preventDefault()
    setPromoError('')
    const cleanCode = promoInput.trim().toUpperCase()
    if (!cleanCode) return

    const available = getAvailablePromoCodes()
    const found = available.find(
      (p) => p.code.toUpperCase() === cleanCode && (p.isActive !== false && p.is_active !== false)
    )

    if (found) {
      setAppliedPromo(found)
      setPromoInput('')
    } else {
      setPromoError("Bunday promokod mavjud emas yoki muddati o'tgan!")
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoError('')
  }

  // Discount calculation
  const discountPercent = appliedPromo ? (appliedPromo.discountPercent || appliedPromo.discount_percent || 0) : 0
  const discountAmount = Math.round((totalPrice * discountPercent) / 100)
  const finalPrice = Math.max(0, totalPrice - discountAmount)

  if (!isCartOpen) return null

  const handleStartCheckout = () => {
    if (cart.length === 0) return
    setCheckoutStep('checkout')
  }

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    if (!customerName.trim() || !phone.trim() || !address.trim()) return

    setIsSubmitting(true)
    const generatedId = Math.floor(100000 + Math.random() * 900000)

    const orderPayload = {
      id: generatedId,
      customerName: customerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      paymentMethod,
      notes: notes.trim(),
      items: cart,
      total: finalPrice,
      promoCode: appliedPromo?.code || null,
      discountPercent: discountPercent,
      discountAmount: discountAmount,
    }

    try {
      // 1. Send direct Telegram Notification with book photo to Admin!
      await sendOrderNotification(orderPayload)

      // 2. Save to Supabase DB if available
      if (isSupabaseConfigured() && supabase) {
        await supabase.from('orders').insert([
          {
            id: generatedId,
            customer_name: orderPayload.customerName,
            customer_phone: orderPayload.phone,
            customer_address: orderPayload.address,
            total_price: orderPayload.total,
            payment_method: orderPayload.paymentMethod,
            items: orderPayload.items,
            status: 'new',
          },
        ])
      }
    } catch (err) {
      console.warn('Order processing error:', err)
    } finally {
      setIsSubmitting(false)
      setLastOrderId(generatedId)
      setCheckoutStep('success')
      clearCart()
      setAppliedPromo(null)
    }
  }

  const handleClose = () => {
    setIsCartOpen(false)
    if (checkoutStep === 'success') {
      setCheckoutStep('cart')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={handleClose} />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0b0f19] border-l border-slate-800 shadow-2xl flex flex-col z-10">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white font-heading">
                {checkoutStep === 'checkout' ? t('checkoutTitle') : t('cartTitle')}
              </h2>
              {totalItems > 0 && checkoutStep === 'cart' && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold">
                  {totalItems}
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            
            {/* Step 1: Cart Items List */}
            {checkoutStep === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">{t('emptyCart')}</h3>
                      <p className="text-xs text-slate-400 mt-1">{t('emptyCartDesc')}</p>
                    </div>
                    <button
                      onClick={handleClose}
                      className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow transition-colors"
                    >
                      {t('browseBooks')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 rounded-2xl bg-slate-900/80 border border-slate-800"
                      >
                        <img
                          src={item.cover_url}
                          alt={item.title}
                          className="w-16 h-20 object-cover rounded-xl border border-slate-800 flex-shrink-0"
                        />
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-[11px] text-indigo-400 font-medium">
                              {item.author}
                            </div>
                            <h4 className="text-xs font-bold text-white line-clamp-1">
                              {item.title}
                            </h4>
                            <div className="text-xs font-extrabold text-amber-400 font-heading mt-1">
                              {Number(item.price).toLocaleString('uz-UZ')} so'm
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 bg-slate-950 px-2 py-1 rounded-lg border border-slate-800">
                              <button
                                onClick={() => updateQuantity(item.id, -1)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="text-xs font-bold text-white px-1">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, 1)}
                                className="text-slate-400 hover:text-white"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-slate-500 hover:text-rose-400 p-1"
                              title="O'chirish"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Promokod Bo'limi (Promo Code input) */}
                    <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                        <Tag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Promokod bormi?</span>
                      </div>

                      {appliedPromo ? (
                        <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
                          <div className="flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="font-mono font-bold">{appliedPromo.code}</span>
                            <span>(-{discountPercent}%)</span>
                          </div>
                          <button
                            onClick={handleRemovePromo}
                            className="text-slate-400 hover:text-rose-400 p-1"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleApplyPromo} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Masalan: KITOB10"
                            value={promoInput}
                            onChange={(e) => setPromoInput(e.target.value)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs uppercase font-mono placeholder-slate-500 focus:outline-none focus:border-amber-400"
                          />
                          <button
                            type="submit"
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors"
                          >
                            Qo'llash
                          </button>
                        </form>
                      )}

                      {promoError && (
                        <div className="text-[11px] text-rose-400">{promoError}</div>
                      )}

                      <div className="text-[10px] text-slate-500 font-mono">
                        💡 Test promokodlar: <b>KITOB10</b> (-10%), <b>TALABA</b> (-15%)
                      </div>
                    </div>

                  </div>
                )}
              </>
            )}

            {/* Step 2: Checkout Form */}
            {checkoutStep === 'checkout' && (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <span>Ma'lumotlaringiz kitob rasmi bilan to'g'ridan-to'g'ri Telegram orqali qabul qilinadi.</span>
                </div>

                {appliedPromo && (
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between">
                    <span>Qo'llangan promokod: <b>{appliedPromo.code}</b></span>
                    <span className="font-bold">-{discountPercent}% chegirma</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('yourName')} *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Sardor Rustamov"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('address')} *
                  </label>
                  <textarea
                    required
                    rows="2"
                    placeholder="Toshkent shahri, Chilonzor tumani, 9-mavze, 15-uy..."
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    {t('paymentMethod')}
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Yetkazilganda naqd pul / karta">{t('cashOnDelivery')}</option>
                    <option value="Click / Payme">{t('clickPayme')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Qo'shimcha izoh (ixtiyoriy)
                  </label>
                  <input
                    type="text"
                    placeholder="Eshik kodi yoki yetkazish vaqti..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span>{isSubmitting ? 'Yuborilmoqda...' : t('confirmOrder')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCheckoutStep('cart')}
                    className="w-full mt-2 py-2 text-xs text-slate-400 hover:text-white"
                  >
                    ← Savatga qaytish
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: Success Screen */}
            {checkoutStep === 'success' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-xs font-mono text-indigo-400">Buyurtma #{lastOrderId}</span>
                  <h3 className="text-lg font-bold text-white font-heading mt-1">
                    {t('orderSuccessTitle')}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {t('orderSuccessDesc')}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 w-full text-xs text-slate-400">
                  📸 <b>Kitob rasmi bilan</b> ma'lumotlar Telegram botingizga yuborildi!
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors"
                >
                  Xaridni davom ettirish
                </button>
              </div>
            )}

          </div>

          {/* Footer Total Summary */}
          {checkoutStep === 'cart' && cart.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-3">
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>{t('itemsTotal')}:</span>
                  <span className="text-white font-semibold">
                    {Number(totalPrice).toLocaleString('uz-UZ')} so'm
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between text-amber-400 font-semibold">
                    <span>Promokod ({appliedPromo.code} -{discountPercent}%):</span>
                    <span>-{Number(discountAmount).toLocaleString('uz-UZ')} so'm</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>{t('deliveryFee')}:</span>
                  <span className="text-emerald-400 font-semibold">{t('freeDelivery')}</span>
                </div>

                <div className="flex justify-between text-base font-extrabold text-white pt-2 border-t border-slate-800">
                  <span>{t('totalSum')}:</span>
                  <span className="text-amber-400 font-heading">
                    {Number(finalPrice).toLocaleString('uz-UZ')} so'm
                  </span>
                </div>
              </div>

              <button
                onClick={handleStartCheckout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-600 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>{t('checkoutButton')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
