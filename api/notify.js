// Vercel serverless function: Telegram xabarlarini xavfsiz yuboradi.
// Token brauzerga chiqmaydi. Vercel > Settings > Environment Variables:
//   TELEGRAM_BOT_TOKEN, TELEGRAM_ADMIN_CHAT_ID
const ALLOWED = new Set(['sendMessage', 'sendPhoto'])

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' })
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID
  if (!token || !chatId) {
    return res.status(500).json({ ok: false, error: 'TELEGRAM_BOT_TOKEN yoki TELEGRAM_ADMIN_CHAT_ID Vercel\'da kiritilmagan' })
  }

  const { method, payload } = req.body || {}
  if (!ALLOWED.has(method) || typeof payload !== 'object' || payload === null) {
    return res.status(400).json({ ok: false, error: 'Noto\'g\'ri so\'rov' })
  }

  // Faqat ruxsat etilgan maydonlar; chat_id doim admin
  const body = { chat_id: chatId, parse_mode: 'HTML' }
  if (method === 'sendMessage') body.text = String(payload.text || '').slice(0, 4096)
  if (method === 'sendPhoto') {
    body.photo = String(payload.photo || '')
    body.caption = String(payload.caption || '').slice(0, 1024)
  }

  try {
    const tg = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await tg.json()
    return res.status(tg.ok ? 200 : 502).json(data)
  } catch (e) {
    return res.status(502).json({ ok: false, error: e.message })
  }
}
