// Telegram Bot Notification Service with Dynamic Admin Configuration
// Bot token endi brauzerda saqlanmaydi: xabarlar Vercel serverless funksiyasi
// (/api/notify) orqali yuboriladi. Token faqat Vercel Environment Variables'da.
const NOTIFY_ENDPOINT = '/api/notify'

const callNotify = async (method, payload) => {
  try {
    const response = await fetch(NOTIFY_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ method, payload }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok || !data.ok) {
      return { success: false, error: data.description || data.error || 'Telegram API xatosi' }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Telegram notify error:', error)
    return { success: false, error: error.message }
  }
}

export const getTelegramConfig = () => {
  try {
    const stored = localStorage.getItem('kitobhon_telegram_config')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (e) {
    console.error('Error parsing Telegram config:', e)
  }
  return {
    botToken: '',
    adminChatId: '',
    botUsername: '@Kitobilim_bot',
    telegramChannel: 'https://t.me/kitobhon_uz',
    notifyOrders: true,
    notifyContacts: true,
    notifyAdminActions: true,
  }
}

export const saveTelegramConfig = (config) => {
  try {
    localStorage.setItem('kitobhon_telegram_config', JSON.stringify({ ...config, botToken: '', adminChatId: '' }))
    window.dispatchEvent(new CustomEvent('telegram-config-changed', { detail: config }))
    return true
  } catch (e) {
    console.error('Error saving Telegram config:', e)
    return false
  }
}

/**
 * Send HTML text message to Telegram Admin
 */
export const sendTelegramMessage = async (text) => {
  return await callNotify('sendMessage', { text, parse_mode: 'HTML' })
}

/**
 * Send Photo with HTML Caption to Telegram Admin
 */
export const sendTelegramPhoto = async (photoUrl, caption) => {
  const res = await callNotify('sendPhoto', {
    photo: photoUrl,
    caption: caption.slice(0, 1024),
    parse_mode: 'HTML',
  })
  if (res.success) return res
  return await sendTelegramMessage(caption)
}

/**
 * Test Telegram Connection
 */
export const testTelegramConnection = async () => {
  const time = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
  const text = `🤖 <b>TEST XABARI — KITOBHON.UZ</b>
━━━━━━━━━━━━━━━━━━━━
✅ <b>Telegram Bot muvaffaqiyatli ulandi!</b>
⏰ <b>Vaqti:</b> ${time}
⚙️ <b>Holat:</b> Barcha bildirishnomalar faol

<i>Kitobhon.uz boshqaruv panelidan yuborildi.</i>`

  return await sendTelegramMessage(text)
}

/**
 * Format and send new order notification with book cover photo
 */
export const sendOrderNotification = async (order) => {
  const config = getTelegramConfig()
  if (config.notifyOrders === false) {
    return { success: true, skipped: true }
  }

  const itemsText = order.items
    .map(
      (item, idx) =>
        `  ${idx + 1}. <b>${item.title}</b> (${item.author || ''})\n     ${item.quantity} x ${Number(item.price).toLocaleString('uz-UZ')} so'm = <b>${(item.quantity * item.price).toLocaleString('uz-UZ')} so'm</b>`
    )
    .join('\n\n')

  const formattedDate = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })

  const promoInfo = order.promoCode
    ? `🎟 <b>Promokod:</b> <code>${order.promoCode}</code> (-${order.discountPercent}% chegirma)\n`
    : ''

  const discountInfo = order.discountAmount
    ? `🏷 <b>Chegirma:</b> -${Number(order.discountAmount).toLocaleString('uz-UZ')} so'm\n`
    : ''

  const message = `🛍 <b>YANGI BUYURTMA QABUL QILINDI!</b>
━━━━━━━━━━━━━━━━━━━━
🆔 <b>Buyurtma ID:</b> #${order.id || Math.floor(100000 + Math.random() * 900000)}
📅 <b>Vaqti:</b> ${formattedDate}

👤 <b>Mijoz:</b> ${order.customerName}
📞 <b>Telefon:</b> <a href="tel:${order.phone}">${order.phone}</a>
📍 <b>Manzil:</b> ${order.address || "Ko'rsatilmadi"}
💳 <b>To'lov:</b> ${order.paymentMethod || 'Yetkazilganda naqd pul'}
${promoInfo}${discountInfo}${order.notes ? `📝 <b>Izoh:</b> ${order.notes}\n` : ''}
📚 <b>Buyurtma tarkibi:</b>
${itemsText}

💰 <b>UMUMIY SUMMA:</b> <b>${Number(order.total).toLocaleString('uz-UZ')} SO'M</b>
━━━━━━━━━━━━━━━━━━━━
⚡️ <i>Kitobhon.uz tizimidan avtomatik xabar</i>`

  const firstBookPhoto = order.items?.[0]?.cover_url
  if (firstBookPhoto) {
    return await sendTelegramPhoto(firstBookPhoto, message)
  }

  return await sendTelegramMessage(message)
}

/**
 * Format and send contact inquiry message
 */
export const sendContactNotification = async ({ name, phone, email, message }) => {
  const config = getTelegramConfig()
  if (config.notifyContacts === false) {
    return { success: true, skipped: true }
  }

  const formattedDate = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })

  const text = `📩 <b>SAYTDAN YANGI MUROJAAT!</b>
━━━━━━━━━━━━━━━━━━━━
📅 <b>Vaqti:</b> ${formattedDate}
👤 <b>Ismi:</b> ${name}
📞 <b>Telefon:</b> <a href="tel:${phone}">${phone}</a>
${email ? `📧 <b>Email:</b> ${email}\n` : ''}
💬 <b>Xabar matni:</b>
<i>"${message}"</i>
━━━━━━━━━━━━━━━━━━━━
⚡️ <i>Kitobhon.uz mijozlar xizmati</i>`

  return await sendTelegramMessage(text)
}

/**
 * Format and send admin activity notification with photo
 */
export const sendAdminActivityNotification = async (action, bookTitle, details = '', coverUrl = '') => {
  const config = getTelegramConfig()
  if (config.notifyAdminActions === false) {
    return { success: true, skipped: true }
  }

  const text = `🛠 <b>ADMIN HARAKATI: ${action.toUpperCase()}</b>
━━━━━━━━━━━━━━━━━━━━
📚 <b>Kitob:</b> ${bookTitle}
${details ? `ℹ️ <b>Tafsilot:</b> ${details}\n` : ''}
📅 <b>Vaqt:</b> ${new Date().toLocaleTimeString('uz-UZ')}`

  if (coverUrl) {
    return await sendTelegramPhoto(coverUrl, text)
  }
  return await sendTelegramMessage(text)
}
