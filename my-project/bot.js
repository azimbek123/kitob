/**
 * Kitobhon.uz Telegram Bot (@Kitobilim_bot)
 * Ishga tushirish:  BOT_TOKEN=... ADMIN_ID=... SUPABASE_URL=... SUPABASE_KEY=... node bot.js
 * (Vercel'da emas — Railway/Render/VPS kabi doimiy ishlaydigan joyda ishga tushiring)
 */
const BOT_TOKEN = process.env.BOT_TOKEN
const ADMIN_ID = Number(process.env.ADMIN_ID)
const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_KEY
if (!BOT_TOKEN || !ADMIN_ID) {
  console.error('BOT_TOKEN va ADMIN_ID environment o\'zgaruvchilari kerak')
  process.exit(1)
}
const BASE_URL = `https://api.telegram.org/bot${BOT_TOKEN}`

console.log('--------------------------------------------------')
console.log('🤖 Kitobhon.uz Telegram Boti ishga tushdi...')
console.log('--------------------------------------------------')

let lastUpdateId = 0

// Telegramga xabar yuborish funksiyasi
async function sendMessage(chatId, text, replyMarkup = null) {
  try {
    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
    }
    if (replyMarkup) payload.reply_markup = replyMarkup

    const res = await fetch(`${BASE_URL}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    return await res.json()
  } catch (err) {
    console.error('Xabar yuborishda xatolik:', err.message)
  }
}

// Supabase REST yordamchisi (kitoblar umumiy bazada saqlanadi)
async function db(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation',
      ...(options.headers || {}),
    },
  })
  if (!res.ok) throw new Error(`Supabase ${res.status}: ${await res.text()}`)
  return res.status === 204 ? [] : res.json()
}
const getBooks = () => db('books?select=id,title,author,price,category,stock&order=id.desc')

// Buyruqlarni qayta ishlash
async function handleCommand(chatId, text, from) {
  const isSenderAdmin = String(chatId) === String(ADMIN_ID)
  const trimmed = text.trim()

  if (trimmed === '/start') {
    const welcome = `
Assalomu alaykum, <b>${from.first_name || 'Hurmatli kitobxon'}</b>! 📚
<b>Kitobhon.uz</b> rasmiy botiga xush kelibsiz!

Bu yerda siz do'kondagi yangi kitoblarni ko'rishingiz, buyurtmalar haqida xabardor bo'lishingiz va admin boshqaruvini amalga oshirishingiz mumkin.

<b>Mavjud buyruqlar:</b>
📖 /books — Kitoblar ro'yxatini ko'rish
📊 /stats — Do'kon statistikasi
ℹ️ /help — Yordam va ma'lumot
${isSenderAdmin ? '\n👑 <i>Siz tizim administratori sifatida tanildingiz!</i>' : ''}
`
    await sendMessage(chatId, welcome)
    return
  }

  if (trimmed === '/books') {
    let msg = `📚 <b>KITOBLAR RO'YXATI:</b>\n━━━━━━━━━━━━━━━━━━━━\n`
    const memoryBooks = await getBooks()
    memoryBooks.forEach((b, i) => {
      msg += `${i + 1}. <b>${b.title}</b> (${b.author})\n   💰 ${Number(b.price).toLocaleString('uz-UZ')} so'm | 📦 Qoldiq: ${b.stock} ta\n   ID: <code>${b.id}</code>\n\n`
    })
    msg += `🌐 Sayt orqali to'liq katalog: <b>/kitoblar</b>`
    await sendMessage(chatId, msg)
    return
  }

  if (trimmed === '/stats') {
    const memoryBooks = await getBooks()
    const totalBooks = memoryBooks.length
    const totalStock = memoryBooks.reduce((acc, b) => acc + b.stock, 0)
    const totalSum = memoryBooks.reduce((acc, b) => acc + b.stock * b.price, 0)

    const statsMsg = `
📊 <b>KITOBHON.UZ STATISTIKASI:</b>
━━━━━━━━━━━━━━━━━━━━
📚 <b>Kitoblar turlari:</b> ${totalBooks} xil
📦 <b>Ombordagi umumiy qoldiq:</b> ${totalStock} dona
💰 <b>Ombordagi tovar qiymati:</b> ${totalSum.toLocaleString('uz-UZ')} so'm
⚡️ <b>Holat:</b> Tizim faol ishlamoqda
`
    await sendMessage(chatId, statsMsg)
    return
  }

  if (trimmed.startsWith('/add') && isSenderAdmin) {
    // Format: /add Sarlavha | Muallif | Narx | Janr
    const parts = trimmed.replace('/add', '').split('|').map((s) => s.trim())
    if (parts.length < 3) {
      await sendMessage(chatId, `⚠️ Format noto'g'ri!\nMisol: <code>/add Yangi Kitob | Muallif Ismi | 50000 | Badiiy</code>`)
      return
    }

    const [newBook] = await db('books', {
      method: 'POST',
      body: JSON.stringify({
        title: parts[0],
        author: parts[1],
        price: Number(parts[2]) || 50000,
        category: parts[3] || 'Badiiy',
        stock: 10,
      }),
    })

    await sendMessage(chatId, `✅ <b>Kitob muvaffaqiyatli qo'shildi!</b>\n\n📚 <b>${newBook.title}</b>\n👤 ${newBook.author}\n💰 ${Number(newBook.price).toLocaleString('uz-UZ')} so'm\nID: <code>${newBook.id}</code>`)
    return
  }

  if (trimmed.startsWith('/delete') && isSenderAdmin) {
    const id = trimmed.replace('/delete', '').trim()
    const deleted = await db(`books?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })

    if (deleted.length > 0) {
      await sendMessage(chatId, `🗑 <b>ID ${id} bo'lgan kitob o'chirildi!</b>`)
    } else {
      await sendMessage(chatId, `❌ ID ${id} bo'lgan kitob topilmadi.`)
    }
    return
  }

  if (trimmed === '/help') {
    const helpMsg = `
ℹ️ <b>Yordam markazi:</b>
/books — Barcha kitoblar ro'yxati
/stats — Statistik ma'lumotlar

${isSenderAdmin ? `<b>Admin buyruqlari:</b>\n/add &lt;nomi&gt; | &lt;muallif&gt; | &lt;narx&gt; | &lt;janr&gt;\n/delete &lt;id&gt;` : ''}
`
    await sendMessage(chatId, helpMsg)
    return
  }

  // Odatiy xabarlar uchun
  await sendMessage(chatId, `Hurmatli ${from.first_name || 'foydalanuvchi'}, buyruqlarni ko'rish uchun /help ni bosing.`)
}

// Telegram Long Polling
async function pollUpdates() {
  try {
    const res = await fetch(`${BASE_URL}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`)
    const data = await res.json()

    if (data.ok && Array.isArray(data.result)) {
      for (const update of data.result) {
        lastUpdateId = update.update_id

        if (update.message && update.message.text) {
          try {
            await handleCommand(update.message.chat.id, update.message.text, update.message.from)
          } catch (e) {
            console.error(e.message)
            await sendMessage(update.message.chat.id, '⚠️ Bazaga ulanishda xatolik yuz berdi.')
          }
        }
      }
    }
  } catch (err) {
    // Tarmoq vaqtinchalik uzilsa jim qayta ulanadi
  } finally {
    setTimeout(pollUpdates, 1500)
  }
}

// Pollingni boshlash
pollUpdates()
