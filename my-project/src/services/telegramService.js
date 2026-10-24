// Telegram Bot Notification Service with Dynamic Admin Configuration
const DEFAULT_BOT_TOKEN = '8571838307:AAHBYzDfpJF0HyOjY9SCFT9xtVny7C9x7I8'
const DEFAULT_ADMIN_CHAT_ID = '7420313359'

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
    botToken: import.meta.env.VITE_TELEGRAM_BOT_TOKEN || DEFAULT_BOT_TOKEN,
    adminChatId: import.meta.env.VITE_TELEGRAM_ADMIN_CHAT_ID || DEFAULT_ADMIN_CHAT_ID,
    botUsername: '@kitobhon_bot',
    telegramChannel: 'https://t.me/kitobhon_uz',
    notifyOrders: true,
    notifyContacts: true,
    notifyAdminActions: true,
  }
}

export const saveTelegramConfig = (config) => {
  try {
    localStorage.setItem('kitobhon_telegram_config', JSON.stringify(config))
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
export const sendTelegramMessage = async (text, overrideConfig = null) => {
  const config = overrideConfig || getTelegramConfig()
  const token = config.botToken || DEFAULT_BOT_TOKEN
  const chatId = config.adminChatId || DEFAULT_ADMIN_CHAT_ID

  if (!token || !chatId) {
    return { success: false, error: 'Telegram Bot Token yoki Chat ID kiritilmagan' }
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML',
      }),
    })
    const data = await response.json()
    if (!data.ok) {
      return { success: false, error: data.description || 'Telegram API xatosi' }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error sending Telegram notification:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send Photo with HTML Caption to Telegram Admin
 */
export const sendTelegramPhoto = async (photoUrl, caption, overrideConfig = null) => {
  const config = overrideConfig || getTelegramConfig()
  const token = config.botToken || DEFAULT_BOT_TOKEN
  const chatId = config.adminChatId || DEFAULT_ADMIN_CHAT_ID

  try {
    const url = `https://api.telegram.org/bot${token}/sendPhoto`
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption: caption.slice(0, 1024),
        parse_mode: 'HTML',
      }),
    })
    const data = await response.json()
    if (data.ok) {
      return { success: true, data }
    }
    return await sendTelegramMessage(caption, config)
  } catch (error) {
    console.error('Error sending Telegram photo:', error)
    return await sendTelegramMessage(caption, config)
  }
}

/**
 * Test Telegram Connection
 */
export const testTelegramConnection = async (token, chatId) => {
  const testConfig = { botToken: token, adminChatId: chatId }
  const time = new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
  const text = `🤖 <b>TEST XABARI — KITOBHON.UZ</b>
━━━━━━━━━━━━━━━━━━━━
✅ <b>Telegram Bot muvaffaqiyatli ulandi!</b>
⏰ <b>Vaqti:</b> ${time}
⚙️ <b>Holat:</b> Barcha bildirishnomalar faol

<i>Kitobhon.uz boshqaruv panelidan yuborildi.</i>`

  return await sendTelegramMessage(text, testConfig)
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
    return await sendTelegramPhoto(firstBookPhoto, message, config)
  }

  return await sendTelegramMessage(message, config)
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

  return await sendTelegramMessage(text, config)
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
    return await sendTelegramPhoto(coverUrl, text, config)
  }
  return await sendTelegramMessage(text, config)
}
