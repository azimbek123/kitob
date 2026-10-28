// Site settings management service
// Ma'lumotlar avval Supabase'da, keyin localStorage'da saqlanadi
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient'

export const DEFAULT_SITE_SETTINGS = {
  phone1: '+998 71 200 00 00',
  phone2: '+998 90 123 45 67',
  email: 'info@kitobhon.uz',
  telegramUsername: '@kitobhon_admin',
  telegramChannel: 'https://t.me/kitobhon_uz',
  address: "Toshkent sh., Yunusobod tumani, Amir Temur shoh ko'chasi, 107-B",
  addressLandmark: 'Mo\'ljal: Metro "Bodomzor"',
  workingHours: '09:00 — 22:00 (Har kuni dam olishsiz)',
  onlineHours: 'Onlayn buyurtmalar 24/7 qabul qilinadi',
  botUsername: '@Kitobilim_bot',
  siteUrl: 'https://kitobmagazin.vercel.app',
  notifyOrders: true,
  notifyContacts: true,
  notifyAdminActions: true,
}

// Supabase row'ni frontend formatiga o'tkazish
const dbToSettings = (row) => ({
  phone1: row.phone1 || DEFAULT_SITE_SETTINGS.phone1,
  phone2: row.phone2 || DEFAULT_SITE_SETTINGS.phone2,
  email: row.email || DEFAULT_SITE_SETTINGS.email,
  telegramUsername: row.telegram_username || DEFAULT_SITE_SETTINGS.telegramUsername,
  telegramChannel: row.telegram_channel || DEFAULT_SITE_SETTINGS.telegramChannel,
  address: row.address || DEFAULT_SITE_SETTINGS.address,
  addressLandmark: row.address_landmark || DEFAULT_SITE_SETTINGS.addressLandmark,
  workingHours: row.working_hours || DEFAULT_SITE_SETTINGS.workingHours,
  onlineHours: row.online_hours || DEFAULT_SITE_SETTINGS.onlineHours,
  botUsername: row.bot_username || DEFAULT_SITE_SETTINGS.botUsername,
  siteUrl: row.site_url || DEFAULT_SITE_SETTINGS.siteUrl,
  notifyOrders: row.notify_orders !== false,
  notifyContacts: row.notify_contacts !== false,
  notifyAdminActions: row.notify_admin_actions !== false,
})

// Frontend formatini Supabase row'ga o'tkazish
const settingsToDb = (settings) => ({
  id: 'main',
  phone1: settings.phone1,
  phone2: settings.phone2,
  email: settings.email,
  telegram_username: settings.telegramUsername,
  telegram_channel: settings.telegramChannel,
  address: settings.address,
  address_landmark: settings.addressLandmark,
  working_hours: settings.workingHours,
  online_hours: settings.onlineHours,
  bot_username: settings.botUsername,
  site_url: settings.siteUrl,
  notify_orders: settings.notifyOrders !== false,
  notify_contacts: settings.notifyContacts !== false,
  notify_admin_actions: settings.notifyAdminActions !== false,
  updated_at: new Date().toISOString(),
})

// localStorage'dan o'qish
export const getSiteSettings = () => {
  try {
    const stored = localStorage.getItem('kitobhon_site_settings')
    if (stored) {
      return { ...DEFAULT_SITE_SETTINGS, ...JSON.parse(stored) }
    }
  } catch (e) {
    console.error('Error reading site settings:', e)
  }
  return DEFAULT_SITE_SETTINGS
}

// Supabase'dan sozlamalarni yuklash
export const loadSiteSettingsFromDB = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    return getSiteSettings()
  }
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'main')
      .single()

    if (error || !data) {
      return getSiteSettings()
    }

    const settings = dbToSettings(data)
    // localStorage'ga ham saqlab qo'yamiz (offline uchun)
    localStorage.setItem('kitobhon_site_settings', JSON.stringify(settings))
    return settings
  } catch (e) {
    console.error('Error loading site settings from DB:', e)
    return getSiteSettings()
  }
}

// Sozlamalarni saqlash (Supabase + localStorage)
export const saveSiteSettings = async (settings) => {
  try {
    // localStorage'ga saqlaymiz
    localStorage.setItem('kitobhon_site_settings', JSON.stringify(settings))
    window.dispatchEvent(new CustomEvent('site-settings-changed', { detail: settings }))

    // Supabase'ga ham saqlaymiz
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase
        .from('site_settings')
        .upsert(settingsToDb(settings), { onConflict: 'id' })

      if (error) {
        console.error('Supabase settings save error:', error.message)
        return false
      }
    }
    return true
  } catch (e) {
    console.error('Error saving site settings:', e)
    return false
  }
}

// Inquiries / Contact form messages — Supabase contacts jadvaliddan olish
export const getStoredInquiries = () => {
  try {
    const stored = localStorage.getItem('kitobhon_inquiries')
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

// Supabase'dan murojaatlarni yuklash
export const loadInquiriesFromDB = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    return getStoredInquiries()
  }
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) return getStoredInquiries()

    const inquiries = (data || []).map((item) => ({
      id: item.id,
      name: item.name,
      phone: item.phone,
      email: item.email || '',
      message: item.message,
      status: item.status || 'new',
      date: item.created_at,
    }))

    localStorage.setItem('kitobhon_inquiries', JSON.stringify(inquiries))
    return inquiries
  } catch (e) {
    console.error('Error loading inquiries from DB:', e)
    return getStoredInquiries()
  }
}

export const saveInquiry = async (inquiry) => {
  try {
    // localStorage'ga saqlaymiz
    const list = getStoredInquiries()
    const updated = [inquiry, ...list]
    localStorage.setItem('kitobhon_inquiries', JSON.stringify(updated))
    window.dispatchEvent(new Event('inquiries-changed'))

    // Supabase contacts jadvaliga ham saqlaymiz
    if (isSupabaseConfigured() && supabase) {
      const { error } = await supabase.from('contacts').insert([{
        name: inquiry.name,
        phone: inquiry.phone,
        email: inquiry.email || null,
        message: inquiry.message,
      }])
      if (error) console.error('Contacts DB save error:', error.message)
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const deleteInquiry = (id) => {
  try {
    const list = getStoredInquiries().filter((item) => item.id !== id)
    localStorage.setItem('kitobhon_inquiries', JSON.stringify(list))
    window.dispatchEvent(new Event('inquiries-changed'))

    // Supabase'dan ham o'chirish
    if (isSupabaseConfigured() && supabase) {
      supabase.from('contacts').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('Contact delete error:', error.message)
      })
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}

export const toggleInquiryStatus = (id) => {
  try {
    const list = getStoredInquiries().map((item) =>
      item.id === id
        ? { ...item, status: item.status === 'contacted' ? 'new' : 'contacted' }
        : item
    )
    localStorage.setItem('kitobhon_inquiries', JSON.stringify(list))
    window.dispatchEvent(new Event('inquiries-changed'))
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
